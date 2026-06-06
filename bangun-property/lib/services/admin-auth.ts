import { NextRequest } from "next/server";

// ─── Simple admin token auth (PRD §4 role separation) ────────────────────────
//
// Set ADMIN_TOKEN in .env.local. Admin API routes require a matching token via
// either the `Authorization: Bearer <token>` header or an `admin_token` cookie.
// This is intentionally lightweight (single-tenant internal tool). For multi-user
// auth, replace with a proper provider (NextAuth, Clerk, etc).

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";

export function isAdminConfigured(): boolean {
  return ADMIN_TOKEN.length > 0;
}

/** Constant-time-ish string compare to avoid trivial timing leaks. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

export function extractToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7).trim();
  const cookie = req.cookies.get("admin_token")?.value;
  if (cookie) return cookie;
  const header = req.headers.get("x-admin-token");
  if (header) return header;
  return null;
}

export interface AuthResult {
  ok: boolean;
  reason?: string;
}

/**
 * Returns { ok: true } when the request is authorised.
 * In production we fail closed when ADMIN_TOKEN is missing — never silently allow.
 * In dev we allow with a warning so engineers don't get locked out.
 */
export function checkAdminAuth(req: NextRequest): AuthResult {
  if (!isAdminConfigured()) {
    if (process.env.NODE_ENV === "production") {
      console.error("[admin-auth] ADMIN_TOKEN is not configured — refusing access in production");
      return { ok: false, reason: "Admin not configured" };
    }
    console.warn("[admin-auth] ADMIN_TOKEN missing — admin API is unprotected (dev only)");
    return { ok: true, reason: "ADMIN_TOKEN not configured (dev mode)" };
  }
  const token = extractToken(req);
  if (!token) return { ok: false, reason: "Missing admin token" };
  if (!safeEqual(token, ADMIN_TOKEN)) return { ok: false, reason: "Invalid admin token" };
  return { ok: true };
}

/** Verify a raw token (used by the login endpoint). */
export function verifyToken(token: string): boolean {
  if (!isAdminConfigured()) return true;
  return safeEqual(token, ADMIN_TOKEN);
}
