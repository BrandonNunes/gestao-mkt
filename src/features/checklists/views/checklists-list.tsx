"use client";

import { useState } from "react";
import { usePermission } from "@/src/hooks/use-permission";
import { Button } from "@/src/components/ui/button";
import ChecklistFormDialog from "./checklist-form-dialog";

interface Checklist {
  id: string;
  nome: string;
  tipo: string;
  _count?: { perguntas: number };
}

interface Props {
  checklists: Checklist[];
  onRefresh: () => void;
}

export default function ChecklistsList({ checklists, onRefresh }: Props) {
  const { isGestor } = usePermission();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null);

  const handleNew = () => {
    setSelectedChecklist(null);
    setDialogOpen(true);
  };

  const handleEdit = (checklist: Checklist) => {
    setSelectedChecklist(checklist);
    setDialogOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Checklists</h2>
        {isGestor && <Button onClick={handleNew}>Novo Checklist</Button>}
      </div>

      <div className="border rounded-md">
        {checklists.length === 0 ? (
          <p className="p-4 text-muted-foreground">Nenhum checklist cadastrado.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3">Nome</th>
                <th className="text-left p-3">Tipo</th>
                <th className="text-left p-3">Perguntas</th>
                {isGestor && <th className="text-left p-3">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {checklists.map((c) => (
                <tr key={c.id} className="border-t border-border">
                  <td className="p-3">{c.nome}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${c.tipo === "SAIDA" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300" : "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300"}`}>
                      {c.tipo === "SAIDA" ? "Saída" : "Devolução"}
                    </span>
                  </td>
                  <td className="p-3">{c._count?.perguntas ?? 0}</td>
                  {isGestor && (
                    <td className="p-3">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(c)}>Editar</Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ChecklistFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={onRefresh}
        checklist={selectedChecklist}
      />
    </div>
  );
}
