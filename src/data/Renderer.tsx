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
import rehypeExternalLinks from 'rehype-external-links';
import {PrivacyPolicy} from './PrivacyPolicy';
import {
  formatDays,
  formatHour,
  useMap
} from '@share-meals/frg-ui';
import {render} from './RendererUtil.js';
import ReactMarkdown from 'react-markdown';

export const Renderer = () => {
  const {clickedFeatures} = useMap();
  const [page, setPage] = useState<number>(0);
  useEffect(() => {
    setPage(0);
  }, [clickedFeatures]);
  if(clickedFeatures.length > 0){
    console.log(render(clickedFeatures[0]));
  }
  switch(clickedFeatures.length){
    case 0:
      return <PrivacyPolicy />;
    case 1:
      return <IonText>
	{/*
	<ReactMarkdown
	  children={render(clickedFeatures[0])}
	  rehypePlugins={[[rehypeExternalLinks, { target: '_blank' }]]}
	/>
	*/}
      </IonText>;
    default:
      return <>
	{/*
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
	  children={render(clickedFeatures[page])}
	rehypePlugins={[[rehypeExternalLinks, { target: '_blank' }]]}
	/>
	*/}
      </>;
  }
}
