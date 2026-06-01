import { NextResponse } from "next/server";
import * as cautelasService from "@/src/features/cautelas/services/cautelas.service";

export async function GET() {
  try {
    const result = await cautelasService.verificarAtrasos();
    return NextResponse.json({ message: "Verificação concluída", atualizadas: result.count });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erro" }, { status: 500 });
  }
}
