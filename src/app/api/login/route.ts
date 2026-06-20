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
  // 303 ("See Other") makes the browser follow the redirect with a GET request
  // (the form submission is a POST; without 303 the browser would re-POST to
  // the target page and get a 405 Method Not Allowed).
  if (!expected || !process.env.AUTH_SECRET) {
    return NextResponse.redirect(new URL("/login?error=config", request.url), 303);
  }

  if (password !== expected) {
    return NextResponse.redirect(new URL("/login?error=1", request.url), 303);
  }

  const token = await createSessionToken();
  const response = NextResponse.redirect(new URL("/", request.url), 303);
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return response;
}
