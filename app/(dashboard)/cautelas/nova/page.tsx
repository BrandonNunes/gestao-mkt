"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import CautelaEmitirDialog from "@/src/features/cautelas/views/cautela-emitir-dialog";

interface Acessorio {
  id: string;
  nome: string;
  status: string;
}

export default function NovaCautelaPage() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [equipamentos, setEquipamentos] = useState<any[]>([]);
  const [selectedUsuario, setSelectedUsuario] = useState("");
  const [selectedEquipamentos, setSelectedEquipamentos] = useState<string[]>([]);
  const [selectedAcessorios, setSelectedAcessorios] = useState<string[]>([]);
  const [acessoriosMap, setAcessoriosMap] = useState<Record<string, Acessorio[]>>({});
  const [dataRetorno, setDataRetorno] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cautelaCriadaId, setCautelaCriadaId] = useState<string | null>(null);
  const [emitirOpen, setEmitirOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    fetch("/api/usuarios?status=ATIVO&limit=100", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setUsuarios(d.data || []));

    fetch("/api/equipamentos/disponiveis", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setEquipamentos(data || []);
      });
  }, []);

  const toggleEquipamento = async (id: string) => {
    if (selectedEquipamentos.includes(id)) {
      setSelectedEquipamentos((prev) => prev.filter((e) => e !== id));
      setSelectedAcessorios((prev) => prev.filter((a) => {
        const equipAcessorios = acessoriosMap[id] || [];
        return !equipAcessorios.some((ac) => ac.id === a);
      }));
      setAcessoriosMap((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } else {
      setSelectedEquipamentos((prev) => [...prev, id]);
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`/api/equipamentos/${id}/acessorios`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const acessoriosData = (data || []).filter((a: Acessorio) => a.status === "ATIVO");
      setAcessoriosMap((prev) => ({ ...prev, [id]: acessoriosData }));
      setSelectedAcessorios((prev) => [
        ...prev,
        ...acessoriosData.map((a: Acessorio) => a.id),
      ]);
    }
  };

  const toggleAcessorio = (acessorioId: string) => {
    setSelectedAcessorios((prev) =>
      prev.includes(acessorioId)
        ? prev.filter((a) => a !== acessorioId)
        : [...prev, acessorioId],
    );
  };

  const createCautela = async () => {
    if (!selectedUsuario || selectedEquipamentos.length === 0 || !dataRetorno) {
      setError("Preencha todos os campos obrigatorios.");
      return null;
    }

    setError("");
    setLoading(true);
    const token = localStorage.getItem("accessToken");

    try {
      const res = await fetch("/api/cautelas", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          usuario_id: selectedUsuario,
          equipamento_ids: selectedEquipamentos,
          acessorio_ids: selectedAcessorios.length > 0 ? selectedAcessorios : undefined,
          data_prevista_retorno: new Date(dataRetorno).toISOString(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Erro ao criar cautela");
        setLoading(false);
        return null;
      }

      const data = await res.json();
      setLoading(false);
      return data.id as string;
    } catch {
      setError("Erro de rede. Tente novamente.");
      setLoading(false);
      return null;
    }
  };

  const handleSalvarRascunho = async () => {
    const id = await createCautela();
    if (id) router.push("/cautelas");
  };

  const handleEmitir = async () => {
    const id = await createCautela();
    if (id) {
      setCautelaCriadaId(id);
      setEmitirOpen(true);
    }
  };

  const handleEmitirSuccess = () => {
    router.push("/cautelas");
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Nova Cautela</h2>
      {error && <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-md">{error}</div>}

      <div className="space-y-6 max-w-2xl">
        <div>
          <Label htmlFor="colaborador">Colaborador *</Label>
          <select
            id="colaborador"
            className="w-full border rounded-md p-2 text-sm"
            value={selectedUsuario}
            onChange={(e) => setSelectedUsuario(e.target.value)}
          >
            <option value="">Selecione...</option>
            {usuarios.map((u: any) => (
              <option key={u.id} value={u.id}>
                {u.nome} — {u.matricula}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="dataRetorno">Data Prevista de Retorno *</Label>
          <Input
            id="dataRetorno"
            type="datetime-local"
            value={dataRetorno}
            onChange={(e) => setDataRetorno(e.target.value)}
          />
        </div>

        <div>
          <Label>Equipamentos Disponiveis *</Label>
          <div className="space-y-1 max-h-80 overflow-y-auto border rounded-md p-2 mt-1">
            {equipamentos.map((e: any) => (
              <div key={e.id}>
                <label className="flex items-center gap-2 p-1 hover:bg-muted/50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedEquipamentos.includes(e.id)}
                    onChange={() => toggleEquipamento(e.id)}
                  />
                  <span>
                    {e.nome} ({e.codigo_patrimonial})
                  </span>
                </label>
                {selectedEquipamentos.includes(e.id) && acessoriosMap[e.id] && (
                  <div className="ml-8 space-y-1 mb-1">
                    {(acessoriosMap[e.id] || []).map((a) => (
                      <label
                        key={a.id}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:bg-muted/50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedAcessorios.includes(a.id)}
                          onChange={() => toggleAcessorio(a.id)}
                        />
                        {a.nome}
                      </label>
                    ))}
                    {(acessoriosMap[e.id] || []).length === 0 && (
                      <p className="text-xs text-muted-foreground/60 ml-6">Sem acessorios</p>
                    )}
                  </div>
                )}
              </div>
            ))}
            {equipamentos.length === 0 && (
              <p className="text-sm text-muted-foreground/60 p-2">Nenhum equipamento disponivel.</p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSalvarRascunho} disabled={loading}>
            Salvar Rascunho
          </Button>
          <Button onClick={handleEmitir} disabled={loading}>
            {loading ? "Salvando..." : "Emitir Cautela"}
          </Button>
        </div>
      </div>

      {cautelaCriadaId && (
        <CautelaEmitirDialog
          open={emitirOpen}
          onOpenChange={setEmitirOpen}
          cautelaId={cautelaCriadaId}
          onSuccess={handleEmitirSuccess}
        />
      )}
    </div>
  );
}
