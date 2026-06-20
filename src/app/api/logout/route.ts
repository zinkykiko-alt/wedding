import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";

/** Clears the login cookie and returns to the login screen. */
export async function POST(request: NextRequest) {
  // 303 so the browser follows with a GET (this is reached from a POST form).
  const response = NextResponse.redirect(new URL("/login", request.url), 303);
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
