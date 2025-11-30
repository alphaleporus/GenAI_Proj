'use client';

import React from 'react';
import {MapContainer, TileLayer, Marker, Polyline, Popup} from 'react-leaflet';
import {Truck} from '@/lib/types';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Pune, India coordinates
const PUNE_CENTER: [number, number] = [18.5204, 73.8567];

interface SupplyChainMapProps {
  trucks: Truck[];
  ecoMode: boolean;
}

// Custom truck icon
const createTruckIcon = (status: string) => {
  const color = status === 'on-time' ? '#10b981' : status === 'delayed' ? '#f59e0b' : '#ef4444';
  return L.divIcon({
    className: 'custom-truck-icon',
    html: `
      <div style="
        background: ${color};
        border: 2px solid white;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 10px ${color}80;
      ">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
          <path d="M10 17h4V5H2v12h3m5 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm9 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0-9V2l3 3-3 3Z"/>
        </svg>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

export default function SupplyChainMap({ trucks, ecoMode }: SupplyChainMapProps) {
  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={PUNE_CENTER}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {trucks.map((truck) => (
          <React.Fragment key={truck.id}>
            {/* Route polyline */}
            {truck.route && truck.route.length > 0 && (
              <Polyline
                positions={truck.route.map(coord => [coord[1], coord[0]])}
                pathOptions={{
                  color: truck.status === 'critical' ? '#ef4444' : 
                         truck.status === 'delayed' ? '#f59e0b' : '#10b981',
                  weight: 3,
                  opacity: 0.7,
                  dashArray: ecoMode ? '10, 10' : undefined,
                }}
              />
            )}

            {/* Truck marker */}
            <Marker
              position={[truck.position[1], truck.position[0]]}
              icon={createTruckIcon(truck.status)}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-bold text-slate-900">{truck.id}</div>
                  <div className="text-slate-600">Driver: {truck.driver}</div>
                  <div className="text-slate-600">Cargo: ${(truck.cargoValue / 1000).toFixed(0)}K</div>
                  <div className="text-slate-600">Speed: {truck.velocity} km/h</div>
                  <div className={`font-semibold mt-1 ${
                    truck.status === 'on-time' ? 'text-green-600' :
                    truck.status === 'delayed' ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {truck.status.toUpperCase().replace('-', ' ')}
                  </div>
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-lg border border-white/10 rounded-lg p-3 text-xs z-[1000]">
        <div className="font-semibold text-slate-200 mb-2">Legend</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-slate-300">On Time</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-slate-300">Delayed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-slate-300">Critical</span>
          </div>
        </div>
      </div>
    </div>
  );
}
