import type { Signalement, SignalementType, SignalementStatus } from '@/types/signalement.types';

const CENTER = { lat: 48.6579, lng: 7.8307 };

const LAMP_IDS = [
  'LP-0003', 'LP-0011', 'LP-0017', 'LP-0022', 'LP-0028',
  'LP-0034', 'LP-0041', 'LP-0057', 'LP-0063', 'LP-0072',
  'LP-0081', 'LP-0089', 'LP-0095', 'LP-0103', 'LP-0118',
  'LP-0124', 'LP-0132', 'LP-0139', undefined, undefined,
];

const DESCRIPTIONS: Record<SignalementType, string[]> = {
  panne: [
    'Le lampadaire ne fonctionne plus depuis plusieurs jours.',
    'Ampoule grillée, zone sans éclairage la nuit.',
    'Éteint depuis hier soir, très dangereux pour les piétons.',
    'Panne totale, aucune lumière depuis 3 jours.',
    "Le lampadaire clignote puis s'éteint.",
  ],
  anomalie: [
    'Câble apparent au niveau du pied du poteau, risque électrique.',
    'Poteau penché après un choc apparent, à sécuriser.',
    'Scintillement permanent, la lumière clignote toute la nuit.',
    'La lampe reste allumée en pleine journée.',
    'Vasque fissurée, eau infiltrée visible.',
    'Bras de potence rouillé et corrodé.',
  ],
  mal_eclaire: [
    "La zone est très sombre, l'éclairage est insuffisant.",
    "Le lampadaire éclaire vers le haut au lieu d'éclairer la route.",
    'Faible intensité lumineuse, difficile de voir la nuit.',
    "Tout le carrefour est dans l'obscurité passé 23h.",
  ],
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

const daysAgo = (d: number): string =>
  new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString();

const generateSignalements = (): Signalement[] => {
  const rnd = mulberry32(9999);

  const raw: Array<{ daysOld: number; status: SignalementStatus; type: SignalementType }> = [
    { daysOld: 1,  status: 'nouveau',  type: 'panne'       },
    { daysOld: 2,  status: 'nouveau',  type: 'anomalie'    },
    { daysOld: 2,  status: 'nouveau',  type: 'panne'       },
    { daysOld: 3,  status: 'confirme', type: 'panne'       },
    { daysOld: 4,  status: 'nouveau',  type: 'mal_eclaire' },
    { daysOld: 5,  status: 'rejete',   type: 'anomalie'    },
    { daysOld: 6,  status: 'confirme', type: 'panne'       },
    { daysOld: 7,  status: 'nouveau',  type: 'panne'       },
    { daysOld: 8,  status: 'en_cours', type: 'anomalie'    },
    { daysOld: 10, status: 'resolu',   type: 'panne'       },
    { daysOld: 11, status: 'nouveau',  type: 'mal_eclaire' },
    { daysOld: 12, status: 'resolu',   type: 'anomalie'    },
    { daysOld: 14, status: 'en_cours', type: 'panne'       },
    { daysOld: 15, status: 'resolu',   type: 'panne'       },
    { daysOld: 17, status: 'rejete',   type: 'anomalie'    },
    { daysOld: 18, status: 'resolu',   type: 'mal_eclaire' },
    { daysOld: 20, status: 'confirme', type: 'panne'       },
    { daysOld: 22, status: 'resolu',   type: 'panne'       },
    { daysOld: 23, status: 'rejete',   type: 'panne'       },
    { daysOld: 25, status: 'resolu',   type: 'panne'       },
    { daysOld: 27, status: 'resolu',   type: 'anomalie'    },
    { daysOld: 30, status: 'resolu',   type: 'panne'       },
    { daysOld: 33, status: 'resolu',   type: 'mal_eclaire' },
    { daysOld: 35, status: 'resolu',   type: 'panne'       },
    { daysOld: 38, status: 'resolu',   type: 'anomalie'    },
    { daysOld: 40, status: 'resolu',   type: 'panne'       },
    { daysOld: 42, status: 'resolu',   type: 'panne'       },
    { daysOld: 45, status: 'resolu',   type: 'mal_eclaire' },
    { daysOld: 50, status: 'resolu',   type: 'anomalie'    },
    { daysOld: 55, status: 'resolu',   type: 'panne'       },
  ];

  return raw.map((item, idx) => {
    const lampPostId = LAMP_IDS[Math.floor(rnd() * LAMP_IDS.length)];
    const descs = DESCRIPTIONS[item.type];
    const description = descs[Math.floor(rnd() * descs.length)];
    const jitterLat = (rnd() - 0.5) * 0.009;
    const jitterLng = (rnd() - 0.5) * 0.014;
    const createdAt = daysAgo(item.daysOld);
    const resolvedAt = item.status === 'resolu' ? daysAgo(Math.max(0, item.daysOld - Math.floor(rnd() * 4 + 1))) : undefined;

    return {
      id: idx + 1,
      lampPostId,
      type: item.type,
      description,
      lat: CENTER.lat + jitterLat,
      lng: CENTER.lng + jitterLng,
      status: item.status,
      createdAt,
      resolvedAt,
      mairieId: 1,
    };
  });
};

export const SIGNALEMENTS = generateSignalements();
