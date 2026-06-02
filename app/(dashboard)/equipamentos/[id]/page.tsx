"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/card";
import { STATUS_EQUIPAMENTO_LABELS, STATUS_EQUIPAMENTO_COLORS } from "@/src/lib/constants";

interface Acessorio {
  id: string;
  nome: string;
  codigo_interno?: string;
  descricao?: string;
  status: string;
}

interface EquipamentoDetail {
  id: string;
  codigo_patrimonial: string;
  nome: string;
  categoria?: { nome: string };
  marca?: string;
  modelo?: string;
  numero_serie?: string;
  descricao?: string;
  data_aquisicao?: string;
  valor_aquisicao?: number;
  localizacao?: string;
  observacoes?: string;
  status: string;
  acessorios: Acessorio[];
}

function fmtDate(iso?: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

function fmtCurrency(val?: number) {
  if (val == null) return "-";
  return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function EquipamentoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [equip, setEquip] = useState<EquipamentoDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    fetch(`/api/equipamentos/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setEquip(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="p-4 text-muted-foreground">Carregando...</div>;
  }

  if (!equip) {
    return <div className="p-4 text-muted-foreground">Equipamento nao encontrado.</div>;
  }

  const infoRows = [
    { label: "Codigo Patrimonial", value: equip.codigo_patrimonial },
    { label: "Categoria", value: equip.categoria?.nome || "-" },
    { label: "Marca", value: equip.marca || "-" },
    { label: "Modelo", value: equip.modelo || "-" },
    { label: "Numero de Serie", value: equip.numero_serie || "-" },
    { label: "Localizacao", value: equip.localizacao || "-" },
    { label: "Data de Aquisicao", value: fmtDate(equip.data_aquisicao) },
    { label: "Valor de Aquisicao", value: fmtCurrency(equip.valor_aquisicao) },
  ];

  return (
    <div>
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
        &larr; Voltar
      </Button>

      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold">{equip.nome}</h2>
        <Badge className={STATUS_EQUIPAMENTO_COLORS[equip.status as keyof typeof STATUS_EQUIPAMENTO_COLORS] || ""}>
          {STATUS_EQUIPAMENTO_LABELS[equip.status as keyof typeof STATUS_EQUIPAMENTO_LABELS]}
        </Badge>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Detalhes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {infoRows.map((row) => (
              <div key={row.label}>
                <p className="text-xs text-muted-foreground">{row.label}</p>
                <p className="text-sm">{row.value}</p>
              </div>
            ))}
          </div>
          {(equip.descricao || equip.observacoes) && (
            <div className="mt-4 space-y-2">
              {equip.descricao && (
                <div>
                  <p className="text-xs text-muted-foreground">Descricao</p>
                  <p className="text-sm">{equip.descricao}</p>
                </div>
              )}
              {equip.observacoes && (
                <div>
                  <p className="text-xs text-muted-foreground">Observacoes</p>
                  <p className="text-sm">{equip.observacoes}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Acessorios ({equip.acessorios?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {equip.acessorios?.length > 0 ? (
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3">Nome</th>
                  <th className="text-left p-3">Codigo Interno</th>
                  <th className="text-left p-3">Descricao</th>
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {equip.acessorios.map((a) => (
                  <tr key={a.id} className="border-t border-border">
                    <td className="p-3">{a.nome}</td>
                    <td className="p-3">{a.codigo_interno || "-"}</td>
                    <td className="p-3">{a.descricao || "-"}</td>
                    <td className="p-3">
                      <Badge className={a.status === "ATIVO" ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300" : "bg-muted text-foreground/80"}>
                        {a.status === "ATIVO" ? "Ativo" : "Inativo"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="p-4 text-muted-foreground">Nenhum acessorio vinculado.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
