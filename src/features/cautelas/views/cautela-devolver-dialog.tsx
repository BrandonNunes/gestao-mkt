"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { Select } from "@/src/components/ui/select";
import { Textarea } from "@/src/components/ui/textarea";

interface Checklist {
  id: string;
  nome: string;
  tipo: string;
}

interface Pergunta {
  id: string;
  pergunta: string;
  obrigatoria: boolean;
  ordem: number;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cautelaId: string;
  onSuccess: () => void;
}

export default function CautelaDevolverDialog({ open, onOpenChange, cautelaId, onSuccess }: Props) {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [selectedChecklist, setSelectedChecklist] = useState("");
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [respostas, setRespostas] = useState<Record<string, boolean | null>>({});
  const [temAvarias, setTemAvarias] = useState(false);
  const [avariasDescricao, setAvariasDescricao] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setError("");
      setSelectedChecklist("");
      setPerguntas([]);
      setRespostas({});
      setTemAvarias(false);
      setAvariasDescricao("");
      setObservacoes("");
      setLoading(false);

      const token = localStorage.getItem("accessToken");
      fetch("/api/checklists?tipo=DEVOLUCAO", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => setChecklists(data || []))
        .catch(() => {});
    }
  }, [open]);

  const handleChecklistChange = async (id: string) => {
    setSelectedChecklist(id);
    setRespostas({});
    setError("");

    if (!id) {
      setPerguntas([]);
      return;
    }

    const token = localStorage.getItem("accessToken");
    const res = await fetch(`/api/checklists/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setPerguntas(data.perguntas || []);
  };

  const handleResposta = (perguntaId: string, valor: boolean) => {
    setRespostas((prev) => ({ ...prev, [perguntaId]: valor }));
  };

  const handleSubmit = async () => {
    setError("");

    if (!selectedChecklist) {
      setError("Selecione um checklist.");
      return;
    }

    const faltantes = perguntas
      .filter((p) => p.obrigatoria && respostas[p.id] == null)
      .map((p) => p.pergunta);

    if (faltantes.length > 0) {
      setError(`Perguntas obrigatorias nao respondidas: ${faltantes.join(", ")}`);
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("accessToken");

    try {
      const res = await fetch(`/api/cautelas/${cautelaId}/devolver`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          checklist_id: selectedChecklist,
          respostas: Object.entries(respostas)
            .filter(([, v]) => v != null)
            .map(([pergunta_id, resposta]) => ({ pergunta_id, resposta })),
          tem_avarias: temAvarias,
          avarias_descricao: temAvarias ? avariasDescricao : undefined,
          observacoes: observacoes || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Erro ao devolver cautela");
        return;
      }

      onOpenChange(false);
      onSuccess();
    } catch {
      setError("Erro de rede. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Devolver Cautela — Checklist de Devolucao</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">{error}</div>
        )}

        <div>
          <Label htmlFor="checklist">Checklist de Devolucao *</Label>
          <Select
            id="checklist"
            value={selectedChecklist}
            onChange={(e) => handleChecklistChange(e.target.value)}
            options={checklists.map((c) => ({ value: c.id, label: c.nome }))}
            placeholder="Selecione um checklist"
          />
        </div>

        {perguntas.length > 0 && (
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {perguntas.map((p) => (
              <div key={p.id} className="border rounded-md p-3">
                <p className="text-sm mb-2">
                  {p.pergunta}
                  {p.obrigatoria && <span className="text-red-500 ml-1">*</span>}
                </p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name={`dp_${p.id}`}
                      checked={respostas[p.id] === true}
                      onChange={() => handleResposta(p.id, true)}
                    />
                    Sim
                  </label>
                  <label className="flex items-center gap-1 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name={`dp_${p.id}`}
                      checked={respostas[p.id] === false}
                      onChange={() => handleResposta(p.id, false)}
                    />
                    Nao
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}

        <div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={temAvarias}
              onChange={(e) => setTemAvarias(e.target.checked)}
              className="rounded"
            />
            Possui avarias?
          </label>
          {temAvarias && (
            <Textarea
              className="mt-2"
              placeholder="Descreva as avarias encontradas..."
              value={avariasDescricao}
              onChange={(e) => setAvariasDescricao(e.target.value)}
            />
          )}
        </div>

        <div>
          <Label htmlFor="observacoes">Observacoes</Label>
          <Textarea
            id="observacoes"
            placeholder="Observacoes adicionais (opcional)"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Devolvendo..." : "Confirmar Devolucao"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
