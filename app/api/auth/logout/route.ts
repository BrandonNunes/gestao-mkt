import { NextResponse } from "next/server";
import { clearRefreshTokenCookie } from "@/src/lib/auth";

export async function POST() {
  const response = NextResponse.json({ message: "Logout realizado" });
  response.headers.set("Set-Cookie", clearRefreshTokenCookie());
  return response;
}
