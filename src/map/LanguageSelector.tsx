import {IonSelect, IonSelectOption} from '@ionic/react';
import {useTranslation} from 'react-i18next';
import {useMap} from './MapContext';

// Order: English first, then alphabetized by English name.
// TODO: add Haitian Creole (`ht`) once we have UI + data translation for it.
const languages = [
  {code: 'en',      label: 'English',              flag: '🇺🇸'},
  {code: 'ar',      label: 'العربية',              flag: '🇸🇦'},
  {code: 'bn',      label: 'বাংলা',                flag: '🇧🇩'},
  {code: 'zh-Hans', label: '简体中文',              flag: '🇨🇳'},
  // Traditional Chinese (zh-Hant) removed 2026-07-24: the map's tile
  // renderer failed to display Traditional CJK glyphs, blanking the map
  // when this locale was selected. Re-enable when the font/glyph gap is
  // resolved.
  {code: 'fr',      label: 'Français',             flag: '🇫🇷'},
  {code: 'ko',      label: '한국어',               flag: '🇰🇷'},
  {code: 'pl',      label: 'Polski',               flag: '🇵🇱'},
  {code: 'ru',      label: 'Русский',              flag: '🇷🇺'},
  {code: 'es',      label: 'Español',              flag: '🇪🇸'},
  {code: 'ur',      label: 'اردو',                 flag: '🇵🇰'},
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
