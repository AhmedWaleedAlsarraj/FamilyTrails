import React, { createContext, useContext, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { router } from "./routes";
import { Memory } from "./data/poi";
import { RouterProvider } from "react-router-dom";

// --- Context ---
interface AppContextType {
  memories: Memory[];
  addMemory: (memory: Omit<Memory, "id" | "date" | "timestamp">) => string;
  deleteMemory: (id: string) => void;
  getMemoriesByPOI: (poiId: string) => Memory[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_MEMORIES: Memory[] = [
  {
    id: "1",
    poiId: "bahrain-fort",
    poiName: "Bahrain Fort",
    type: "photo",
    content:
      "https://images.unsplash.com/photo-1716740975436-e973756e526c?q=80&w=300",
    caption:
      "Amazing ancient fort by the sea! The kids loved exploring the ruins.",
    date: "2 days ago",
    timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
  {
    id: "2",
    poiId: "bab-al-bahrain",
    poiName: "Bab Al Bahrain",
    type: "text",
    content:
      "Incredible experience walking through the old souq. The kids loved the spice stalls.",
    date: "1 week ago",
    timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
  },
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [memories, setMemories] = useState<Memory[]>(INITIAL_MEMORIES);

  const addMemory = (memoryData: Omit<Memory, "id" | "date" | "timestamp">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newMemory: Memory = {
      ...memoryData,
      id,
      date: "Just now",
      timestamp: Date.now(),
    };
    setMemories((prev) => [newMemory, ...prev]);
    return id;
  };

  const deleteMemory = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  const getMemoriesByPOI = (poiId: string) => {
    return memories.filter((m) => m.poiId === poiId);
  };

  return (
    <AppContext.Provider
      value={{ memories, addMemory, deleteMemory, getMemoriesByPOI }}
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

export default function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  );
}
