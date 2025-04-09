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
    return `${days}  \n${time}${data.notes ? '  \n' + data.notes : ''}`;
  })
  .join('\n\n');;
};

export const render = (data) => {
  let payload = [];
  payload.push(`# ${data.name}`);
  payload.push(`${data.streetAddress}\n${data.addressLocality}, ${data.addressRegion} ${data.postalCode}`);

  if(data.hours !== null){
    payload.push(`## Hours\n\n${renderHours(data.hours)}`);
  }

  if(data.emailAddresses !== null){
    payload.push(data.emailAddresses.map((e) => `[a href='mailto:${e.email}'](${e.email})`).join('\n'));
  }

  payload.push(`This location is ${data.status}.`);
  
  if(data.website){
    payload.push(`[${data.website}](${data.website})`);
  }
  if(data.phoneNumbers !== null){
    payload.push(data.phoneNumbers.map((p) => p.phoneNumber).join('\n'));
  }
  switch(data.idRequired){
    case true:
      payload.push(`**ID is required**`);
      break;
    case false:
      payload.push(`**ID is not required**`);
      break;
  }
  if(data.notes !== null){
    payload.push(`### Notes\n${data.notes}`);
  }

  if(data.dietaryAccomodations !== null){
    payload.push(`This location has ${renderList(data.dietaryAccomodations)} food.`);
  }

  if(data.lastVerified !== null){
    payload.push(`Last verified: ${data.lastVerified.split('T')[0]}`);
  }
  
  return payload.join('\n\n');
};
