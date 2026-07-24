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

// Parse "hh:mm:ss" into a Date. The date portion is arbitrary — only the
// time-of-day is used by the formatter — but both endpoints of a range
// must share the same date so `formatRange` treats them as same-day.
const parseTime = (timeStr: string): Date => {
  const [hh, mm, ss] = timeStr.split(':').map(Number);
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59 || ss < 0 || ss > 59) {
    throw new Error('Invalid time format. Expected hh:mm:ss with valid time values.');
  }
  const d = new Date(2000, 0, 1);
  d.setHours(hh, mm, ss || 0, 0);
  return d;
};

const formatTimeRange = (startStr: string, endStr: string | null | undefined, t: TFunction, locale: string): string => {
  const fmt = new Intl.DateTimeFormat(locale, {hour: 'numeric', minute: '2-digit'});
  const start = parseTime(startStr);
  if (!endStr) return `${fmt.format(start)} - ${t('renderer.unknown')}`;
  return fmt.formatRange(start, parseTime(endStr));
};

const renderHours = (allHours: any[], t: TFunction, locale: string) => {
  return allHours.map((hours) => {
    const validDays = hours.days ? hours.days.filter((d: any) => d != null) : [];
    const days = validDays.length > 0 ? renderList(validDays.map((day: string) => t(`days.${day}`)), locale) : '';
    const time = hours.timeStart ? formatTimeRange(hours.timeStart, hours.timeEnd, t, locale) : t('renderer.allDay');
    const parts = [days, time, hours.notes].filter(Boolean);
    return parts.join('  \n');
  })
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

  if(data.dietaryAccomodations){
    const items = data.dietaryAccomodations.map((v: string) => translateDietary(v, t));
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
    payload.push('---');
    payload.push(t('renderer.hours'));
    payload.push(renderHours(data.hours, t, locale));
  }

  if(data.notes){
    payload.push('---');
    payload.push(t('renderer.notes'));
    payload.push(`${data.notes}`);
  }

  if(data.lastVerified){
    const humanReadable = new Date(data.lastVerified.split('T')[0]);
    const localeMap: Record<string, string> = {en: 'en-US', es: 'es-ES', ko: 'ko-KR', id: 'id-ID'};
    const formatter = new Intl.DateTimeFormat(localeMap[locale] || locale, {
      dateStyle: 'medium'
    });
    payload.push(t('renderer.lastVerified', {date: formatter.format(humanReadable)}));
  }

  return payload.join('\n\n');
};
