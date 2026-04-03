import {useCallback, useEffect, useMemo, useRef} from 'react';
import MapGL, {type MapLayerMouseEvent, type ViewStateChangeEvent} from 'react-map-gl/maplibre';
import type {MapRef} from 'react-map-gl/maplibre';
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
  const {
    center,
    layers,
    maxZoom,
    minZoom,
    zoom,
    setZoom,
    setClickedFeatures,
  } = useMap();

  const mapStyle = useMemo(() => getMapStyle(protomapsApiKey, 'light'), [protomapsApiKey]);
  const layerIds = useMemo(() => layers.map((l) => `layer-${l.id}`), [layers]);
  const layerIdsRef = useRef(layerIds);
  layerIdsRef.current = layerIds;

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    map.flyTo({
      center: [center.lng, center.lat],
      ...(center.timestamp ? {duration: 1500} : {duration: 0}),
    });
  }, [center, mapRef]);

  // When zoom is set programmatically (e.g. ZoomButtons, Geocoder), animate to it.
  const programmaticZoom = useRef(false);
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || !zoom.timestamp) return;
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

      const features = map.queryRenderedFeatures(bbox, {layers: layerIdsRef.current});
      const parsed = features.map((f) => {
        const props = parseFeatureProperties(f.properties ?? {});
        const id = props.id;
        if (id && featureLookupRef.current.has(String(id))) {
          return featureLookupRef.current.get(String(id))!;
        }
        return props;
      });
      setClickedFeatures(parsed);

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
    <div style={{width: '100%', height: '100%', position: 'relative'}}>
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
        style={{width: '100%', height: '100%'}}
      >
        <MapLayers mapRef={mapRef} />
      </MapGL>
      {controls}
    </div>
  );
}
