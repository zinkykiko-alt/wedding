import { prisma } from "@/lib/db";
import { computeHeadcount, type GuestFull } from "@/lib/guests";
import QuickAddGuest from "@/components/QuickAddGuest";
import GuestBrowser from "@/components/GuestBrowser";
import ConfirmedHeadcount from "@/components/ConfirmedHeadcount";

export const dynamic = "force-dynamic";

export default async function ConvidadosPage() {
  const rows = await prisma.guest.findMany({ orderBy: { name: "asc" } });
  const guests: GuestFull[] = rows.map((g) => ({
    id: g.id,
    name: g.name,
    phone: g.phone,
    companions: g.companions,
    kids: g.kids,
    status: g.status,
    side: g.side,
    godparent: g.godparent,
    parent: g.parent,
  }));

  const hc = computeHeadcount(guests);

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
            <ConfirmedHeadcount
              titularPeople={hc.titularPeople}
              titularCount={hc.titularCount}
              companions={hc.companions}
              kids={hc.kids}
              bySide={hc.bySide}
              bySideKids={hc.bySideKids}
            />
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

          <GuestBrowser guests={guests} />
        </>
      )}
    </div>
  );
}
