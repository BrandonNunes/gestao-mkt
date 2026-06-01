import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/src/lib/auth";
import { emitirCautelaSchema } from "@/src/lib/validators";
import * as cautelasService from "@/src/features/cautelas/services/cautelas.service";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getTokenFromRequest(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (user.perfil !== "GESTOR") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();

  try {
    const cautela = await cautelasService.emitir(
      id,
      body.checklist_id,
      body.respostas,
      user.sub,
      body.observacoes,
    );
    return NextResponse.json(cautela);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erro" }, { status: 422 });
  }
}
