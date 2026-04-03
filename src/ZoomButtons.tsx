import {
    addSharp,
    removeSharp
} from 'ionicons/icons';
import {
    IonButton,
    IonIcon
} from '@ionic/react';
import {useTranslation} from 'react-i18next';
import {useMap} from './map';

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
    const {t} = useTranslation();
    return <IonButton
	       aria-label={direction === '+' ? t('aria.zoomIn') : t('aria.zoomOut')}
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
