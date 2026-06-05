import { cookies } from "next/headers";
import crypto from "crypto";

/**
 * Minimal single-admin auth: a password in env + a signed httpOnly cookie.
 * No external auth provider — keeps the app free and simple.
 */

const COOKIE_NAME = "tradicionale_admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "tradicionale2024";
const SECRET = process.env.AUTH_SECRET || "change-me-in-production-please";

function makeToken(): string {
  return crypto
    .createHmac("sha256", SECRET)
    .update(ADMIN_PASSWORD)
    .digest("hex");
}

export function verifyPassword(password: string): boolean {
  const a = Buffer.from(password);
  const b = Buffer.from(ADMIN_PASSWORD);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function createSession() {
  cookies().set(COOKIE_NAME, makeToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export function destroySession() {
  cookies().delete(COOKIE_NAME);
}

export function isAuthenticated(): boolean {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return false;
  const expected = makeToken();
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
