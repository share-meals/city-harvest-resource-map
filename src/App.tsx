// @ts-ignore
import {Map} from 'frg';

import food_pantries from './data/food_pantries.json';
import soup_kitchens from './data/soup_kitchens.json';

const PopupRenderer = ({
    data
}: any) => {
    return (
	<>
	    <strong>{data?.name}</strong>
	    <br />
	    {data?.address}
	    <br />
	    {data?.city}, {data?.state} {data?.zip}
		
	</>
    );
}


function App() {
  return (
      <>
	  <div style={{height: '50vh'}}>
	      <Map
		  layers={[
		      {
			  name: 'Food Pantries',
			  geojson: food_pantries,
			  color: 'red'
		      },
		      {
			  name: 'Soup Kitchens',
			  geojson: soup_kitchens,
			  color: 'blue'
		      }
		  ]}
		  center={{
		      lat: 40.7127281,
		      lng: -74.0060152
		  }}
	          popupRenderer={PopupRenderer}
	      />
	  </div>
      </>
  )
}

export default App
