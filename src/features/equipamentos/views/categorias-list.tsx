"use client";

import { useState } from "react";
import { usePermission } from "@/src/hooks/use-permission";
import { Button } from "@/src/components/ui/button";
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
import CategoriaFormDialog from "./categoria-form-dialog";

interface Categoria {
  id: string;
  nome: string;
  _count?: { equipamentos: number };
}

interface Props {
  categorias: Categoria[];
  onRefresh: () => void;
}

export default function CategoriasList({ categorias, onRefresh }: Props) {
  const { isGestor } = usePermission();
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<Categoria | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Categoria | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleNew = () => {
    setSelected(null);
    setFormOpen(true);
  };

  const handleEdit = (categoria: Categoria) => {
    setSelected(categoria);
    setFormOpen(true);
  };

  const handleDeleteClick = (categoria: Categoria) => {
    setDeleteTarget(categoria);
    setDeleteError("");
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteError("");
    setDeleteLoading(true);

    const token = localStorage.getItem("accessToken");
    try {
      const res = await fetch(`/api/categorias/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json();
        setDeleteError(err.error || "Erro ao excluir categoria");
        return;
      }

      setDeleteOpen(false);
      onRefresh();
    } catch {
      setDeleteError("Erro de rede. Tente novamente.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Categorias</h2>
        {isGestor && <Button onClick={handleNew}>Nova Categoria</Button>}
      </div>

      <div className="border rounded-md">
        {categorias.length === 0 ? (
          <p className="p-4 text-muted-foreground">Nenhuma categoria cadastrada.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3">Nome</th>
                <th className="text-left p-3">Equipamentos</th>
                {isGestor && <th className="text-left p-3">Acoes</th>}
              </tr>
            </thead>
            <tbody>
              {categorias.map((c) => (
                <tr key={c.id} className="border-t border-border">
                  <td className="p-3">{c.nome}</td>
                  <td className="p-3">{c._count?.equipamentos ?? 0}</td>
                  {isGestor && (
                    <td className="p-3 space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(c)}>Editar</Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(c)}
                        className={(c._count?.equipamentos ?? 0) > 0 ? "hidden" : "text-red-600"}
                      >
                        Excluir
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <CategoriaFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={onRefresh}
        categoria={selected}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Categoria</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja excluir a categoria <strong>{deleteTarget?.nome}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleteError && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">{deleteError}</div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={deleteLoading}>
              {deleteLoading ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
