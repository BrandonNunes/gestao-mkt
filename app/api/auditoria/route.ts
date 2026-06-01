import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/src/lib/auth";
import * as auditoriaService from "@/src/features/auditoria/services/auditoria.service";

export async function GET(request: NextRequest) {
  const user = await getTokenFromRequest(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (user.perfil !== "GESTOR") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const { searchParams } = request.nextUrl;
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 50;
  const entidade = searchParams.get("entidade") || undefined;
  const acao = searchParams.get("acao") || undefined;
  const usuario_id = searchParams.get("usuario_id") || undefined;
  const data_inicio = searchParams.get("data_inicio") || undefined;
  const data_fim = searchParams.get("data_fim") || undefined;

  const result = await auditoriaService.list({ page, limit, entidade, acao, usuario_id, data_inicio, data_fim });
  return NextResponse.json(result);
}
