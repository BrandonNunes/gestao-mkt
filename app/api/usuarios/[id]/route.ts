import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/src/lib/auth";
import * as usuariosService from "@/src/features/usuarios/services/usuarios.service";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getTokenFromRequest(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const usuario = await usuariosService.getById(id);
  if (!usuario) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  return NextResponse.json(usuario);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getTokenFromRequest(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (user.perfil !== "GESTOR") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const usuario = await usuariosService.update(id, body);
  return NextResponse.json(usuario);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getTokenFromRequest(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (user.perfil !== "GESTOR") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const { id } = await params;
  await usuariosService.softDelete(id);
  return NextResponse.json({ message: "Usuário desativado." });
}
