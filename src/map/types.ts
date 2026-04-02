export interface MapLayerConfig {
  id: string;
  name: string;
  geojson: GeoJSON.GeoJSON;
  featureRadius?: number;
  featureWidth?: number;
  fillColor: string;
  strokeColor: string;
  icon?: string;
  type: string;
}

export interface TimestampedLatLng {
  lat: number;
  lng: number;
  timestamp?: Date;
}

export interface TimestampedZoom {
  level: number;
  timestamp?: Date;
}

export type VisibleLayers = Record<string, boolean>;
