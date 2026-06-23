// Date helpers. Payment dates are stored as date-only values; we format and
// parse them in UTC so they never shift by a day due to the local timezone.

/** Format a Date as Brazilian date, e.g. "01/07/2026". */
export function formatDateBR(date: Date): string {
  return new Date(date).toLocaleDateString("pt-BR", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** Convert a Date to a value for <input type="date"> (YYYY-MM-DD). */
export function toDateInputValue(date: Date | null | undefined): string {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

/** Human-readable file size, e.g. 1536000 -> "1.5 MB". */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 KB";
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.max(1, Math.round(kb))} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}
