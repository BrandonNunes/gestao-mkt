"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/card";

export default function RelatoriosPage() {
  const [tipo, setTipo] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRelatorio = async (t: string) => {
    setTipo(t);
    setLoading(true);
    setError("");
    setData(null);

    const token = localStorage.getItem("accessToken");
    const res = await fetch(`/api/relatorios/${t}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      setError("Erro ao carregar relatorio.");
      setLoading(false);
      return;
    }

    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-foreground">Relatorios</h2>
      <p className="text-muted-foreground mb-4">Selecione o tipo de relatorio desejado.</p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Button
          variant="outline"
          className="p-6 h-auto text-center text-foreground"
          onClick={() => fetchRelatorio("equipamentos")}
        >
          Equipamentos
        </Button>
        <Button
          variant="outline"
          className="p-6 h-auto text-center text-foreground"
          onClick={() => fetchRelatorio("cautelas")}
        >
          Cautelas
        </Button>
        <Button
          variant="outline"
          className="p-6 h-auto text-center text-foreground"
          onClick={() => fetchRelatorio("utilizacao")}
        >
          Utilização
        </Button>
      </div>

      {loading && <p className="text-muted-foreground">Carregando...</p>}

      {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">{error}</div>}

      {data && tipo === "equipamentos" && (
        <Card>
          <CardHeader>
            <CardTitle>Relatorio de Equipamentos</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3">Patrimonio</th>
                  <th className="text-left p-3">Nome</th>
                  <th className="text-left p-3">Categoria</th>
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((e: any) => (
                  <tr key={e.id} className="border-t border-border">
                    <td className="p-3">{e.codigo_patrimonial}</td>
                    <td className="p-3">{e.nome}</td>
                    <td className="p-3">{e.categoria?.nome || "-"}</td>
                    <td className="p-3">{e.status}</td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-muted-foreground/60">
                      Nenhum equipamento.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {data && tipo === "cautelas" && (
        <Card>
          <CardHeader>
            <CardTitle>Relatorio de Cautelas</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3">Nº</th>
                  <th className="text-left p-3">Responsavel</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Emissao</th>
                  <th className="text-left p-3">Prev. Retorno</th>
                  <th className="text-left p-3">Equip.</th>
                </tr>
              </thead>
              <tbody>
                {data.map((c: any) => (
                  <tr key={c.id} className="border-t border-border">
                    <td className="p-3 font-mono">{c.numero}</td>
                    <td className="p-3">{c.usuario?.nome}</td>
                    <td className="p-3">{c.status}</td>
                    <td className="p-3">
                      {c.data_emissao ? new Date(c.data_emissao).toLocaleDateString("pt-BR") : "-"}
                    </td>
                    <td className="p-3">
                      {c.data_prevista_retorno
                        ? new Date(c.data_prevista_retorno).toLocaleDateString("pt-BR")
                        : "-"}
                    </td>
                    <td className="p-3">{c._count?.equipamentos ?? 0}</td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-muted-foreground/60">
                      Nenhuma cautela.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {data && tipo === "utilizacao" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Utilização no Periodo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{data.total_cautelas_periodo}</p>
              <p className="text-sm text-muted-foreground">total de cautelas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Equipamentos Mais Utilizados</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3">Equipamento ID</th>
                    <th className="text-left p-3">Vezes Utilizado</th>
                  </tr>
                </thead>
                <tbody>
                  {data.equipamentos_mais_utilizados?.map((e: any) => (
                    <tr key={e.equipamento_id} className="border-t border-border">
                      <td className="p-3 font-mono text-xs">{e.equipamento_id}</td>
                      <td className="p-3">{e._count.equipamento_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
