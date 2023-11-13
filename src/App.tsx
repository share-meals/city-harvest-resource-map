import {
    IonApp,
    IonContent,
    IonPage,
    setupIonicReact
} from '@ionic/react';
import {Map} from '@share-meals/frg-ui';
import type {MapLayer} from 'share-meals/frg-ui';
import {Renderer} from './data/Renderer';

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
	fillColor: '#54688b',
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

export const App = () => {
    return (
	<IonApp>
	    <IonPage>
		<IonContent>
		    <div style={{height: '100vh', width: '100vw'}}>
			<Map
			center={{
			    lat: 40.7127281,
			    lng: -74.0060152
			}}
			geocoderPlatform='nominatim'
			geocoderUrl='https://nominatim.openstreetmap.org/search'
			
			    renderer={Renderer}
			layers={layers}
			/>
		    </div>
		</IonContent>
	    </IonPage>
	</IonApp>	
    );
}
