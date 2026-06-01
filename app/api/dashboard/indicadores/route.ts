import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/src/lib/auth";
import * as dashboardService from "@/src/features/dashboard/services/dashboard.service";

export async function GET(request: NextRequest) {
  const user = await getTokenFromRequest(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const indicadores = await dashboardService.getIndicadores();
  return NextResponse.json(indicadores);
}
