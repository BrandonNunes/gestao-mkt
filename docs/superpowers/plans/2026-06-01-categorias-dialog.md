# Categorias CRUD via Dialog — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir o input inline da tela de categorias por um Dialog modal (criacao/edicao) + AlertDialog (exclusao), seguindo o padrao `002-crud-dialogs`.

**Architecture:** 3 novos arquivos (`categoria-form-dialog.tsx`, `categorias-list.tsx`, `api/categorias/[id]/route.ts`) + 1 modificacao (`categorias/page.tsx`). Service e schema Zod ja existem, sem alteracoes.

**Tech Stack:** Next.js 16 App Router, React 19, TailwindCSS, ShadCN UI (Dialog, AlertDialog, Button, Input, Label), Zod, Prisma 7+

---

### Task 1: API Route `PUT/DELETE /api/categorias/[id]`

**Files:**
- Create: `app/api/categorias/[id]/route.ts`

- [ ] **Step 1: Create the route file**

```ts
import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/src/lib/auth";
import { createCategoriaSchema } from "@/src/lib/validators";
import * as categoriasService from "@/src/features/equipamentos/services/categorias.service";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getTokenFromRequest(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (user.perfil !== "GESTOR") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const parsed = createCategoriaSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  try {
    const categoria = await categoriasService.update(id, parsed.data.nome);
    return NextResponse.json(categoria);
  } catch (err) {
    return NextResponse.json({ error: "Nome já existe" }, { status: 409 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getTokenFromRequest(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (user.perfil !== "GESTOR") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const { id } = await params;
  try {
    await categoriasService.softDelete(id);
    return NextResponse.json({ message: "Categoria excluída." });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erro" }, { status: 409 });
  }
}
```

- [ ] **Step 2: Verify route compiles**

```bash
npx tsc --noEmit 2>&1 | Select-String "categorias"
```

Expected: no output (no errors in categorias files).

- [ ] **Step 3: Commit**

```bash
git add app/api/categorias/[id]/route.ts
git commit -m "feat: adiciona PUT e DELETE /api/categorias/[id]"
```

---

### Task 2: CategoriaFormDialog Component

**Files:**
- Create: `src/features/equipamentos/views/categoria-form-dialog.tsx`

- [ ] **Step 1: Create the dialog component**

```tsx
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
```

- [ ] **Step 2: Verify compiles**

```bash
npx tsc --noEmit 2>&1 | Select-String "categoria-form-dialog"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/features/equipamentos/views/categoria-form-dialog.tsx
git commit -m "feat: adiciona CategoriaFormDialog (criacao/edicao)"
```

---

### Task 3: CategoriasList Component

**Files:**
- Create: `src/features/equipamentos/views/categorias-list.tsx`

- [ ] **Step 1: Create the list component with dialogs**

```tsx
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
          <p className="p-4 text-gray-500">Nenhuma categoria cadastrada.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">Nome</th>
                <th className="text-left p-3">Equipamentos</th>
                {isGestor && <th className="text-left p-3">Acoes</th>}
              </tr>
            </thead>
            <tbody>
              {categorias.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="p-3">{c.nome}</td>
                  <td className="p-3">{c._count?.equipamentos ?? 0}</td>
                  {isGestor && (
                    <td className="p-3 space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(c)}>Editar</Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(c)}
                        disabled={(c._count?.equipamentos ?? 0) > 0}
                        className={(c._count?.equipamentos ?? 0) > 0 ? "opacity-50" : "text-red-600"}
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
```

- [ ] **Step 2: Verify compiles**

```bash
npx tsc --noEmit 2>&1 | Select-String "categorias-list"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/features/equipamentos/views/categorias-list.tsx
git commit -m "feat: adiciona CategoriasList com dialog de exclusao"
```

---

### Task 4: Update Categorias Page

**Files:**
- Modify: `app/(dashboard)/categorias/page.tsx` (replace entirely)

- [ ] **Step 1: Rewrite the page as a thin wrapper**

```tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import CategoriasList from "@/src/features/equipamentos/views/categorias-list";

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<any[]>([]);

  const fetchCategorias = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    const res = await fetch("/api/categorias?limit=100", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setCategorias(data.data || []);
  }, []);

  useEffect(() => { fetchCategorias(); }, [fetchCategorias]);

  return <CategoriasList categorias={categorias} onRefresh={fetchCategorias} />;
}
```

- [ ] **Step 2: Remove unused Input import from page.tsx**

The old page had `import { Input }`. After replacement, ensure only used imports remain.

- [ ] **Step 3: Verify full compile**

```bash
npx tsc --noEmit 2>&1
```

Expected: only pre-existing errors in `auditoria.service.ts` and `cautelas.service.ts`. No new errors.

- [ ] **Step 4: Commit**

```bash
git add app/(dashboard)/categorias/page.tsx
git commit -m "feat: refatora pagina de categorias para usar CategoriasList"
```

---

### Task 5: Integration Validation

**Files:** None (manual verification)

- [ ] **Step 1: Start dev server and verify**

```bash
npm run dev
```

- [ ] **Step 2: Test scenarios as GESTOR**

1. Acessar `/categorias` → ver listagem com botoes "Nova Categoria", "Editar", "Excluir"
2. Clicar "Nova Categoria" → Dialog abre vazio → preencher nome → Salvar → categoria aparece na listagem
3. Clicar "Editar" em uma linha → Dialog abre preenchido → alterar nome → Salvar → atualizado
4. Tentar nome duplicado → erro "Nome ja existe", dialog permanece aberto
5. Clicar "Excluir" em categoria sem equipamentos → AlertDialog → Confirmar → removida
6. Clicar "Excluir" em categoria com equipamentos → botao desabilitado

- [ ] **Step 3: Test as COLABORADOR**

1. Acessar `/categorias` → ver listagem SEM botoes de acao
2. Nao conseguir ver "Nova Categoria", "Editar", "Excluir"

- [ ] **Step 4: Dialog UX verification**

1. Abrir Dialog → clicar fora → fecha
2. Abrir Dialog → pressionar Escape → fecha
3. Abrir Dialog → clicar Cancelar → fecha sem salvar
4. Abrir AlertDialog exclusao → Cancelar → nao exclui

- [ ] **Step 5: Commit**

```bash
git commit -m "chore: validacao manual de categorias CRUD via dialog"
```

---

## Self-Review

**Spec coverage:**
- Criar categoria via Dialog: Task 2 + Task 4 ✓
- Editar categoria via Dialog: Task 2 + Task 4 ✓
- Excluir categoria com confirmacao: Task 3 ✓
- API PUT/DELETE: Task 1 ✓
- Colaborador sem botoes: Task 3 (`usePermission`) ✓
- Validacao client-side: Task 2 (`createCategoriaSchema.safeParse`) ✓
- Erro unicidade mantem dialog aberto: Task 2 (submitError handling) ✓
- Exclusao bloqueada com equipamentos: Task 1 (409), Task 3 (disabled button) ✓
- Dialog fecha via Cancelar/Escape/clique fora: Task 5 verification ✓

**Placeholder scan:** No TBD, TODO, vague descriptions. ✓

**Type consistency:** 
- `Categoria` interface in Task 3 matches `categoria?` prop in Task 2 ✓
- `onRefresh` callback consistent across Task 3 and Task 4 ✓
- API route params pattern matches existing routes (`params: Promise<{ id: string }>`) ✓
