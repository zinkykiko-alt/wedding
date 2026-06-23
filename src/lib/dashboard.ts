import { todayUTC, addDaysUTC } from "@/lib/format";

export type SupplierWithPayments = {
  status: string;
  category: string;
  totalCost: number;
  payments: { amount: number; status: string; dueDate: Date }[];
};

export type DashboardMetrics = {
  estimated: number; // sum of agreed totals (centavos)
  paid: number; // sum of paid payments
  outstanding: number; // estimated - paid (never below 0)
  dueSoon: number; // pending payments due within the next 30 days
  overdue: number; // pending payments already past due
  byCategory: { category: string; total: number }[]; // desc, only > 0
  supplierCount: number; // active (non-cancelled) suppliers
};

// Cancelled suppliers are excluded from all money figures (you're not paying
// them). "Today" is the Brazil calendar date so overdue/due-soon are correct.
export function computeDashboard(
  suppliers: SupplierWithPayments[],
): DashboardMetrics {
  const today = todayUTC();
  const in30 = addDaysUTC(today, 30);

  let estimated = 0;
  let paid = 0;
  let dueSoon = 0;
  let overdue = 0;
  const catMap = new Map<string, number>();

  const active = suppliers.filter((s) => s.status !== "CANCELLED");

  for (const s of active) {
    estimated += s.totalCost;
    catMap.set(s.category, (catMap.get(s.category) ?? 0) + s.totalCost);

    for (const p of s.payments) {
      if (p.status === "PAID") {
        paid += p.amount;
      } else {
        const due = new Date(p.dueDate);
        if (due < today) overdue += p.amount;
        else if (due <= in30) dueSoon += p.amount;
      }
    }
  }

  const byCategory = [...catMap.entries()]
    .map(([category, total]) => ({ category, total }))
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);

  return {
    estimated,
    paid,
    outstanding: Math.max(0, estimated - paid),
    dueSoon,
    overdue,
    byCategory,
    supplierCount: active.length,
  };
}
