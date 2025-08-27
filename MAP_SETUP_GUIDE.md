# Map Setup Guide for Contact Page

## Option 1: Google Maps (Recommended)

### Step 1: Get Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the "Maps JavaScript API"
4. Go to "Credentials" and create an API key
5. Restrict the API key to your domain for security

### Step 2: Add Environment Variable
Create or update your `.env.local` file:
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### Step 3: Update Coordinates
In `src/app/(app)/(home)/contact/page.tsx`, update the coordinates:
```javascript
center: { lat: YOUR_LATITUDE, lng: YOUR_LONGITUDE }
```

## Option 2: OpenStreetMap (Free Alternative)

If you prefer a free alternative, you can use OpenStreetMap with Leaflet:

### Install Leaflet:
```bash
npm install leaflet react-leaflet --legacy-peer-deps
```

### Update the map component:
```javascript
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// In your component:
<MapContainer 
  center={[YOUR_LAT, YOUR_LNG]} 
  zoom={13} 
  style={{ height: "400px", width: "100%" }}
>
  <TileLayer
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  />
  <Marker position={[YOUR_LAT, YOUR_LNG]}>
    <Popup>
      Visual Emotion Work
    </Popup>
  </Marker>
</MapContainer>
```

## Option 3: Simple Embedded Google Maps

For a simpler approach, you can embed a Google Maps iframe:

```javascript
// Replace the map section with:
<div className="w-full h-full rounded-lg overflow-hidden">
  <iframe
    src="https://www.google.com/maps/embed?pb=https://maps.app.goo.gl/EoCV4CZiF6nB6eLa8"
    width="100%"
    height="100%"
    style={{ border: 0 }}
    allowFullScreen
    loading="lazy"
    referrerPolicy="no-referrer-when-downgrade"
  ></iframe>
</div>
```

## Option 4: Mapbox (Alternative to Google Maps)

### Install Mapbox:
```bash
npm install mapbox-gl --legacy-peer-deps
```

### Setup:
1. Get a Mapbox access token from [mapbox.com](https://www.mapbox.com/)
2. Add to `.env.local`:
```env
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

## Current Implementation

The current implementation uses Google Maps with:
- Custom styling to match your white theme
- Custom marker icon
- Loading state
- Error handling with fallback

## Troubleshooting

1. **API Key Issues**: Make sure your Google Maps API key is valid and has the Maps JavaScript API enabled
2. **Billing**: Google Maps requires billing to be enabled (but has a generous free tier)
3. **Domain Restrictions**: Ensure your API key allows your domain
4. **CORS Issues**: If using localhost, make sure your API key allows localhost

## Coordinates for Common Cities

- New York: `{ lat: 40.7128, lng: -74.0060 }`
- Los Angeles: `{ lat: 34.0522, lng: -118.2437 }`
- Chicago: `{ lat: 41.8781, lng: -87.6298 }`
- London: `{ lat: 51.5074, lng: -0.1278 }`
- Paris: `{ lat: 48.8566, lng: 2.3522 }`

Replace with your actual business location coordinates!
