import Link from "next/link";
import GuestForm from "@/components/GuestForm";
import { createGuest } from "../actions";

export default function NovoConvidadoPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/convidados" className="text-sm text-gray-500 hover:text-brand-700">
          ← Voltar
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-gray-900">Novo convidado</h1>
      </div>
      <GuestForm action={createGuest} submitLabel="Cadastrar convidado" />
    </div>
  );
}
