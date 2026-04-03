import {IonCheckbox, IonItem, IonLabel, IonList} from '@ionic/react';
import {useTranslation} from 'react-i18next';
import {useMap} from './MapContext';

export function LayerToggles() {
  const {layers, visibleLayers, setVisibleLayers} = useMap();
  const {t} = useTranslation();

  return (
    <fieldset style={{border: 'none', margin: 0, padding: 0}}>
      <legend>{t('aria.layerTogglesLegend')}</legend>
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
                '--checkbox-background': 'white',
                '--checkbox-background-checked': layer.fillColor,
                '--border-color': layer.fillColor,
                '--border-color-checked': layer.fillColor,
                '--checkmark-color': layer.fillColor,
              }}
            />
            <IonLabel>{layer.name}</IonLabel>
          </IonItem>
        ))}
      </IonList>
    </fieldset>
  );
}
