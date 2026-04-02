import {IonCheckbox, IonItem, IonLabel, IonList} from '@ionic/react';
import {useMap} from './MapContext';

export function LayerToggles() {
  const {layers, visibleLayers, setVisibleLayers} = useMap();

  return (
    <IonList>
      {layers.map((layer) => (
        <IonItem key={layer.id} lines="none">
          <IonCheckbox
            slot="start"
            checked={visibleLayers[layer.id] !== false}
            onIonChange={(e) => {
              setVisibleLayers({
                ...visibleLayers,
                [layer.id]: e.detail.checked,
              });
            }}
            style={{
              '--checkbox-background-checked': layer.fillColor,
              '--border-color-checked': layer.fillColor,
              '--checkmark-color': layer.fillColor,
              '--checkmark-width': '0',
            }}
          />
          <IonLabel>{layer.name}</IonLabel>
        </IonItem>
      ))}
    </IonList>
  );
}
