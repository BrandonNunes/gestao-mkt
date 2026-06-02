# Devolucao de Cautela — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar Dialog de devolucao na pagina de detalhes da cautela (checklist DEVOLUCAO + avarias) e exibir status ATRASADA visualmente quando data de retorno expirar.

**Architecture:** 1 novo componente (`CautelaDevolverDialog`) + modificacao na pagina de detalhes (funcao `getEffectiveStatus` + botao Devolver). Backend ja pronto.

**Tech Stack:** Next.js 16 App Router, React 19, TailwindCSS, ShadCN UI

---

### Task 1: CautelaDevolverDialog Component

**Files:**
- Create: `src/features/cautelas/views/cautela-devolver-dialog.tsx`

- [ ] **Step 1: Create the dialog**

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
import { Label } from "@/src/components/ui/label";
import { Select } from "@/src/components/ui/select";
import { Textarea } from "@/src/components/ui/textarea";

interface Checklist {
  id: string;
  nome: string;
  tipo: string;
}

interface Pergunta {
  id: string;
  pergunta: string;
  obrigatoria: boolean;
  ordem: number;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cautelaId: string;
  onSuccess: () => void;
}

export default function CautelaDevolverDialog({ open, onOpenChange, cautelaId, onSuccess }: Props) {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [selectedChecklist, setSelectedChecklist] = useState("");
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [respostas, setRespostas] = useState<Record<string, boolean | null>>({});
  const [temAvarias, setTemAvarias] = useState(false);
  const [avariasDescricao, setAvariasDescricao] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setError("");
      setSelectedChecklist("");
      setPerguntas([]);
      setRespostas({});
      setTemAvarias(false);
      setAvariasDescricao("");
      setObservacoes("");
      setLoading(false);

      const token = localStorage.getItem("accessToken");
      fetch("/api/checklists?tipo=DEVOLUCAO", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => setChecklists(data || []))
        .catch(() => {});
    }
  }, [open]);

  const handleChecklistChange = async (id: string) => {
    setSelectedChecklist(id);
    setRespostas({});
    setError("");

    if (!id) {
      setPerguntas([]);
      return;
    }

    const token = localStorage.getItem("accessToken");
    const res = await fetch(`/api/checklists/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setPerguntas(data.perguntas || []);
  };

  const handleResposta = (perguntaId: string, valor: boolean) => {
    setRespostas((prev) => ({ ...prev, [perguntaId]: valor }));
  };

  const handleSubmit = async () => {
    setError("");

    if (!selectedChecklist) {
      setError("Selecione um checklist.");
      return;
    }

    const faltantes = perguntas
      .filter((p) => p.obrigatoria && respostas[p.id] == null)
      .map((p) => p.pergunta);

    if (faltantes.length > 0) {
      setError(`Perguntas obrigatorias nao respondidas: ${faltantes.join(", ")}`);
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("accessToken");

    try {
      const res = await fetch(`/api/cautelas/${cautelaId}/devolver`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          checklist_id: selectedChecklist,
          respostas: Object.entries(respostas)
            .filter(([, v]) => v != null)
            .map(([pergunta_id, resposta]) => ({ pergunta_id, resposta })),
          tem_avarias: temAvarias,
          avarias_descricao: temAvarias ? avariasDescricao : undefined,
          observacoes: observacoes || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Erro ao devolver cautela");
        return;
      }

      onOpenChange(false);
      onSuccess();
    } catch {
      setError("Erro de rede. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Devolver Cautela — Checklist de Devolucao</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">{error}</div>
        )}

        <div>
          <Label htmlFor="checklist">Checklist de Devolucao *</Label>
          <Select
            id="checklist"
            value={selectedChecklist}
            onChange={(e) => handleChecklistChange(e.target.value)}
            options={checklists.map((c) => ({ value: c.id, label: c.nome }))}
            placeholder="Selecione um checklist"
          />
        </div>

        {perguntas.length > 0 && (
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {perguntas.map((p) => (
              <div key={p.id} className="border rounded-md p-3">
                <p className="text-sm mb-2">
                  {p.pergunta}
                  {p.obrigatoria && <span className="text-red-500 ml-1">*</span>}
                </p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name={`dp_${p.id}`}
                      checked={respostas[p.id] === true}
                      onChange={() => handleResposta(p.id, true)}
                    />
                    Sim
                  </label>
                  <label className="flex items-center gap-1 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name={`dp_${p.id}`}
                      checked={respostas[p.id] === false}
                      onChange={() => handleResposta(p.id, false)}
                    />
                    Nao
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}

        <div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={temAvarias}
              onChange={(e) => setTemAvarias(e.target.checked)}
              className="rounded"
            />
            Possui avarias?
          </label>
          {temAvarias && (
            <Textarea
              className="mt-2"
              placeholder="Descreva as avarias encontradas..."
              value={avariasDescricao}
              onChange={(e) => setAvariasDescricao(e.target.value)}
            />
          )}
        </div>

        <div>
          <Label htmlFor="observacoes">Observacoes</Label>
          <Textarea
            id="observacoes"
            placeholder="Observacoes adicionais (opcional)"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Devolvendo..." : "Confirmar Devolucao"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | Select-String "cautela-devolver-dialog"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/features/cautelas/views/cautela-devolver-dialog.tsx
git commit -m "feat: adiciona CautelaDevolverDialog (checklist devolucao + avarias)"
```

---

### Task 2: Atualizar Pagina de Detalhes

**Files:**
- Modify: `app/(dashboard)/cautelas/[id]/page.tsx` (+ getEffectiveStatus, + botao Devolver)

- [ ] **Step 1: Add getEffectiveStatus function**

In `app/(dashboard)/cautelas/[id]/page.tsx`, add after the `fmtDate` function (line 45):

```tsx
function getEffectiveStatus(c: { status: string; data_prevista_retorno: string; data_retorno: string | null }) {
  if (c.status === "EM_USO" && !c.data_retorno && new Date(c.data_prevista_retorno) < new Date()) {
    return "ATRASADA";
  }
  return c.status;
}
```

- [ ] **Step 2: Add import for CautelaDevolverDialog**

Add after the CautelaEmitirDialog import (line 10):

```tsx
import CautelaDevolverDialog from "@/src/features/cautelas/views/cautela-devolver-dialog";
```

- [ ] **Step 3: Add devolverOpen state**

After `const [emitirOpen, setEmitirOpen] = useState(false);` (line 54):

```tsx
  const [devolverOpen, setDevolverOpen] = useState(false);
```

- [ ] **Step 4: Compute effectiveStatus and showDevolver**

Replace line 74:

```tsx
  const showEmitir = isGestor && cautela.status === "ABERTA";
```

With:

```tsx
  const effectiveStatus = getEffectiveStatus(cautela);
  const showEmitir = isGestor && effectiveStatus === "ABERTA";
  const showDevolver = isGestor && (effectiveStatus === "EM_USO" || effectiveStatus === "ATRASADA");
```

- [ ] **Step 5: Use effectiveStatus for badge display**

Replace lines 83-86 (the Badge with status):

```tsx
        <Badge className={STATUS_CAUTELA_COLORS[effectiveStatus as keyof typeof STATUS_CAUTELA_COLORS] || ""}>
          {STATUS_CAUTELA_LABELS[effectiveStatus as keyof typeof STATUS_CAUTELA_LABELS]}
        </Badge>
```

**IMPORTANT**: The `effectiveStatus` variable is used instead of `cautela.status`.

- [ ] **Step 6: Add Devolver button next to Emitir button in the Checklist card header**

After the existing `{showEmitir && (...)}` button block in the CardHeader (around line 159-163), add:

```tsx
            {showDevolver && (
              <Button size="sm" onClick={() => setDevolverOpen(true)}>
                Devolver Cautela
              </Button>
            )}
```

- [ ] **Step 7: Add CautelaDevolverDialog at the end of the component**

After the existing `{showEmitir && (<CautelaEmitirDialog .../>)}` block (around line 184-191), add:

```tsx
      {showDevolver && (
        <CautelaDevolverDialog
          open={devolverOpen}
          onOpenChange={setDevolverOpen}
          cautelaId={cautela.id}
          onSuccess={fetchCautela}
        />
      )}
```

- [ ] **Step 8: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | Select-String "cautela"
```

Expected: only pre-existing errors.

- [ ] **Step 9: Commit**

```bash
git add "app/(dashboard)/cautelas/[id]/page.tsx"
git commit -m "feat: adiciona devolucao e status atrasada na pagina de detalhes"
```

---

### Task 3: Integration Validation

**Files:** None (manual)

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Test devolucao sem avarias (GESTOR)**

1. Criar e emitir uma cautela (status EM_USO)
2. Abrir detalhes da cautela → ver botao "Devolver Cautela"
3. Clicar "Devolver" → Dialog abre com checklists DEVOLUCAO
4. Selecionar checklist → responder perguntas → deixar "Possui avarias?" desmarcado
5. Confirmar → status muda para FINALIZADA, equipamentos voltam DISPONIVEL

- [ ] **Step 3: Test devolucao com avarias**

1. Criar e emitir outra cautela
2. Devolver com "Possui avarias?" marcado + descricao
3. Verificar status muda para PENDENTE, equipamentos AVARIADO

- [ ] **Step 4: Test status ATRASADA**

1. Criar cautela com data_prevista_retorno no passado (ex: ontem)
2. Emitir a cautela
3. Abrir detalhes → ver badge "Atrasada" (nao "Em Uso")
4. Ainda ve botao "Devolver Cautela"

- [ ] **Step 5: Test as COLABORADOR**

1. Logar como colaborador → ver detalhes de cautela propria
2. Verificar que badge de atraso aparece se aplicavel
3. Verificar que NAO ha botoes "Emitir" nem "Devolver"

- [ ] **Step 6: Commit**

```bash
git commit -m "chore: validacao manual de devolucao e status atrasada"
```

---

## Self-Review

**Spec coverage:**
- CautelaDevolverDialog (checklist DEVOLUCAO): Task 1 ✓
- Flag avarias + descricao: Task 1 ✓
- Observacoes: Task 1 ✓
- getEffectiveStatus para ATRASADA: Task 2 Step 1 ✓
- Badge usa effectiveStatus: Task 2 Step 5 ✓
- Botao Devolver visivel EM_USO/ATRASADA + GESTOR: Task 2 Step 4 ✓
- Botao Devolver nao visivel para COLABORADOR: Task 3 Step 5 ✓

**Placeholder scan:** No TBD, TODO. All code is explicit. ✓

**Type consistency:**
- `getEffectiveStatus` signature matches usage in `effectiveStatus` variable ✓
- `CautelaDevolverDialog` props match `CautelaEmitirDialog` pattern ✓
