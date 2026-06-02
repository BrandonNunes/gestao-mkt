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
import { Textarea } from "@/src/components/ui/textarea";
import { Select } from "@/src/components/ui/select";
import { createEquipamentoSchema } from "@/src/lib/validators";

interface Categoria {
  id: string;
  nome: string;
}

interface Equipamento {
  id: string;
  codigo_patrimonial: string;
  nome: string;
  categoria_id: string;
  marca?: string;
  modelo?: string;
  numero_serie?: string;
  descricao?: string;
  data_aquisicao?: string;
  valor_aquisicao?: number;
  localizacao?: string;
  observacoes?: string;
  status: string;
  categoria?: { nome: string };
}

interface AcessorioInput {
  tempId: string;
  id?: string;
  nome: string;
  codigo_interno: string;
  descricao: string;
  ativo: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  equipamento?: Equipamento | null;
}

export default function EquipamentoFormDialog({ open, onOpenChange, onSuccess, equipamento }: Props) {
  const isEdit = !!equipamento;
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [form, setForm] = useState({
    codigo_patrimonial: "",
    nome: "",
    categoria_id: "",
    marca: "",
    modelo: "",
    numero_serie: "",
    descricao: "",
    data_aquisicao: "",
    valor_aquisicao: "",
    localizacao: "",
    observacoes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [acessorios, setAcessorios] = useState<AcessorioInput[]>([]);
  const [acessorioError, setAcessorioError] = useState("");

  useEffect(() => {
    if (open) {
      const token = localStorage.getItem("accessToken");
      fetch("/api/categorias?limit=100", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => setCategorias(data.data || []))
        .catch(() => {});

      if (equipamento) {
        setForm({
          codigo_patrimonial: equipamento.codigo_patrimonial,
          nome: equipamento.nome,
          categoria_id: equipamento.categoria_id,
          marca: equipamento.marca || "",
          modelo: equipamento.modelo || "",
          numero_serie: equipamento.numero_serie || "",
          descricao: equipamento.descricao || "",
          data_aquisicao: equipamento.data_aquisicao
            ? new Date(equipamento.data_aquisicao).toISOString().slice(0, 16)
            : "",
          valor_aquisicao: equipamento.valor_aquisicao ? String(equipamento.valor_aquisicao) : "",
          localizacao: equipamento.localizacao || "",
          observacoes: equipamento.observacoes || "",
        });

        const fetchAcessorios = async () => {
          const res = await fetch(`/api/equipamentos/${equipamento.id}/acessorios`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          setAcessorios(
            (data || []).map((a: { id: string; nome: string; codigo_interno?: string; descricao?: string; status: string }) => ({
              tempId: crypto.randomUUID(),
              id: a.id,
              nome: a.nome,
              codigo_interno: a.codigo_interno || "",
              descricao: a.descricao || "",
              ativo: a.status === "ATIVO",
            })),
          );
        };
        fetchAcessorios();
      } else {
        setForm({
          codigo_patrimonial: "",
          nome: "",
          categoria_id: "",
          marca: "",
          modelo: "",
          numero_serie: "",
          descricao: "",
          data_aquisicao: "",
          valor_aquisicao: "",
          localizacao: "",
          observacoes: "",
        });
        setAcessorios([]);
      }
      setErrors({});
      setSubmitError("");
      setAcessorioError("");
    }
  }, [open, equipamento]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const addAcessorio = () => {
    setAcessorios((prev) => [
      ...prev,
      {
        tempId: crypto.randomUUID(),
        nome: "",
        codigo_interno: "",
        descricao: "",
        ativo: true,
      },
    ]);
    setAcessorioError("");
  };

  const removeAcessorio = (tempId: string) => {
    setAcessorios((prev) => prev.filter((a) => a.tempId !== tempId));
  };

  const updateAcessorio = (tempId: string, field: string, value: string | boolean) => {
    setAcessorios((prev) =>
      prev.map((a) => (a.tempId === tempId ? { ...a, [field]: value } : a)),
    );
  };

  const handleSubmit = async () => {
    setSubmitError("");
    setErrors({});
    setAcessorioError("");

    const missingAcessorio = acessorios.some((a) => !a.nome.trim());
    if (missingAcessorio) {
      setAcessorioError("Preencha o nome de todos os acessorios.");
      return;
    }

    const payload = {
      codigo_patrimonial: form.codigo_patrimonial,
      nome: form.nome,
      categoria_id: form.categoria_id,
      marca: form.marca || undefined,
      modelo: form.modelo || undefined,
      numero_serie: form.numero_serie || undefined,
      descricao: form.descricao || undefined,
      data_aquisicao: form.data_aquisicao
        ? new Date(form.data_aquisicao).toISOString()
        : undefined,
      valor_aquisicao: form.valor_aquisicao ? Number(form.valor_aquisicao) : undefined,
      localizacao: form.localizacao || undefined,
      observacoes: form.observacoes || undefined,
    };

    const parsed = createEquipamentoSchema.safeParse(payload);
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

    try {
      let equipId: string;

      if (isEdit) {
        equipId = equipamento!.id;
        const res = await fetch(`/api/equipamentos/${equipId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(parsed.data),
        });
        if (!res.ok) {
          const err = await res.json();
          setSubmitError(err.error || "Erro ao salvar equipamento");
          setLoading(false);
          return;
        }
      } else {
        const res = await fetch("/api/equipamentos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(parsed.data),
        });
        if (!res.ok) {
          const err = await res.json();
          setSubmitError(err.error || "Erro ao salvar equipamento");
          setLoading(false);
          return;
        }
        const created = await res.json();
        equipId = created.id;
      }

      for (const a of acessorios) {
        if (a.id) {
          await fetch(`/api/acessorios/${a.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              nome: a.nome,
              codigo_interno: a.codigo_interno || undefined,
              descricao: a.descricao || undefined,
              status: a.ativo ? "ATIVO" : "INATIVO",
            }),
          });
        } else {
          await fetch(`/api/equipamentos/${equipId}/acessorios`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              nome: a.nome,
              codigo_interno: a.codigo_interno || undefined,
              descricao: a.descricao || undefined,
            }),
          });
        }
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
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Equipamento" : "Novo Equipamento"}</DialogTitle>
        </DialogHeader>

        {submitError && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">{submitError}</div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <Label htmlFor="codigo_patrimonial">Código Patrimonial *</Label>
            <Input
              id="codigo_patrimonial"
              value={form.codigo_patrimonial}
              onChange={(e) => handleChange("codigo_patrimonial", e.target.value)}
            />
            {fieldError("codigo_patrimonial")}
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Label htmlFor="nome">Nome *</Label>
            <Input id="nome" value={form.nome} onChange={(e) => handleChange("nome", e.target.value)} />
            {fieldError("nome")}
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Label htmlFor="categoria_id">Categoria *</Label>
            <Select
              id="categoria_id"
              value={form.categoria_id}
              onChange={(e) => handleChange("categoria_id", e.target.value)}
              options={categorias.map((c) => ({ value: c.id, label: c.nome }))}
              placeholder="Selecione uma categoria"
            />
            {fieldError("categoria_id")}
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Label htmlFor="marca">Marca</Label>
            <Input id="marca" value={form.marca} onChange={(e) => handleChange("marca", e.target.value)} />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Label htmlFor="modelo">Modelo</Label>
            <Input id="modelo" value={form.modelo} onChange={(e) => handleChange("modelo", e.target.value)} />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Label htmlFor="numero_serie">Número de Série</Label>
            <Input
              id="numero_serie"
              value={form.numero_serie}
              onChange={(e) => handleChange("numero_serie", e.target.value)}
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Label htmlFor="localizacao">Localização</Label>
            <Input
              id="localizacao"
              value={form.localizacao}
              onChange={(e) => handleChange("localizacao", e.target.value)}
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Label htmlFor="data_aquisicao">Data de Aquisição</Label>
            <Input
              id="data_aquisicao"
              type="datetime-local"
              value={form.data_aquisicao}
              onChange={(e) => handleChange("data_aquisicao", e.target.value)}
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Label htmlFor="valor_aquisicao">Valor de Aquisição</Label>
            <Input
              id="valor_aquisicao"
              type="number"
              min="0"
              step="0.01"
              value={form.valor_aquisicao}
              onChange={(e) => handleChange("valor_aquisicao", e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={form.descricao}
              onChange={(e) => handleChange("descricao", e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={form.observacoes}
              onChange={(e) => handleChange("observacoes", e.target.value)}
            />
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-2">
            <Label>Acessorios</Label>
            <Button variant="outline" size="sm" onClick={addAcessorio} type="button">
              + Adicionar acessorio
            </Button>
          </div>
          {acessorioError && <p className="text-xs text-red-600 mb-2">{acessorioError}</p>}

          {acessorios.map((a, idx) => (
            <div key={a.tempId} className="border rounded-md p-3 mb-2 space-y-2">
              <div className="flex gap-2 items-start">
                <span className="text-xs text-muted-foreground/60 mt-2 w-6">{idx + 1}.</span>
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="Nome do acessorio *"
                    value={a.nome}
                    onChange={(e) => updateAcessorio(a.tempId, "nome", e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Input
                      placeholder="Codigo interno"
                      value={a.codigo_interno}
                      onChange={(e) => updateAcessorio(a.tempId, "codigo_interno", e.target.value)}
                    />
                    <Input
                      placeholder="Descricao"
                      value={a.descricao}
                      onChange={(e) => updateAcessorio(a.tempId, "descricao", e.target.value)}
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={a.ativo}
                      onChange={(e) => updateAcessorio(a.tempId, "ativo", e.target.checked)}
                      className="rounded"
                    />
                    Ativo
                  </label>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAcessorio(a.tempId)}
                  type="button"
                  className="text-red-600"
                >
                  Remover
                </Button>
              </div>
            </div>
          ))}

          {acessorios.length === 0 && !acessorioError && (
            <p className="text-sm text-muted-foreground/60">Nenhum acessorio adicionado.</p>
          )}
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
