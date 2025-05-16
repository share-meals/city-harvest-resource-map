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
  Geocoder,
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
  searchSharp,
  layersSharp
} from 'ionicons/icons';

import './App.scss';

import food_pantries from './data/fp.json';
import soup_kitchens from './data/soup_kitchens.json';
import mms from './data/mms.json';
import mm_truck from './data/mm_truck.svg';
import cpds from './data/cpds.json';

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
    featureRadius: 10,
    featureWidth: 4,
    fillColor: 'rgba(210, 91, 115, 0.75)',
    strokeColor: 'white',
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

const GeocoderWrapper: React.FC<{
  modal?: React.RefObject<HTMLIonModalElement>,
  setCenter: any
}> = ({modal, setCenter}) => {
  const {setZoom} = useMap();
  return <Geocoder
	   apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
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
	     logGeocode(result);
	   }}
	   helperText='To find free food near you, please enter your address, city, and zip code'
  />
};

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

const logGeocode = (result: onGeocode[number]) => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
    address: result.formatted_address, // TODO: maybe we should also capture the raw address entered?
    lat: result.geometry.location.lat(),
    lng: result.geometry.location.lng(),
  })
  };
  fetch(`${import.meta.env.VITE_LOG_FUNCTION_URL}/log-geocode`, options)
    .then((response) => {
    })
    .catch((error) => {
      console.log(error);
    });
};


const GeocoderModal: React.FC<{
  setCenter: any
}> = ({setCenter}) => {
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
      <GeocoderWrapper modal={modal} setCenter={setCenter}/>
    </IonContent>
  </IonModal>;
}

export const App = () => {
  const [foodPantries, setFoodPantries] = useState<any>([]);
  const [soupKitchens, setSoupKitchens] = useState<any>([]);
  const [center, setCenter] = useState<any>({
    lat: 40.7127281,
    lng: -74.0060152
  });
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
	<IonIcon slot='icon-only' icon={searchSharp} />
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
	fetch(`${import.meta.env.VITE_LOG_FUNCTION_URL}/log-feature-click`, options)
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
	    center={center}
	    layers={[
	      ...layers,
	      {
		name: 'Food Pantries',
		featureRadius: 10,
		featureWidth: 4,
		fillColor: 'rgba(100, 167, 11, 0.75)',
		// @ts-ignore
		geojson: {
		  type: 'FeatureCollection',
		  features: foodPantries
		},
		strokeColor: 'white',
		type: 'vector',
	      },
	      {
		name: 'Soup Kitchens',
		featureRadius: 10,
		featureWidth: 4,
		fillColor: 'rgba(137, 59, 103, 0.75)',
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
	    {!isMobile &&
	     <IonGrid className='ion-no-padding'>
	       <IonRow style={{height: '100vh'}}>
		 <IonCol>
		   <Map
		     controls={controls.slice(0, 1)}
		     onMapClick={onMapClick}
		     onMapClickOptions={{
		       hitTolerance: 10
		     }}
		     protomapsApiKey={import.meta.env.VITE_PROTOMAPS_API_KEY}
		     protomapsStyles={getMapStyle({
		       apiKey: import.meta.env.VITE_PROTOMAPS_API_KEY,
		       theme: 'light'
		     })}
		     scalingLookup={scalingLookup}
		   />
		 </IonCol>
		 <IonCol>
		   <div className='ion-padding'>
		     <LayerToggles />
		     <GeocoderWrapper setCenter={setCenter} />
		     <Renderer />
		   </div>
		 </IonCol>
	       </IonRow>
	     </IonGrid>
	    }
	    {isMobile && <>
	      <Map
		controls={controls}
		onMapClick={onMapClick}
		onMapClickOptions={{
		  hitTolerance: 10
		}}
		protomapsApiKey={import.meta.env.VITE_PROTOMAPS_API_KEY}
		protomapsStyles={getMapStyle({
		  apiKey: import.meta.env.VITE_PROTOMAPS_API_KEY,
		  theme: 'light'
		})}
		scalingLookup={scalingLookup}
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
