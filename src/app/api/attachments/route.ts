import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const ALLOWED_LABELS = ["CONTRACT", "RECEIPT", "OTHER"];

// Server-side upload. This route sits behind the proxy, so only the logged-in
// user reaches it. The file is sent here, stored privately in Vercel Blob (the
// server SDK authenticates automatically), and its metadata is saved.
export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  const supplierId = String(form.get("supplierId") ?? "");
  const label = String(form.get("label") ?? "OTHER");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Nenhum arquivo recebido." }, { status: 400 });
  }

  const supplier = await prisma.supplier.findUnique({
    where: { id: supplierId },
    select: { id: true },
  });
  if (!supplier) {
    return NextResponse.json({ error: "Fornecedor não encontrado." }, { status: 404 });
  }

  try {
    const blob = await put(file.name, file, {
      access: "private",
      addRandomSuffix: true,
    });

    await prisma.attachment.create({
      data: {
        supplierId,
        label: ALLOWED_LABELS.includes(label) ? label : "OTHER",
        fileName: file.name.slice(0, 255),
        url: blob.url,
        pathname: blob.pathname,
        contentType: file.type || "",
        size: file.size,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[attachments POST] failed:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
