import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatBRL, formatBRLCompact } from "@/lib/money";
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

function shortMonthLabel(b: MonthBucket): string {
  const s = new Date(Date.UTC(b.year, b.month, 1)).toLocaleDateString("pt-BR", {
    timeZone: "UTC",
    month: "short",
  });
  return `${s.replace(".", "")}/${String(b.year).slice(2)}`;
}

function paymentState(p: { status: string; dueDate: Date }, today: Date) {
  if (p.status === "PAID") return { label: "Pago", cls: "bg-emerald-100 text-emerald-700" };
  if (new Date(p.dueDate) < today) return { label: "Vencido", cls: "bg-red-100 text-red-700" };
  return { label: "A vencer", cls: "bg-amber-100 text-amber-800" };
}

export default async function CronogramaPage() {
  const today = todayUTC();
  const ty = today.getUTCFullYear();
  const tm = today.getUTCMonth();

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
        <div className="rounded-2xl border border-dashed border-brand-200 bg-white p-10 text-center">
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

  const isPast = (b: MonthBucket) => b.year < ty || (b.year === ty && b.month < tm);
  const isCurrent = (b: MonthBucket) => b.year === ty && b.month === tm;

  function tooltip(b: MonthBucket): string {
    const upcoming = b.pending - b.overdue;
    const parts = [`${monthLabel(b)}: ${formatBRL(b.total)}`];
    if (b.paid > 0) parts.push(`pago ${formatBRL(b.paid)}`);
    if (upcoming > 0) parts.push(`a vencer ${formatBRL(upcoming)}`);
    if (b.overdue > 0) parts.push(`vencido ${formatBRL(b.overdue)}`);
    if (isPast(b)) parts.push("(mês passado)");
    return parts.join(" · ");
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Cronograma de pagamentos
        </h1>
        <p className="mt-1 text-sm capitalize text-gray-500">{rangeLabel}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-brand-100 bg-white p-3">
          <div className="text-xs text-gray-500">A vencer</div>
          <div className="mt-0.5 font-semibold text-amber-600">
            {formatBRL(grandPending - grandOverdue)}
          </div>
        </div>
        <div className="rounded-xl border border-brand-100 bg-white p-3">
          <div className="text-xs text-gray-500">Vencido</div>
          <div className="mt-0.5 font-semibold text-red-600">
            {formatBRL(grandOverdue)}
          </div>
        </div>
        <div className="rounded-xl border border-brand-100 bg-white p-3">
          <div className="text-xs text-gray-500">Pago</div>
          <div className="mt-0.5 font-semibold text-emerald-600">
            {formatBRL(grandPaid)}
          </div>
        </div>
      </div>

      {/* Horizontal overview: one bar per month, scroll sideways. */}
      <div className="rounded-2xl border border-brand-100 bg-white p-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium text-gray-700">Visão por mês</span>
          <span className="text-xs text-gray-400">
            Meses esmaecidos já passaram · toque para ver os detalhes
          </span>
        </div>
        <div className="overflow-x-auto pb-1">
          <div className="flex items-end gap-2">
            {buckets.map((b) => {
              const upcoming = b.pending - b.overdue;
              const past = isPast(b);
              const current = isCurrent(b);
              return (
                <a
                  key={b.ym}
                  href={`#mes-${b.ym}`}
                  title={tooltip(b)}
                  className={`flex w-16 shrink-0 flex-col items-center ${past ? "opacity-45" : ""}`}
                >
                  <div className="text-[10px] text-gray-400">
                    {b.total > 0 ? formatBRLCompact(b.total) : "—"}
                  </div>
                  <div
                    className={`mt-1 flex h-32 w-9 flex-col justify-end overflow-hidden rounded-md bg-gray-100 ${
                      current ? "ring-2 ring-brand-400" : ""
                    }`}
                  >
                    <div className="bg-red-400" style={{ height: `${(b.overdue / maxTotal) * 100}%` }} />
                    <div className="bg-amber-400" style={{ height: `${(upcoming / maxTotal) * 100}%` }} />
                    <div className="bg-emerald-400" style={{ height: `${(b.paid / maxTotal) * 100}%` }} />
                  </div>
                  <div
                    className={`mt-1 whitespace-nowrap text-[11px] capitalize ${
                      current ? "font-bold text-brand-600" : "text-gray-500"
                    }`}
                  >
                    {shortMonthLabel(b)}
                  </div>
                </a>
              );
            })}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded bg-emerald-400" /> Pago
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded bg-amber-400" /> A vencer
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded bg-red-400" /> Vencido
          </span>
        </div>
      </div>

      {/* Detailed month cards */}
      <ul className="space-y-3">
        {buckets.map((b) => {
          const upcoming = b.pending - b.overdue;
          const current = isCurrent(b);
          const past = isPast(b);
          const empty = b.total === 0;
          return (
            <li
              key={b.ym}
              id={`mes-${b.ym}`}
              className={`scroll-mt-20 rounded-2xl border bg-white p-4 ${
                current ? "border-brand-300 ring-1 ring-brand-200" : "border-brand-100"
              } ${empty || past ? "opacity-60" : ""}`}
            >
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex items-baseline gap-2">
                  <span className="font-medium capitalize text-gray-900">
                    {monthLabel(b)}
                  </span>
                  {current && (
                    <span className="rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-medium text-white">
                      mês atual
                    </span>
                  )}
                  {past && (
                    <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                      já passou
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
                            className="min-w-0 flex-1 truncate text-gray-700 hover:text-brand-700"
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
