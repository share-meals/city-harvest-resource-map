import {layers as protoLayers, labels as protoLabels, namedTheme} from 'protomaps-themes-base';
import type {StyleSpecification, LayerSpecification} from 'maplibre-gl';

function styleLabels(labelLayers: LayerSpecification[]): LayerSpecification[] {
  return labelLayers.map((layer) => {
    const l = {...layer} as any;
    if (l.id === 'roads_labels_minor') {
      l.paint = {
        ...l.paint,
        'text-color': '#555555',
        'text-halo-color': '#ffffff',
        'text-halo-width': 2,
      };
      l.layout = {
        ...l.layout,
        'text-size': ['interpolate', ['linear'], ['zoom'], 12, 10, 16, 14],
      };
    } else if (l.id === 'roads_labels_major') {
      l.paint = {
        ...l.paint,
        'text-color': '#333333',
        'text-halo-color': '#ffffff',
        'text-halo-width': 2,
      };
      l.layout = {
        ...l.layout,
        'text-size': ['interpolate', ['linear'], ['zoom'], 10, 10, 16, 16],
      };
    } else if (l.id === 'places_locality') {
      l.paint = {
        ...l.paint,
        'text-color': '#222222',
        'text-halo-color': '#ffffff',
        'text-halo-width': 2,
      };
    } else if (l.id === 'places_subplace') {
      l.paint = {
        ...l.paint,
        'text-color': '#555555',
        'text-halo-color': '#ffffff',
        'text-halo-width': 2,
      };
    }
    return l;
  });
}

export function getMapStyle(apiKey: string, theme: 'light' | 'dark' = 'light', lang: string = 'en'): StyleSpecification {
  return {
    version: 8,
    glyphs: 'https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf',
    sprite: `https://protomaps.github.io/basemaps-assets/sprites/v4/${theme}`,
    sources: {
      protomaps: {
        type: 'vector',
        url: `https://api.protomaps.com/tiles/v4.json?key=${apiKey}`,
        attribution: '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>',
      },
    },
    layers: [
      ...protoLayers('protomaps', namedTheme(theme)),
      ...styleLabels(protoLabels('protomaps', theme, lang) as LayerSpecification[]),
    ],
  };
}
