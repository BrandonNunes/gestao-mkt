import { NextRequest, NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/src/lib/validators";
import * as authService from "@/src/features/auth/services/auth.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }
    await authService.forgotPassword(parsed.data.email);
    return NextResponse.json({ message: "Se o e-mail existir, um link de recuperação será enviado." });
  } catch {
    return NextResponse.json({ error: "Erro ao processar solicitação" }, { status: 500 });
  }
}
