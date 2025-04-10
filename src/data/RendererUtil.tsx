// @ts-nocheck

const daysLookup = {
  Su: 'Sundays',
  Mo: 'Mondays',
  Tu: 'Tuesdays',
  We: 'Wednesdays',
  Th: 'Thursdays',
  Fr: 'Fridays',
  Sa: 'Saturdays',
}

const renderList = (arr) => arr.length < 3 ? arr.join(' and ') : `${arr.slice(0, -1).join(', ')}, and ${arr[arr.length - 1]}`;

function renderTime(timeStr) {
  if(timeStr === undefined){
    return 'unknown';
  }
  // Split the time string into hours, minutes, seconds
  const [hh, mm, ss] = timeStr.split(':').map(Number);
  
  // Validate the time components
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59 || ss < 0 || ss > 59) {
    throw new Error('Invalid time format. Expected hh:mm:ss with valid time values.');
  }
  
  // Determine AM or PM
  const period = hh >= 12 ? 'PM' : 'AM';
  
  // Convert to 12-hour format
  let hours12 = hh % 12;
  hours12 = hours12 === 0 ? 12 : hours12; // 0 should become 12 (12 AM or 12 PM)
  
  // Format the time string without leading zero for hours
  return `${hours12}:${mm.toString().padStart(2, '0')}${period}`;
}

const renderHours = (allHours) => {
  return allHours.map((hours) => {
    const days = hours.days ? renderList(hours.days.map((day) => daysLookup[day])) : 'unknown';
    const time = hours.timeStart ? `${renderTime(hours.timeStart)} - ${renderTime(hours.timeEnd)}` : 'All Day';
    return `${days}  \n${time}${hours.notes ? '  \n' + hours.notes : ''}`;
  })
  .join('\n\n');;
};

export const render = (data) => {
  let payload = [];
  payload.push(`# ${data.name}`);
  payload.push(`${data.streetAddress}\n${data.addressLocality}, ${data.addressRegion} ${data.postalCode}`);

  if(data.dietaryAccomodations){
    payload.push(`This location has **${renderList(data.dietaryAccomodations)}** food.`);
  }

  switch(data.idRequired){
    case true:
      payload.push(`**ID is required**`);
      break;
    case false:
      payload.push(`**ID is not required**`);
      break;
  }
  
  if(data.hours){
    payload.push('---');
    payload.push('**Hours**');
    payload.push(renderHours(data.hours));
  }

  let contacts = [];

  if(data.website){
    contacts.push(`[Website](${data.website})`);
  }
  
  if(data.emailAddresses){
    contacts.push(data.emailAddresses.map((e) => `[${e.email}](mailto:${e.email})`).join('\n'));
  }

  if(data.phoneNumbers){
    contacts.push(data.phoneNumbers.map((p) => p.phoneNumber).join('\n'));
  }

  if(contacts.length > 0){
    payload.push('---');
    payload.push('**Contact Information**');
    payload.push(contacts.join('\n\n'));
  }

  if(data.notes){
    payload.push('---');
    payload.push('**Notes**');
    payload.push(`${data.notes}`);
  }


  if(data.lastVerified){
    const humanReadable = new Date(data.lastVerified.split('T')[0]);
    const formatter = new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium'
    });
    payload.push(`Last verified: ${formatter.format(humanReadable)}`);
  }
  
  return payload.join('\n\n');
};
