"use client";

import { forwardRef, useContext, useEffect, useImperativeHandle, useRef } from "react";
import { GoogleMapsContext, useMap } from "@vis.gl/react-google-maps";

export type CircleEventProps = {
  onClick?: (e: google.maps.MapMouseEvent) => void;
  onDrag?: (e: google.maps.MapMouseEvent) => void;
  onDragStart?: (e: google.maps.MapMouseEvent) => void;
  onDragEnd?: (e: google.maps.MapMouseEvent) => void;
  onRadiusChanged?: (ev: any) => void;
  onCenterChanged?: (ev: any) => void;
};

export type CircleProps = google.maps.CircleOptions & CircleEventProps;

export type CircleRef = { circle: google.maps.Circle | null };

export const Circle = forwardRef<CircleRef, CircleProps>((props, ref) => {
  const circle = useRef<google.maps.Circle | null>(null);
  const map = useMap();

  useImperativeHandle(ref, () => ({ circle: circle.current }));

  useEffect(() => {
    if (!map) return;

    circle.current = new google.maps.Circle({
      ...props,
      map
    });

    return () => {
      if (circle.current) {
        circle.current.setMap(null);
      }
    };
  }, [map]);

  useEffect(() => {
    if (!circle.current) return;
    circle.current.setOptions(props);
  }, [props]);

  useEffect(() => {
    if (!circle.current) return;

    const listeners: google.maps.MapsEventListener[] = [];

    if (props.onRadiusChanged) {
        listeners.push(google.maps.event.addListener(circle.current, 'radius_changed', () => {
            props.onRadiusChanged!(circle.current);
        }));
    }

    if (props.onCenterChanged) {
        listeners.push(google.maps.event.addListener(circle.current, 'center_changed', () => {
            props.onCenterChanged!(circle.current);
        }));
    }

    return () => {
        listeners.forEach(l => l.remove());
    };
  }, [props.onRadiusChanged, props.onCenterChanged]);

  return null;
});
