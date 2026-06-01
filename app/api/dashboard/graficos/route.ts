import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/src/lib/auth";
import * as dashboardService from "@/src/features/dashboard/services/dashboard.service";

export async function GET(request: NextRequest) {
  const user = await getTokenFromRequest(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const meses = Number(request.nextUrl.searchParams.get("meses")) || 6;
  const graficos = await dashboardService.getGraficos(meses);
  return NextResponse.json(graficos);
}
