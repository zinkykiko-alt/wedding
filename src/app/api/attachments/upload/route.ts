import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isValidSession, SESSION_COOKIE } from "@/lib/auth";

// Issues short-lived tokens so the browser can upload a file straight to Vercel
// Blob (bypassing the serverless body-size limit, so large photos work too).
//
// This route is excluded from the proxy (see src/proxy.ts) because Vercel calls
// it back server-to-server after an upload finishes. We instead check the login
// session inside onBeforeGenerateToken, so only the logged-in user can upload.
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const store = await cookies();
        const ok = await isValidSession(store.get(SESSION_COOKIE)?.value);
        if (!ok) throw new Error("Não autorizado");

        return {
          access: "private",
          addRandomSuffix: true,
          allowedContentTypes: [
            "application/pdf",
            "image/png",
            "image/jpeg",
            "image/webp",
            "image/heic",
            "image/heif",
          ],
          maximumSizeInBytes: 25 * 1024 * 1024, // 25 MB
        };
      },
      onUploadCompleted: async () => {
        // The browser saves the file's metadata via the saveAttachment action,
        // so there's nothing to do here.
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    // Surface the real cause in the Vercel function logs.
    console.error("[attachments/upload] failed:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}
