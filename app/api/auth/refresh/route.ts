import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as authService from "@/src/features/auth/services/auth.service";
import { setRefreshTokenCookie } from "@/src/lib/auth";

export async function POST(_request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;
    if (!refreshToken) {
      return NextResponse.json({ error: "Token não encontrado" }, { status: 401 });
    }

    const result = await authService.refreshSession(refreshToken);
    const response = NextResponse.json({ accessToken: result.accessToken, usuario: result.usuario });
    response.headers.set("Set-Cookie", setRefreshTokenCookie(result.refreshToken));
    return response;
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erro" }, { status: 401 });
  }
}
