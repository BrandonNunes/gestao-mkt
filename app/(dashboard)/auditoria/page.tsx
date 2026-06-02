"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/src/components/ui/card";
import { formatDate } from "@/src/lib/utils";

export default function AuditoriaPage() {
  const [registros, setRegistros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    fetch("/api/auditoria?limit=50", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { setRegistros(d.data || []); setLoading(false); });
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Auditoria</h2>
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Carregando...</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3">Entidade</th>
                  <th className="text-left p-3">Ação</th>
                  <th className="text-left p-3">Usuário</th>
                  <th className="text-left p-3">Data/Hora</th>
                </tr>
              </thead>
              <tbody>
                {registros.map((r: any) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="p-3">{r.entidade}</td>
                    <td className="p-3">{r.acao}</td>
                    <td className="p-3">{r.usuario?.nome}</td>
                    <td className="p-3">{formatDate(r.data_hora)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
