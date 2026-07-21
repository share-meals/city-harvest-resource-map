// Deriving the fields the backend wants from a Google GeocoderResult,
// without ever sending the raw typed text or free-form formatted address.

// Priority list for picking a single searchType from Google's `types` array.
// Ordered specific → general; first match wins. Anything Google returns that
// isn't in this list falls through to 'unknown'.
const SEARCH_TYPE_PRIORITY = [
  'street_address', 'premise', 'subpremise',
  'intersection',
  'postal_code',
  'route',
  'point_of_interest', 'establishment', 'airport', 'park', 'natural_feature',
  'neighborhood',
  'sublocality_level_5', 'sublocality_level_4', 'sublocality_level_3',
  'sublocality_level_2', 'sublocality_level_1', 'sublocality',
  'locality',
  'colloquial_area',
  'administrative_area_level_2', 'administrative_area_level_1',
  'country',
];

export type ResultBucket = 'NONE' | 'UNIQUE' | 'AMBIGUOUS';

export interface GeocodePayload {
  searchType: string;
  resultBucket: ResultBucket;
  resolvedCity: string | null;
  resolvedRegion: string | null;
  resolvedBorough: string | null;
  resolvedCountry: string | null;
  resolvedLocationType: string | null;
  lat: number | null;
  lng: number | null;
  resultsFound: boolean;
}

export function pickSearchType(types: string[] | undefined): string {
  if (!types) return 'unknown';
  for (const t of SEARCH_TYPE_PRIORITY) {
    if (types.includes(t)) return t;
  }
  return types[0] || 'unknown';
}

export function bucketResults(count: number): ResultBucket {
  if (count === 0) return 'NONE';
  if (count === 1) return 'UNIQUE';
  return 'AMBIGUOUS';
}

type Component = google.maps.GeocoderAddressComponent;

function componentByType(components: Component[] | undefined, type: string, useShortName = false): string | null {
  if (!components) return null;
  const hit = components.find((c) => c.types.includes(type));
  if (!hit) return null;
  return (useShortName ? hit.short_name : hit.long_name) || null;
}

export function classifyResult(
  results: google.maps.GeocoderResult[]
): GeocodePayload {
  if (!results.length) {
    return {
      searchType: 'unknown',
      resultBucket: 'NONE',
      resolvedCity: null,
      resolvedRegion: null,
      resolvedBorough: null,
      resolvedCountry: null,
      resolvedLocationType: null,
      lat: null,
      lng: null,
      resultsFound: false,
    };
  }

  const top = results[0];
  const components = top.address_components;

  return {
    searchType: pickSearchType(top.types),
    resultBucket: bucketResults(results.length),
    resolvedCity: componentByType(components, 'locality'),
    resolvedRegion: componentByType(components, 'administrative_area_level_1', true),
    resolvedBorough: componentByType(components, 'sublocality_level_1'),
    resolvedCountry: componentByType(components, 'country', true),
    resolvedLocationType: top.geometry?.location_type || null,
    lat: top.geometry?.location?.lat() ?? null,
    lng: top.geometry?.location?.lng() ?? null,
    resultsFound: true,
  };
}
