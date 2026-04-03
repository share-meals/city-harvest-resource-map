import {createContext, useContext, useState, useEffect} from 'react';
import type {ReactNode} from 'react';
import type {MapRef} from 'react-map-gl/maplibre';
import type {
  MapLayerConfig,
  TimestampedLatLng,
  TimestampedZoom,
  VisibleLayers,
} from './types';

interface MapContextValue {
  center: TimestampedLatLng;
  clickedFeatures: any[];
  setClickedFeatures: (features: any[]) => void;
  layers: MapLayerConfig[];
  maxZoom: number;
  minZoom: number;
  zoom: TimestampedZoom;
  setZoom: (zoom: TimestampedZoom) => void;
  visibleLayers: VisibleLayers;
  setVisibleLayers: (layers: VisibleLayers) => void;
  mapRef: React.RefObject<MapRef | null> | null;
}

const MapContext = createContext<MapContextValue | null>(null);

export function useMap(): MapContextValue {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error('useMap must be used within a MapProvider');
  return ctx;
}

interface MapProviderProps {
  center: TimestampedLatLng;
  children: ReactNode;
  layers: MapLayerConfig[];
  maxZoom: number;
  minZoom: number;
  mapRef: React.RefObject<MapRef | null>;
}

export function MapProvider({
  center: initialCenter,
  children,
  layers,
  maxZoom,
  minZoom,
  mapRef,
}: MapProviderProps) {
  const center = initialCenter;

  const [clickedFeatures, setClickedFeatures] = useState<any[]>([]);
  const [zoom, setZoom] = useState<TimestampedZoom>({level: 12, timestamp: new Date()});
  const [visibleLayers, setVisibleLayers] = useState<VisibleLayers>(() => {
    const initial: VisibleLayers = {};
    layers.forEach((l) => {
      initial[l.id] = true;
    });
    return initial;
  });

  // Add new layers to visibleLayers when they appear
  useEffect(() => {
    setVisibleLayers((prev) => {
      const next = {...prev};
      layers.forEach((l) => {
        if (next[l.id] === undefined) {
          next[l.id] = true;
        }
      });
      return next;
    });
  }, [layers]);

  return (
    <MapContext.Provider
      value={{
        center,
        clickedFeatures,
        setClickedFeatures,
        layers,
        maxZoom,
        minZoom,
        zoom,
        setZoom,
        visibleLayers,
        setVisibleLayers,
        mapRef,
      }}
    >
      {children}
    </MapContext.Provider>
  );
}
