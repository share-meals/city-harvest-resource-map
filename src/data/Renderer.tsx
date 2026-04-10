import {
  IonButton,
  IonIcon,
  IonText,
} from '@ionic/react';
import {
  checkmarkSharp,
  chevronBackSharp,
  chevronForwardSharp,
  copyOutline,
} from 'ionicons/icons';
import {
  useEffect,
  useRef,
  useState
} from 'react';
import {useTranslation} from 'react-i18next';
import type {TFunction} from 'i18next';
import rehypeExternalLinks from 'rehype-external-links';
import {PrivacyPolicy} from './PrivacyPolicy';
import {useMap} from '../map';
import {render, formatAddress, getWebsites, getPhoneNumbers, getEmailAddresses} from './RendererUtil.js';
import {logToServer} from '../logging';
import ReactMarkdown from 'react-markdown';

const CopyButton = ({value, label, t}: {value: string, label: string, t: TFunction}) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API not available
    }
  };
  return (
    <IonButton
      aria-label={copied ? t('aria.copied') : label}
      fill='clear'
      size='small'
      onClick={handleCopy}
    >
      <IonIcon slot='icon-only' icon={copied ? checkmarkSharp : copyOutline} />
    </IonButton>
  );
};

const ContactRow = ({children, value, label, t}: {children: React.ReactNode, value: string, label: string, t: TFunction}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px'}}>
    <div style={{flex: 1}}>{children}</div>
    <CopyButton value={value} label={label} t={t} />
  </div>
);

const FeatureDetails = ({feature, t, lang}: {feature: any, t: TFunction, lang: string}) => {
  const address = formatAddress(feature);
  const websites = getWebsites(feature);
  const phoneNumbers = getPhoneNumbers(feature);
  const emails = getEmailAddresses(feature);
  const hasContacts = websites.length > 0 || phoneNumbers.length > 0 || emails.length > 0;
  return (
    <IonText>
      <h1>{feature.name}</h1>
      <div style={{display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '12px'}}>
        <div style={{flex: 1, whiteSpace: 'pre-line'}}>{address}</div>
        <CopyButton value={address} label={t('aria.copyAddress')} t={t} />
      </div>
      <ReactMarkdown
        children={render(feature, t, lang)}
        rehypePlugins={[[rehypeExternalLinks, {target: '_blank'}]]}
      />
      {hasContacts && (
        <>
          <hr />
          <p><strong>{t('renderer.contactInfo').replace(/\*\*/g, '')}</strong></p>
          {websites.map((url) => (
            <ContactRow key={url} value={url} label={t('aria.copyWebsite')} t={t}>
              <a href={url} target='_blank' rel='noopener noreferrer'>{url}</a>
            </ContactRow>
          ))}
          {emails.map((email) => (
            <ContactRow key={email} value={email} label={t('aria.copyEmail')} t={t}>
              <a href={`mailto:${email}`}>{email}</a>
            </ContactRow>
          ))}
          {phoneNumbers.map((phone) => (
            <ContactRow key={phone} value={phone} label={t('aria.copyPhone')} t={t}>
              {phone}
            </ContactRow>
          ))}
        </>
      )}
    </IonText>
  );
};

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
      return <FeatureDetails feature={clickedFeatures[0]} t={t} lang={i18n.language} />;
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
	<FeatureDetails feature={clickedFeatures[page]} t={t} lang={i18n.language} />
	{subtleBar}
      </>;
    }
  }
}
