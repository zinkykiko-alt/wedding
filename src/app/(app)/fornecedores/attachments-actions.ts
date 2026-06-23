"use server";

import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/db";

const ALLOWED_LABELS = ["CONTRACT", "RECEIPT", "OTHER"];

// Called from the client right after a file finishes uploading to Blob, to save
// the file's metadata (the bytes already live in Vercel Blob).
export async function saveAttachment(input: {
  supplierId: string;
  label: string;
  fileName: string;
  url: string;
  pathname: string;
  contentType: string;
  size: number;
}) {
  const supplier = await prisma.supplier.findUnique({
    where: { id: input.supplierId },
    select: { id: true },
  });
  if (!supplier) return;

  await prisma.attachment.create({
    data: {
      supplierId: input.supplierId,
      label: ALLOWED_LABELS.includes(input.label) ? input.label : "OTHER",
      fileName: input.fileName.slice(0, 255),
      url: input.url,
      pathname: input.pathname,
      contentType: (input.contentType || "").slice(0, 100),
      size: Number.isFinite(input.size) ? Math.max(0, Math.floor(input.size)) : 0,
    },
  });

  revalidatePath(`/fornecedores/${input.supplierId}`);
}

export async function deleteAttachment(id: string) {
  const attachment = await prisma.attachment.findUnique({ where: { id } });
  if (!attachment) return;

  // Remove the bytes from Blob, then the database record. If the Blob delete
  // fails we still drop the record so it doesn't linger in the UI.
  try {
    await del(attachment.url);
  } catch {
    // ignore
  }
  await prisma.attachment.delete({ where: { id } });

  revalidatePath(`/fornecedores/${attachment.supplierId}`);
}
