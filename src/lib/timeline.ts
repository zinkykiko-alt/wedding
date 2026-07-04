export type TimelinePayment = {
  id: string;
  amount: number;
  status: string;
  dueDate: Date;
  supplier: { id: string; name: string };
};

export type MonthBucket = {
  ym: string; // "2026-07"
  year: number;
  month: number; // 0-based
  total: number;
  paid: number;
  pending: number; // includes overdue
  overdue: number;
  payments: TimelinePayment[];
};

// Builds one bucket per month from the first payment's month to the last
// payment's month (inclusive), so months with nothing still appear — giving a
// continuous financial timeline. `today` decides what counts as overdue.
export function computeTimeline(
  payments: TimelinePayment[],
  today: Date,
): MonthBucket[] {
  if (payments.length === 0) return [];

  let min = payments[0].dueDate;
  let max = payments[0].dueDate;
  for (const p of payments) {
    if (p.dueDate < min) min = p.dueDate;
    if (p.dueDate > max) max = p.dueDate;
  }

  const buckets: MonthBucket[] = [];
  const index = new Map<string, MonthBucket>();
  let y = min.getUTCFullYear();
  let m = min.getUTCMonth();
  const endY = max.getUTCFullYear();
  const endM = max.getUTCMonth();
  while (y < endY || (y === endY && m <= endM)) {
    const ym = `${y}-${String(m + 1).padStart(2, "0")}`;
    const bucket: MonthBucket = {
      ym,
      year: y,
      month: m,
      total: 0,
      paid: 0,
      pending: 0,
      overdue: 0,
      payments: [],
    };
    buckets.push(bucket);
    index.set(ym, bucket);
    m += 1;
    if (m > 11) {
      m = 0;
      y += 1;
    }
  }

  for (const p of payments) {
    const ym = `${p.dueDate.getUTCFullYear()}-${String(
      p.dueDate.getUTCMonth() + 1,
    ).padStart(2, "0")}`;
    const bucket = index.get(ym);
    if (!bucket) continue;
    bucket.total += p.amount;
    if (p.status === "PAID") {
      bucket.paid += p.amount;
    } else {
      bucket.pending += p.amount;
      if (new Date(p.dueDate) < today) bucket.overdue += p.amount;
    }
    bucket.payments.push(p);
  }

  for (const bucket of buckets) {
    bucket.payments.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }
  return buckets;
}
