import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/src/lib/auth";
import * as relatoriosService from "@/src/features/relatorios/services/relatorios.service";

export async function GET(request: NextRequest) {
  const user = await getTokenFromRequest(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (user.perfil !== "GESTOR") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const status = request.nextUrl.searchParams.get("status") || undefined;
  const data = await relatoriosService.relatorioCautelas(status);
  return NextResponse.json(data);
}
