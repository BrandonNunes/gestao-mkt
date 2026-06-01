import { NextRequest, NextResponse } from "next/server";
import { changePasswordSchema } from "@/src/lib/validators";
import * as authService from "@/src/features/auth/services/auth.service";
import { getTokenFromRequest } from "@/src/lib/auth";

export async function POST(request: NextRequest) {
  const user = await getTokenFromRequest(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }
    await authService.changePassword(user.sub, parsed.data.senhaAtual, parsed.data.novaSenha);
    return NextResponse.json({ message: "Senha alterada com sucesso." });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erro" }, { status: 400 });
  }
}
