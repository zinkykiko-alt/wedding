"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { reaisToCentavos } from "@/lib/money";

// Shape of each payment row sent from the form (as a JSON string field).
type PaymentInput = {
  amount?: number | string;
  dueDate?: string;
  status?: string;
  paidDate?: string;
};

type SupplierData = {
  name: string;
  category: string;
  totalCost: number;
  status: string;
  notes: string;
  payments: {
    amount: number;
    dueDate: Date;
    status: string;
    paidDate: Date | null;
  }[];
};

// Read and normalize all supplier fields (including payments) from the form.
function parseSupplierForm(formData: FormData): SupplierData {
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "OTHER");
  const status = String(formData.get("status") ?? "NEGOTIATING");
  const notes = String(formData.get("notes") ?? "").trim();
  const totalCost = reaisToCentavos(Number(formData.get("totalCost") ?? 0));

  let rows: PaymentInput[] = [];
  try {
    const raw = String(formData.get("payments") ?? "[]");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) rows = parsed;
  } catch {
    rows = [];
  }

  const payments = rows
    .filter((r) => r && r.dueDate) // a payment needs at least a due date
    .map((r) => {
      const isPaid = r.status === "PAID";
      return {
        amount: reaisToCentavos(Number(r.amount) || 0),
        dueDate: new Date(String(r.dueDate)),
        status: isPaid ? "PAID" : "PENDING",
        paidDate: isPaid && r.paidDate ? new Date(String(r.paidDate)) : null,
      };
    });

  return { name, category, totalCost, status, notes, payments };
}

export async function createSupplier(formData: FormData) {
  const data = parseSupplierForm(formData);
  if (!data.name) return; // name is required (also enforced in the form)

  await prisma.supplier.create({
    data: {
      name: data.name,
      category: data.category,
      totalCost: data.totalCost,
      status: data.status,
      notes: data.notes,
      payments: { create: data.payments },
    },
  });

  revalidatePath("/fornecedores");
  redirect("/fornecedores");
}

export async function updateSupplier(id: string, formData: FormData) {
  const data = parseSupplierForm(formData);
  if (!data.name) return;

  // Replace the payment schedule wholesale: delete the old rows, create the new.
  await prisma.$transaction([
    prisma.payment.deleteMany({ where: { supplierId: id } }),
    prisma.supplier.update({
      where: { id },
      data: {
        name: data.name,
        category: data.category,
        totalCost: data.totalCost,
        status: data.status,
        notes: data.notes,
        payments: { create: data.payments },
      },
    }),
  ]);

  revalidatePath("/fornecedores");
  redirect("/fornecedores");
}

export async function deleteSupplier(id: string) {
  await prisma.supplier.delete({ where: { id } });
  revalidatePath("/fornecedores");
  redirect("/fornecedores");
}
