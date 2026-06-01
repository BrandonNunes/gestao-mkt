"use client";

import { useState, useEffect } from "react";
import { usePermission } from "@/src/hooks/use-permission";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Card, CardContent } from "@/src/components/ui/card";
import { STATUS_CAUTELA_LABELS, STATUS_CAUTELA_COLORS } from "@/src/lib/constants";
import { useRouter } from "next/navigation";

export default function CautelasList() {
  const { isGestor } = usePermission();
  const [cautelas, setCautelas] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchCautelas = async () => {
    setLoading(true);
    const token = localStorage.getItem("accessToken");
    const endpoint = isGestor ? "/api/cautelas" : "/api/cautelas/minhas";
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    const res = await fetch(`${endpoint}?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setCautelas(data.data || []);
    setTotal(data.total || 0);
    setLoading(false);
  };

  useEffect(() => { fetchCautelas(); }, [page]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Cautelas</h2>
        {isGestor && <Button onClick={() => router.push("/dashboard/cautelas/nova")}>Nova Cautela</Button>}
      </div>
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Carregando...</div>
          ) : cautelas.length === 0 ? (
            <div className="p-4 text-center text-gray-500">Nenhuma cautela encontrada.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3">Nº</th>
                  <th className="text-left p-3">Responsável</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Emissão</th>
                  <th className="text-left p-3">Prev. Retorno</th>
                  <th className="text-left p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {cautelas.map((c: any) => (
                  <tr key={c.id} className="border-t">
                    <td className="p-3 font-mono">{c.numero || c.id.slice(0, 8)}</td>
                    <td className="p-3">{c.usuario?.nome}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${STATUS_CAUTELA_COLORS[c.status as keyof typeof STATUS_CAUTELA_COLORS] || ""}`}>
                        {STATUS_CAUTELA_LABELS[c.status as keyof typeof STATUS_CAUTELA_LABELS]}
                      </span>
                    </td>
                    <td className="p-3">{c.data_emissao ? new Date(c.data_emissao).toLocaleDateString("pt-BR") : "-"}</td>
                    <td className="p-3">{c.data_prevista_retorno ? new Date(c.data_prevista_retorno).toLocaleDateString("pt-BR") : "-"}</td>
                    <td className="p-3">
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/cautelas/${c.id}`)}>Ver</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
      <div className="flex justify-between mt-4">
        <Button variant="outline" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>Anterior</Button>
        <Button variant="outline" onClick={() => setPage(page + 1)} disabled={page * 20 >= total}>Próxima</Button>
      </div>
    </div>
  );
}
