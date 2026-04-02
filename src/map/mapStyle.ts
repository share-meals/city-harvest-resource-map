import {layers as protoLayers, namedTheme} from 'protomaps-themes-base';
import type {StyleSpecification} from 'maplibre-gl';

export function getMapStyle(apiKey: string, theme: 'light' | 'dark' = 'light'): StyleSpecification {
  return {
    version: 8,
    glyphs: 'https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf',
    sources: {
      protomaps: {
        type: 'vector',
        url: `https://api.protomaps.com/tiles/v4.json?key=${apiKey}`,
        attribution: '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>',
      },
    },
    layers: protoLayers('protomaps', namedTheme(theme)),
  };
}
