import type { LampPost, LampStatus } from '@/types/lamp.types';

const CENTER = { lat: 48.5867, lng: 7.6682 };

const STREETS = [
  'Rue Principale',
  'Rue de la Gare',
  'Rue des Vignes',
  'Rue des Tilleuls',
  'Rue de l\'Église',
  'Rue du Moulin',
  'Rue des Jardins',
  'Rue du Château',
  'Rue de la Forêt',
  'Rue des Champs',
  'Rue des Écoles',
  'Rue du Canal',
];

const pickStatus = (seed: number): LampStatus => {
  const roll = seed % 100;
  if (roll < 70) return 'led';
  if (roll < 95) return 'classic';
  return 'out';
};

const mulberry32 = (seed: number) => {
  let t = seed;
  return () => {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

export const generateLampPosts = (count = 140): LampPost[] => {
  const random = mulberry32(4281);

  return Array.from({ length: count }, (_, index) => {
    const jitterLat = (random() - 0.5) * 0.018;
    const jitterLng = (random() - 0.5) * 0.028;
    const street = STREETS[Math.floor(random() * STREETS.length)];
    const status = pickStatus(Math.floor(random() * 1000) + index);

    return {
      id: `LP-${String(index + 1).padStart(4, '0')}`,
      label: `Lampadaire ${index + 1}`,
      street,
      lat: CENTER.lat + jitterLat,
      lng: CENTER.lng + jitterLng,
      status,
      lastUpdated: new Date(Date.now() - random() * 1000 * 60 * 60 * 24 * 40).toISOString(),
    };
  });
};
