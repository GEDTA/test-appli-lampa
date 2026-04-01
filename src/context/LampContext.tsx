import { createContext, useCallback, useContext, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { LampPost, LampStatus } from '@/types/lamp.types';
import { generateLampPosts } from '@/data/lampPosts';
// TODO: Importer apiClient lors de l'intégration backend
// import { apiClient } from '@/api/axios.client';

interface CreateLampData {
  street: string;
  lat: number;
  lng: number;
  status: LampStatus;
}

interface LampContextValue {
  lampPosts: LampPost[];
  isLoading: boolean;
  updateLampStatus: (id: string, status: LampStatus) => Promise<void>;
  addLampPost: (data: CreateLampData) => Promise<LampPost>;
}

export const LAMP_QUERY_KEY = ['lampPosts'] as const;

// TODO: Remplacer par apiClient.get<LampPost[]>('/lamppost') lors de l'intégration backend
const fetchLampPosts = (): Promise<LampPost[]> => Promise.resolve(generateLampPosts());

const LampContext = createContext<LampContextValue | null>(null);

export const LampProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();

  const { data: lampPosts = [], isLoading } = useQuery({
    queryKey: LAMP_QUERY_KEY,
    queryFn: fetchLampPosts,
    staleTime: Infinity,
  });

  const updateLampStatus = useCallback(async (id: string, status: LampStatus) => {
    // TODO: await apiClient.patch(`/lamppost/${id}/status`, { status });
    queryClient.setQueryData<LampPost[]>(LAMP_QUERY_KEY, (prev) =>
      prev?.map((lamp) =>
        lamp.id === id ? { ...lamp, status, lastUpdated: new Date().toISOString() } : lamp
      ) ?? []
    );
  }, [queryClient]);

  const addLampPost = useCallback(async (data: CreateLampData): Promise<LampPost> => {
    // TODO: const res = await apiClient.post<LampPost>('/lamppost', data);
    const newLamp: LampPost = {
      id: `LP-${String(Date.now()).slice(-4)}`,
      label: `Lampadaire ${data.street}`,
      street: data.street,
      lat: data.lat,
      lng: data.lng,
      status: data.status,
      lastUpdated: new Date().toISOString(),
    };
    queryClient.setQueryData<LampPost[]>(LAMP_QUERY_KEY, (prev) => [...(prev ?? []), newLamp]);
    return newLamp;
  }, [queryClient]);

  const value = useMemo(
    () => ({ lampPosts, isLoading, updateLampStatus, addLampPost }),
    [lampPosts, isLoading, updateLampStatus, addLampPost]
  );

  return <LampContext.Provider value={value}>{children}</LampContext.Provider>;
};

export const useLampPosts = () => {
  const context = useContext(LampContext);
  if (!context) {
    throw new Error("useLampPosts doit être utilisé à l'intérieur de LampProvider.");
  }
  return context;
};
