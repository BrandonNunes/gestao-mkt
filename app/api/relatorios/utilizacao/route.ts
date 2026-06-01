import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/src/lib/auth";
import * as relatoriosService from "@/src/features/relatorios/services/relatorios.service";

export async function GET(request: NextRequest) {
  const user = await getTokenFromRequest(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (user.perfil !== "GESTOR") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const data_inicio = request.nextUrl.searchParams.get("data_inicio") || new Date(Date.now() - 30 * 86400000).toISOString();
  const data_fim = request.nextUrl.searchParams.get("data_fim") || new Date().toISOString();

  const data = await relatoriosService.relatorioUtilizacao(data_inicio, data_fim);
  return NextResponse.json(data);
}
