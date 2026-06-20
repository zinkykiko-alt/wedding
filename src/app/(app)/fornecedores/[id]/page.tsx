import Link from "next/link";
import { notFound } from "next/navigation";
import SupplierForm, { type SupplierFormInitial } from "@/components/SupplierForm";
import DeleteSupplierButton from "@/components/DeleteSupplierButton";
import { prisma } from "@/lib/db";
import { centavosToReais } from "@/lib/money";
import { toDateInputValue } from "@/lib/format";
import { updateSupplier, deleteSupplier } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditarFornecedorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: { payments: { orderBy: { dueDate: "asc" } } },
  });
  if (!supplier) notFound();

  const initial: SupplierFormInitial = {
    name: supplier.name,
    category: supplier.category,
    totalCost: supplier.totalCost ? String(centavosToReais(supplier.totalCost)) : "",
    status: supplier.status,
    notes: supplier.notes,
    payments: supplier.payments.map((p) => ({
      amount: String(centavosToReais(p.amount)),
      dueDate: toDateInputValue(p.dueDate),
      status: p.status,
      paidDate: toDateInputValue(p.paidDate),
    })),
  };

  const update = updateSupplier.bind(null, supplier.id);
  const remove = deleteSupplier.bind(null, supplier.id);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/fornecedores" className="text-sm text-gray-500 hover:text-rose-700">
          ← Voltar
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-gray-900">Editar fornecedor</h1>
      </div>

      <SupplierForm action={update} initial={initial} submitLabel="Salvar alterações" />

      <div className="border-t border-gray-200 pt-5">
        <DeleteSupplierButton action={remove} />
      </div>
    </div>
  );
}
