// The couple's details, used across the app's branding.
export const WEDDING = {
  bride: "Alícia",
  groom: "Bruno",
  year: 2027,
  month: 6, // 0-based: July
  day: 24,
  dateLabel: "24 de julho de 2027",
  dateShort: "24 . 07 . 2027",
  venue: "Vinícola Casagrande",
  city: "Lençóis Paulista · SP",
};

/** Whole days from `today` (UTC-midnight) until the wedding. Negative if past. */
export function daysUntilWedding(today: Date): number {
  const wedding = Date.UTC(WEDDING.year, WEDDING.month, WEDDING.day);
  return Math.round((wedding - today.getTime()) / 86_400_000);
}
