import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { RouterProvider } from "react-router-dom";
import { MotionConfig } from "motion/react";
import { router } from "./routes";
import { Memory, POI } from "./data/poi";
import { supabase } from "./lib/supabase";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { RewardsProvider } from "./context/RewardsContext";
import { useAccessibility } from "./context/AccessibilityContext";
import { useUserLocation, distanceKm, formatDistance } from "./lib/useUserLocation";

interface AppContextType {
  memories: Memory[];
  pois: POI[];
  loadingMemories: boolean;
  loadingPois: boolean;
  addMemory: (
    memory: Omit<Memory, "id" | "date" | "timestamp" | "userId" | "authorName">,
  ) => Promise<string | null>;
  deleteMemory: (id: string) => Promise<void>;
  updateMemoryVisibility: (id: string, visibility: "public" | "private") => Promise<boolean>;
  getMemoriesByPOI: (poiId: string) => Memory[];
  fetchMemoriesForPOI: (poiId: string) => Promise<Memory[]>;
  incrementViews: (poiId: string) => Promise<void>;
  locationStatus: "idle" | "requesting" | "granted" | "denied" | "unavailable";
  requestLocation: () => void;
  detectedCountryCode: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Maps a Supabase `attractions` row to the frontend POI shape.
function mapAttractionRow(row: any): POI {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    distance: row.distance ?? "",
    distanceKm: null,
    country: row.country,
    countryCode: row.country_code,
    latitude: row.latitude,
    longitude: row.longitude,
    description: row.description,
    fullDescription: row.full_description,
    imageUrl: row.image_url,
    location: row.location,
    rating: row.rating,
    views: row.views,
    details: {
      built: row.built ?? undefined,
      height: row.height ?? undefined,
      access: row.access ?? undefined,
      open: row.open_hours ?? undefined,
      entry: row.entry ?? undefined,
      features: row.features ?? undefined,
    },
  };
}

// Maps a Supabase `memories` row to the frontend Memory shape.
function mapMemoryRow(row: any): Memory {
  return {
    id: row.id,
    userId: row.user_id,
    poiId: row.poi_id,
    poiName: row.poi_name,
    type: row.type,
    content: row.content,
    caption: row.caption ?? undefined,
    visibility: row.visibility,
    authorName: row.author_name,
    date: new Date(row.created_at).toLocaleDateString(),
    timestamp: new Date(row.created_at).getTime(),
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [rawPois, setRawPois] = useState<POI[]>([]);
  const [loadingMemories, setLoadingMemories] = useState(true);
  const [loadingPois, setLoadingPois] = useState(true);
  const { coords, status: locationStatus, requestLocation } = useUserLocation();

  // Attractions are public — load once regardless of login state.
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("attractions").select("*").order("name");
      if (!error && data) setRawPois(data.map(mapAttractionRow));
      setLoadingPois(false);
    })();
  }, []);

  // Once we know the user's GPS position, figure out which country they're
  // nearest to (closest attraction's country wins), then compute a real
  // distance for every attraction in that country and sort nearest-first.
  // Attractions from other countries are filtered out entirely — showing a
  // UK attraction's "12,000 km away" to someone in Bahrain isn't useful.
  const { pois, detectedCountryCode } = useMemo(() => {
    if (!coords || rawPois.length === 0) {
      return { pois: rawPois, detectedCountryCode: null as string | null };
    }

    const withDistance = rawPois.map((poi) => ({
      ...poi,
      distanceKm: distanceKm(coords.latitude, coords.longitude, poi.latitude, poi.longitude),
    }));

    const nearest = withDistance.reduce((closest, poi) =>
      (poi.distanceKm ?? Infinity) < (closest.distanceKm ?? Infinity) ? poi : closest,
    );
    const countryCode = nearest.countryCode;

    const sameCountry = withDistance
      .filter((poi) => poi.countryCode === countryCode)
      .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity))
      .map((poi) => ({ ...poi, distance: formatDistance(poi.distanceKm ?? 0) }));

    return { pois: sameCountry, detectedCountryCode: countryCode };
  }, [coords, rawPois]);

  // Memories are private per user — reload whenever login state changes.
  useEffect(() => {
    if (!user) {
      setMemories([]);
      setLoadingMemories(false);
      return;
    }
    setLoadingMemories(true);
    (async () => {
      const { data, error } = await supabase
        .from("memories")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (!error && data) setMemories(data.map(mapMemoryRow));
      setLoadingMemories(false);
    })();
  }, [user]);

  const addMemory = useCallback(
    async (
      memoryData: Omit<Memory, "id" | "date" | "timestamp" | "userId" | "authorName">,
    ) => {
      if (!user) return null;
      const authorName =
        (user.user_metadata?.full_name as string | undefined) || user.email || "Explorer";
      const { data, error } = await supabase
        .from("memories")
        .insert({
          user_id: user.id,
          poi_id: memoryData.poiId,
          poi_name: memoryData.poiName,
          type: memoryData.type,
          content: memoryData.content,
          caption: memoryData.caption ?? null,
          visibility: memoryData.visibility,
          author_name: authorName,
        })
        .select()
        .single();

      if (error || !data) {
        console.error("Failed to save memory:", error);
        return null;
      }
      setMemories((prev) => [mapMemoryRow(data), ...prev]);
      return data.id as string;
    },
    [user],
  );

  const deleteMemory = useCallback(async (id: string) => {
    const { error } = await supabase.from("memories").delete().eq("id", id);
    if (error) {
      console.error("Failed to delete memory:", error);
      return;
    }
    setMemories((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const updateMemoryVisibility = useCallback(
    async (id: string, visibility: "public" | "private") => {
      const { error } = await supabase.from("memories").update({ visibility }).eq("id", id);
      if (error) {
        console.error("Failed to update memory visibility:", error);
        return false;
      }
      setMemories((prev) => prev.map((m) => (m.id === id ? { ...m, visibility } : m)));
      return true;
    },
    [],
  );

  // "My Memories" screen — only what THIS account owns, private or public.
  const getMemoriesByPOI = useCallback(
    (poiId: string) => memories.filter((m) => m.poiId === poiId),
    [memories],
  );

  // POI detail screen — a live query, not the cached `memories` list, since
  // it needs to include OTHER users' public memories too. RLS automatically
  // restricts the result to: rows you own, plus rows anyone marked public.
  const fetchMemoriesForPOI = useCallback(async (poiId: string) => {
    const { data, error } = await supabase
      .from("memories")
      .select("*")
      .eq("poi_id", poiId)
      .order("created_at", { ascending: false });
    if (error || !data) {
      console.error("Failed to load memories for POI:", error);
      return [];
    }
    return data.map(mapMemoryRow);
  }, []);

  // Real running visitor counter. Call once per POI-detail-screen view.
  const incrementViews = useCallback(async (poiId: string) => {
    const { error } = await supabase.rpc("increment_attraction_views", {
      attraction_id: poiId,
    });
    if (error) {
      console.error("Failed to increment views:", error);
      return;
    }
    setRawPois((prev) =>
      prev.map((p) => (p.id === poiId ? { ...p, views: p.views + 1 } : p)),
    );
  }, []);

  return (
    <AppContext.Provider
      value={{
        memories,
        pois,
        loadingMemories,
        loadingPois,
        addMemory,
        deleteMemory,
        updateMemoryVisibility,
        getMemoriesByPOI,
        fetchMemoriesForPOI,
        incrementViews,
        locationStatus,
        requestLocation,
        detectedCountryCode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

function RouterWithMotionConfig() {
  const { effectiveReduceMotion } = useAccessibility();
  return (
    <MotionConfig reducedMotion={effectiveReduceMotion ? "always" : "user"}>
      <RouterProvider router={router} />
    </MotionConfig>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <RewardsProvider>
          <RouterWithMotionConfig />
        </RewardsProvider>
      </AppProvider>
    </AuthProvider>
  );
}
