import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatBRL } from "@/lib/money";
import { todayUTC } from "@/lib/format";

export const dynamic = "force-dynamic";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function parseYm(ym: string | undefined, fallback: Date): { y: number; mo: number } {
  if (ym && /^\d{4}-\d{2}$/.test(ym)) {
    const [y, m] = ym.split("-").map(Number);
    if (m >= 1 && m <= 12) return { y, mo: m - 1 };
  }
  return { y: fallback.getUTCFullYear(), mo: fallback.getUTCMonth() };
}

function ymStr(y: number, mo: number): string {
  return `${y}-${String(mo + 1).padStart(2, "0")}`;
}

export default async function CalendarioPage({
  searchParams,
}: {
  searchParams: Promise<{ ym?: string }>;
}) {
  const { ym } = await searchParams;
  const today = todayUTC();
  const { y, mo } = parseYm(ym, today);

  const payments = await prisma.payment.findMany({
    where: { supplier: { status: { not: "CANCELLED" } } },
    include: { supplier: { select: { id: true, name: true } } },
    orderBy: { dueDate: "asc" },
  });
  type PaymentRow = (typeof payments)[number];

  const byDay = new Map<number, PaymentRow[]>();
  for (const p of payments) {
    const d = new Date(p.dueDate);
    if (d.getUTCFullYear() === y && d.getUTCMonth() === mo) {
      const day = d.getUTCDate();
      const arr = byDay.get(day) ?? [];
      arr.push(p);
      byDay.set(day, arr);
    }
  }

  const firstOfMonth = new Date(Date.UTC(y, mo, 1));
  const startWeekday = firstOfMonth.getUTCDay();
  const daysInMonth = new Date(Date.UTC(y, mo + 1, 0)).getUTCDate();
  const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;

  const monthTitle = firstOfMonth.toLocaleDateString("pt-BR", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  });
  const prev = ymStr(mo === 0 ? y - 1 : y, mo === 0 ? 11 : mo - 1);
  const next = ymStr(mo === 11 ? y + 1 : y, mo === 11 ? 0 : mo + 1);

  function chipClass(p: PaymentRow): string {
    if (p.status === "PAID") return "bg-emerald-100 text-emerald-700";
    return new Date(p.dueDate) < today
      ? "bg-red-100 text-red-700"
      : "bg-amber-100 text-amber-800";
  }

  const cells = Array.from({ length: totalCells }, (_, i) => {
    const dayNum = i - startWeekday + 1;
    const inMonth = dayNum >= 1 && dayNum <= daysInMonth;
    const isToday =
      inMonth &&
      today.getUTCFullYear() === y &&
      today.getUTCMonth() === mo &&
      today.getUTCDate() === dayNum;
    const dayPayments = inMonth ? byDay.get(dayNum) ?? [] : [];
    return { key: i, dayNum, inMonth, isToday, dayPayments };
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900">
        Calendário de pagamentos
      </h1>

      <div className="flex items-center justify-between">
        <Link
          href={`/calendario?ym=${prev}`}
          className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-rose-100 hover:text-rose-700"
        >
          ← Anterior
        </Link>
        <span className="font-medium capitalize text-gray-900">{monthTitle}</span>
        <Link
          href={`/calendario?ym=${next}`}
          className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-rose-100 hover:text-rose-700"
        >
          Próximo →
        </Link>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-gray-600">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded bg-red-200" /> Vencido
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded bg-amber-200" /> A vencer
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded bg-emerald-200" /> Pago
        </span>
      </div>

      {payments.length === 0 && (
        <p className="text-sm text-gray-500">
          Nenhum pagamento cadastrado ainda. Adicione um cronograma de pagamentos
          em cada fornecedor.
        </p>
      )}

      <div className="overflow-x-auto">
        <div className="min-w-[680px]">
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500">
            {WEEKDAYS.map((w) => (
              <div key={w} className="py-1">
                {w}
              </div>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((c) => (
              <div
                key={c.key}
                className={`min-h-[92px] rounded-lg border p-1 ${
                  c.inMonth ? "border-rose-100 bg-white" : "border-transparent bg-transparent"
                } ${c.isToday ? "ring-2 ring-rose-400" : ""}`}
              >
                {c.inMonth && (
                  <>
                    <div
                      className={`mb-1 text-right text-xs ${
                        c.isToday ? "font-bold text-rose-600" : "text-gray-400"
                      }`}
                    >
                      {c.dayNum}
                    </div>
                    <div className="space-y-1">
                      {c.dayPayments.map((p) => (
                        <Link
                          key={p.id}
                          href={`/fornecedores/${p.supplier.id}`}
                          title={`${p.supplier.name} — ${formatBRL(p.amount)}`}
                          className={`block truncate rounded px-1 py-0.5 text-[11px] leading-tight hover:opacity-80 ${chipClass(p)}`}
                        >
                          {formatBRL(p.amount)}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400">
        Toque em um pagamento para abrir o fornecedor.
      </p>
    </div>
  );
}
