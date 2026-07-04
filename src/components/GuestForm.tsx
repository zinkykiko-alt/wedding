import Link from "next/link";
import { COMPANION_OPTIONS, GUEST_STATUSES, GUEST_SIDES } from "@/lib/constants";
import SubmitButton from "@/components/SubmitButton";

export type GuestInitial = {
  name: string;
  companions: number;
  kids: number;
  status: string;
  side: string;
};

const field =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200";
const labelCls = "mb-1 block text-sm font-medium text-gray-700";

export default function GuestForm({
  action,
  initial,
  submitLabel = "Salvar",
}: {
  action: (formData: FormData) => void | Promise<void>;
  initial?: GuestInitial;
  submitLabel?: string;
}) {
  return (
    <form action={action} className="space-y-4 rounded-2xl border border-brand-100 bg-white p-5">
      <div>
        <label htmlFor="name" className={labelCls}>
          Nome *
        </label>
        <input
          id="name"
          name="name"
          required
          autoFocus
          defaultValue={initial?.name ?? ""}
          placeholder="Nome do convidado"
          className={field}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="companions" className={labelCls}>
            Acompanhante
          </label>
          <select
            id="companions"
            name="companions"
            defaultValue={String(initial?.companions ?? 0)}
            className={field}
          >
            {COMPANION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="kids" className={labelCls}>
            Número de crianças
          </label>
          <input
            id="kids"
            name="kids"
            type="number"
            min="0"
            defaultValue={String(initial?.kids ?? 0)}
            className={field}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="status" className={labelCls}>
            Situação
          </label>
          <select
            id="status"
            name="status"
            defaultValue={initial?.status ?? "TITULAR"}
            className={field}
          >
            {GUEST_STATUSES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-400">
            Titular conta na contagem final. Reserva é um backup.
          </p>
        </div>
        <div>
          <label htmlFor="side" className={labelCls}>
            Lado
          </label>
          <select
            id="side"
            name="side"
            defaultValue={initial?.side ?? ""}
            className={field}
          >
            <option value="">Não definido</option>
            {GUEST_SIDES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-400">Convidado da Alícia ou do Bruno.</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton
          pendingLabel="Salvando..."
          className="rounded-lg bg-brand-500 px-5 py-2 font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitLabel}
        </SubmitButton>
        <Link
          href="/convidados"
          className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
