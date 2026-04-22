export type SignalementType = 'panne' | 'anomalie' | 'mal_eclaire';
export type SignalementStatus = 'nouveau' | 'confirme' | 'en_cours' | 'resolu' | 'rejete';

export interface Signalement {
  id: number;
  lampPostId?: string;
  type: SignalementType;
  description?: string;
  lat: number;
  lng: number;
  status: SignalementStatus;
  createdAt: string; // ISO
  resolvedAt?: string; // ISO
  mairieId: number;
}

export const SIGNALEMENT_TYPE_LABELS: Record<SignalementType, string> = {
  panne:       'Panne',
  anomalie:    'Anomalie',
  mal_eclaire: 'Mal éclairé',
};

export const SIGNALEMENT_TYPE_COLORS: Record<SignalementType, string> = {
  panne:       'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
  anomalie:    'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  mal_eclaire: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
};

export const SIGNALEMENT_STATUS_LABELS: Record<SignalementStatus, string> = {
  nouveau:  'Nouveau',
  confirme: 'Confirmé — HS',
  en_cours: 'En cours',
  resolu:   'Résolu',
  rejete:   'Rejeté',
};

export const SIGNALEMENT_STATUS_COLORS: Record<SignalementStatus, string> = {
  nouveau:  'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800',
  confirme: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800',
  en_cours: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800',
  resolu:   'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800',
  rejete:   'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700',
};
