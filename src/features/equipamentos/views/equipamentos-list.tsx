"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePermission } from "@/src/hooks/use-permission";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Card, CardContent } from "@/src/components/ui/card";
import { STATUS_EQUIPAMENTO_LABELS, STATUS_EQUIPAMENTO_COLORS } from "@/src/lib/constants";
import EquipamentoFormDialog from "./equipamento-form-dialog";

export default function EquipamentosList() {
  const { isGestor } = usePermission();
  const [equipamentos, setEquipamentos] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEquipamento, setSelectedEquipamento] = useState<any | null>(null);
  const router = useRouter();

  const fetchEquipamentos = async () => {
    setLoading(true);
    const token = localStorage.getItem("accessToken");
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    const res = await fetch(`/api/equipamentos?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setEquipamentos(data.data || []);
    setTotal(data.total || 0);
    setLoading(false);
  };

  useEffect(() => {
    fetchEquipamentos();
  }, [page]);

  const handleNew = () => {
    setSelectedEquipamento(null);
    setDialogOpen(true);
  };

  const handleEdit = (equipamento: any) => {
    setSelectedEquipamento(equipamento);
    setDialogOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-foreground">Equipamentos</h2>
        {isGestor && <Button onClick={handleNew}>Novo Equipamento</Button>}
      </div>
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") fetchEquipamentos();
          }}
        />
        <Button onClick={fetchEquipamentos}>Buscar</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">Carregando...</div>
          ) : equipamentos.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">Nenhum equipamento encontrado.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 ">
                <tr>
                  <th className="text-left p-3">Patrimônio</th>
                  <th className="text-left p-3">Nome</th>
                  <th className="text-left p-3">Categoria</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {equipamentos.map((e: any) => (
                  <tr key={e.id} className="border-t">
                    <td className="p-3">{e.codigo_patrimonial}</td>
                    <td className="p-3">{e.nome}</td>
                    <td className="p-3">{e.categoria?.nome}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${STATUS_EQUIPAMENTO_COLORS[e.status as keyof typeof STATUS_EQUIPAMENTO_COLORS] || ""}`}
                      >
                        {
                          STATUS_EQUIPAMENTO_LABELS[
                            e.status as keyof typeof STATUS_EQUIPAMENTO_LABELS
                          ]
                        }
                      </span>
                    </td>
                    <td className="p-3 space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/equipamentos/${e.id}`)}
                      >
                        Ver
                      </Button>
                      {isGestor && (
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(e)}>
                          Editar
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
      <div className="flex justify-between mt-4">
        <Button
          variant="outline"
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
        >
          Anterior
        </Button>
        <Button variant="outline" onClick={() => setPage(page + 1)} disabled={page * 20 >= total}>
          Próxima
        </Button>
      </div>

      <EquipamentoFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchEquipamentos}
        equipamento={selectedEquipamento}
      />
    </div>
  );
}
