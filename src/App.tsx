const logFunctionUrl = 'https://us-east1-city-harvest-423311.cloudfunctions.net';
const protomapsApiKey = 'dae8f6c71066c020';

import {RControl} from 'rlayers';

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
  getMapStyle,
  GeocoderInput,
  GeocoderProvider,
  Map,
  MapProvider,
  LayerToggles,
  useMap,
} from '@share-meals/frg-ui';

import {ZoomButtons} from './ZoomButtons';

import type {
  MapLayerProps,
  onGeocode
} from '@share-meals/frg-ui';
import {Renderer} from './data/Renderer';
import {
  useEffect,
  useRef,
  useState
} from 'react';
import {useWindowSize} from '@uidotdev/usehooks';
import {
  closeSharp,
  homeSharp,
  layersSharp
} from 'ionicons/icons';

import './App.scss';

import food_pantries from './data/fp.json';
import soup_kitchens from './data/soup_kitchens.json';
import mms from './data/mms.json';
import mm_truck from './data/mm_truck.png';
import cpds from './data/cpds.json';
import cpd_truck from './data/cpd_truck.png';

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

const scalingLookup = {
  10: 0.5,
  12: 0.75,
  14: 1,
  15: 1.25
}

// @ts-ignore
const geojsonify = ({geolocation, ...data}) => {
  return {
    type: 'Feature',
    geometry: geolocation,
    properties: data
  }
};

const layers: MapLayerProps[] = [
  {
    name: 'Community Partner Distributions',
    geojson: cpds,
    fillColor: '#D25B73',
    strokeColor: 'white',
    icon: cpd_truck,
    type: 'vector'
  },
  {
    name: 'Mobile Markets',
    geojson: mms,
    fillColor: '#006747',
    strokeColor: 'white',
    icon: mm_truck,
    type: 'vector'
  }
];

setupIonicReact();

const InfoModal = ({trigger}: {trigger: string}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  useEffect(() => {
    setIsOpen(trigger !== '');
  }, [trigger]);
  return <IonModal isOpen={isOpen}>
    <IonHeader>
      <IonToolbar>
	<IonButtons slot='end'>
	  <IonButton onClick={() => {setIsOpen(false);}}>
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
  return <IonModal ref={modal} trigger='openLayerTogglesModal'>
    <IonHeader>
      <IonToolbar>
	<IonButtons slot='end'>
	  <IonButton onClick={() => {modal.current?.dismiss();}}>
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

const logGeocode = ({latlng, address}: onGeocode) => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({address, ...latlng})
  };
  fetch(`${logFunctionUrl}/log-geocode`, options)
    .then((response) => {
    })
    .catch((error) => {
      console.log(error);
    });
};


const GeocoderModal = () => {
  const modal = useRef<HTMLIonModalElement>(null);
  return <IonModal ref={modal} trigger='openGeocoderModal'>
    <IonHeader>
      <IonToolbar>
	<IonTitle>
	  Go to an address
	</IonTitle>
	<IonButtons slot='end'>
	  <IonButton onClick={() => {modal.current?.dismiss();}}>
	    <IonIcon slot='icon-only' icon={closeSharp} />
	  </IonButton>
	</IonButtons>
      </IonToolbar>
    </IonHeader>
    <IonContent className='ion-padding'>
      <GeocoderInput
	onGeocode={(args) => {
	  modal.current?.dismiss();
	  logGeocode(args);
	}}
	helperText='To find food near you, please enter your address, city, and zip code'
      />
    </IonContent>
  </IonModal>;
}

export const App = () => {
  const [foodPantries, setFoodPantries] = useState<any>([]);
  const [soupKitchens, setSoupKitchens] = useState<any>([]);
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
      <IonButton id='openLayerTogglesModal'>
	<IonIcon slot='icon-only' icon={layersSharp} />
      </IonButton>
      <IonButton id='openGeocoderModal'>
	<IonIcon slot='icon-only' icon={homeSharp} />
      </IonButton>
    </span>
  ];
  const onMapClick = ({data, lat, lng}: {data: any, lat: number, lng: number}) => {
    if(data.length > 0
       && data.length <= 5){ // don't log anything larger than 5 so as no to clog up logs
      for(const d of data){
	const options = {
	  method: 'POST',
	  headers: {
	    'Content-Type': 'application/json'
	  },
	  body: JSON.stringify({id: d.id, lat, lng})
	};
    fetch(`${logFunctionUrl}/log-feature-click`, options)
      .then((response) => {
      })
      .catch((error) => {
	console.log(error);
      });
      }
    }
    if(isMobile){
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
    fetch('https://data-bundles.s3.us-east-2.amazonaws.com/allOpenFoodPantries.json')
      .then(response => response.json())
      .then(async (response) => {
	const fp = response.filter((r: any) => r.type === 'foodPantry').map(geojsonify);
	const sk = response.filter((r: any) => r.type === 'soupKitchen').map(geojsonify);
	setFoodPantries(fp);
	setSoupKitchens(sk);
      })
      .catch((error) => {
	console.log(error);
      });
  }, []);
  return <IonApp>
    <IonPage>
      <IonContent>
	<div style={{height: '100vh', width: '100vw'}}>
	  <MapProvider
	    center={{
	      lat: 40.7127281,
	      lng: -74.0060152
	    }}
	    layers={[
	      ...layers,
	      {
		name: 'Food Pantries',
		featureRadius: 10,
		featureWidth: 4,
		fillColor: 'rgba(100, 167, 11, 0.5)',
		// @ts-ignore
		geojson: {
		  type: 'FeatureCollection',
		  features: foodPantries
		},
		strokeColor: 'white',
		textScale: 1.5,
		type: 'vector',
	      },
	      {
		name: 'Soup Kitchens',
		featureRadius: 10,
		featureWidth: 4,
		fillColor: 'rgba(137, 59, 103, 0.5)',
		geojson: {
		  type: 'FeatureCollection',
		  features: soupKitchens
		},
		strokeColor: 'white',
		type: 'vector',
	      }
	    ]}
	    maxZoom={16}
	    minZoom={10}>
	    <GeocoderProvider
	      platform='nominatim'
	      url='https://nominatim.openstreetmap.org/search'>
	      {!isMobile &&
	       <IonGrid>
		 <IonRow style={{height: '100vh'}}>
		   <IonCol>
		     <Map
		       controls={controls.slice(0, 1)}
		       onMapClick={onMapClick}
		       onMapClickOptions={{
			 hitTolerance: 20
		       }}
		       protomapsApiKey={protomapsApiKey}
		       protomapsStyles={getMapStyle({
			 apiKey: protomapsApiKey,
			 theme: 'light'
		       })}
		       scalingLookup={scalingLookup}
		     />
		   </IonCol>
		   <IonCol>
		     <LayerToggles />
		     <GeocoderInput
		       onGeocode={logGeocode}
		       onGeocodeZoom={17}
		       helperText='To find food near you, please enter your address, city, and zip code'
		     />
		     <Renderer />
		   </IonCol>
		 </IonRow>
	       </IonGrid>
	      }
	      {isMobile && <>
		<Map
		  controls={controls}
		  onMapClick={onMapClick}
		  protomapsApiKey={protomapsApiKey}
		  protomapsStyles={getMapStyle({
		    apiKey: protomapsApiKey,
		    theme: 'light'
		  })}
		  scalingLookup={scalingLookup}
		/>
		<InfoModal trigger={infoTrigger} />
		<GeocoderModal />
		<LayerTogglesModal />
	      </>}
	    </GeocoderProvider>
	  </MapProvider>
	</div>
      </IonContent>
    </IonPage>
  </IonApp>;
}
