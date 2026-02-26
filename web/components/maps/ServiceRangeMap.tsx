"use client";

import { Map, Marker } from "@vis.gl/react-google-maps";
import { Circle } from "./Circle";

interface ServiceRangeMapProps {
  center: { lat: number; lng: number };
  radius: number; // in meters
  onRadiusChange: (newRadius: number) => void;
}

export function ServiceRangeMap({ center, radius, onRadiusChange }: ServiceRangeMapProps) {
  return (
    <div className="h-64 w-full rounded-2xl overflow-hidden border border-border shadow-inner">
      <Map
        defaultCenter={center}
        defaultZoom={13}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
      >
        <Marker position={center} />
        <Circle
           center={center}
           radius={radius}
           strokeColor={'#FF7A00'}
           strokeOpacity={0.8}
           strokeWeight={2}
           fillColor={'#FF7A00'}
           fillOpacity={0.35}
           editable={true}
           draggable={true}
           onRadiusChanged={(c) => {
             onRadiusChange(c.getRadius());
           }}
        />
      </Map>
    </div>
  );
}
