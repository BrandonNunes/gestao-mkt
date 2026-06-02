import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/src/lib/auth";
import { createCategoriaSchema } from "@/src/lib/validators";
import * as categoriasService from "@/src/features/equipamentos/services/categorias.service";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getTokenFromRequest(request);
  if (!user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  if (user.perfil !== "GESTOR") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const parsed = createCategoriaSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  try {
    const categoria = await categoriasService.update(id, parsed.data.nome);
    return NextResponse.json(categoria);
  } catch (err) {
    return NextResponse.json({ error: "Nome ja existe" }, { status: 409 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getTokenFromRequest(request);
  if (!user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  if (user.perfil !== "GESTOR") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const { id } = await params;
  try {
    await categoriasService.softDelete(id);
    return NextResponse.json({ message: "Categoria excluida." });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erro" }, { status: 409 });
  }
}
