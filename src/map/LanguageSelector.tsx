import {IonSelect, IonSelectOption} from '@ionic/react';
import {useTranslation} from 'react-i18next';
import {useMap} from './MapContext';

const languages = [
  {code: 'en', label: 'English'},
  {code: 'es', label: 'Español'},
  {code: 'zh', label: '中文'},
  {code: 'ko', label: '한국어'},
];

export function LanguageSelector() {
  const {t, i18n} = useTranslation();
  const {setClickedFeatures} = useMap();

  return (
    <IonSelect
      label={t('language')}
      labelPlacement="stacked"
      value={i18n.language}
      onIonChange={(e) => {
        i18n.changeLanguage(e.detail.value);
        setClickedFeatures([]);
      }}
      interface="popover"
    >
      {languages.map((lang) => (
        <IonSelectOption key={lang.code} value={lang.code}>
          {lang.label}
        </IonSelectOption>
      ))}
    </IonSelect>
  );
}
