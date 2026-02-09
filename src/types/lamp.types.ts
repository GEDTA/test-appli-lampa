export type LampStatus = 'led' | 'classic' | 'out';

export interface LampPost {
  id: string;
  label: string;
  street: string;
  lat: number;
  lng: number;
  status: LampStatus;
  lastUpdated: string;
}

export const LAMP_STATUS_LABELS: Record<LampStatus, string> = {
  led: 'Fonctionnel - LED',
  classic: 'Fonctionnel - classique',
  out: 'Hors service',
};

export const LAMP_STATUS_COLORS: Record<LampStatus, string> = {
  led: '#16a34a',
  classic: '#3f6212',
  out: '#dc2626',
};

export const LAMP_POWER_WATTS: Record<LampStatus, number> = {
  led: 45,
  classic: 135,
  out: 0,
};
