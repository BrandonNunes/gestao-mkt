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
import { createCategoriaSchema } from "@/src/lib/validators";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  categoria?: { id: string; nome: string } | null;
}

export default function CategoriaFormDialog({ open, onOpenChange, onSuccess, categoria }: Props) {
  const isEdit = !!categoria;
  const [nome, setNome] = useState("");
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setNome(categoria ? categoria.nome : "");
      setError("");
      setSubmitError("");
    }
  }, [open, categoria]);

  const handleChange = (value: string) => {
    setNome(value);
    if (error) setError("");
  };

  const handleSubmit = async () => {
    setSubmitError("");
    setError("");

    const parsed = createCategoriaSchema.safeParse({ nome });
    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("accessToken");
    const url = isEdit ? `/api/categorias/${categoria!.id}` : "/api/categorias";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nome }),
      });

      if (!res.ok) {
        const err = await res.json();
        setSubmitError(err.error || "Erro ao salvar categoria");
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
        </DialogHeader>

        {submitError && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">{submitError}</div>
        )}

        <div>
          <Label htmlFor="nome">Nome *</Label>
          <Input
            id="nome"
            value={nome}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Nome da categoria"
          />
          {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
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
