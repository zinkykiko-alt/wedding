"use server";

import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/db";

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
