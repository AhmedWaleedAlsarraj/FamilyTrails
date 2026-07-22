import React, { createContext, useContext, useState, useEffect } from 'react';

export type MemoryType = 'photo' | 'video' | 'audio' | 'text';

export interface Memory {
  id: string;
  poiId: string;
  poiName: string;
  type: MemoryType;
  date: string;
  caption?: string;
  content?: string; // For text notes or image URLs
  thumbnail?: string;
  duration?: string; // For audio/video
}

interface MemoryContextType {
  memories: Memory[];
  addMemory: (memory: Omit<Memory, 'id' | 'date'>) => void;
  deleteMemory: (id: string) => void;
}

const MemoryContext = createContext<MemoryContextType | undefined>(undefined);

export const MemoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [memories, setMemories] = useState<Memory[]>([]);

  // Add some initial mock memories
  useEffect(() => {
    setMemories([
      {
        id: '1',
        poiId: 'greys-monument',
        poiName: "Grey's Monument",
        type: 'photo',
        date: '2 days ago',
        caption: 'Beautiful monument in the winter sunshine! The kids loved learning about Earl Grey.',
        thumbnail: 'https://images.unsplash.com/photo-1744617233303-0100e5782130?q=80&w=200'
      },
      {
        id: '2',
        poiId: 'the-quayside',
        poiName: 'The Quayside',
        type: 'text',
        date: '1 week ago',
        content: 'Amazing view from the Quayside walk. Perfect family afternoon. We saw three different bridges!',
      },
      {
        id: '3',
        poiId: 'newcastle-castle',
        poiName: 'Newcastle Castle',
        type: 'video',
        date: '1 week ago',
        caption: 'Medieval castle was fascinating - children enjoyed the interactive exhibits.',
        thumbnail: 'https://images.unsplash.com/photo-1689572865897-413cb89a9e21?q=80&w=200'
      }
    ]);
  }, []);

  const addMemory = (memory: Omit<Memory, 'id' | 'date'>) => {
    const newMemory: Memory = {
      ...memory,
      id: Math.random().toString(36).substring(2, 9),
      date: 'Just now'
    };
    setMemories(prev => [newMemory, ...prev]);
  };

  const deleteMemory = (id: string) => {
    setMemories(prev => prev.filter(m => m.id !== id));
  };

  return (
    <MemoryContext.Provider value={{ memories, addMemory, deleteMemory }}>
      {children}
    </MemoryContext.Provider>
  );
};

export const useMemories = () => {
  const context = useContext(MemoryContext);
  if (!context) throw new Error('useMemories must be used within MemoryProvider');
  return context;
};
