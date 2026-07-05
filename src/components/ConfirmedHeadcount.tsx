"use client";

import { useState } from "react";

type Side = { ALICIA: number; BRUNO: number; NONE: number };

export default function ConfirmedHeadcount({
  titularPeople,
  titularCount,
  companions,
  kids,
  bySide,
  bySideKids,
}: {
  titularPeople: number;
  titularCount: number;
  companions: number;
  kids: number;
  bySide: Side;
  bySideKids: Side;
}) {
  const [includeKids, setIncludeKids] = useState(true);

  const total = includeKids ? titularPeople : titularPeople - kids;
  const alicia = includeKids ? bySide.ALICIA : bySide.ALICIA - bySideKids.ALICIA;
  const bruno = includeKids ? bySide.BRUNO : bySide.BRUNO - bySideKids.BRUNO;
  const none = includeKids ? bySide.NONE : bySide.NONE - bySideKids.NONE;

  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm text-gray-500">
          Pessoas confirmadas{!includeKids && " (sem crianças)"}
        </div>
        <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-xs text-gray-600">
          <input
            type="checkbox"
            checked={includeKids}
            onChange={(e) => setIncludeKids(e.target.checked)}
            className="accent-brand-500"
          />
          Contar crianças
        </label>
      </div>

      <div className="mt-1 text-3xl font-semibold text-gray-900">{total}</div>

      <p className="mt-1 text-sm text-gray-500">
        {titularCount} titular{titularCount === 1 ? "" : "es"} · {companions}{" "}
        acompanhante{companions === 1 ? "" : "s"}
        {includeKids && (
          <>
            {" "}
            · {kids} criança{kids === 1 ? "" : "s"}
          </>
        )}
      </p>

      <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm">
        <span className="font-medium text-violet-700">Alícia {alicia}</span>
        <span className="font-medium text-sky-700">Bruno {bruno}</span>
        {none > 0 && <span className="text-gray-400">Sem lado {none}</span>}
      </p>
    </div>
  );
}
