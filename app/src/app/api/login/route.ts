import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, expectedAuthToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { password } = (await req.json().catch(() => ({}))) as { password?: string };
  const configured = process.env.APP_PASSWORD;
  if (!configured) {
    return NextResponse.json({ error: "APP_PASSWORD not configured" }, { status: 500 });
  }
  if (password !== configured) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }
  const token = await expectedAuthToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, token!, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}
