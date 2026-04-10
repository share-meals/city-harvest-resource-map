import {
  IonApp,
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonModal,
  IonPage,
  IonRow,
  IonTitle,
  IonToolbar,
  setupIonicReact
} from '@ionic/react';
import {
  Geocoder,
  LanguageSelector,
  LayerToggles,
  MapProvider,
  MapView,
  useMap,
} from './map';
import type {MapLayerConfig} from './map';
import type {MapRef} from 'react-map-gl/maplibre';

import {ZoomButtons} from './ZoomButtons';
import {Renderer} from './data/Renderer';
import {logToServer} from './logging';
import {
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {useTranslation} from 'react-i18next';
import {useWindowSize} from '@uidotdev/usehooks';
import {
  closeSharp,
  searchSharp,
  layersSharp
} from 'ionicons/icons';

import './App.scss';

import mms_en from './data/mms.json';
import mms_es from './data/mms.es.json';
import mms_ko from './data/mms.ko.json';
import mms_id from './data/mms.id.json';
import mm_truck from './data/mm_truck.svg';
import cpds_en from './data/cpds.json';
import cpds_es from './data/cpds.es.json';
import cpds_ko from './data/cpds.ko.json';
import cpds_id from './data/cpds.id.json';

const mmsByLang: Record<string, any> = {en: mms_en, es: mms_es, ko: mms_ko, id: mms_id};
const cpdsByLang: Record<string, any> = {en: cpds_en, es: cpds_es, ko: cpds_ko, id: cpds_id};

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

// @ts-ignore
const geojsonify = ({geolocation, ...data}) => {
  return {
    type: 'Feature',
    geometry: geolocation,
    properties: data
  }
};

setupIonicReact();

const GeocoderWrapper: React.FC<{
  modal?: React.RefObject<HTMLIonModalElement>,
  setCenter: any
}> = ({modal, setCenter}) => {
  const {setZoom} = useMap();
  const {t, i18n} = useTranslation();
  return <Geocoder
    apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
    components={{
      administrativeArea: 'NY',
      locality: 'New York'
    }}
    onGeocode={(results) => {
      const result = results[0];
      setCenter({
        lat: result.geometry.location.lat(),
        lng: result.geometry.location.lng(),
        timestamp: new Date()
      });
      setZoom({
        level: 16,
        timestamp: new Date()
      });
      if(modal){
        modal.current?.dismiss();
      }
      logGeocode(result, i18n.language);
    }}
    helperText={t('geocoder.helperText')}
  />
};

const InfoModal = ({trigger}: {trigger: string}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const {t} = useTranslation();
  useEffect(() => {
    setIsOpen(trigger !== '');
  }, [trigger]);
  return <IonModal isOpen={isOpen} aria-labelledby='info-modal-title'>
    <IonHeader className='ion-no-border'>
      <IonToolbar>
	<IonTitle id='info-modal-title'>{t('aria.featureDetails')}</IonTitle>
	<IonButtons slot='end'>
	  <IonButton aria-label={t('aria.close')} onClick={() => {setIsOpen(false);}}>
	    <IonIcon slot='icon-only' icon={closeSharp} />
	  </IonButton>
	</IonButtons>
      </IonToolbar>
    </IonHeader>
    <IonContent className='ion-padding'>
      <Renderer />
    </IonContent>
  </IonModal>;
}

const LayerTogglesModal = () => {
  const modal = useRef<HTMLIonModalElement>(null);
  const {t} = useTranslation();
  return <IonModal ref={modal} trigger='openLayerTogglesModal' aria-labelledby='layer-toggles-modal-title'>
    <IonHeader className='ion-no-border'>
      <IonToolbar>
	<IonTitle id='layer-toggles-modal-title'>{t('aria.layerSelection')}</IonTitle>
	<IonButtons slot='end'>
	  <IonButton aria-label={t('aria.close')} onClick={() => {modal.current?.dismiss();}}>
	    <IonIcon slot='icon-only' icon={closeSharp} />
	  </IonButton>
	</IonButtons>
      </IonToolbar>
    </IonHeader>
    <IonContent className='ion-padding'>
      <LayerToggles />
    </IonContent>
  </IonModal>;
}

const logGeocode = (result: google.maps.GeocoderResult, language: string) => {
  logToServer('/log-geocode', {
    address: result.formatted_address,
    lat: result.geometry.location.lat(),
    lng: result.geometry.location.lng(),
    language,
  });
};


const GeocoderModal: React.FC<{
  setCenter: any
}> = ({setCenter}) => {
  const modal = useRef<HTMLIonModalElement>(null);
  const {t} = useTranslation();
  return <IonModal ref={modal} trigger='openGeocoderModal' aria-labelledby='geocoder-modal-title'>
    <IonHeader className='ion-no-border'>
      <IonToolbar>
	<IonTitle id='geocoder-modal-title'>
	  {t('geocoder.modalTitle')}
	</IonTitle>
	<IonButtons slot='end'>
	  <IonButton aria-label={t('aria.close')} onClick={() => {modal.current?.dismiss();}}>
	    <IonIcon slot='icon-only' icon={closeSharp} />
	  </IonButton>
	</IonButtons>
      </IonToolbar>
    </IonHeader>
    <IonContent className='ion-padding'>
      <GeocoderWrapper modal={modal} setCenter={setCenter}/>
    </IonContent>
  </IonModal>;
}

const ENV_MODE = import.meta.env.MODE;
if (ENV_MODE === 'live') {
  console.log('Environment: live');
}

const EnvironmentBanner = () => {
  if (ENV_MODE === 'live') return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 99999,
      background: '#ff9800',
      color: 'white',
      textAlign: 'center',
      fontSize: '12px',
      padding: '2px 0',
      fontWeight: 'bold',
    }}>
      {ENV_MODE.toUpperCase()}
    </div>
  );
};

export const App = () => {
  const {t, i18n} = useTranslation();

  // Update <html lang> attribute when language changes
  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const [foodPantries, setFoodPantries] = useState<any>([]);
  const [soupKitchens, setSoupKitchens] = useState<any>([]);
  const [center, setCenter] = useState<any>({
    lat: 40.7127281,
    lng: -74.0060152
  });
  const mapRef = useRef<MapRef>(null);
  const size: {
    height: number | null,
    width: number | null
  } = useWindowSize();
  const isMobile: boolean = size.width! < 576;
  const controls: any = [
    <span className='primaryButtons' key='primaryButtons'>
      <ZoomButtons />
    </span>,
    <span className='secondaryButtons' key='secondaryButtons'>
      <IonButton id='openLayerTogglesModal' aria-label={t('aria.toggleLayers')}>
	<IonIcon slot='icon-only' icon={layersSharp} />
      </IonButton>
      <IonButton id='openGeocoderModal' aria-label={t('aria.searchAddress')}>
	<IonIcon slot='icon-only' icon={searchSharp} />
      </IonButton>
    </span>
  ];
  const onMapClick = ({data}: {data: any, lat: number, lng: number}) => {
    if(isMobile && data.length > 0){
      setInfoTrigger((new Date()).toString());
    }
  };
  const [infoTrigger, setInfoTrigger] = useState<string>('');
  useEffect(() => {
    if(!isMobile && infoTrigger !== ''){
      setInfoTrigger('');
    }
  }, [isMobile, infoTrigger, setInfoTrigger]);

  useEffect(() => {
    const lang = i18n.language;
    const filename = `foodPantriesOpen.${lang}.json`;
    fetch(`${import.meta.env.VITE_DATA_URL}/${filename}`)
      .then(response => response.json())
      .then((response) => {
	const items = Array.isArray(response) ? response : response.data;
	const fp = items.filter((r: any) => r.type === 'foodPantry').map(geojsonify);
	const sk = items.filter((r: any) => r.type === 'soupKitchen').map(geojsonify);
	setFoodPantries(fp);
	setSoupKitchens(sk);
      })
      .catch((error) => {
	console.log(error);
      });
  }, [i18n.language]);

  const staticLayers: MapLayerConfig[] = useMemo(() => [
    {
      id: 'cpd',
      name: t('layers.cpd'),
      geojson: (cpdsByLang[i18n.language] || cpdsByLang.en) as GeoJSON.GeoJSON,
      featureRadius: 10,
      featureWidth: 4,
      fillColor: 'rgba(210, 91, 115, 0.75)',
      strokeColor: 'white',
      type: 'vector'
    },
    {
      id: 'mobile-markets',
      name: t('layers.mobileMarkets'),
      geojson: (mmsByLang[i18n.language] || mmsByLang.en) as GeoJSON.GeoJSON,
      fillColor: '#006747',
      strokeColor: 'white',
      icon: mm_truck,
      type: 'vector'
    }
  ], [t, i18n.language]);

  const allLayers: MapLayerConfig[] = useMemo(() => [
    ...staticLayers,
    {
      id: 'food-pantries',
      name: t('layers.foodPantries'),
      featureRadius: 10,
      featureWidth: 4,
      fillColor: 'rgba(100, 167, 11, 0.75)',
      geojson: {
        type: 'FeatureCollection' as const,
        features: foodPantries
      },
      strokeColor: 'white',
      type: 'vector',
    },
    {
      id: 'soup-kitchens',
      name: t('layers.soupKitchens'),
      featureRadius: 10,
      featureWidth: 4,
      fillColor: 'rgba(137, 59, 103, 0.75)',
      geojson: {
        type: 'FeatureCollection' as const,
        features: soupKitchens
      },
      strokeColor: 'white',
      type: 'vector',
    }
  ], [staticLayers, foodPantries, soupKitchens, t]);

  return <IonApp>
    <EnvironmentBanner />
    <IonPage>
      <IonContent>
	<div style={{height: '100vh', width: '100vw'}}>
	  <MapProvider
	    center={center}
	    layers={allLayers}
	    maxZoom={18}
	    minZoom={10}
	    mapRef={mapRef}>
	    {!isMobile &&
	     <IonGrid className='ion-no-padding'>
	       <IonRow style={{height: '100vh'}}>
		 <IonCol>
		   <MapView
		     controls={controls.slice(0, 1)}
		     mapRef={mapRef}
		     onMapClick={onMapClick}
		     protomapsApiKey={import.meta.env.VITE_PROTOMAPS_API_KEY}
		   />
		 </IonCol>
		 <IonCol>
		   <div className='ion-padding'>
		     <LanguageSelector />
		     <LayerToggles />
		     <GeocoderWrapper setCenter={setCenter} />
		     <Renderer />
		   </div>
		 </IonCol>
	       </IonRow>
	     </IonGrid>
	    }
	    {isMobile && <>
	      <MapView
		controls={<>{controls}</>}
		mapRef={mapRef}
		onMapClick={onMapClick}
		protomapsApiKey={import.meta.env.VITE_PROTOMAPS_API_KEY}
	      />
	      <InfoModal trigger={infoTrigger} />
	      <GeocoderModal setCenter={setCenter} />
	      <LayerTogglesModal />
	    </>
	    }
	  </MapProvider>
	</div>
      </IonContent>
    </IonPage>
  </IonApp>;
}
