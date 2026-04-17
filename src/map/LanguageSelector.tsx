import {IonSelect, IonSelectOption} from '@ionic/react';
import {useTranslation} from 'react-i18next';
import {useMap} from './MapContext';

const languages = [
  {code: 'en', label: 'English', flag: '🇺🇸'},
  {code: 'es', label: 'Español', flag: '🇪🇸'},
  {code: 'ko', label: '한국어', flag: '🇰🇷'},
  {code: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩'},
];

export function LanguageSelector() {
  const {t, i18n} = useTranslation();
  const {setClickedFeatures} = useMap();

  return (
    <>
      <p id='language-selector-label' style={{marginBottom: '4px'}}>{t('language')}</p>
      <IonSelect
        aria-labelledby='language-selector-label'
        value={i18n.language}
        onIonChange={(e) => {
          i18n.changeLanguage(e.detail.value);
          setClickedFeatures([]);
        }}
        interface="popover"
        style={{marginBottom: '32px'}}
      >
        {languages.map((lang) => (
          <IonSelectOption key={lang.code} value={lang.code}>
            {lang.flag} {lang.label}
          </IonSelectOption>
        ))}
      </IonSelect>
    </>
  );
}
