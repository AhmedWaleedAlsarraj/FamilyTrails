import React, { createContext, useContext, useState } from "react";

// --- Data Types ---
export type POICategory = "Monument" | "Museum" | "Parks & Nature" | "Historic Site";

export interface POI {
  id: string;
  name: string;
  category: POICategory;
  distance: string;
  description: string;
  imageUrl: string;
  details: {
    built?: string;
    height?: string;
    access?: string;
    open?: string;
    entry?: string;
    highlights?: string;
    location: string;
  };
}

export interface Memory {
  id: string;
  poiId: string;
  poiName: string;
  type: "photo" | "video" | "audio" | "text";
  content: string; 
  caption?: string;
  date: string;
  timestamp: number;
}

// --- Mock Data ---
export const POIS: POI[] = [
  {
    id: "greys-monument",
    name: "Grey's Monument",
    category: "Monument",
    distance: "0.3 km",
    description: "A prominent city landmark built in 1838 to commemorate Earl Grey, Prime Minister and tea namesake. Standing 41 meters tall in the heart of Newcastle, it serves as a popular meeting point and historic site.",
    imageUrl: "https://images.unsplash.com/photo-1670613465528-3a00c1684daf?q=80&w=1080",
    details: {
      built: "1838",
      height: "41m",
      access: "24/7",
      location: "Grainger Street, Newcastle City Centre",
    }
  },
  {
    id: "newcastle-castle",
    name: "Newcastle Castle",
    category: "Historic Site",
    distance: "0.5 km",
    description: "Medieval fortress dating from the 11th century, giving Newcastle its name. Features the Castle Keep and Black Gate with panoramic city views.",
    imageUrl: "https://images.unsplash.com/photo-1644848337938-aa2d5b4ed828?q=80&w=1080",
    details: {
      built: "11th-12th century",
      open: "10am-5pm",
      entry: "£8 adults",
      location: "Castle Garth, Newcastle upon Tyne",
    }
  },
  {
    id: "the-quayside",
    name: "The Quayside",
    category: "Historic Site",
    distance: "0.7 km",
    description: "Historic riverside area featuring the iconic Tyne Bridge and Millennium Bridge. Popular for walks, dining, and cultural venues.",
    imageUrl: "https://images.unsplash.com/photo-1660042866417-1963a3cf5ab6?q=80&w=1080",
    details: {
      access: "24/7",
      highlights: "Bridges, restaurants, art venues",
      location: "Quayside, Newcastle upon Tyne",
    }
  },
  {
    id: "discovery-museum",
    name: "Discovery Museum",
    category: "Museum",
    distance: "0.8 km",
    description: "Free museum exploring Newcastle's history, science, and innovation. Family-friendly exhibits and interactive displays.",
    imageUrl: "https://images.unsplash.com/photo-1744617233303-0100e5782130?q=80&w=1080",
    details: {
      open: "10am-4pm",
      entry: "Free",
      highlights: "Turbinia, science maze",
      location: "Blandford Square, Newcastle upon Tyne",
    }
  },
  {
    id: "tyne-bridge",
    name: "Tyne Bridge",
    category: "Monument",
    distance: "1.2 km",
    description: "Iconic green arch bridge spanning the River Tyne, opened in 1928. Symbol of Newcastle and engineering marvel.",
    imageUrl: "https://images.unsplash.com/photo-1667409116400-9a19bd946ca5?q=80&w=1080",
    details: {
      built: "1928",
      height: "59m",
      location: "Tyne Bridge, Newcastle upon Tyne",
    }
  },
  {
    id: "great-north-museum",
    name: "Great North Museum",
    category: "Museum",
    distance: "1.5 km",
    description: "Natural history and archaeology museum with Egyptian mummies, Hadrian's Wall exhibits, and planetarium shows.",
    imageUrl: "https://images.unsplash.com/photo-1672572683689-42594e7a3036?q=80&w=1080",
    details: {
      open: "10am-5pm",
      entry: "Free",
      location: "Barras Bridge, Newcastle upon Tyne",
    }
  }
];

const INITIAL_MEMORIES: Memory[] = [
  {
    id: "1",
    poiId: "greys-monument",
    poiName: "Grey's Monument",
    type: "photo",
    content: "https://images.unsplash.com/photo-1670613465528-3a00c1684daf?q=80&w=300",
    caption: "Beautiful monument in the winter sunshine! The kids loved learning about Earl Grey.",
    date: "2 days ago",
    timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000
  },
  {
    id: "2",
    poiId: "the-quayside",
    poiName: "The Quayside",
    type: "text",
    content: "Amazing view from the Quayside walk. Perfect family afternoon.",
    date: "1 week ago",
    timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000
  }
];

// --- Context ---
interface AppContextType {
  memories: Memory[];
  addMemory: (memory: Omit<Memory, "id" | "date" | "timestamp">) => string;
  deleteMemory: (id: string) => void;
  getMemoriesByPOI: (poiId: string) => Memory[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [memories, setMemories] = useState<Memory[]>(INITIAL_MEMORIES);

  const addMemory = (memoryData: Omit<Memory, "id" | "date" | "timestamp">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newMemory: Memory = {
      ...memoryData,
      id,
      date: "Today",
      timestamp: Date.now()
    };
    setMemories(prev => [newMemory, ...prev]);
    return id;
  };

  const deleteMemory = (id: string) => {
    setMemories(prev => prev.filter(m => m.id !== id));
  };

  const getMemoriesByPOI = (poiId: string) => {
    return memories.filter(m => m.poiId === poiId);
  };

  return (
    <AppContext.Provider value={{ memories, addMemory, deleteMemory, getMemoriesByPOI }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
