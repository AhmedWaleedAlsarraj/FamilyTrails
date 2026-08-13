import { useState, useEffect } from "react";

interface Coords {
  latitude: number;
  longitude: number;
}

interface UseUserLocationResult {
  coords: Coords | null;
  status: "idle" | "requesting" | "granted" | "denied" | "unavailable";
  requestLocation: () => void;
}

/**
 * Requests the browser's geolocation permission and returns the user's
 * current coordinates. Does NOT request automatically on mount — call
 * requestLocation() from a user action (e.g. a button tap), since browsers
 * block/ignore geolocation prompts that fire without user interaction and
 * iOS Safari in particular is strict about this.
 */
export function useUserLocation(): UseUserLocationResult {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [status, setStatus] = useState<UseUserLocationResult["status"]>("idle");

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setStatus("unavailable");
      return;
    }
    setStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setStatus("granted");
      },
      (error) => {
        console.error("Geolocation error:", error);
        setStatus("denied");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  return { coords, status, requestLocation };
}

/**
 * Haversine formula — distance in km between two lat/lng points.
 * Accurate enough for "how far is this attraction from me" display purposes.
 */
export function distanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}
