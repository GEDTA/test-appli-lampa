import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { generateLampPosts } from '@/data/lampPosts';
import type { LampPost, LampStatus } from '@/types/lamp.types';

interface LampContextValue {
  lampPosts: LampPost[];
  updateLampStatus: (id: string, status: LampStatus) => void;
}

const LampContext = createContext<LampContextValue | null>(null);

export const LampProvider = ({ children }: { children: React.ReactNode }) => {
  const [lampPosts, setLampPosts] = useState<LampPost[]>(() => generateLampPosts());

  const updateLampStatus = useCallback((id: string, status: LampStatus) => {
    setLampPosts((prev) =>
      prev.map((lamp) =>
        lamp.id === id ? { ...lamp, status, lastUpdated: new Date().toISOString() } : lamp
      )
    );
  }, []);

  const value = useMemo(() => ({ lampPosts, updateLampStatus }), [lampPosts, updateLampStatus]);

  return <LampContext.Provider value={value}>{children}</LampContext.Provider>;
};

export const useLampPosts = () => {
  const context = useContext(LampContext);
  if (!context) {
    throw new Error('useLampPosts doit être utilisé à l\'intérieur de LampProvider.');
  }
  return context;
};
