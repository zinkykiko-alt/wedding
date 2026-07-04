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

/** Compact currency for tight spaces, e.g. 425000 -> "R$ 4,3 mil", 250000000 -> "R$ 2,5 mi". */
export function formatBRLCompact(centavos: number): string {
  const reais = centavos / 100;
  if (reais >= 1_000_000) {
    return `R$ ${(reais / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi`;
  }
  if (reais >= 1000) {
    return `R$ ${(reais / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil`;
  }
  return formatBRL(centavos);
}
