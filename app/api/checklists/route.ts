import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/src/lib/auth";
import { createChecklistSchema } from "@/src/lib/validators";
import * as checklistsService from "@/src/features/checklists/services/checklists.service";

export async function GET(request: NextRequest) {
  const user = await getTokenFromRequest(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const tipo = request.nextUrl.searchParams.get("tipo") || undefined;
  const data = await checklistsService.list(tipo);
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const user = await getTokenFromRequest(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (user.perfil !== "GESTOR") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const body = await request.json();
  const parsed = createChecklistSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const checklist = await checklistsService.create(parsed.data);
  return NextResponse.json(checklist, { status: 201 });
}
