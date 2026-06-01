"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";

export default function NovaCautelaPage() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [equipamentos, setEquipamentos] = useState<any[]>([]);
  const [selectedUsuario, setSelectedUsuario] = useState("");
  const [selectedEquipamentos, setSelectedEquipamentos] = useState<string[]>([]);
  const [dataRetorno, setDataRetorno] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    fetch("/api/usuarios?status=ATIVO&limit=100", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json()).then((d) => setUsuarios(d.data || []));
    fetch("/api/equipamentos/disponiveis", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json()).then(setEquipamentos);
  }, []);

  const toggleEquipamento = (id: string) => {
    setSelectedEquipamentos((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id],
    );
  };

  const handleSubmit = async () => {
    if (!selectedUsuario || selectedEquipamentos.length === 0 || !dataRetorno) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }
    setError("");
    const token = localStorage.getItem("accessToken");
    const res = await fetch("/api/cautelas", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        usuario_id: selectedUsuario,
        equipamento_ids: selectedEquipamentos,
        data_prevista_retorno: new Date(dataRetorno).toISOString(),
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      setError(err.error || "Erro ao criar cautela");
      return;
    }
    router.push("/dashboard/cautelas");
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Nova Cautela</h2>
      {error && <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-md">{error}</div>}

      <div className="space-y-6 max-w-2xl">
        <div>
          <label className="block text-sm font-medium mb-1">Colaborador</label>
          <select className="w-full border rounded-md p-2" value={selectedUsuario} onChange={(e) => setSelectedUsuario(e.target.value)}>
            <option value="">Selecione...</option>
            {usuarios.map((u: any) => (
              <option key={u.id} value={u.id}>{u.nome} — {u.matricula}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Equipamentos Disponíveis</label>
          <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-2">
            {equipamentos.map((e: any) => (
              <label key={e.id} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded">
                <input
                  type="checkbox"
                  checked={selectedEquipamentos.includes(e.id)}
                  onChange={() => toggleEquipamento(e.id)}
                />
                <span>{e.nome} ({e.codigo_patrimonial})</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Data Prevista de Retorno</label>
          <Input type="datetime-local" value={dataRetorno} onChange={(e) => setDataRetorno(e.target.value)} />
        </div>

        <Button onClick={handleSubmit}>Criar Cautela</Button>
      </div>
    </div>
  );
}
