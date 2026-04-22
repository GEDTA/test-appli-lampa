import { createContext, useCallback, useContext, useMemo, useState } from 'react';

export interface AppSettings {
  // Carte
  defaultZoom: number;
  showClusters: boolean;
  // Énergie
  hoursPerNight: number;
  ledPower: number;
  classicPower: number;
  // Éco
  kwhPrice: number;
  co2Factor: number;
  ledTargetPct: number;
}

const DEFAULT_SETTINGS: AppSettings = {
  defaultZoom: 13,
  showClusters: true,
  hoursPerNight: 9,
  ledPower: 45,
  classicPower: 135,
  kwhPrice: 0.18,
  co2Factor: 0.052,
  ledTargetPct: 90,
};

const STORAGE_KEY = 'lampadaire_settings';

interface SettingsContextValue {
  settings: AppSettings;
  saveSettings: (next: Partial<AppSettings>) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

const SETTINGS_KEYS = Object.keys(DEFAULT_SETTINGS) as (keyof AppSettings)[];

const loadFromStorage = (): AppSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const safe: Partial<AppSettings> = {};
    for (const key of SETTINGS_KEYS) {
      if (key in parsed && typeof parsed[key] === typeof DEFAULT_SETTINGS[key]) {
        (safe as Record<string, unknown>)[key] = parsed[key];
      }
    }
    return { ...DEFAULT_SETTINGS, ...safe };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<AppSettings>(loadFromStorage);

  const saveSettings = useCallback((next: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...next };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const value = useMemo<SettingsContextValue>(
    () => ({ settings, saveSettings }),
    [settings, saveSettings]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings doit être utilisé dans SettingsProvider');
  return ctx;
};
