import {
  IonButton,
  IonButtons,
  IonHeader,
  IonIcon,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import {
  chevronBackSharp,
  chevronForwardSharp
} from 'ionicons/icons';
import {
  useEffect,
  useState
} from 'react';
import type {
  Dictionary,
  Hours
} from '@share-meals/frg-ui';
import rehypeExternalLinks from 'rehype-external-links';
import {PrivacyPolicy} from './PrivacyPolicy';
import {
  formatDays,
  formatHour,
  useMap
} from '@share-meals/frg-ui';
import ReactMarkdown from 'react-markdown';

const dictionary: Dictionary = {
  and: ' and ',
  comma: ', ',
  lastComma: ', and ',
  '1': 'Mondays',
  '2': 'Tuesdays',
  '3': 'Wednesdays',
  '4': 'Thursdays',
  '5': 'Fridays',
  '6': 'Saturdays',
  '7': 'Sundays',
}

const formatHours = (hours: any) => {
  return hours.map((h: Hours) => {
    const days = h.days ? formatDays({days: h.days, dictionary}) : null;
    const timeStart = h.timeStart ? formatHour({time: h.timeStart, timeZone: h.timeZone!, format: 'h:mma'}) : null;
    const timeEnd = h.timeEnd ? formatHour({time: h.timeEnd, timeZone: h.timeZone!, format: 'h:mma'}) : null;
    let payload = '- ';
    if(days)payload += days;
    if(timeStart){
      if(days)payload += '  \n';
      payload += timeStart;
    }
    if(timeEnd){
      if(timeStart)payload += ' - ';
      payload += timeEnd;
    }
    if(h.notes){
      if(days || timeStart)payload += '  \n';
      payload += h.notes;
    }
    return payload;
  }).join('\n');
}

const formatData = (data: any) => {
  const full_address: string = (`${data.address}, ${data.city}, ${data.state} ${data.zipcode}`).replace(/ /g, '+');
  return (
    `**${data.name}**  
${data.address || ''}  
${data.city || ''}, ${data.state || ''} ${data.zipcode || ''}  
[Open in Google Maps](https://www.google.com/maps/?q=${full_address})  
${data.website ? '\nVisit the [website](' + data.website + ')' :''}  
${data.hours !== null ? '\n\n**Hours of Operation**\n' + formatHours(data.hours) : ''}  
${data.notes && data.notes.trim() !== '' ? '\n\n**Notes**  \n' + data.notes : ''}  
${data.trackedBy && data.trackedBy.includes('Plentiful') ? '\n  \nBook an appointment on [Plentiful](https://plentifulapp.com/)' : ''}
    `
  );
}


export const Renderer = () => {
  const {clickedFeatures} = useMap();
  const [page, setPage] = useState<number>(0);
  useEffect(() => {
    setPage(0);
  }, [clickedFeatures]);
  switch(clickedFeatures.length){
    case 0:
      return <PrivacyPolicy />;
    case 1:
      return <IonText>
	<ReactMarkdown
	  children={formatData(clickedFeatures[0])}
	  rehypePlugins={[[rehypeExternalLinks, { target: '_blank' }]]}
	/>
      </IonText>;
    default:
      return <>
	<IonHeader class='ion-no-border'>
	  <IonToolbar>
	    <IonButtons slot='start'>
	      <IonButton
		disabled={page === 0}
		fill='clear'
		size='small'
		onClick={() => {
		  setPage(page - 1);
		}}>
		<IonIcon
		icon={chevronBackSharp}
		slot='icon-only' />
	      </IonButton>
	    </IonButtons>
	    <IonTitle className='ion-text-center' size='small'>
	      <IonText>
		{page + 1} of {clickedFeatures.length}
	      </IonText>
	    </IonTitle>
	    <IonButtons slot='end'>
	      <IonButton
		disabled={page === clickedFeatures.length - 1}
		fill='clear'
		size='small'
		onClick={() => {
		  setPage(page + 1);
		}}>
		<IonIcon
		icon={chevronForwardSharp}
		slot='icon-only' />
	      </IonButton>
	    </IonButtons>
	  </IonToolbar>
	</IonHeader>
	<ReactMarkdown
	  children={formatData(clickedFeatures[page])}
	rehypePlugins={[[rehypeExternalLinks, { target: '_blank' }]]}
	/>
      </>;
  }
}
