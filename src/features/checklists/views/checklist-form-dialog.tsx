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
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Select } from "@/src/components/ui/select";
import { createChecklistSchema } from "@/src/lib/validators";

interface PerguntaInput {
  id: string;
  pergunta: string;
  obrigatoria: boolean;
  ordem: number;
}

interface Checklist {
  id: string;
  nome: string;
  tipo: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  checklist?: Checklist | null;
}

const TIPO_OPTIONS = [
  { value: "SAIDA", label: "Saída" },
  { value: "DEVOLUCAO", label: "Devolução" },
];

export default function ChecklistFormDialog({ open, onOpenChange, onSuccess, checklist }: Props) {
  const isEdit = !!checklist;
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("SAIDA");
  const [perguntas, setPerguntas] = useState<PerguntaInput[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [perguntaError, setPerguntaError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (checklist) {
        setNome(checklist.nome);
        setTipo(checklist.tipo);
        const token = localStorage.getItem("accessToken");
        fetch(`/api/checklists/${checklist.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((r) => r.json())
          .then((data) => {
            if (data.perguntas) {
              setPerguntas(
                data.perguntas.map((p: { id: string; pergunta: string; obrigatoria: boolean; ordem: number }) => ({
                  id: crypto.randomUUID(),
                  pergunta: p.pergunta,
                  obrigatoria: p.obrigatoria,
                  ordem: p.ordem,
                })),
              );
            }
          })
          .catch(() => {});
      } else {
        setNome("");
        setTipo("SAIDA");
        setPerguntas([]);
      }
      setErrors({});
      setPerguntaError("");
      setSubmitError("");
    }
  }, [open, checklist]);

  const addPergunta = () => {
    setPerguntas((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        pergunta: "",
        obrigatoria: true,
        ordem: prev.length + 1,
      },
    ]);
    setPerguntaError("");
  };

  const removePergunta = (id: string) => {
    setPerguntas((prev) => prev.filter((p) => p.id !== id).map((p, i) => ({ ...p, ordem: i + 1 })));
  };

  const updatePergunta = (id: string, field: string, value: string | boolean) => {
    setPerguntas((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    );
  };

  const handleSubmit = async () => {
    setSubmitError("");
    setErrors({});
    setPerguntaError("");

    if (perguntas.length === 0) {
      setPerguntaError("Adicione ao menos uma pergunta.");
      return;
    }

    const payload = {
      nome,
      tipo,
      perguntas: perguntas.map((p) => ({
        pergunta: p.pergunta,
        obrigatoria: p.obrigatoria,
        ordem: p.ordem,
      })),
    };

    const parsed = createChecklistSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.errors.forEach((e) => {
        const path = e.path[0] as string;
        if (!fieldErrors[path]) fieldErrors[path] = e.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("accessToken");
    const url = isEdit ? `/api/checklists/${checklist!.id}` : "/api/checklists";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        const err = await res.json();
        setSubmitError(err.error || "Erro ao salvar checklist");
        return;
      }

      onOpenChange(false);
      onSuccess();
    } catch {
      setSubmitError("Erro de rede. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const fieldError = (field: string) =>
    errors[field] ? <p className="text-xs text-red-600 mt-1">{errors[field]}</p> : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Checklist" : "Novo Checklist"}</DialogTitle>
        </DialogHeader>

        {submitError && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">{submitError}</div>
        )}

        <div className="space-y-3">
          <div>
            <Label htmlFor="cnome">Nome *</Label>
            <Input id="cnome" value={nome} onChange={(e) => setNome(e.target.value)} />
            {fieldError("nome")}
          </div>
          <div>
            <Label htmlFor="ctipo">Tipo *</Label>
            <Select id="ctipo" value={tipo} onChange={(e) => setTipo(e.target.value)} options={TIPO_OPTIONS} />
            {fieldError("tipo")}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Perguntas</Label>
              <Button variant="outline" size="sm" onClick={addPergunta} type="button">
                + Adicionar pergunta
              </Button>
            </div>
            {perguntaError && <p className="text-xs text-red-600 mb-2">{perguntaError}</p>}

            {perguntas.map((p, idx) => (
              <div key={p.id} className="border rounded-md p-3 mb-2 space-y-2">
                <div className="flex gap-2 items-start">
                  <span className="text-xs text-muted-foreground/60 mt-2 w-6">{idx + 1}.</span>
                  <div className="flex-1">
                    <Input
                      placeholder="Texto da pergunta"
                      value={p.pergunta}
                      onChange={(e) => updatePergunta(p.id, "pergunta", e.target.value)}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePergunta(p.id)}
                    type="button"
                    className="text-red-600"
                  >
                    Remover
                  </Button>
                </div>
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={p.obrigatoria}
                    onChange={(e) => updatePergunta(p.id, "obrigatoria", e.target.checked)}
                    className="rounded"
                  />
                  Obrigatória
                </label>
              </div>
            ))}

            {perguntas.length === 0 && !perguntaError && (
              <p className="text-sm text-muted-foreground/60">Nenhuma pergunta adicionada.</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
