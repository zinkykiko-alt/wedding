// Single source of truth for the fixed option lists, with Portuguese labels.

export type Option = { value: string; label: string };

export const CATEGORIES: readonly Option[] = [
  { value: "VENUE", label: "Espaço" },
  { value: "BUFFET", label: "Buffet" },
  { value: "PHOTOGRAPHY", label: "Fotografia" },
  { value: "MUSIC", label: "Música" },
  { value: "DECORATION", label: "Decoração" },
  { value: "ATTIRE", label: "Traje" },
  { value: "OTHER", label: "Outro" },
];

export const SUPPLIER_STATUSES: readonly Option[] = [
  { value: "NEGOTIATING", label: "Negociando" },
  { value: "HIRED", label: "Contratado" },
  { value: "CANCELLED", label: "Cancelado" },
];

export const PAYMENT_STATUSES: readonly Option[] = [
  { value: "PENDING", label: "Pendente" },
  { value: "PAID", label: "Pago" },
];

export const ATTACHMENT_LABELS: readonly Option[] = [
  { value: "CONTRACT", label: "Contrato" },
  { value: "RECEIPT", label: "Recibo/Comprovante" },
  { value: "OTHER", label: "Outro" },
];

export const COMPANION_OPTIONS: readonly Option[] = [
  { value: "0", label: "Sem acompanhante" },
  { value: "1", label: "+1" },
  { value: "2", label: "+2" },
];

export const GUEST_STATUSES: readonly Option[] = [
  { value: "TITULAR", label: "Titular" },
  { value: "BENCH", label: "Reserva" },
];

// The two sides of the wedding. "" means not assigned yet.
export const GUEST_SIDES: readonly Option[] = [
  { value: "ALICIA", label: "Alicia" },
  { value: "BRUNO", label: "Bruno" },
];

/** Look up the human label for a stored value, falling back to the value itself. */
export function getLabel(list: readonly Option[], value: string): string {
  return list.find((o) => o.value === value)?.label ?? value;
}
