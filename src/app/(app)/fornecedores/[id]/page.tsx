import Link from "next/link";
import { notFound } from "next/navigation";
import SupplierForm, { type SupplierFormInitial } from "@/components/SupplierForm";
import DeleteSupplierButton from "@/components/DeleteSupplierButton";
import AttachmentUploader from "@/components/AttachmentUploader";
import DeleteAttachmentButton from "@/components/DeleteAttachmentButton";
import { prisma } from "@/lib/db";
import { centavosToReais } from "@/lib/money";
import { toDateInputValue, formatFileSize } from "@/lib/format";
import { ATTACHMENT_LABELS, getLabel } from "@/lib/constants";
import { updateSupplier, deleteSupplier } from "../actions";
import { deleteAttachment } from "../attachments-actions";

export const dynamic = "force-dynamic";

export default async function EditarFornecedorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: {
      payments: { orderBy: { dueDate: "asc" } },
      attachments: { orderBy: { createdAt: "desc" } },
    },
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

      <section className="rounded-2xl border border-rose-100 bg-white p-5">
        <h2 className="font-semibold text-gray-900">
          Anexos (contratos e comprovantes)
        </h2>
        <p className="mt-1 mb-3 text-sm text-gray-500">
          Os arquivos ficam privados — só você, logado, consegue abri-los.
        </p>

        <AttachmentUploader supplierId={supplier.id} />

        {supplier.attachments.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">Nenhum arquivo enviado ainda.</p>
        ) : (
          <ul className="mt-3 divide-y divide-gray-100">
            {supplier.attachments.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-3 py-2"
              >
                <a
                  href={`/api/attachments/${a.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-0 flex-1 truncate text-sm font-medium text-rose-700 hover:underline"
                >
                  {a.fileName}
                  <span className="ml-2 font-normal text-gray-400">
                    {getLabel(ATTACHMENT_LABELS, a.label)} · {formatFileSize(a.size)}
                  </span>
                </a>
                <DeleteAttachmentButton action={deleteAttachment.bind(null, a.id)} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="border-t border-gray-200 pt-5">
        <DeleteSupplierButton action={remove} />
      </div>
    </div>
  );
}
