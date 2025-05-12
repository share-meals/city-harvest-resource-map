import {
    addSharp,
    removeSharp
} from 'ionicons/icons';
import {
    IonButton,
    IonIcon
} from '@ionic/react';
import {useMap} from '@share-meals/frg-ui';

export interface ZoomButton extends Omit<React.ComponentProps<typeof IonButton>, 'disabled'>{
    direction: '-' | '+'
};

export interface MapControl {
    className: string,
    element: React.JSX.Element
};

const getTimestampedZoom = (zoom: number) => ({
  level: zoom,
  timestamp: new Date()
});

export const ZoomButton = ({
    direction,
    ...props
}: ZoomButton) => {
    const {
	maxZoom,
	minZoom,
	setZoom,
	zoom
    } = useMap();
    return <IonButton
	       disabled={direction === '+' ? zoom!.level >= maxZoom : zoom!.level <= minZoom}
	       onClick={() => {
		   const newZoom: number  = zoom!.level + (direction === '+' ? 1 : -1);
		   setZoom(direction === '+'
			 ? (newZoom > maxZoom ? getTimestampedZoom(maxZoom) : getTimestampedZoom(newZoom))
			 : (newZoom < minZoom ? getTimestampedZoom(minZoom) : getTimestampedZoom(newZoom)));
	       }}
    {...props}
    >
	<IonIcon slot='icon-only' icon={direction === '+' ? addSharp : removeSharp} />
    </IonButton>
}

export const ZoomButtons: React.FC<Omit<React.ComponentProps<typeof IonButton>, 'disabled'>> = (props) => <>
    <ZoomButton direction='+' {...props} />
    <ZoomButton direction='-' {...props} />
</>;
