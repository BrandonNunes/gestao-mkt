import { NextRequest, NextResponse } from "next/server";
import { resetPasswordSchema } from "@/src/lib/validators";
import * as authService from "@/src/features/auth/services/auth.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }
    await authService.resetPassword(parsed.data.token, parsed.data.novaSenha);
    return NextResponse.json({ message: "Senha redefinida com sucesso." });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erro" }, { status: 400 });
  }
}
