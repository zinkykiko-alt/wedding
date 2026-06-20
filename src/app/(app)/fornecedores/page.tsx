import Link from "next/link";
import { prisma } from "@/lib/db";
import { CATEGORIES, SUPPLIER_STATUSES, getLabel } from "@/lib/constants";
import { formatBRL } from "@/lib/money";

export const dynamic = "force-dynamic";

function statusClasses(status: string): string {
  switch (status) {
    case "HIRED":
      return "bg-green-100 text-green-700";
    case "CANCELLED":
      return "bg-gray-200 text-gray-600";
    default:
      return "bg-amber-100 text-amber-700"; // NEGOTIATING
  }
}

export default async function FornecedoresPage() {
  const suppliers = await prisma.supplier.findMany({
    include: { payments: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Fornecedores</h1>
        <Link
          href="/fornecedores/novo"
          className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600"
        >
          + Novo fornecedor
        </Link>
      </div>

      {suppliers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-rose-200 bg-white p-10 text-center">
          <div className="text-4xl">📋</div>
          <p className="mt-3 font-medium text-gray-700">Nenhum fornecedor ainda</p>
          <p className="mt-1 text-sm text-gray-500">
            Comece cadastrando seu primeiro fornecedor (espaço, buffet, fotógrafo…).
          </p>
          <Link
            href="/fornecedores/novo"
            className="mt-4 inline-block rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600"
          >
            + Novo fornecedor
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {suppliers.map((s) => {
            const paid = s.payments
              .filter((p) => p.status === "PAID")
              .reduce((sum, p) => sum + p.amount, 0);
            const scheduled = s.payments.reduce((sum, p) => sum + p.amount, 0);
            return (
              <li key={s.id}>
                <Link
                  href={`/fornecedores/${s.id}`}
                  className="block rounded-2xl border border-rose-100 bg-white p-4 transition-shadow hover:shadow-md"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-gray-900">{s.name}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClasses(
                            s.status,
                          )}`}
                        >
                          {getLabel(SUPPLIER_STATUSES, s.status)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {getLabel(CATEGORIES, s.category)}
                        {s.payments.length > 0 &&
                          ` • ${s.payments.length} pagamento${s.payments.length > 1 ? "s" : ""}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {formatBRL(s.totalCost)}
                      </div>
                      {scheduled > 0 && (
                        <div className="mt-0.5 text-xs text-gray-500">
                          Pago {formatBRL(paid)} de {formatBRL(scheduled)}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
