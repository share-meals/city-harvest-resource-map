import {useRef, useCallback} from 'react';
import {useJsApiLoader} from '@react-google-maps/api';
import {IonInput, IonButton, IonSpinner} from '@ionic/react';
import {useTranslation} from 'react-i18next';

const LIBRARIES: ('places')[] = ['places'];

interface GeocoderProps {
  apiKey: string;
  components?: {
    administrativeArea?: string;
    locality?: string;
  };
  onGeocode: (results: google.maps.GeocoderResult[]) => void;
  helperText?: string;
}

export function Geocoder({apiKey, components, onGeocode, helperText}: GeocoderProps) {
  const {isLoaded} = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES,
  });
  const inputRef = useRef<HTMLIonInputElement>(null);

  const handleGeocode = useCallback(async () => {
    const address = (await inputRef.current?.getInputElement())?.value;
    if (!address) return;

    const geocoder = new google.maps.Geocoder();
    const componentRestrictions: google.maps.GeocoderComponentRestrictions = {};
    if (components?.administrativeArea) {
      componentRestrictions.administrativeArea = components.administrativeArea;
    }
    if (components?.locality) {
      componentRestrictions.locality = components.locality;
    }

    geocoder.geocode(
      {address, componentRestrictions},
      (results, status) => {
        if (status === 'OK' && results && results.length > 0) {
          onGeocode(results);
        }
      },
    );
  }, [components, onGeocode]);

  const {t} = useTranslation();

  if (!isLoaded) return <IonSpinner aria-label={t('geocoder.search')} />;

  return (
    <div>
      <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
        <IonInput
          ref={inputRef}
          label={helperText}
          labelPlacement="stacked"
          placeholder={t('geocoder.placeholder')}
          style={{flex: 1}}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleGeocode();
          }}
        />
        <IonButton onClick={handleGeocode}>
          {t('geocoder.search')}
        </IonButton>
      </div>
    </div>
  );
}
