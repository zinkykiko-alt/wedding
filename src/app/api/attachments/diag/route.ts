import { put, del } from "@vercel/blob";
import { NextResponse } from "next/server";

// TEMPORARY diagnostic. Open /api/attachments/diag while logged in to see
// whether Blob storage is connected and whether private uploads work.
// It is behind the proxy, so only the logged-in user can reach it.
export async function GET() {
  const hasBlobToken = !!process.env.BLOB_READ_WRITE_TOKEN;

  async function tryPut(access: "public" | "private"): Promise<string> {
    try {
      const blob = await put(`diag/test-${Date.now()}.txt`, "hello", {
        access,
        addRandomSuffix: true,
      });
      try {
        await del(blob.url);
      } catch {
        // ignore cleanup failure
      }
      return "OK";
    } catch (e) {
      return `FAILED: ${(e as Error).message}`;
    }
  }

  return NextResponse.json({
    hasBlobToken,
    privateUpload: await tryPut("private"),
    publicUpload: await tryPut("public"),
  });
}
