import {
    useEffect,
    useRef,
    useState
} from 'react';
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
    GeocoderInput,
    GeocoderProvider,
    Map,
    MapControl,
    MapProvider,
    LayerToggles,
    ZoomButtons,
} from '@share-meals/frg-ui';

import type {
    MapLayer,
    onGeocode
} from '@share-meals/frg-ui';
import {Renderer} from './data/Renderer';
import {useWindowSize} from '@uidotdev/usehooks';
import {
    closeSharp,
    homeSharp,
    layersSharp
} from 'ionicons/icons';

import './App.scss';



import food_pantries from './data/food_pantries.json';
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

const layers: MapLayer[] = [
    {
	name: 'Community Partner Distributions',
	geojson: cpds,
	fillColor: '#D25B73',
      strokeColor: 'white',
      icon: {
	src: cpd_truck,
	scale: 0.13312
	}
    },
    {
	name: 'Mobile Markets',
	geojson: mms,
	fillColor: '#006747',
	strokeColor: 'white',
	icon: {
	    src: mm_truck,
	    scale: 0.065
	}
    },
    {
	name: 'Food Pantries',
	geojson: food_pantries,
	fillColor: '#64a70b',
	strokeColor: 'white'
    },
    {
	name: 'Soup Kitchens',
	geojson: soup_kitchens,
	fillColor: '#893B67',
	strokeColor: 'white'
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
    /*
       if(onMapCenter !== undefined){
       onMapCenter({
       address,
       lat: latlng?.lat || null,
       lng: latlng?.lng || null,
       });
       }
       if(latlng !== null){
       const point: Coordinate = fromLonLat([latlng.lng, latlng.lat]);
       setView({
       center: point,
       zoom: view.zoom
       });
       setSpotlight!(new Point(point));
       setGeocoderErrorMessage(null);
       }else{
       setGeocoderErrorMessage('Address not found');
       }
     */
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
    const size: {
	height: number | null,
	width: number | null
    } = useWindowSize();
    const isMobile: boolean = size.width! < 576;
    const controls: MapControl[] = [
	{
	    className:'primaryButtons',
	    // @ts-ignore
	    element: <ZoomButtons />
	},
	{
	    className: 'secondaryButtons',
	    element: <>
		<IonButton id='openLayerTogglesModal'>
		    <IonIcon slot='icon-only' icon={layersSharp} />
		</IonButton>
		<IonButton id='openGeocoderModal'>
		    <IonIcon slot='icon-only' icon={homeSharp} />
		</IonButton>
	    </>
	}
    ];
    const [infoTrigger, setInfoTrigger] = useState<string>('');
    useEffect(() => {
	if(!isMobile && infoTrigger !== ''){
	    setInfoTrigger('');
	}
    }, [isMobile, infoTrigger, setInfoTrigger]);
    return <IonApp>
	<IonPage>
	    <IonContent>
		<div style={{height: '100vh', width: '100vw'}}>
		    <MapProvider
			center={{
			    lat: 40.7127281,
			    lng: -74.0060152
			}}
			layers={layers}
			maxZoom={20}
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
				onMapClick={() => {
				    setInfoTrigger((new Date()).toString());
				}}
				controls={controls} />
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
