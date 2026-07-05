import Link from "next/link";
import { prisma } from "@/lib/db";
import { computeHeadcount, type GuestLike } from "@/lib/guests";
import QuickAddGuest from "@/components/QuickAddGuest";

export const dynamic = "force-dynamic";

type Guest = GuestLike & { id: string; name: string; phone: string };

function describe(g: Guest): string {
  const parts: string[] = [];
  if (g.companions > 0) parts.push(`+${g.companions}`);
  if (g.kids > 0) parts.push(`${g.kids} criança${g.kids > 1 ? "s" : ""}`);
  return parts.join(" · ");
}

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

function GuestRow({ g }: { g: Guest }) {
  const extra = describe(g);
  return (
    <Link
      href={`/convidados/${g.id}`}
      className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-brand-50"
    >
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate font-medium text-gray-900">{g.name}</span>
          <SideBadge side={g.side} />
        </span>
        {g.phone && (
          <span className="mt-0.5 block text-xs text-gray-400">{g.phone}</span>
        )}
      </span>
      <span className="shrink-0 text-sm text-gray-500">{extra || "—"}</span>
    </Link>
  );
}

export default async function ConvidadosPage() {
  const guests = (await prisma.guest.findMany({
    orderBy: { name: "asc" },
  })) as Guest[];

  const hc = computeHeadcount(guests);
  const titulars = guests.filter((g) => g.status !== "BENCH");
  const bench = guests.filter((g) => g.status === "BENCH");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Lista de convidados</h1>

      <QuickAddGuest />

      {guests.length === 0 ? (
        <p className="text-center text-sm text-gray-500">
          Nenhum convidado ainda. Use o campo acima para adicionar o primeiro. 👆
        </p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-brand-100 bg-white p-5">
              <div className="text-sm text-gray-500">Pessoas confirmadas</div>
              <div className="mt-1 text-3xl font-semibold text-gray-900">
                {hc.titularPeople}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {hc.titularCount} titular{hc.titularCount === 1 ? "" : "es"} ·{" "}
                {hc.companions} acompanhante{hc.companions === 1 ? "" : "s"} ·{" "}
                {hc.kids} criança{hc.kids === 1 ? "" : "s"}
              </p>
              <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                <span className="font-medium text-violet-700">
                  Alícia {hc.bySide.ALICIA}
                </span>
                <span className="font-medium text-sky-700">
                  Bruno {hc.bySide.BRUNO}
                </span>
                {hc.bySide.NONE > 0 && (
                  <span className="text-gray-400">Sem lado {hc.bySide.NONE}</span>
                )}
              </p>
            </div>
            <div className="rounded-2xl border border-brand-100 bg-white p-5">
              <div className="text-sm text-gray-500">Reserva (backup)</div>
              <div className="mt-1 text-3xl font-semibold text-gray-500">
                {hc.benchPeople}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {hc.benchCount} convidado{hc.benchCount === 1 ? "" : "s"} na reserva
              </p>
            </div>
          </div>

          <section>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Titulares ({titulars.length})
            </h2>
            {titulars.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhum titular ainda.</p>
            ) : (
              <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-brand-100 bg-white">
                {titulars.map((g) => (
                  <GuestRow key={g.id} g={g} />
                ))}
              </div>
            )}
          </section>

          {bench.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Reserva ({bench.length})
              </h2>
              <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-brand-100 bg-white">
                {bench.map((g) => (
                  <GuestRow key={g.id} g={g} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
