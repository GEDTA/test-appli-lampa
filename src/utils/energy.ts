/** Constante partagée pour éviter la duplication dans les pages */
export const DAYS_PER_YEAR = 365;

/**
 * kWh consommés annuellement par l'ensemble du parc (LED + classique).
 */
export const calcAnnualKwh = (
  led: number,
  classic: number,
  ledPower: number,
  classicPower: number,
  hoursPerNight: number,
): number =>
  ((led * ledPower + classic * classicPower) * hoursPerNight * DAYS_PER_YEAR) / 1000;

/**
 * kWh de référence si tout le parc était encore classique
 * (utilisé pour calculer les kg CO₂ évités grâce aux LED).
 */
export const calcBaselineKwh = (
  total: number,
  classicPower: number,
  hoursPerNight: number,
): number => (total * classicPower * hoursPerNight * DAYS_PER_YEAR) / 1000;

/**
 * kWh consommés annuellement par un seul lampadaire selon sa puissance.
 */
export const calcAnnualKwhForLamp = (
  power: number,
  hoursPerNight: number,
): number => (power * hoursPerNight * DAYS_PER_YEAR) / 1000;

/**
 * Économies annuelles (€) si tous les lampadaires classiques restants
 * étaient convertis en LED.
 */
export const calcLedSavingsPerYear = (
  classicCount: number,
  ledPower: number,
  classicPower: number,
  hoursPerNight: number,
  kwhPrice: number,
): number =>
  (classicCount * (classicPower - ledPower) * hoursPerNight * DAYS_PER_YEAR * kwhPrice) / 1000;
