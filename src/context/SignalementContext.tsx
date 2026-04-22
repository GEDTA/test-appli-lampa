import { createContext, useCallback, useContext, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Signalement, SignalementStatus } from '@/types/signalement.types';
import { SIGNALEMENTS } from '@/data/signalements';
import { LAMP_QUERY_KEY } from '@/context/LampContext';
import type { LampPost } from '@/types/lamp.types';

interface SignalementContextValue {
  signalements: Signalement[];
  isLoading: boolean;
  updateStatus: (id: number, status: SignalementStatus) => Promise<void>;
  confirmSignalement: (id: number) => Promise<void>;
  rejectSignalement: (id: number) => Promise<void>;
}

export const SIGNALEMENT_QUERY_KEY = ['signalements'] as const;

const fetchSignalements = (): Promise<Signalement[]> => Promise.resolve(SIGNALEMENTS);

const SignalementContext = createContext<SignalementContextValue | null>(null);

export const SignalementProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();

  const { data: signalements = [], isLoading } = useQuery({
    queryKey: SIGNALEMENT_QUERY_KEY,
    queryFn: fetchSignalements,
    staleTime: Infinity,
  });

  const updateStatus = useCallback(async (id: number, status: SignalementStatus) => {
    queryClient.setQueryData<Signalement[]>(SIGNALEMENT_QUERY_KEY, (prev) =>
      prev?.map((s) =>
        s.id === id
          ? {
              ...s,
              status,
              resolvedAt: status === 'resolu' ? new Date().toISOString() : s.resolvedAt,
            }
          : s
      ) ?? []
    );
  }, [queryClient]);

  // Confirme le signalement ET passe le lampadaire lié en HS sur la carte
  const confirmSignalement = useCallback(async (id: number) => {
    const signalement = queryClient.getQueryData<Signalement[]>(SIGNALEMENT_QUERY_KEY)?.find((s) => s.id === id);

    // 1. Mettre à jour le statut du signalement
    queryClient.setQueryData<Signalement[]>(SIGNALEMENT_QUERY_KEY, (prev) =>
      prev?.map((s) => s.id === id ? { ...s, status: 'confirme' as SignalementStatus } : s) ?? []
    );

    // 2. Si un lampadaire est lié, le passer en HS (out) sur la carte pour tout le monde
    if (signalement?.lampPostId) {
      queryClient.setQueryData<LampPost[]>(LAMP_QUERY_KEY, (prev) =>
        prev?.map((lamp) =>
          lamp.id === signalement.lampPostId
            ? { ...lamp, status: 'out', lastUpdated: new Date().toISOString() }
            : lamp
        ) ?? []
      );
    }
  }, [queryClient]);

  const rejectSignalement = useCallback(async (id: number) => {
    queryClient.setQueryData<Signalement[]>(SIGNALEMENT_QUERY_KEY, (prev) =>
      prev?.map((s) => s.id === id ? { ...s, status: 'rejete' as SignalementStatus } : s) ?? []
    );
  }, [queryClient]);

  const value = useMemo(
    () => ({ signalements, isLoading, updateStatus, confirmSignalement, rejectSignalement }),
    [signalements, isLoading, updateStatus, confirmSignalement, rejectSignalement]
  );

  return <SignalementContext.Provider value={value}>{children}</SignalementContext.Provider>;
};

export const useSignalements = () => {
  const ctx = useContext(SignalementContext);
  if (!ctx) throw new Error('useSignalements doit être utilisé dans SignalementProvider');
  return ctx;
};
