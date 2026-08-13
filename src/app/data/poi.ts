// Memory interface
export interface Memory {
  id: string;
  userId: string;
  poiId: string;
  poiName: string;
  type: "photo" | "video" | "text";
  content: string;
  caption?: string;
  visibility: "public" | "private";
  authorName: string;
  date: string;
  timestamp: number;
}

// POI interface
export interface POI {
  id: string;
  name: string;
  category: "Monument" | "Museum" | "Parks & Nature" | "Historic Site";
  distance: string;
  distanceKm: number | null; // null until user location is known
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  description: string;
  fullDescription: string;
  imageUrl: string;
  location: string;
  rating: number;
  views: number;
  details: {
    built?: string;
    height?: string;
    access?: string;
    open?: string;
    entry?: string;
    features?: string[];
  };
}

// NOTE: The 7 attractions used to be hardcoded here as a static POIS array.
// They now live in the Supabase `attractions` table (see supabase/schema.sql)
// so visitor counts can actually increment and attractions can be
// added/edited without shipping a new app build.
//
// Access them via `const { pois } = useApp()` (see src/App.tsx) instead of
// importing POIS directly.
