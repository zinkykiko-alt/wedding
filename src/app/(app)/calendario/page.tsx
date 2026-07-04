import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatBRL } from "@/lib/money";
import { formatDateBR, todayUTC } from "@/lib/format";
import { computeTimeline, type MonthBucket } from "@/lib/timeline";

export const dynamic = "force-dynamic";

function monthLabel(b: MonthBucket): string {
  return new Date(Date.UTC(b.year, b.month, 1)).toLocaleDateString("pt-BR", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  });
}

function paymentState(p: { status: string; dueDate: Date }, today: Date) {
  if (p.status === "PAID") return { label: "Pago", cls: "bg-emerald-100 text-emerald-700" };
  if (new Date(p.dueDate) < today) return { label: "Vencido", cls: "bg-red-100 text-red-700" };
  return { label: "A vencer", cls: "bg-amber-100 text-amber-800" };
}

export default async function CronogramaPage() {
  const today = todayUTC();
  const payments = await prisma.payment.findMany({
    where: { supplier: { status: { not: "CANCELLED" } } },
    include: { supplier: { select: { id: true, name: true } } },
    orderBy: { dueDate: "asc" },
  });

  const buckets = computeTimeline(payments, today);

  if (buckets.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-gray-900">
          Cronograma de pagamentos
        </h1>
        <div className="rounded-2xl border border-dashed border-rose-200 bg-white p-10 text-center">
          <div className="text-4xl">📅</div>
          <p className="mt-3 font-medium text-gray-700">Nenhum pagamento ainda</p>
          <p className="mt-1 text-sm text-gray-500">
            Adicione um cronograma de pagamentos em cada fornecedor para ver a
            linha do tempo por mês.
          </p>
        </div>
      </div>
    );
  }

  const maxTotal = Math.max(...buckets.map((b) => b.total), 1);
  const grandPaid = buckets.reduce((s, b) => s + b.paid, 0);
  const grandPending = buckets.reduce((s, b) => s + b.pending, 0);
  const grandOverdue = buckets.reduce((s, b) => s + b.overdue, 0);
  const rangeLabel = `${monthLabel(buckets[0])} — ${monthLabel(buckets[buckets.length - 1])}`;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Cronograma de pagamentos
        </h1>
        <p className="mt-1 text-sm capitalize text-gray-500">{rangeLabel}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-rose-100 bg-white p-3">
          <div className="text-xs text-gray-500">A vencer</div>
          <div className="mt-0.5 font-semibold text-amber-600">
            {formatBRL(grandPending - grandOverdue)}
          </div>
        </div>
        <div className="rounded-xl border border-rose-100 bg-white p-3">
          <div className="text-xs text-gray-500">Vencido</div>
          <div className="mt-0.5 font-semibold text-red-600">
            {formatBRL(grandOverdue)}
          </div>
        </div>
        <div className="rounded-xl border border-rose-100 bg-white p-3">
          <div className="text-xs text-gray-500">Pago</div>
          <div className="mt-0.5 font-semibold text-emerald-600">
            {formatBRL(grandPaid)}
          </div>
        </div>
      </div>

      <ul className="space-y-3">
        {buckets.map((b) => {
          const upcoming = b.pending - b.overdue;
          const isCurrent =
            today.getUTCFullYear() === b.year && today.getUTCMonth() === b.month;
          const empty = b.total === 0;
          return (
            <li
              key={b.ym}
              className={`rounded-2xl border bg-white p-4 ${
                isCurrent ? "border-rose-300 ring-1 ring-rose-200" : "border-rose-100"
              } ${empty ? "opacity-60" : ""}`}
            >
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex items-baseline gap-2">
                  <span className="font-medium capitalize text-gray-900">
                    {monthLabel(b)}
                  </span>
                  {isCurrent && (
                    <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-medium text-white">
                      mês atual
                    </span>
                  )}
                </div>
                <span className="font-semibold text-gray-900">
                  {formatBRL(b.total)}
                </span>
              </div>

              {!empty && (
                <>
                  <div className="mt-2 flex h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div className="bg-emerald-400" style={{ width: `${(b.paid / maxTotal) * 100}%` }} />
                    <div className="bg-amber-400" style={{ width: `${(upcoming / maxTotal) * 100}%` }} />
                    <div className="bg-red-400" style={{ width: `${(b.overdue / maxTotal) * 100}%` }} />
                  </div>

                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                    {upcoming > 0 && (
                      <span className="text-amber-700">A vencer {formatBRL(upcoming)}</span>
                    )}
                    {b.overdue > 0 && (
                      <span className="text-red-700">Vencido {formatBRL(b.overdue)}</span>
                    )}
                    {b.paid > 0 && (
                      <span className="text-emerald-700">Pago {formatBRL(b.paid)}</span>
                    )}
                  </div>

                  <ul className="mt-3 divide-y divide-gray-100">
                    {b.payments.map((p) => {
                      const st = paymentState(p, today);
                      return (
                        <li key={p.id} className="flex items-center justify-between gap-3 py-1.5 text-sm">
                          <Link
                            href={`/fornecedores/${p.supplier.id}`}
                            className="min-w-0 flex-1 truncate text-gray-700 hover:text-rose-700"
                          >
                            <span className="text-gray-400">{formatDateBR(p.dueDate)}</span>{" "}
                            {p.supplier.name}
                          </Link>
                          <span className="text-gray-900">{formatBRL(p.amount)}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${st.cls}`}>
                            {st.label}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
