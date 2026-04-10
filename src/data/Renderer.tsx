import {
  IonButton,
  IonIcon,
  IonText,
} from '@ionic/react';
import {
  chevronBackSharp,
  chevronForwardSharp
} from 'ionicons/icons';
import {
  useEffect,
  useRef,
  useState
} from 'react';
import {useTranslation} from 'react-i18next';
import rehypeExternalLinks from 'rehype-external-links';
import {PrivacyPolicy} from './PrivacyPolicy';
import {useMap} from '../map';
import {render} from './RendererUtil.js';
import {logToServer} from '../logging';
import ReactMarkdown from 'react-markdown';

export const Renderer = () => {
  const {clickedFeatures} = useMap();
  const {t, i18n} = useTranslation();
  const [page, setPage] = useState<number>(0);

  // Track which feature ids have been logged for the current click session.
  // Resets when clickedFeatures changes (i.e. the user clicks somewhere new).
  const loggedIdsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    loggedIdsRef.current = new Set();
    setPage(0);
  }, [clickedFeatures]);

  // Log the currently visible feature (if not already logged this session).
  useEffect(() => {
    if (clickedFeatures.length === 0) return;
    const feature = clickedFeatures[page];
    if (!feature || !feature.id) return;
    const id = String(feature.id);
    if (loggedIdsRef.current.has(id)) return;
    loggedIdsRef.current.add(id);
    const coords = feature.geolocation?.coordinates ?? [0, 0];
    logToServer('/log-feature-click', {
      id: feature.id,
      lat: coords[1],
      lng: coords[0],
      language: i18n.language,
    });
  }, [clickedFeatures, page, i18n.language]);
  switch(clickedFeatures.length){
    case 0:
      return <PrivacyPolicy />;
    case 1:
      return <IonText>
	<ReactMarkdown
	  children={render(clickedFeatures[0], t, i18n.language)}
	  rehypePlugins={[[rehypeExternalLinks, { target: '_blank' }]]}
	/>
      </IonText>;
    default: {
      const prominentBar = (
	<div style={{
	  display: 'flex',
	  alignItems: 'center',
	  justifyContent: 'space-between',
	  padding: '8px 12px',
	  marginBottom: '12px',
	  background: 'var(--ion-color-light, #f4f5f8)',
	  borderRadius: '8px',
	}}>
	  <IonButton
	    aria-label={t('aria.previousPage')}
	    disabled={page === 0}
	    fill='solid'
	    size='default'
	    onClick={() => { setPage(page - 1); }}>
	    <IonIcon icon={chevronBackSharp} slot='icon-only' />
	  </IonButton>
	  <strong style={{fontSize: '1.1em'}}>
	    {t('renderer.pageOf', {page: page + 1, total: clickedFeatures.length})}
	  </strong>
	  <IonButton
	    aria-label={t('aria.nextPage')}
	    disabled={page === clickedFeatures.length - 1}
	    fill='solid'
	    size='default'
	    onClick={() => { setPage(page + 1); }}>
	    <IonIcon icon={chevronForwardSharp} slot='icon-only' />
	  </IonButton>
	</div>
      );
      const subtleBar = (
	<div style={{
	  display: 'flex',
	  alignItems: 'center',
	  justifyContent: 'space-between',
	  marginTop: '12px',
	}}>
	  <IonButton
	    aria-label={t('aria.previousPage')}
	    disabled={page === 0}
	    fill='clear'
	    size='small'
	    onClick={() => { setPage(page - 1); }}>
	    <IonIcon icon={chevronBackSharp} slot='icon-only' />
	  </IonButton>
	  <IonText>
	    <small>
	      {t('renderer.pageOf', {page: page + 1, total: clickedFeatures.length})}
	    </small>
	  </IonText>
	  <IonButton
	    aria-label={t('aria.nextPage')}
	    disabled={page === clickedFeatures.length - 1}
	    fill='clear'
	    size='small'
	    onClick={() => { setPage(page + 1); }}>
	    <IonIcon icon={chevronForwardSharp} slot='icon-only' />
	  </IonButton>
	</div>
      );
      return <>
	{prominentBar}
	<ReactMarkdown
	  children={render(clickedFeatures[page], t, i18n.language)}
	  rehypePlugins={[[rehypeExternalLinks, { target: '_blank' }]]}
	/>
	{subtleBar}
      </>;
    }
  }
}
