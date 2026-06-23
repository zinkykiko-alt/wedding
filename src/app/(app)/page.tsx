import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatBRL } from "@/lib/money";
import { CATEGORIES, getLabel } from "@/lib/constants";
import { computeDashboard } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

const sections = [
  { href: "/fornecedores", emoji: "📋", title: "Fornecedores", description: "Cadastre buffet, espaço, fotógrafo e acompanhe os pagamentos." },
  { href: "/calendario", emoji: "📅", title: "Calendário de pagamentos", description: "Veja as datas de vencimento e o que está atrasado ou próximo." },
  { href: "/convidados", emoji: "👰", title: "Lista de convidados", description: "Controle confirmados, acompanhantes, crianças e a reserva." },
];

function Kpi({
  label,
  value,
  valueClass = "text-gray-900",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-rose-100 bg-white p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className={`mt-1 text-xl font-semibold ${valueClass}`}>{value}</div>
    </div>
  );
}

export default async function PainelPage() {
  const suppliers = await prisma.supplier.findMany({ include: { payments: true } });

  if (suppliers.length === 0) {
    return (
      <div className="space-y-8">
        <section className="rounded-2xl border border-rose-100 bg-white p-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Bem-vindo(a) ao seu planejador 💍
          </h1>
          <p className="mt-2 max-w-2xl text-gray-600">
            Comece cadastrando seus fornecedores. Assim que houver dados, este
            painel mostrará o resumo financeiro do casamento.
          </p>
          <Link
            href="/fornecedores/novo"
            className="mt-4 inline-block rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600"
          >
            + Cadastrar primeiro fornecedor
          </Link>
        </section>
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="rounded-2xl border border-rose-100 bg-white p-5 transition-shadow hover:shadow-md"
            >
              <div className="text-2xl">{s.emoji}</div>
              <h2 className="mt-2 font-semibold text-gray-900">{s.title}</h2>
              <p className="mt-1 text-sm text-gray-600">{s.description}</p>
            </Link>
          ))}
        </section>
      </div>
    );
  }

  const m = computeDashboard(suppliers);
  const cancelledCount = suppliers.filter((s) => s.status === "CANCELLED").length;
  const pctPaid =
    m.estimated > 0 ? Math.min(100, Math.round((m.paid / m.estimated) * 100)) : 0;
  const maxCat = m.byCategory[0]?.total ?? 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Painel financeiro</h1>

      {m.overdue > 0 && (
        <Link
          href="/calendario"
          className="block rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800 hover:bg-red-100"
        >
          ⚠️ Você tem {formatBRL(m.overdue)} em pagamentos vencidos. Ver no
          calendário →
        </Link>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Custo total estimado" value={formatBRL(m.estimated)} />
        <Kpi label="Total pago" value={formatBRL(m.paid)} valueClass="text-emerald-600" />
        <Kpi label="Falta pagar" value={formatBRL(m.outstanding)} valueClass="text-amber-600" />
        <Kpi label="Vence em 30 dias" value={formatBRL(m.dueSoon)} valueClass="text-sky-600" />
      </div>

      <div className="rounded-2xl border border-rose-100 bg-white p-5">
        <div className="flex items-center justify-between text-sm font-medium text-gray-700">
          <span>Progresso de pagamento</span>
          <span>{pctPaid}%</span>
        </div>
        <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-3 rounded-full bg-emerald-500"
            style={{ width: `${pctPaid}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-gray-500">
          <span>{formatBRL(m.paid)} pago</span>
          <span>{formatBRL(m.outstanding)} a pagar</span>
        </div>
      </div>

      <div className="rounded-2xl border border-rose-100 bg-white p-5">
        <h2 className="mb-3 font-semibold text-gray-900">Custo por categoria</h2>
        {m.byCategory.length === 0 ? (
          <p className="text-sm text-gray-500">
            Defina o custo total dos fornecedores para ver a distribuição.
          </p>
        ) : (
          <ul className="space-y-3">
            {m.byCategory.map((c) => (
              <li key={c.category}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">
                    {getLabel(CATEGORIES, c.category)}
                  </span>
                  <span className="font-medium text-gray-900">
                    {formatBRL(c.total)}
                  </span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full bg-rose-400"
                    style={{ width: `${maxCat > 0 ? Math.round((c.total / maxCat) * 100) : 0}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {cancelledCount > 0 && (
        <p className="text-xs text-gray-400">
          {cancelledCount} fornecedor(es) cancelado(s) não entram nos totais.
        </p>
      )}
    </div>
  );
}
