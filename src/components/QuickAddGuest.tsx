"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { COMPANION_OPTIONS, GUEST_STATUSES, GUEST_SIDES } from "@/lib/constants";
import { addGuest } from "@/app/(app)/convidados/actions";

const field =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200";
const labelCls = "mb-1 block text-xs font-medium text-gray-600";

export default function QuickAddGuest() {
  const router = useRouter();
  const nameRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  // Cleared after each add:
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [companions, setCompanions] = useState("0");
  const [kids, setKids] = useState("0");
  const [godparent, setGodparent] = useState(false);
  const [parent, setParent] = useState(false);
  // Sticky (kept between adds to speed up batches):
  const [side, setSide] = useState("");
  const [status, setStatus] = useState("TITULAR");

  const [lastAdded, setLastAdded] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      nameRef.current?.focus();
      return;
    }
    startTransition(async () => {
      const res = await addGuest({
        name: trimmed,
        phone: phone.trim(),
        companions: Number(companions),
        kids: Number(kids),
        status,
        side,
        godparent,
        parent,
      });
      if (res.ok) {
        setLastAdded(trimmed);
        setName("");
        setPhone("");
        setCompanions("0");
        setKids("0");
        setGodparent(false);
        setParent(false);
        router.refresh();
        nameRef.current?.focus();
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-brand-200 bg-white p-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="sm:min-w-[180px] sm:flex-1">
          <label className={labelCls} htmlFor="qa-name">
            Nome
          </label>
          <input
            id="qa-name"
            ref={nameRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            placeholder="Nome do convidado"
            className={field}
          />
        </div>
        <div className="sm:min-w-[150px]">
          <label className={labelCls} htmlFor="qa-phone">
            Telefone
          </label>
          <input
            id="qa-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            inputMode="tel"
            placeholder="(14) 90000-0000"
            className={field}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="qa-side">
            Lado
          </label>
          <select
            id="qa-side"
            value={side}
            onChange={(e) => setSide(e.target.value)}
            className={field}
          >
            <option value="">Não definido</option>
            {GUEST_SIDES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="qa-comp">
            Acomp.
          </label>
          <select
            id="qa-comp"
            value={companions}
            onChange={(e) => setCompanions(e.target.value)}
            className={field}
          >
            {COMPANION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="w-24">
          <label className={labelCls} htmlFor="qa-kids">
            Crianças
          </label>
          <input
            id="qa-kids"
            type="number"
            min="0"
            value={kids}
            onChange={(e) => setKids(e.target.value)}
            className={field}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="qa-status">
            Situação
          </label>
          <select
            id="qa-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={field}
          >
            {GUEST_STATUSES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <label className="flex cursor-pointer items-center gap-1.5 pb-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            checked={godparent}
            onChange={(e) => setGodparent(e.target.checked)}
            className="h-4 w-4 accent-brand-500"
          />
          ★ Padrinho/Madrinha
        </label>
        <label className="flex cursor-pointer items-center gap-1.5 pb-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            checked={parent}
            onChange={(e) => setParent(e.target.checked)}
            className="h-4 w-4 accent-brand-500"
          />
          ♥ Pais
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand-500 px-5 py-2 font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Adicionando..." : "Adicionar"}
        </button>
      </div>

      <p className="mt-2 text-xs text-gray-400">
        Dica: aperte <strong>Enter</strong> para adicionar e já digitar o
        próximo. <strong>Lado</strong> e <strong>Situação</strong> continuam
        selecionados para agilizar listas grandes.
        {lastAdded && !pending && (
          <span className="text-emerald-700"> · ✓ {lastAdded} adicionado(a).</span>
        )}
      </p>
    </form>
  );
}
