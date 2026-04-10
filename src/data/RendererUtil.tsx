import type {TFunction} from 'i18next';

const renderList = (arr: any[]) => arr.length < 3 ? arr.join(' and ') : `${arr.slice(0, -1).join(', ')}, and ${arr[arr.length - 1]}`;

function renderTime(timeStr: string, t: TFunction) {
  if(timeStr === undefined
     || timeStr === null){
    return t('renderer.unknown');
  }
  const [hh, mm, ss] = timeStr.split(':').map(Number);

  if (hh < 0 || hh > 23 || mm < 0 || mm > 59 || ss < 0 || ss > 59) {
    throw new Error('Invalid time format. Expected hh:mm:ss with valid time values.');
  }

  const period = hh >= 12 ? t('renderer.pm') : t('renderer.am');

  let hours12 = hh % 12;
  hours12 = hours12 === 0 ? 12 : hours12;

  return `${hours12}:${mm.toString().padStart(2, '0')}${period}`;
}

const renderHours = (allHours: any[], t: TFunction) => {
  return allHours.map((hours) => {
    const validDays = hours.days ? hours.days.filter((d: any) => d != null) : [];
    const days = validDays.length > 0 ? renderList(validDays.map((day: string) => t(`days.${day}`))) : '';
    const time = hours.timeStart ? `${renderTime(hours.timeStart, t)} - ${renderTime(hours.timeEnd, t)}` : t('renderer.allDay');
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
    payload.push(t('renderer.dietaryAccommodations', {list: `**${renderList(data.dietaryAccomodations)}**`}));
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
    payload.push(renderHours(data.hours, t));
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
