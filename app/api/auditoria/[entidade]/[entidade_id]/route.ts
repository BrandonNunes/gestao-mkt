import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/src/lib/auth";
import * as auditoriaService from "@/src/features/auditoria/services/auditoria.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entidade: string; entidade_id: string }> },
) {
  const user = await getTokenFromRequest(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { entidade, entidade_id } = await params;
  const registros = await auditoriaService.getByEntidade(entidade, entidade_id);
  return NextResponse.json({ entidade, entidade_id, registros });
}
