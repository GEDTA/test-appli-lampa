export type InterventionType =
  | 'ampoule'
  | 'driver'
  | 'câble'
  | 'photocellule'
  | 'bras'
  | 'armoire'
  | 'nettoyage';

export interface Intervention {
  id: string;
  date: string; // YYYY-MM-DD
  type: InterventionType;
  cost: number; // €
  lampId: string;
  street: string;
  provider: string;
  comment: string;
}

export const INTERVENTION_TYPE_LABELS: Record<InterventionType, string> = {
  ampoule: 'Ampoule',
  driver: 'Driver',
  'câble': 'Câble',
  photocellule: 'Photocellule',
  bras: 'Bras',
  armoire: 'Armoire',
  nettoyage: 'Nettoyage',
};

export const INTERVENTION_TYPE_COLORS: Record<InterventionType, string> = {
  ampoule: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  driver: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  'câble': 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  photocellule: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  bras: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  armoire: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
  nettoyage: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
};

const TYPES: InterventionType[] = [
  'ampoule', 'driver', 'câble', 'photocellule', 'bras', 'armoire', 'nettoyage',
];

const PROVIDERS = ['SERUE Éclairage', 'ELEC 67', 'Régie municipale', 'CITELUM'];

const STREETS = [
  'Rue Principale', 'Rue de la Gare', 'Rue des Vignes', 'Rue des Tilleuls',
  "Rue de l'Église", 'Rue du Moulin', 'Rue des Jardins', 'Rue du Château',
  'Rue de la Forêt', 'Rue des Champs', 'Rue des Écoles', 'Rue du Canal',
];

const COST_RANGE: Record<InterventionType, [number, number]> = {
  ampoule:     [25,  45],
  driver:      [60, 120],
  'câble':     [80, 200],
  photocellule:[35,  65],
  bras:        [100, 180],
  armoire:     [150, 300],
  nettoyage:   [20,  35],
};

const COMMENTS: Record<InterventionType, string[]> = {
  ampoule:     ['Remplacement ampoule HS', 'Ampoule sodium grillée', 'Changement ampoule défaillante'],
  driver:      ['Driver LED défaillant remplacé', 'Court-circuit driver', 'Remplacement driver vieillissant'],
  'câble':     ['Câble endommagé par travaux', 'Raccordement câble souterrain', 'Court-circuit câblage'],
  photocellule:['Photocellule hors service', 'Remplacement cellule crépusculaire', 'Mauvais réglage corrigé'],
  bras:        ['Bras tordu suite à un accident', 'Remplacement bras de potence', 'Bras corrodé remplacé'],
  armoire:     ['Fusible armoire remplacé', 'Intervention armoire de commande', 'Disjoncteur défaillant'],
  nettoyage:   ['Nettoyage vasque et réflecteur', 'Entretien préventif annuel', 'Dépôt insectes sur vasque retiré'],
};

const mulberry32 = (seed: number) => {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

const generateInterventions = (): Intervention[] => {
  const random = mulberry32(1337);
  const result: Intervention[] = [];

  // Count per year — calibrated so 2025 ≈ 3 480 €
  const yearConfig: Array<[number, number]> = [
    [2021, 40],
    [2022, 46],
    [2023, 53],
    [2024, 60],
    [2025, 64],
    [2026, 24], // données partielles (jusqu'en mars)
  ];

  let idx = 0;
  for (const [year, count] of yearConfig) {
    // For 2026, limit days to ~90 (Jan+Feb+Mar)
    const maxDayOfYear = year === 2026 ? 90 : 365;

    for (let i = 0; i < count; i++) {
      const type = TYPES[Math.floor(random() * TYPES.length)];
      const [minCost, maxCost] = COST_RANGE[type];
      const cost = Math.round(minCost + random() * (maxCost - minCost));

      // Pick a day within the year
      const dayOfYear = Math.floor(random() * maxDayOfYear) + 1;
      const date = new Date(year, 0, dayOfYear);
      const dateStr = date.toISOString().split('T')[0];

      const lampNum = Math.floor(random() * 140) + 1;
      const lampId = `LP-${String(lampNum).padStart(4, '0')}`;
      const street = STREETS[Math.floor(random() * STREETS.length)];
      const provider = PROVIDERS[Math.floor(random() * PROVIDERS.length)];
      const comments = COMMENTS[type];
      const comment = comments[Math.floor(random() * comments.length)];

      result.push({
        id: `INT-${String(++idx).padStart(4, '0')}`,
        date: dateStr,
        type,
        cost,
        lampId,
        street,
        provider,
        comment,
      });
    }
  }

  return result.sort((a, b) => b.date.localeCompare(a.date));
};

export const INTERVENTIONS = generateInterventions();
