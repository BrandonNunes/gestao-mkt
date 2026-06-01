import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/src/lib/auth";
import { createCategoriaSchema } from "@/src/lib/validators";
import * as categoriasService from "@/src/features/equipamentos/services/categorias.service";

export async function GET(request: NextRequest) {
  const user = await getTokenFromRequest(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const page = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || undefined;
  const result = await categoriasService.list(page, 50, search);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const user = await getTokenFromRequest(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (user.perfil !== "GESTOR") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const body = await request.json();
  const parsed = createCategoriaSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  try {
    const cat = await categoriasService.create(parsed.data.nome);
    return NextResponse.json(cat, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Nome já existe" }, { status: 409 });
  }
}
