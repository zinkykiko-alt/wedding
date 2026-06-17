import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";

/**
 * Handles the login form. Compares the typed password against APP_PASSWORD.
 * On success, sets the signed session cookie and sends you to the home page.
 * On failure, sends you back to /login with an error flag.
 */
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");

  const expected = process.env.APP_PASSWORD;

  // If the app isn't configured yet, fail clearly instead of letting anyone in.
  if (!expected || !process.env.AUTH_SECRET) {
    return NextResponse.redirect(new URL("/login?error=config", request.url));
  }

  if (password !== expected) {
    return NextResponse.redirect(new URL("/login?error=1", request.url));
  }

  const token = await createSessionToken();
  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return response;
}
