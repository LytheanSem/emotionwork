"use client";

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapComponent = () => {
  // Business location coordinates (update these to your actual location)
  const businessLocation: [number, number] = [40.7128, -74.0060]; // Replace with your actual coordinates

  return (
    <div className="w-full h-full">
      <MapContainer 
        center={businessLocation} 
        zoom={15} 
        style={{ height: "100%", width: "100%" }}
        className="rounded-lg"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={businessLocation}>
          <Popup>
            <div className="text-center">
              <h3 className="font-bold text-gray-900">Visual Emotion Work</h3>
              <p className="text-sm text-gray-600">1234 Venue St. City, State, 56789</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapComponent;
