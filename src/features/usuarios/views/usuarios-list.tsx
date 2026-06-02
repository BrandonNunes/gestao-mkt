"use client";

import { useState, useEffect } from "react";
import { usePermission } from "@/src/hooks/use-permission";
import { useAuth } from "@/src/hooks/use-auth";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Card, CardContent } from "@/src/components/ui/card";
import UsuarioFormDialog from "./usuario-form-dialog";
import UsuarioStatusDialog from "./usuario-status-dialog";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  matricula: string;
  perfil: string;
  status: string;
  telefone?: string | null;
}

export default function UsuariosList() {
  const { isGestor } = usePermission();
  const { user: currentUser } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState<Usuario | null>(null);

  const fetchUsuarios = async () => {
    setLoading(true);
    const token = localStorage.getItem("accessToken");
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    const res = await fetch(`/api/usuarios?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setUsuarios(data.data || []);
    setTotal(data.total || 0);
    setLoading(false);
  };

  useEffect(() => { fetchUsuarios(); }, [page]);

  const handleNew = () => {
    setSelectedUsuario(null);
    setFormOpen(true);
  };

  const handleEdit = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setFormOpen(true);
  };

  const handleStatus = (usuario: Usuario) => {
    setStatusTarget(usuario);
    setStatusOpen(true);
  };

  if (!isGestor) return <p className="text-muted-foreground">Acesso restrito.</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Usuários</h2>
        <Button onClick={handleNew}>Novo Usuário</Button>
      </div>
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Buscar por nome, email ou matrícula..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") fetchUsuarios(); }}
        />
        <Button onClick={fetchUsuarios}>Buscar</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">Carregando...</div>
          ) : usuarios.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">Nenhum usuário encontrado.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3">Nome</th>
                  <th className="text-left p-3">E-mail</th>
                  <th className="text-left p-3">Matrícula</th>
                  <th className="text-left p-3">Perfil</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id} className="border-t border-border">
                    <td className="p-3">{u.nome}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3">{u.matricula}</td>
                    <td className="p-3">{u.perfil === "GESTOR" ? "Gestor" : "Colaborador"}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${u.status === "ATIVO" ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300" : "bg-muted text-foreground/80"}`}>
                        {u.status === "ATIVO" ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="p-3 space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(u)}>Editar</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleStatus(u)}>
                        {u.status === "ATIVO" ? "Inativar" : "Ativar"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
      <div className="flex justify-between mt-4">
        <Button variant="outline" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>Anterior</Button>
        <span className="text-sm text-muted-foreground">Página {page} de {Math.ceil(total / 20) || 1}</span>
        <Button variant="outline" onClick={() => setPage(page + 1)} disabled={page * 20 >= total}>Próxima</Button>
      </div>

      <UsuarioFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={fetchUsuarios}
        usuario={selectedUsuario}
      />

      <UsuarioStatusDialog
        open={statusOpen}
        onOpenChange={setStatusOpen}
        usuario={statusTarget}
        onConfirm={fetchUsuarios}
      />
    </div>
  );
}
