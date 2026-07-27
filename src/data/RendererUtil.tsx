import type {TFunction} from 'i18next';

const renderList = (arr: any[], locale: string = 'en') =>
  new Intl.ListFormat(locale, {style: 'long', type: 'conjunction'}).format(arr.map(String));

// Directus enters dietary values as free-text ("halal", "kosher", "baby food").
// Slug them for i18n lookup; fall back to the raw string when a key is missing
// so newly-added values still render (untranslated) instead of blowing up.
const translateDietary = (value: string, t: TFunction) => {
  const slug = value.trim().toLowerCase()
    .replace(/\s+(\w)/g, (_, c) => c.toUpperCase());
  return t(`dietary.${slug}`, {defaultValue: value});
};

// Parse "hh:mm:ss" into a Date, or null if the input is malformed.
// The date portion is arbitrary — only the time-of-day is used by the
// formatter — but both endpoints of a range must share the same date so
// `formatRange` treats them as same-day. Return null (not throw) so one
// bad row in the feed can't crash the whole Renderer.
const parseTime = (timeStr: string): Date | null => {
  const [hh, mm, ss] = timeStr.split(':').map(Number);
  if (!Number.isFinite(hh) || !Number.isFinite(mm) ||
      hh < 0 || hh > 23 || mm < 0 || mm > 59 ||
      (ss !== undefined && (!Number.isFinite(ss) || ss < 0 || ss > 59))) {
    return null;
  }
  const d = new Date(2000, 0, 1);
  d.setHours(hh, mm, ss || 0, 0);
  return d;
};

// Return the locale-formatted "1:00–3:00 PM" range, or null if either
// endpoint is missing / malformed. Callers treat null as all-day per
// the data convention: a partial time range is meaningless, so we don't
// render "1:00 PM – Unknown".
const formatTimeRange = (startStr: string | null | undefined, endStr: string | null | undefined, locale: string): string | null => {
  if (!startStr || !endStr) return null;
  const start = parseTime(startStr);
  const end = parseTime(endStr);
  if (!start || !end) return null;
  return new Intl.DateTimeFormat(locale, {hour: 'numeric', minute: '2-digit'}).formatRange(start, end);
};

// A row with no days is meaningless (whether or not times are set) — drop
// it and warn so the bad row surfaces in the console. A row with days but
// no times is intentional in the feed to mean "the times are unknown /
// unspecified"; we render just the days for now (client wants "All Day"
// eventually, but not yet). A row with both renders both.
const renderHours = (allHours: any[], t: TFunction, locale: string, pantryName: string) => {
  return allHours.map((hours) => {
    const validDays = hours.days ? hours.days.filter((d: any) => d != null) : [];
    if (validDays.length === 0) {
      console.warn(`[hours] dropping row with no days for pantry ${JSON.stringify(pantryName)}:`, hours);
      return null;
    }
    const days = renderList(validDays.map((day: string) => t(`days.${day}`)), locale);
    const time = formatTimeRange(hours.timeStart, hours.timeEnd, locale);
    const parts = [days, time, hours.notes].filter(Boolean);
    return parts.join('  \n');
  })
  .filter(Boolean)
  .join('\n\n');
};

export const formatAddress = (data: any): string => {
  return `${data.streetAddress}\n${data.addressLocality}, ${data.addressRegion} ${data.postalCode}`;
};

export const getWebsites = (data: any): string[] => {
  if (!data.website) return [];
  return data.website.split(',').map((w: string) => w.trim()).filter(Boolean);
};

export const getPhoneNumbers = (data: any): string[] => {
  if (!data.phoneNumbers) return [];
  return data.phoneNumbers.map((p: {phoneNumber: string}) => p.phoneNumber).filter(Boolean);
};

export const getEmailAddresses = (data: any): string[] => {
  if (!data.emailAddresses) return [];
  return data.emailAddresses.map((e: {email: string}) => e.email).filter(Boolean);
};

export const render = (data: any, t: TFunction, locale: string = 'en') => {
  let payload = [];

  const items = (data.dietaryAccomodations ?? [])
    .filter((v: unknown) => typeof v === 'string' && v.trim().length > 0)
    .map((v: string) => translateDietary(v, t));
  if (items.length) {
    payload.push(t('renderer.dietaryAccommodations', {list: `**${renderList(items, locale)}**`}));
  }

  switch(data.idRequired){
    case true:
      payload.push(t('renderer.idRequired'));
      break;
    case false:
      payload.push(t('renderer.idNotRequired'));
      break;
  }

  if(data.hours){
    const rendered = renderHours(data.hours, t, locale, data.name);
    if (rendered) {
      payload.push('---');
      payload.push(t('renderer.hours'));
      payload.push(rendered);
    }
  }

  if(data.notes){
    payload.push('---');
    payload.push(t('renderer.notes'));
    payload.push(`${data.notes}`);
  }

  if(data.lastVerified){
    // The date portion is UTC-midnight; format in UTC so a US-timezone
    // viewer doesn't see it pulled back a day (e.g. "2023-01-30" → "Jan 29").
    const humanReadable = new Date(data.lastVerified.split('T')[0]);
    const localeMap: Record<string, string> = {en: 'en-US', es: 'es-ES', ko: 'ko-KR', id: 'id-ID'};
    const formatter = new Intl.DateTimeFormat(localeMap[locale] || locale, {
      dateStyle: 'medium',
      timeZone: 'UTC',
    });
    payload.push(t('renderer.lastVerified', {date: formatter.format(humanReadable)}));
  }

  return payload.join('\n\n');
};
