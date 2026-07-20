# City Harvest Resource Map

An interactive map for finding free food resources in New York City, built with React, Ionic, and MapLibre GL.

## Setup

```bash
yarn install
```

### Environment Variables

Copy the example and fill in your values:

```bash
cp .env.example .env.development
cp .env.example .env.live
```

Required variables:

| Variable | Description |
|---|---|
| `VITE_PROTOMAPS_API_KEY` | API key for Protomaps vector tiles |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API key (geocoding) |
| `VITE_LOG_FUNCTION_URL` | Base URL for the logging Cloud Function |
| `VITE_DATA_URL` | Base URL for food pantry data endpoint |
| `VITE_DEBUG` | Set to `true` to log analytics to console instead of remote server |

- `.env.development` is loaded during `yarn dev`
- `.env.live` is loaded during `yarn build`

## Development

```bash
yarn dev
```

Runs at http://localhost:5173.

### Data source

Food pantry data is served from Cloudflare R2 as pre-scrubbed, per-language JSON files. The base URL is set by `VITE_DATA_URL`; the app fetches:

```
${VITE_DATA_URL}/pantries.open.{lang}.json
```

For any environment, `VITE_DATA_URL` should point at the public R2 base — production uses `https://files.cfamhub.org/feeds`. `{lang}` is one of `en`, `es`, `id`, `ko`, `zh`.

If the requested language's file isn't available, the app falls back to `pantries.open.en.json` and shows a toast letting the user know. If English is also unavailable, an error toast is shown and the map is left empty.

## Production Build

```bash
yarn build
yarn preview
```

## Internationalization

The app supports 5 languages via react-i18next:

- English (`en`)
- Spanish (`es`) - Español
- Korean (`ko`) - 한국어
- Indonesian (`id`) - Bahasa Indonesia
- Chinese (`zh`) - 中文

Language is auto-detected from the `?lang=` URL parameter (for iframe embedding), then the browser's preferred language, then defaults to English.

UI translations are in `src/i18n/locales/`. Static layer data (CPD, Mobile Markets) has pre-translated GeoJSON files (e.g. `cpds.es.json`). Food pantry/soup kitchen data is translated server-side and loaded from the localized JSON endpoint.

## Map Layers

| Layer | Source | Color |
|---|---|---|
| Community Partner Distributions | `src/data/cpds.json` (static, translated) | Pink |
| Mobile Markets | `src/data/mms.json` (static, translated) | Green (truck icon) |
| Food Pantries | Remote API (per language) | Green |
| Soup Kitchens | Remote API (per language) | Purple |

## Geocoder

Searching an address flies the map to the location and places a red pin marker. The geocoder is restricted to New York City addresses.

## Logging

Two analytics events are logged to `VITE_LOG_FUNCTION_URL`:

- **`/log-geocode`** - POST `{address, lat, lng, language}` when a user searches an address
- **`/log-feature-click`** - POST `{id, lat, lng, language}` when a user clicks a map feature

## Project Structure

```
src/
  i18n/
    config.ts          # i18next initialization
    locales/           # Translation JSON files (en, es, zh, ko)
  map/
    MapContext.tsx      # React context for map state
    MapView.tsx         # MapLibre GL map component
    MapLayers.tsx       # GeoJSON layer rendering
    LayerToggles.tsx    # Layer visibility checkboxes
    Geocoder.tsx        # Google Maps address search
    LanguageSelector.tsx # Language dropdown
    mapStyle.ts         # Protomaps style generation
    types.ts            # Shared TypeScript interfaces
  data/
    Renderer.tsx        # Feature detail display
    RendererUtil.tsx    # Feature data formatting
    PrivacyPolicy.tsx   # Privacy policy component
    cpds.json           # Community Partner Distributions data
    mms.json            # Mobile Markets data
    mm_truck.svg        # Mobile Markets icon
  App.tsx               # Main app component
  App.scss              # App styles
```
