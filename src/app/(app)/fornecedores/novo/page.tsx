import Link from "next/link";
import SupplierForm from "@/components/SupplierForm";
import { createSupplier } from "../actions";

export default function NovoFornecedorPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/fornecedores" className="text-sm text-gray-500 hover:text-brand-700">
          ← Voltar
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-gray-900">Novo fornecedor</h1>
      </div>
      <SupplierForm action={createSupplier} submitLabel="Cadastrar fornecedor" />
    </div>
  );
}
