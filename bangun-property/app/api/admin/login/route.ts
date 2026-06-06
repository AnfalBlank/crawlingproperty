import { NextRequest, NextResponse } from "next/server";
import { verifyToken, isAdminConfigured } from "@/lib/services/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/admin/login  { token }  → sets httpOnly cookie if valid
export async function POST(request: NextRequest) {
  let body: { token?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const token = (body.token || "").trim();

  if (!verifyToken(token)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const res = NextResponse.json({ success: true, configured: isAdminConfigured() });
  // httpOnly cookie — not readable by JS, sent automatically on admin requests
  res.cookies.set("admin_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });
  return res;
}

// GET /api/admin/login  → check whether already authed / whether auth is required
export async function GET(request: NextRequest) {
  const configured = isAdminConfigured();
  // In production, if no admin token is configured, never report authed=true
  if (!configured && process.env.NODE_ENV === "production") {
    return NextResponse.json({ configured: false, authed: false });
  }
  const token = request.cookies.get("admin_token")?.value ?? "";
  const authed = !configured || verifyToken(token);
  return NextResponse.json({ configured, authed });
}

// DELETE /api/admin/login  → logout
export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete("admin_token");
  return res;
}
