import { NextRequest, NextResponse } from "next/server";
import { isValidSession, SESSION_COOKIE } from "@/lib/auth";

/**
 * In Next.js 16 this file is called "proxy" (it used to be called
 * "middleware"). It runs before every matching request.
 *
 * Job: if the visitor does not have a valid login cookie, send them to the
 * /login page. This keeps the whole app private.
 */
export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (await isValidSession(token)) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  /**
   * Run on every path EXCEPT:
   *  - /login and /api/login (needed to actually log in)
   *  - /api/attachments/upload (Vercel calls it back server-to-server after an
   *    upload; it does its own login check inside)
   *  - Next.js internals (_next/static, _next/image)
   *  - any file with an extension (favicon.ico, images, etc.)
   */
  matcher: [
    "/((?!login|api/login|api/attachments/upload|_next/static|_next/image|.*\\..*).*)",
  ],
};
