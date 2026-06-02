# Acessorios nos Equipamentos — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar secao de acessorios no Dialog de equipamento (criar/editar/remover) e implementar pagina de detalhes do equipamento com todos os dados + tabela de acessorios.

**Architecture:** 2 arquivos modificados. Dialog ganha secao dinamica de acessorios (mesmo padrao do checklist-form-dialog). Pagina de detalhes busca API e exibe em grid + tabela.

**Tech Stack:** Next.js 16 App Router, React 19, TailwindCSS, ShadCN UI (Dialog, Button, Input, Label, Textarea, Select, Badge), Zod

---

### Task 1: Secao Acessorios no EquipamentoFormDialog

**Files:**
- Modify: `src/features/equipamentos/views/equipamento-form-dialog.tsx` (add acessorios section + sync logic)

- [ ] **Step 1: Add acessorio interface and state**

Insert after line 38 (after the Equipamento interface, before Props):

```tsx
interface AcessorioInput {
  tempId: string;
  id?: string;
  nome: string;
  codigo_interno: string;
  descricao: string;
  ativo: boolean;
}
```

Insert after line 65 (`const [loading, setLoading] = useState(false);`):

```tsx
  const [acessorios, setAcessorios] = useState<AcessorioInput[]>([]);
  const [acessorioError, setAcessorioError] = useState("");
```

- [ ] **Step 2: Load existing acessorios in edit mode**

Inside the `useEffect` block (after the `if (equipamento) { ... }` block that sets form fields, around line 92), add:

```tsx
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
```

And in the else branch (creation mode), add after the `setForm(...)` call:

```tsx
        setAcessorios([]);
```

Also add `setAcessorioError("");` next to the existing `setErrors({}); setSubmitError("");`.

- [ ] **Step 3: Add acessorio helper functions**

Insert before `handleSubmit` (around line 124):

```tsx
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
```

- [ ] **Step 4: Modify handleSubmit to sync acessorios**

Replace the `handleSubmit` function (lines 124-183) with the new version that saves equipamento first, then syncs acessorios:

```tsx
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

      const existingIds = acessorios.filter((a) => a.id).map((a) => a.id!);
      const removedIds = isEdit
        ? (() => {
            const currentIds = acessorios.filter((a) => a.id).map((a) => a.id!);
            return [] as string[];
          })()
        : [];

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
```

- [ ] **Step 5: Add acessorios UI section in JSX**

Insert after the observacoes Textarea block (after line 284, before `</div>` that closes the grid, before `<DialogFooter>`):

```tsx
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
                <span className="text-xs text-gray-400 mt-2 w-6">{idx + 1}.</span>
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
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
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
            <p className="text-sm text-gray-400">Nenhum acessorio adicionado.</p>
          )}
        </div>

        <DialogFooter>
```

- [ ] **Step 6: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | Select-String "equipamento-form-dialog"
```

Expected: no output.

- [ ] **Step 7: Commit**

```bash
git add src/features/equipamentos/views/equipamento-form-dialog.tsx
git commit -m "feat: adiciona secao de acessorios no dialog de equipamento"
```

---

### Task 2: Implementar Pagina de Detalhes do Equipamento

**Files:**
- Modify: `app/(dashboard)/equipamentos/[id]/page.tsx` (replace placeholder)

- [ ] **Step 1: Check Badge component availability**

```bash
Test-Path "src/components/ui/badge.tsx"
```

If it doesn't exist, stop here and we need to create it. If it exists, continue.

**Note:** Badge exists at `src/components/ui/badge.tsx`. If not, create:

```tsx
export function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>
      {children}
    </span>
  );
}
```

- [ ] **Step 2: Replace the page with full implementation**

Replace the entire content of `app/(dashboard)/equipamentos/[id]/page.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/card";
import { STATUS_EQUIPAMENTO_LABELS, STATUS_EQUIPAMENTO_COLORS } from "@/src/lib/constants";

interface Acessorio {
  id: string;
  nome: string;
  codigo_interno?: string;
  descricao?: string;
  status: string;
}

interface EquipamentoDetail {
  id: string;
  codigo_patrimonial: string;
  nome: string;
  categoria?: { nome: string };
  marca?: string;
  modelo?: string;
  numero_serie?: string;
  descricao?: string;
  data_aquisicao?: string;
  valor_aquisicao?: number;
  localizacao?: string;
  observacoes?: string;
  status: string;
  acessorios: Acessorio[];
}

function fmtDate(iso?: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

function fmtCurrency(val?: number) {
  if (val == null) return "-";
  return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function EquipamentoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [equip, setEquip] = useState<EquipamentoDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    fetch(`/api/equipamentos/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setEquip(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="p-4 text-gray-500">Carregando...</div>;
  }

  if (!equip) {
    return <div className="p-4 text-gray-500">Equipamento nao encontrado.</div>;
  }

  const infoRows = [
    { label: "Codigo Patrimonial", value: equip.codigo_patrimonial },
    { label: "Categoria", value: equip.categoria?.nome || "-" },
    { label: "Marca", value: equip.marca || "-" },
    { label: "Modelo", value: equip.modelo || "-" },
    { label: "Numero de Serie", value: equip.numero_serie || "-" },
    { label: "Localizacao", value: equip.localizacao || "-" },
    { label: "Data de Aquisicao", value: fmtDate(equip.data_aquisicao) },
    { label: "Valor de Aquisicao", value: fmtCurrency(equip.valor_aquisicao) },
  ];

  return (
    <div>
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
        &larr; Voltar
      </Button>

      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold">{equip.nome}</h2>
        <Badge className={STATUS_EQUIPAMENTO_COLORS[equip.status as keyof typeof STATUS_EQUIPAMENTO_COLORS] || ""}>
          {STATUS_EQUIPAMENTO_LABELS[equip.status as keyof typeof STATUS_EQUIPAMENTO_LABELS]}
        </Badge>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Detalhes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {infoRows.map((row) => (
              <div key={row.label}>
                <p className="text-xs text-gray-500">{row.label}</p>
                <p className="text-sm">{row.value}</p>
              </div>
            ))}
          </div>
          {(equip.descricao || equip.observacoes) && (
            <div className="mt-4 space-y-2">
              {equip.descricao && (
                <div>
                  <p className="text-xs text-gray-500">Descricao</p>
                  <p className="text-sm">{equip.descricao}</p>
                </div>
              )}
              {equip.observacoes && (
                <div>
                  <p className="text-xs text-gray-500">Observacoes</p>
                  <p className="text-sm">{equip.observacoes}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Acessorios ({equip.acessorios?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {equip.acessorios?.length > 0 ? (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3">Nome</th>
                  <th className="text-left p-3">Codigo Interno</th>
                  <th className="text-left p-3">Descricao</th>
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {equip.acessorios.map((a) => (
                  <tr key={a.id} className="border-t">
                    <td className="p-3">{a.nome}</td>
                    <td className="p-3">{a.codigo_interno || "-"}</td>
                    <td className="p-3">{a.descricao || "-"}</td>
                    <td className="p-3">
                      <Badge className={a.status === "ATIVO" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {a.status === "ATIVO" ? "Ativo" : "Inativo"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="p-4 text-gray-500">Nenhum acessorio vinculado.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | Select-String "page.tsx"
```

Expected: no output related to `equipamentos/[id]/page.tsx`.

- [ ] **Step 4: Commit**

```bash
git add "app/(dashboard)/equipamentos/[id]/page.tsx"
git commit -m "feat: implementa pagina de detalhes do equipamento com acessorios"
```

---

### Task 3: Integration Validation

**Files:** None (manual)

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Test equipamento dialog with acessorios (GESTOR)**

1. Clicar "Novo Equipamento" → preencher campos → adicionar 2 acessorios → Salvar
2. Clicar "Editar" no equipamento criado → ver acessorios carregados → editar nome de um → adicionar um novo → remover um → Salvar
3. Clicar "Editar" novamente → verificar que alteracoes persistiram

- [ ] **Step 3: Test pagina de detalhes**

1. Clicar "Ver" em um equipamento → pagina carrega com todos os campos + tabela de acessorios
2. Verificar badge de status do equipamento
3. Verificar badge de status de cada acessorio (Ativo/Inativo)

- [ ] **Step 4: Test as COLABORADOR**

1. Logar como colaborador → clicar "Ver" em um equipamento → pagina de detalhes carrega normalmente
2. Na listagem de equipamentos → nao ve botoes "Novo Equipamento" nem "Editar"

- [ ] **Step 5: Commit**

```bash
git commit -m "chore: validacao manual de acessorios e detalhes do equipamento"
```

---

## Self-Review

**Spec coverage:**
- Secao acessorios no dialog (add/remove/edit): Task 1 Steps 1-5 ✓
- Criacao: salvar equipamento → criar acessorios: Task 1 Step 4 ✓
- Edicao: salvar equipamento → PUT acessorios existentes + POST novos: Task 1 Step 4 ✓
- Pagina de detalhes com todos os campos: Task 2 Step 2 ✓
- Tabela de acessorios na pagina de detalhes: Task 2 Step 2 ✓
- Somente leitura na pagina de detalhes: Task 2 Step 2 (sem botoes de acao) ✓

**Placeholder scan:** No TBD, TODO, or vague descriptions. All code is explicit. ✓

**Type consistency:**
- `AcessorioInput.tempId` used consistently in add/remove/update functions ✓
- `EquipamentoDetail` interface matches API response structure ✓
- Badge and STATUS constants imported from existing files ✓
