import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/src/lib/auth";
import * as equipamentosService from "@/src/features/equipamentos/services/equipamentos.service";

export async function GET(request: NextRequest) {
  const user = await getTokenFromRequest(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const data = await equipamentosService.getDisponiveis();
  return NextResponse.json(data);
}
