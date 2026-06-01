import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/src/lib/auth";
import { devolverCautelaSchema } from "@/src/lib/validators";
import * as cautelasService from "@/src/features/cautelas/services/cautelas.service";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getTokenFromRequest(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (user.perfil !== "GESTOR") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const parsed = devolverCautelaSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  try {
    const cautela = await cautelasService.devolver(
      id,
      parsed.data.checklist_id,
      parsed.data.respostas,
      parsed.data.tem_avarias,
      parsed.data.avarias_descricao,
      parsed.data.observacoes,
    );
    return NextResponse.json(cautela);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erro" }, { status: 422 });
  }
}
