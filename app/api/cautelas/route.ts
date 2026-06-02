import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/src/lib/auth";
import { createCautelaSchema } from "@/src/lib/validators";
import * as cautelasService from "@/src/features/cautelas/services/cautelas.service";

export async function GET(request: NextRequest) {
  const user = await getTokenFromRequest(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 20;
  const status = searchParams.get("status") || undefined;
  const usuario_id = searchParams.get("usuario_id") || undefined;
  const search = searchParams.get("search") || undefined;

  const result = await cautelasService.list({ page, limit, status, usuario_id, search });
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const user = await getTokenFromRequest(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (user.perfil !== "GESTOR") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const body = await request.json();
  const parsed = createCautelaSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  try {
    const cautela = await cautelasService.create({
      usuario_id: parsed.data.usuario_id,
      equipamento_ids: parsed.data.equipamento_ids,
      acessorio_ids: parsed.data.acessorio_ids,
      data_prevista_retorno: parsed.data.data_prevista_retorno,
    });
    return NextResponse.json(cautela, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erro" }, { status: 422 });
  }
}
