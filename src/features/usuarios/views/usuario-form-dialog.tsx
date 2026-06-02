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
import { createUsuarioSchema } from "@/src/lib/validators";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  matricula: string;
  telefone?: string | null;
  perfil: string;
  status: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  usuario?: Usuario | null;
}

const PERFIL_OPTIONS = [
  { value: "COLABORADOR", label: "Colaborador" },
  { value: "GESTOR", label: "Gestor" },
];

export default function UsuarioFormDialog({ open, onOpenChange, onSuccess, usuario }: Props) {
  const isEdit = !!usuario;
  const [form, setForm] = useState({
    nome: "",
    email: "",
    matricula: "",
    telefone: "",
    perfil: "COLABORADOR",
    senha: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (usuario) {
        setForm({
          nome: usuario.nome,
          email: usuario.email,
          matricula: usuario.matricula,
          telefone: usuario.telefone || "",
          perfil: usuario.perfil,
          senha: "",
        });
      } else {
        setForm({
          nome: "",
          email: "",
          matricula: "",
          telefone: "",
          perfil: "COLABORADOR",
          senha: "",
        });
      }
      setErrors({});
      setSubmitError("");
    }
  }, [open, usuario]);

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

  const handleSubmit = async () => {
    setSubmitError("");
    setErrors({});

    if (!isEdit) {
      const payload = {
        nome: form.nome,
        email: form.email,
        matricula: form.matricula,
        telefone: form.telefone || undefined,
        perfil: form.perfil as "GESTOR" | "COLABORADOR",
        senha: form.senha,
      };
      const parsed = createUsuarioSchema.safeParse(payload);
      if (!parsed.success) {
        const fieldErrors: Record<string, string> = {};
        parsed.error.errors.forEach((e) => {
          const path = e.path[0] as string;
          if (!fieldErrors[path]) fieldErrors[path] = e.message;
        });
        setErrors(fieldErrors);
        return;
      }
    } else {
      if (!form.nome || form.nome.length < 3) {
        setErrors({ nome: "Nome deve ter no mínimo 3 caracteres" });
        return;
      }
      if (!form.email) {
        setErrors({ email: "E-mail é obrigatório" });
        return;
      }
      if (!form.matricula) {
        setErrors({ matricula: "Matrícula é obrigatória" });
        return;
      }
    }

    setLoading(true);
    const token = localStorage.getItem("accessToken");

    let body: Record<string, unknown>;
    if (isEdit) {
      body = {
        nome: form.nome,
        email: form.email,
        matricula: form.matricula,
        telefone: form.telefone || null,
        perfil: form.perfil,
      };
    } else {
      body = {
        nome: form.nome,
        email: form.email,
        matricula: form.matricula,
        telefone: form.telefone || undefined,
        perfil: form.perfil,
        senha: form.senha,
      };
    }

    const url = isEdit ? `/api/usuarios/${usuario!.id}` : "/api/usuarios";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        setSubmitError(err.error || "Erro ao salvar usuário");
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
        </DialogHeader>

        {submitError && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">{submitError}</div>
        )}

        <div className="space-y-3">
          <div>
            <Label htmlFor="unome">Nome *</Label>
            <Input id="unome" value={form.nome} onChange={(e) => handleChange("nome", e.target.value)} />
            {fieldError("nome")}
          </div>
          <div>
            <Label htmlFor="uemail">E-mail *</Label>
            <Input id="uemail" type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} />
            {fieldError("email")}
          </div>
          <div>
            <Label htmlFor="umatricula">Matrícula *</Label>
            <Input id="umatricula" value={form.matricula} onChange={(e) => handleChange("matricula", e.target.value)} />
            {fieldError("matricula")}
          </div>
          <div>
            <Label htmlFor="utelefone">Telefone</Label>
            <Input id="utelefone" value={form.telefone} onChange={(e) => handleChange("telefone", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="uperfil">Perfil *</Label>
            <Select
              id="uperfil"
              value={form.perfil}
              onChange={(e) => handleChange("perfil", e.target.value)}
              options={PERFIL_OPTIONS}
            />
          </div>
          {!isEdit && (
            <div>
              <Label htmlFor="usenha">Senha *</Label>
              <Input id="usenha" type="password" value={form.senha} onChange={(e) => handleChange("senha", e.target.value)} />
              {fieldError("senha")}
            </div>
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
