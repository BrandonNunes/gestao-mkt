import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/src/lib/validators";
import * as authService from "@/src/features/auth/services/auth.service";
import { setRefreshTokenCookie } from "@/src/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const result = await authService.login(parsed.data.email, parsed.data.senha);
    const response = NextResponse.json(result);
    response.headers.set("Set-Cookie", setRefreshTokenCookie(result.refreshToken));
    return response;
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erro interno" }, { status: 401 });
  }
}
