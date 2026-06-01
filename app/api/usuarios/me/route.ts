import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/src/lib/auth";
import * as usuariosService from "@/src/features/usuarios/services/usuarios.service";

export async function GET(request: NextRequest) {
  const user = await getTokenFromRequest(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const me = await usuariosService.getMe(user.sub);
  return NextResponse.json(me);
}
