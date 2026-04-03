import {Source, Layer, useMap as useMapGL} from 'react-map-gl/maplibre';
import {useMap} from './MapContext';
import {useEffect, useState} from 'react';

function loadSvgImage(map: maplibregl.Map, id: string, url: string, size: number = 40): Promise<void> {
  return new Promise((resolve) => {
    if (map.hasImage(id)) { resolve(); return; }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (map.hasImage(id)) { resolve(); return; }
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, size, size);
      const imageData = ctx.getImageData(0, 0, size, size);
      map.addImage(id, {width: size, height: size, data: imageData.data});
      resolve();
    };
    img.onerror = () => resolve();
    img.src = url;
  });
}

export function MapLayers() {
  const {layers, visibleLayers} = useMap();
  const {current: mapInstance} = useMapGL();
  const [iconsLoaded, setIconsLoaded] = useState(false);

  useEffect(() => {
    const map = mapInstance?.getMap();
    if (!map) return;

    const addIcons = async () => {
      const iconLayers = layers.filter((l) => l.icon);
      await Promise.all(
        iconLayers.map((l) => loadSvgImage(map, `icon-${l.id}`, l.icon!))
      );
      setIconsLoaded(true);
      map.triggerRepaint();
    };

    if (map.isStyleLoaded()) {
      addIcons();
    } else {
      map.on('style.load', addIcons);
      return () => { map.off('style.load', addIcons); };
    }
  }, [mapInstance, layers]);

  const scalingStops: [number, number][] = [
    [10, 0.5],
    [12, 0.75],
    [14, 1],
    [15, 1.25],
  ];

  function scaledRadiusExpr(baseRadius: number): any {
    return [
      'interpolate', ['linear'], ['zoom'],
      ...scalingStops.flatMap(([z, s]) => [z, baseRadius * s]),
    ];
  }

  const iconScalingExpr: any = [
    'interpolate', ['linear'], ['zoom'],
    ...scalingStops.flatMap(([z, s]) => [z, s]),
  ];

  return (
    <>
      {layers.map((layer) => {
        const visible = visibleLayers[layer.id] !== false;
        const sourceId = `source-${layer.id}`;
        const layerId = `layer-${layer.id}`;

        if (layer.icon) {
          // Don't render symbol layer until icons are loaded
          if (!iconsLoaded) return null;
          return (
            <Source key={sourceId} id={sourceId} type="geojson" data={layer.geojson}>
              <Layer
                id={layerId}
                type="symbol"
                layout={{
                  visibility: visible ? 'visible' : 'none',
                  'icon-image': `icon-${layer.id}`,
                  'icon-size': iconScalingExpr,
                  'icon-allow-overlap': true,
                }}
              />
            </Source>
          );
        }

        return (
          <Source key={sourceId} id={sourceId} type="geojson" data={layer.geojson}>
            <Layer
              id={layerId}
              type="circle"
              layout={{
                visibility: visible ? 'visible' : 'none',
              }}
              paint={{
                'circle-radius': scaledRadiusExpr(layer.featureRadius ?? 10),
                'circle-color': layer.fillColor,
                'circle-stroke-color': layer.strokeColor,
                'circle-stroke-width': layer.featureWidth ?? 2,
                'circle-opacity': 1,
              }}
            />
          </Source>
        );
      })}
    </>
  );
}
