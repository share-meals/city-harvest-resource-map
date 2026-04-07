import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import MapGL, {Marker, Source, Layer, type MapLayerMouseEvent, type ViewStateChangeEvent} from 'react-map-gl/maplibre';
import type {MapRef} from 'react-map-gl/maplibre';
import {useTranslation} from 'react-i18next';
import {useMap} from './MapContext';
import {MapLayers} from './MapLayers';
import {getMapStyle} from './mapStyle';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapViewProps {
  controls?: React.ReactNode;
  mapRef: React.RefObject<MapRef | null>;
  onMapClick?: (arg: {data: any[]; lat: number; lng: number}) => void;
  protomapsApiKey: string;
}

function createCircleGeoJSON(center: [number, number], radiusMeters: number, steps: number = 64): GeoJSON.Feature {
  const coords: [number, number][] = [];
  const km = radiusMeters / 1000;
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * 2 * Math.PI;
    const dx = km * Math.cos(angle);
    const dy = km * Math.sin(angle);
    const lat = center[1] + (dy / 111.32);
    const lng = center[0] + (dx / (111.32 * Math.cos(center[1] * Math.PI / 180)));
    coords.push([lng, lat]);
  }
  return {
    type: 'Feature',
    geometry: {type: 'Polygon', coordinates: [coords]},
    properties: {},
  };
}

function parseFeatureProperties(properties: Record<string, any>): Record<string, any> {
  const parsed: Record<string, any> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (typeof value === 'string') {
      try {
        const maybeJson = JSON.parse(value);
        if (typeof maybeJson === 'object' && maybeJson !== null) {
          parsed[key] = maybeJson;
          continue;
        }
      } catch {
        // not JSON
      }
    }
    parsed[key] = value;
  }
  return parsed;
}

export function MapView({controls, mapRef, onMapClick, protomapsApiKey}: MapViewProps) {
  const {t, i18n} = useTranslation();
  const {
    center,
    layers,
    maxZoom,
    minZoom,
    zoom,
    setZoom,
    setClickedFeatures,
  } = useMap();

  const mapStyle = useMemo(() => getMapStyle(protomapsApiKey, 'light', i18n.language), [protomapsApiKey, i18n.language]);
  const layerIds = useMemo(() => layers.map((l) => `layer-${l.id}`), [layers]);
  const layerIdsRef = useRef(layerIds);
  layerIdsRef.current = layerIds;

  const [clickHighlight, setClickHighlight] = useState<{
    center: [number, number];
    radiusMeters: number;
  } | null>(null);

  const flyingTo = useRef(false);

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || !center.timestamp) return;
    flyingTo.current = true;
    map.flyTo({
      center: [center.lng, center.lat],
      zoom: zoom.level,
      duration: 1500,
    });
    map.once('moveend', () => { flyingTo.current = false; });
  }, [center, mapRef]);

  // When zoom is set programmatically (e.g. ZoomButtons, Geocoder), animate to it.
  // Skip if a flyTo is already in progress (which handles zoom too).
  const programmaticZoom = useRef(false);
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || !zoom.timestamp || flyingTo.current) return;
    programmaticZoom.current = true;
    map.zoomTo(zoom.level, {duration: 300});
  }, [zoom, mapRef]);

  // Sync map's actual zoom back to context via react-map-gl's onZoomEnd prop
  const handleZoomEnd = useCallback(
    (e: ViewStateChangeEvent) => {
      if (programmaticZoom.current) {
        programmaticZoom.current = false;
        return;
      }
      const z = Math.round(e.viewState.zoom);
      setZoom({level: z});
    },
    [setZoom],
  );

  // Build a lookup of all feature properties by id from the current layer data
  const featureLookupRef = useRef<Map<string, Record<string, any>>>(new Map());
  useEffect(() => {
    const lookup = new Map<string, Record<string, any>>();
    for (const layer of layers) {
      const geojson = layer.geojson as any;
      const features = geojson?.features ?? [];
      for (const f of features) {
        const id = f.properties?.id ?? f.id;
        if (id) {
          lookup.set(String(id), f.properties ?? {});
        }
      }
    }
    featureLookupRef.current = lookup;
  }, [layers]);

  const handleClick = useCallback(
    (e: MapLayerMouseEvent) => {
      const map = mapRef.current?.getMap();
      if (!map) return;

      const bbox: [[number, number], [number, number]] = [
        [e.point.x - 10, e.point.y - 10],
        [e.point.x + 10, e.point.y + 10],
      ];

      const existingLayers = layerIdsRef.current.filter((id) => map.getLayer(id));
      if (existingLayers.length === 0) return;
      const features = map.queryRenderedFeatures(bbox, {layers: existingLayers});
      const parsed = features.map((f) => {
        const props = parseFeatureProperties(f.properties ?? {});
        const id = props.id;
        if (id && featureLookupRef.current.has(String(id))) {
          return featureLookupRef.current.get(String(id))!;
        }
        return props;
      });
      setClickedFeatures(parsed);

      if (parsed.length > 0) {
        // Convert 10px hitbox to meters at current zoom/latitude
        const metersPerPx = 156543.03 * Math.cos(e.lngLat.lat * Math.PI / 180) / Math.pow(2, map.getZoom());
        setClickHighlight({
          center: [e.lngLat.lng, e.lngLat.lat],
          radiusMeters: metersPerPx * 10,
        });
      } else {
        setClickHighlight(null);
      }

      if (onMapClick) {
        onMapClick({
          data: parsed,
          lat: e.lngLat.lat,
          lng: e.lngLat.lng,
        });
      }
    },
    [mapRef, setClickedFeatures, onMapClick],
  );

  return (
    <div role="region" aria-label={t('aria.map')} style={{width: '100%', height: '100%', position: 'relative'}}>
      <MapGL
        ref={mapRef as React.Ref<MapRef>}
        initialViewState={{
          longitude: center.lng,
          latitude: center.lat,
          zoom: 12,
        }}
        maxZoom={maxZoom}
        minZoom={minZoom}
        mapStyle={mapStyle}
        onClick={handleClick}
        onZoomEnd={handleZoomEnd}
        trackResize={false}
        style={{width: '100%', height: '100%'}}
      >
        <MapLayers />
        {center.timestamp && (
          <Marker
            longitude={center.lng}
            latitude={center.lat}
            anchor="bottom"
          >
            <svg width="24" height="36" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24s12-15 12-24c0-6.627-5.373-12-12-12z" fill="#E53935"/>
              <circle cx="12" cy="12" r="5" fill="white"/>
            </svg>
          </Marker>
        )}
        {clickHighlight && (
          <Source
            id="click-highlight-area"
            type="geojson"
            data={createCircleGeoJSON(clickHighlight.center, clickHighlight.radiusMeters)}
          >
            <Layer
              id="click-highlight-circle"
              type="fill"
              paint={{
                'fill-color': 'rgba(25, 118, 210, 0.25)',
              }}
            />
          </Source>
        )}
      </MapGL>
      {controls}
    </div>
  );
}
