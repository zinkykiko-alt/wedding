import Link from "next/link";
import { prisma } from "@/lib/db";
import { computeHeadcount, type GuestLike } from "@/lib/guests";

export const dynamic = "force-dynamic";

type Guest = GuestLike & { id: string; name: string };

function describe(g: Guest): string {
  const parts: string[] = [];
  if (g.companions > 0) parts.push(`+${g.companions}`);
  if (g.kids > 0) parts.push(`${g.kids} criança${g.kids > 1 ? "s" : ""}`);
  return parts.join(" · ");
}

function GuestRow({ g }: { g: Guest }) {
  const extra = describe(g);
  return (
    <Link
      href={`/convidados/${g.id}`}
      className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-rose-50"
    >
      <span className="min-w-0 truncate font-medium text-gray-900">{g.name}</span>
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Lista de convidados</h1>
        <Link
          href="/convidados/novo"
          className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600"
        >
          + Novo convidado
        </Link>
      </div>

      {guests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-rose-200 bg-white p-10 text-center">
          <div className="text-4xl">👰</div>
          <p className="mt-3 font-medium text-gray-700">Nenhum convidado ainda</p>
          <p className="mt-1 text-sm text-gray-500">
            Cadastre seus convidados e acompanhe a contagem de pessoas.
          </p>
          <Link
            href="/convidados/novo"
            className="mt-4 inline-block rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600"
          >
            + Novo convidado
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-rose-100 bg-white p-5">
              <div className="text-sm text-gray-500">Pessoas confirmadas</div>
              <div className="mt-1 text-3xl font-semibold text-gray-900">
                {hc.titularPeople}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {hc.titularCount} titular{hc.titularCount === 1 ? "" : "es"} ·{" "}
                {hc.companions} acompanhante{hc.companions === 1 ? "" : "s"} ·{" "}
                {hc.kids} criança{hc.kids === 1 ? "" : "s"}
              </p>
            </div>
            <div className="rounded-2xl border border-rose-100 bg-white p-5">
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
              <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-rose-100 bg-white">
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
              <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-rose-100 bg-white">
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
