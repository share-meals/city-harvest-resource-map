import {useRef, useCallback} from 'react';
import {useJsApiLoader} from '@react-google-maps/api';
import {IonInput, IonButton, IonIcon, IonSpinner, IonText} from '@ionic/react';
import {searchSharp} from 'ionicons/icons';
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
      {helperText && (
        <IonText>
          <p className='geocoder-helper-text'>{helperText}</p>
        </IonText>
      )}
      <div style={{display: 'flex', alignItems: 'center', gap: '8px', width: '100%', marginBottom: '32px'}}>
        <IonInput
          ref={inputRef}
          aria-label={t('geocoder.placeholder')}
          placeholder={t('geocoder.placeholder')}
          fill="outline"
          style={{flex: '1 1 0', minWidth: 0}}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleGeocode();
          }}
        />
        <IonButton aria-label={t('geocoder.search')} style={{flexShrink: 0}} onClick={handleGeocode}>
          <IonIcon slot='icon-only' icon={searchSharp} />
        </IonButton>
      </div>
    </div>
  );
}
