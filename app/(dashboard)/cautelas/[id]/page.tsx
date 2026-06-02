"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePermission } from "@/src/hooks/use-permission";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/card";
import { STATUS_CAUTELA_LABELS, STATUS_CAUTELA_COLORS } from "@/src/lib/constants";
import CautelaEmitirDialog from "@/src/features/cautelas/views/cautela-emitir-dialog";
import CautelaDevolverDialog from "@/src/features/cautelas/views/cautela-devolver-dialog";

interface CautelaDetail {
  id: string;
  numero: number;
  status: string;
  data_emissao: string;
  data_prevista_retorno: string;
  data_retirada?: string;
  data_retorno?: string;
  observacoes?: string;
  usuario: { nome: string; matricula: string };
  createdBy: { nome: string };
  equipamentos: {
    equipamento: {
      id: string;
      nome: string;
      codigo_patrimonial: string;
    };
  }[];
  acessorios?: {
    acessorio: {
      id: string;
      nome: string;
    };
  }[];
  respostas?: {
    resposta: boolean;
    pergunta: { pergunta: string };
  }[];
}

function fmtDate(iso?: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

function getEffectiveStatus(c: { status: string; data_prevista_retorno: string; data_retorno?: string | null }) {
  if (c.status === "EM_USO" && !c.data_retorno && new Date(c.data_prevista_retorno) < new Date()) {
    return "ATRASADA";
  }
  return c.status;
}

export default function CautelaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isGestor } = usePermission();
  const id = params.id as string;
  const [cautela, setCautela] = useState<CautelaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [emitirOpen, setEmitirOpen] = useState(false);
  const [devolverOpen, setDevolverOpen] = useState(false);

  const fetchCautela = () => {
    const token = localStorage.getItem("accessToken");
    fetch(`/api/cautelas/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setCautela(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchCautela(); }, [id]);

  if (loading) return <div className="p-4 text-gray-500">Carregando...</div>;
  if (!cautela) return <div className="p-4 text-gray-500">Cautela nao encontrada.</div>;

  const effectiveStatus = getEffectiveStatus(cautela);
  const showEmitir = isGestor && effectiveStatus === "ABERTA";
  const showDevolver = isGestor && (effectiveStatus === "EM_USO" || effectiveStatus === "ATRASADA");

  return (
    <div>
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
        &larr; Voltar
      </Button>

      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold">Cautela #{cautela.numero || "-"}</h2>
        <Badge className={STATUS_CAUTELA_COLORS[effectiveStatus as keyof typeof STATUS_CAUTELA_COLORS] || ""}>
          {STATUS_CAUTELA_LABELS[effectiveStatus as keyof typeof STATUS_CAUTELA_LABELS]}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informacoes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="text-gray-500">Responsavel: </span>
              {cautela.usuario?.nome} ({cautela.usuario?.matricula})
            </div>
            <div>
              <span className="text-gray-500">Emitida por: </span>
              {cautela.createdBy?.nome || "-"}
            </div>
            <div>
              <span className="text-gray-500">Emissao: </span>
              {fmtDate(cautela.data_emissao)}
            </div>
            <div>
              <span className="text-gray-500">Prev. Retorno: </span>
              {fmtDate(cautela.data_prevista_retorno)}
            </div>
            <div>
              <span className="text-gray-500">Retirada: </span>
              {fmtDate(cautela.data_retirada)}
            </div>
            <div>
              <span className="text-gray-500">Devolucao: </span>
              {fmtDate(cautela.data_retorno)}
            </div>
            {cautela.observacoes && (
              <div>
                <span className="text-gray-500">Observacoes: </span>
                {cautela.observacoes}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Equipamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cautela.equipamentos?.map((ce) => (
                <div key={ce.equipamento.id} className="border rounded-md p-3">
                  <p className="font-medium text-sm">
                    {ce.equipamento.nome} ({ce.equipamento.codigo_patrimonial})
                  </p>
                  {cautela.acessorios && cautela.acessorios.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Acessorios:{" "}
                      {cautela.acessorios
                        .map((ca) => ca.acessorio.nome)
                        .join(", ")}
                    </p>
                  )}
                </div>
              ))}
              {(!cautela.equipamentos || cautela.equipamentos.length === 0) && (
                <p className="text-sm text-gray-400">Nenhum equipamento.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Checklist</CardTitle>
            {showEmitir && (
              <Button size="sm" onClick={() => setEmitirOpen(true)}>
                Emitir Cautela
              </Button>
            )}
            {showDevolver && (
              <Button size="sm" onClick={() => setDevolverOpen(true)}>
                Devolver Cautela
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {cautela.respostas && cautela.respostas.length > 0 ? (
              <div className="space-y-2">
                {cautela.respostas.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Badge className={r.resposta ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {r.resposta ? "Sim" : "Nao"}
                    </Badge>
                    <span>{r.pergunta?.pergunta}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Nenhum checklist vinculado.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {showEmitir && (
        <CautelaEmitirDialog
          open={emitirOpen}
          onOpenChange={setEmitirOpen}
          cautelaId={cautela.id}
          onSuccess={fetchCautela}
        />
      )}
      {showDevolver && (
        <CautelaDevolverDialog
          open={devolverOpen}
          onOpenChange={setDevolverOpen}
          cautelaId={cautela.id}
          onSuccess={fetchCautela}
        />
      )}
    </div>
  );
}
