// Money is stored as integer centavos (cents) to avoid floating-point errors.

/** Format integer centavos as Brazilian currency, e.g. 150000 -> "R$ 1.500,00". */
export function formatBRL(centavos: number): string {
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/** Convert a reais value (e.g. 1500.5 from a number input) to integer centavos. */
export function reaisToCentavos(reais: number): number {
  if (!Number.isFinite(reais)) return 0;
  return Math.round(reais * 100);
}

/** Convert integer centavos to a reais number (e.g. for filling a number input). */
export function centavosToReais(centavos: number): number {
  return centavos / 100;
}
