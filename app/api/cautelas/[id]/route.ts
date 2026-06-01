import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/src/lib/auth";
import * as cautelasService from "@/src/features/cautelas/services/cautelas.service";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getTokenFromRequest(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const cautela = await cautelasService.getById(id);
  if (!cautela) return NextResponse.json({ error: "Cautela não encontrada" }, { status: 404 });
  return NextResponse.json(cautela);
}
