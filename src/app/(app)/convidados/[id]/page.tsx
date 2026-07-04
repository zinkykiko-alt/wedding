import Link from "next/link";
import { notFound } from "next/navigation";
import GuestForm, { type GuestInitial } from "@/components/GuestForm";
import DeleteGuestButton from "@/components/DeleteGuestButton";
import { prisma } from "@/lib/db";
import { updateGuest, deleteGuest } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditarConvidadoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const guest = await prisma.guest.findUnique({ where: { id } });
  if (!guest) notFound();

  const initial: GuestInitial = {
    name: guest.name,
    companions: guest.companions,
    kids: guest.kids,
    status: guest.status,
  };
  const update = updateGuest.bind(null, guest.id);
  const remove = deleteGuest.bind(null, guest.id);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/convidados" className="text-sm text-gray-500 hover:text-rose-700">
          ← Voltar
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-gray-900">Editar convidado</h1>
      </div>

      <GuestForm action={update} initial={initial} submitLabel="Salvar alterações" />

      <div className="border-t border-gray-200 pt-5">
        <DeleteGuestButton action={remove} />
      </div>
    </div>
  );
}
