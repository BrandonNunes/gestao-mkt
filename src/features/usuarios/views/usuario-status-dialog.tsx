"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/src/components/ui/alert-dialog";
import { useAuth } from "@/src/hooks/use-auth";

interface Usuario {
  id: string;
  nome: string;
  status: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario: Usuario | null;
  onConfirm: () => void;
}

export default function UsuarioStatusDialog({ open, onOpenChange, usuario, onConfirm }: Props) {
  const { user: currentUser } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!usuario) return null;

  const isAtivar = usuario.status === "INATIVO";
  const acao = isAtivar ? "ativar" : "inativar";
  const AcaoLabel = isAtivar ? "Ativar" : "Inativar";

  const handleConfirm = async () => {
    setError("");

    if (usuario.id === currentUser?.id && !isAtivar) {
      setError("Você não pode inativar seu próprio usuário.");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("accessToken");

    try {
      const res = await fetch(`/api/usuarios/${usuario.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: isAtivar ? "ATIVO" : "INATIVO" }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Erro ao alterar status");
        return;
      }

      onOpenChange(false);
      onConfirm();
    } catch {
      setError("Erro de rede. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{AcaoLabel} Usuário</AlertDialogTitle>
          <AlertDialogDescription>
            Deseja {acao} o usuário <strong>{usuario.nome}</strong>?
            {!isAtivar && " O usuário não poderá mais acessar o sistema enquanto estiver inativo."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">{error}</div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={loading}>
            {loading ? "Processando..." : AcaoLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
