"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { filterGuests, type GuestFull } from "@/lib/guests";
import GodparentToggle from "@/components/GodparentToggle";

function SideBadge({ side }: { side: string }) {
  if (side === "ALICIA")
    return (
      <span className="shrink-0 rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-medium text-violet-700">
        Alícia
      </span>
    );
  if (side === "BRUNO")
    return (
      <span className="shrink-0 rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-medium text-sky-700">
        Bruno
      </span>
    );
  return null;
}

function describe(g: GuestFull): string {
  const parts: string[] = [];
  if (g.companions > 0) parts.push(`+${g.companions}`);
  if (g.kids > 0) parts.push(`${g.kids} criança${g.kids > 1 ? "s" : ""}`);
  return parts.join(" · ");
}

const selectCls =
  "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200";

function Toggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "border-brand-500 bg-brand-500 text-white"
          : "border-gray-300 bg-white text-gray-600 hover:bg-brand-50"
      }`}
    >
      {children}
    </button>
  );
}

export default function GuestBrowser({ guests }: { guests: GuestFull[] }) {
  const [query, setQuery] = useState("");
  const [side, setSide] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [noPhone, setNoPhone] = useState(false);
  const [godparentOnly, setGodparentOnly] = useState(false);

  const filtered = useMemo(
    () =>
      filterGuests(guests, {
        query,
        side,
        status,
        noPhone,
        noKids: false,
        godparentOnly,
      }),
    [guests, query, side, status, noPhone, godparentOnly],
  );

  const peopleSum = filtered.reduce((s, g) => s + 1 + g.companions + g.kids, 0);
  const anyFilter =
    query.trim() !== "" ||
    side !== "ALL" ||
    status !== "ALL" ||
    noPhone ||
    godparentOnly;

  function clearAll() {
    setQuery("");
    setSide("ALL");
    setStatus("ALL");
    setNoPhone(false);
    setGodparentOnly(false);
  }

  return (
    <div className="space-y-3">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        type="search"
        placeholder="🔎 Buscar por nome ou telefone…"
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
      />

      <div className="flex flex-wrap items-center gap-2">
        <select value={side} onChange={(e) => setSide(e.target.value)} className={selectCls}>
          <option value="ALL">Todos os lados</option>
          <option value="ALICIA">Alícia</option>
          <option value="BRUNO">Bruno</option>
          <option value="NONE">Sem lado</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls}>
          <option value="ALL">Todas as situações</option>
          <option value="TITULAR">Titular</option>
          <option value="BENCH">Reserva</option>
        </select>
        <Toggle active={godparentOnly} onClick={() => setGodparentOnly((v) => !v)}>
          ★ Padrinhos/madrinhas
        </Toggle>
        <Toggle active={noPhone} onClick={() => setNoPhone((v) => !v)}>
          Só sem telefone
        </Toggle>
        {anyFilter && (
          <button
            type="button"
            onClick={clearAll}
            className="text-sm text-gray-500 underline hover:text-brand-700"
          >
            Limpar
          </button>
        )}
      </div>

      <p className="text-sm text-gray-500">
        Mostrando <strong className="text-gray-900">{filtered.length}</strong> de{" "}
        {guests.length} convidado{guests.length === 1 ? "" : "s"} ·{" "}
        <strong className="text-gray-900">{peopleSum}</strong> pessoa
        {peopleSum === 1 ? "" : "s"}
      </p>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-brand-200 bg-white p-6 text-center text-sm text-gray-500">
          Nenhum convidado encontrado com esses filtros.
        </p>
      ) : (
        <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-brand-100 bg-white">
          {filtered.map((g) => {
            const extra = describe(g);
            return (
              <div
                key={g.id}
                className="flex items-center gap-2 px-3 py-3 hover:bg-brand-50"
              >
                <GodparentToggle id={g.id} active={g.godparent} />
                <Link
                  href={`/convidados/${g.id}`}
                  className="flex min-w-0 flex-1 items-center justify-between gap-3"
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-medium text-gray-900">{g.name}</span>
                      {g.godparent && (
                        <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                          ★ Padrinho/Madrinha
                        </span>
                      )}
                      <SideBadge side={g.side} />
                      {g.status === "BENCH" && (
                        <span className="shrink-0 rounded-full bg-gray-200 px-2 py-0.5 text-[11px] font-medium text-gray-500">
                          Reserva
                        </span>
                      )}
                    </span>
                    {g.phone && (
                      <span className="mt-0.5 block text-xs text-gray-400">{g.phone}</span>
                    )}
                  </span>
                  <span className="shrink-0 text-sm text-gray-500">{extra || "—"}</span>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
