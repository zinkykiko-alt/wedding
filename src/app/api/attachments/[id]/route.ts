import { get } from "@vercel/blob";
import { prisma } from "@/lib/db";

// Streams a private attachment back to the browser. This route sits behind the
// proxy, so only the logged-in user can reach it; the underlying Blob is private
// and never exposed directly.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const attachment = await prisma.attachment.findUnique({ where: { id } });
  if (!attachment) {
    return new Response("Arquivo não encontrado", { status: 404 });
  }

  const result = await get(attachment.pathname, { access: "private" });
  if (!result || !result.stream) {
    return new Response("Arquivo indisponível", { status: 404 });
  }

  return new Response(result.stream, {
    headers: {
      "Content-Type": attachment.contentType || "application/octet-stream",
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(
        attachment.fileName,
      )}`,
      "Cache-Control": "private, no-store",
    },
  });
}
