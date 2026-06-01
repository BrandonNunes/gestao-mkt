import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/src/lib/auth";
import * as cautelasService from "@/src/features/cautelas/services/cautelas.service";

export async function GET(request: NextRequest) {
  const user = await getTokenFromRequest(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const page = Number(searchParams.get("page")) || 1;
  const result = await cautelasService.list({ page, limit: 20, usuario_id: user.sub });
  return NextResponse.json(result);
}
