"use client";

import { useState } from "react";
import Link from "next/link";
import { CATEGORIES, SUPPLIER_STATUSES, PAYMENT_STATUSES } from "@/lib/constants";
import SubmitButton from "@/components/SubmitButton";

type Row = {
  _id: string;
  amount: string;
  dueDate: string;
  status: string;
  paidDate: string;
};

export type SupplierFormInitial = {
  name: string;
  category: string;
  totalCost: string;
  status: string;
  notes: string;
  payments: { amount: string; dueDate: string; status: string; paidDate: string }[];
};

let rowCounter = 0;
function newRow(partial?: Partial<Row>): Row {
  rowCounter += 1;
  return {
    _id: `row-${rowCounter}-${Math.random().toString(36).slice(2)}`,
    amount: partial?.amount ?? "",
    dueDate: partial?.dueDate ?? "",
    status: partial?.status ?? "PENDING",
    paidDate: partial?.paidDate ?? "",
  };
}

const fieldClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200";
const labelClass = "mb-1 block text-sm font-medium text-gray-700";

export default function SupplierForm({
  action,
  initial,
  submitLabel = "Salvar",
}: {
  action: (formData: FormData) => void | Promise<void>;
  initial?: SupplierFormInitial;
  submitLabel?: string;
}) {
  const [rows, setRows] = useState<Row[]>(() =>
    (initial?.payments ?? []).map((p) => newRow(p)),
  );

  function updateRow(id: string, patch: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r._id === id ? { ...r, ...patch } : r)));
  }

  const paymentsJson = JSON.stringify(
    rows.map((r) => ({
      amount: r.amount,
      dueDate: r.dueDate,
      status: r.status,
      paidDate: r.paidDate,
    })),
  );

  return (
    <form action={action} className="space-y-6">
      <div className="rounded-2xl border border-brand-100 bg-white p-5 space-y-4">
        <div>
          <label htmlFor="name" className={labelClass}>
            Nome do fornecedor *
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={initial?.name ?? ""}
            placeholder="Ex: Espaço Jardim das Flores"
            className={fieldClass}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="category" className={labelClass}>
              Categoria
            </label>
            <select
              id="category"
              name="category"
              defaultValue={initial?.category ?? "OTHER"}
              className={fieldClass}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="status" className={labelClass}>
              Situação
            </label>
            <select
              id="status"
              name="status"
              defaultValue={initial?.status ?? "NEGOTIATING"}
              className={fieldClass}
            >
              {SUPPLIER_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="totalCost" className={labelClass}>
            Custo total acordado (R$)
          </label>
          <input
            id="totalCost"
            name="totalCost"
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            defaultValue={initial?.totalCost ?? ""}
            placeholder="0,00"
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="notes" className={labelClass}>
            Observações
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            defaultValue={initial?.notes ?? ""}
            placeholder="Anotações livres sobre este fornecedor."
            className={fieldClass}
          />
        </div>
      </div>

      {/* Payment schedule */}
      <div className="rounded-2xl border border-brand-100 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Cronograma de pagamentos</h2>
          <button
            type="button"
            onClick={() => setRows((rs) => [...rs, newRow()])}
            className="rounded-lg bg-brand-100 px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-200"
          >
            + Adicionar pagamento
          </button>
        </div>

        {rows.length === 0 ? (
          <p className="text-sm text-gray-500">
            Nenhum pagamento ainda. Adicione as parcelas e seus vencimentos.
          </p>
        ) : (
          <div className="space-y-3">
            {rows.map((r, i) => (
              <div
                key={r._id}
                className="rounded-xl border border-gray-200 p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    Pagamento {i + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => setRows((rs) => rs.filter((x) => x._id !== r._id))}
                    className="text-sm text-gray-400 hover:text-brand-600"
                  >
                    Remover
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Valor (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      inputMode="decimal"
                      value={r.amount}
                      onChange={(e) => updateRow(r._id, { amount: e.target.value })}
                      placeholder="0,00"
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Vencimento</label>
                    <input
                      type="date"
                      value={r.dueDate}
                      onChange={(e) => updateRow(r._id, { dueDate: e.target.value })}
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Situação</label>
                    <select
                      value={r.status}
                      onChange={(e) => updateRow(r._id, { status: e.target.value })}
                      className={fieldClass}
                    >
                      {PAYMENT_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {r.status === "PAID" && (
                    <div>
                      <label className={labelClass}>Data do pagamento</label>
                      <input
                        type="date"
                        value={r.paidDate}
                        onChange={(e) => updateRow(r._id, { paidDate: e.target.value })}
                        className={fieldClass}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <input type="hidden" name="payments" value={paymentsJson} />

      <div className="flex items-center gap-3">
        <SubmitButton
          pendingLabel="Salvando..."
          className="rounded-lg bg-brand-500 px-5 py-2 font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitLabel}
        </SubmitButton>
        <Link
          href="/fornecedores"
          className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
