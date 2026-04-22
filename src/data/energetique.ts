export interface DonneesAnnuelles {
  annee: number;
  nbLed: number;
  nbClassic: number;
  nbTotal: number;
  consommationKwh: number;  // kWh réel du parc mixte
  baselineKwh: number;      // kWh si tout était encore classique
  economiesKwh: number;     // différence
  coutEnergie: number;      // € payés
  co2Emis: number;          // kg CO₂ réel
  co2Evite: number;         // kg CO₂ par rapport au baseline
  partielle?: boolean;      // données incomplètes
}

// Paramètres fixes communs
const LED_W = 45;
const CLASSIC_W = 135;
const HOURS = 9;
const DAYS = 365;
const KWH_PRICE = 0.18;
const CO2 = 0.052;

const kwh = (led: number, classic: number) =>
  ((led * LED_W + classic * CLASSIC_W) * HOURS * DAYS) / 1000;

const baseline = (total: number) =>
  (total * CLASSIC_W * HOURS * DAYS) / 1000;

const build = (
  annee: number,
  nbLed: number,
  nbClassic: number,
  partielle = false,
): DonneesAnnuelles => {
  const nbTotal = nbLed + nbClassic;
  const consommationKwh = kwh(nbLed, nbClassic);
  const baselineKwh = baseline(nbTotal);
  const economiesKwh = baselineKwh - consommationKwh;
  return {
    annee,
    nbLed,
    nbClassic,
    nbTotal,
    consommationKwh: Math.round(consommationKwh),
    baselineKwh: Math.round(baselineKwh),
    economiesKwh: Math.round(economiesKwh),
    coutEnergie: Math.round(consommationKwh * KWH_PRICE),
    co2Emis: Math.round(consommationKwh * CO2),
    co2Evite: Math.round(economiesKwh * CO2),
    partielle,
  };
};

export const DONNEES_ENERGETIQUES: DonneesAnnuelles[] = [
  build(2020,  28, 112), // début de la transition
  build(2021,  50,  90),
  build(2022,  70,  70),
  build(2023,  90,  50),
  build(2024, 112,  28),
  build(2025, 119,  21),
  build(2026, 122,  18, true), // partiel
];
