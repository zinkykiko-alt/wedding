import { SignJWT, jwtVerify } from "jose";

/**
 * Simple shared-password login.
 *
 * When the correct password is entered, we create a signed token (a JWT) and
 * store it in an HTTP-only cookie. On every request, the proxy (see
 * src/proxy.ts) checks that cookie. The token is signed with AUTH_SECRET, so it
 * cannot be forged without knowing that secret.
 *
 * Two settings (environment variables) must be set in Vercel:
 *   - APP_PASSWORD: the password you type to open the app
 *   - AUTH_SECRET:  a long random string used to sign the session
 */

export const SESSION_COOKIE = "wp_session";

// How long a login lasts before you must sign in again.
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

/** Create a signed session token to store in the login cookie. */
export async function createSessionToken(): Promise<string> {
  return await new SignJWT({ app: "wedding" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());
}

/** Returns true only if the token is present, untampered, and unexpired. */
export async function isValidSession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    await jwtVerify(token, getSecretKey());
    return true;
  } catch {
    return false;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
};
