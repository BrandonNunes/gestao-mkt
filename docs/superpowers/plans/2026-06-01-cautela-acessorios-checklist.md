# Cautela com Acessorios e Checklist — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar selecao de acessorios e checklist de saida na tela de criacao de cautela, implementar pagina de detalhes com botao emitir, e criar entidade CautelaAcessorio no banco.

**Architecture:** Nova entidade N:N CautelaAcessorio (schema Prisma + migration). Service ajustado para aceitar `acessorio_ids`. Nova pagina de criacao com equipamentos + acessorios aninhados + checklist opcional. Novo Dialog `CautelaEmitirDialog` compartilhado entre criacao e detalhes. Pagina de detalhes implementada.

**Tech Stack:** Next.js 16 App Router, React 19, Prisma 7+, PostgreSQL, TailwindCSS, ShadCN UI

---

### Task 1: Migration — CautelaAcessorio

**Files:**
- Modify: `prisma/schema.prisma` (add model + relation)

- [ ] **Step 1: Add CautelaAcessorio to schema**

After line 168 (end of model Cautela, before `model CautelaEquipamento`), add `acessorios CautelaAcessorio[]` inside `model Cautela`:

```prisma
  equipamentos CautelaEquipamento[]
  respostas   RespostaChecklist[]
  acessorios  CautelaAcessorio[]
```

After model `CautelaEquipamento` (around line 180), add the new model:

```prisma
model CautelaAcessorio {
  id           String @id @default(uuid())
  cautela_id   String
  acessorio_id String

  cautela   Cautela   @relation(fields: [cautela_id], references: [id])
  acessorio Acessorio @relation(fields: [acessorio_id], references: [id])

  @@index([cautela_id])
  @@index([acessorio_id])
}
```

- [ ] **Step 2: Run migration**

```bash
npx prisma migrate dev --name add_cautela_acessorio
```

Expected: migration created and applied successfully.

- [ ] **Step 3: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: adiciona entidade CautelaAcessorio (N:N)"
```

---

### Task 2: API — Service + Validator + Route

**Files:**
- Modify: `src/lib/validators.ts` (+ `acessorio_ids`)
- Modify: `src/features/cautelas/services/cautelas.service.ts` (+ acessorios in create, getById)
- Modify: `app/api/cautelas/route.ts` (pass `acessorio_ids`)

- [ ] **Step 1: Update validators.ts**

Change line 80-84 — add `acessorio_ids`:

```typescript
export const createCautelaSchema = z.object({
  usuario_id: z.string().uuid(),
  equipamento_ids: z.array(z.string().uuid()).min(1, "Selecione pelo menos um equipamento"),
  acessorio_ids: z.array(z.string().uuid()).optional(),
  data_prevista_retorno: z.string().datetime(),
});
```

- [ ] **Step 2: Update cautelas.service.ts — create function**

In `src/features/cautelas/services/cautelas.service.ts`, replace the `create` function (lines 4-31):

```typescript
export async function create(data: {
  usuario_id: string;
  equipamento_ids: string[];
  acessorio_ids?: string[];
  data_prevista_retorno: string;
}) {
  const equipamentos = await prisma.equipamento.findMany({
    where: { id: { in: data.equipamento_ids }, deletedAt: null },
  });

  const indisponiveis = equipamentos.filter((e) => e.status !== StatusEquipamento.DISPONIVEL);
  if (indisponiveis.length > 0) {
    throw new Error(
      `Equipamentos indisponiveis: ${indisponiveis.map((e) => `${e.nome} (${e.status})`).join(", ")}`,
    );
  }

  return prisma.cautela.create({
    data: {
      usuario_id: data.usuario_id,
      createdBy_id: data.usuario_id,
      data_prevista_retorno: new Date(data.data_prevista_retorno),
      equipamentos: {
        create: data.equipamento_ids.map((eid) => ({ equipamento_id: eid })),
      },
      acessorios: data.acessorio_ids?.length
        ? {
            create: data.acessorio_ids.map((aid) => ({ acessorio_id: aid })),
          }
        : undefined,
    },
    include: { equipamentos: true, usuario: true },
  });
}
```

- [ ] **Step 3: Update cautelas.service.ts — getById function**

In the `getById` function (lines 175-194), add `acessorios` to the include:

Replace the include block inside `getById`:

```typescript
      include: {
        usuario: true,
        createdBy: true,
        equipamentos: {
          include: {
            equipamento: {
              include: {
                categoria: true,
                acessorios: { where: { deletedAt: null } },
              },
            },
          },
        },
        acessorios: {
          include: {
            acessorio: true,
          },
        },
        respostas: { include: { pergunta: true } },
      },
```

- [ ] **Step 4: Update cautelas/route.ts — POST**

In `app/api/cautelas/route.ts`, in the POST handler (around line 27), pass `acessorio_ids` to the service. Replace lines 26-35:

```typescript
  const body = await request.json();
  const parsed = createCautelaSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  try {
    const cautela = await cautelasService.create({
      usuario_id: parsed.data.usuario_id,
      equipamento_ids: parsed.data.equipamento_ids,
      acessorio_ids: parsed.data.acessorio_ids,
      data_prevista_retorno: parsed.data.data_prevista_retorno,
    });
    return NextResponse.json(cautela, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erro" }, { status: 422 });
  }
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | Select-String "cautelas"
```

Expected: no new errors.

- [ ] **Step 6: Commit**

```bash
git add src/lib/validators.ts src/features/cautelas/services/cautelas.service.ts app/api/cautelas/route.ts
git commit -m "feat: adiciona acessorio_ids na criacao de cautela e no getById"
```

---

### Task 3: CautelaEmitirDialog Component

**Files:**
- Create: `src/features/cautelas/views/cautela-emitir-dialog.tsx`

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
import { Label } from "@/src/components/ui/label";
import { Select } from "@/src/components/ui/select";

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

export default function CautelaEmitirDialog({ open, onOpenChange, cautelaId, onSuccess }: Props) {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [selectedChecklist, setSelectedChecklist] = useState("");
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [respostas, setRespostas] = useState<Record<string, boolean | null>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setError("");
      setSelectedChecklist("");
      setPerguntas([]);
      setRespostas({});
      setLoading(false);

      const token = localStorage.getItem("accessToken");
      fetch("/api/checklists?tipo=SAIDA", {
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
      const res = await fetch(`/api/cautelas/${cautelaId}/emitir`, {
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
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Erro ao emitir cautela");
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
          <DialogTitle>Emitir Cautela — Checklist de Saida</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">{error}</div>
        )}

        <div>
          <Label htmlFor="checklist">Checklist de Saida *</Label>
          <Select
            id="checklist"
            value={selectedChecklist}
            onChange={(e) => handleChecklistChange(e.target.value)}
            options={checklists.map((c) => ({ value: c.id, label: c.nome }))}
            placeholder="Selecione um checklist"
          />
        </div>

        {perguntas.length > 0 && (
          <div className="space-y-3 max-h-64 overflow-y-auto">
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
                      name={`p_${p.id}`}
                      checked={respostas[p.id] === true}
                      onChange={() => handleResposta(p.id, true)}
                    />
                    Sim
                  </label>
                  <label className="flex items-center gap-1 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name={`p_${p.id}`}
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

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Emitindo..." : "Confirmar Emissao"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | Select-String "cautela-emitir-dialog"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/features/cautelas/views/cautela-emitir-dialog.tsx
git commit -m "feat: adiciona CautelaEmitirDialog (checklist saida)"
```

---

### Task 4: Pagina Cautelas — Nova (refatorar)

**Files:**
- Modify: `app/(dashboard)/cautelas/nova/page.tsx` (complete rewrite)

- [ ] **Step 1: Rewrite the page**

Replace entire content of `app/(dashboard)/cautelas/nova/page.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import CautelaEmitirDialog from "@/src/features/cautelas/views/cautela-emitir-dialog";

interface Acessorio {
  id: string;
  nome: string;
  status: string;
}

export default function NovaCautelaPage() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [equipamentos, setEquipamentos] = useState<any[]>([]);
  const [selectedUsuario, setSelectedUsuario] = useState("");
  const [selectedEquipamentos, setSelectedEquipamentos] = useState<string[]>([]);
  const [selectedAcessorios, setSelectedAcessorios] = useState<string[]>([]);
  const [acessoriosMap, setAcessoriosMap] = useState<Record<string, Acessorio[]>>({});
  const [dataRetorno, setDataRetorno] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cautelaCriadaId, setCautelaCriadaId] = useState<string | null>(null);
  const [emitirOpen, setEmitirOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    fetch("/api/usuarios?status=ATIVO&limit=100", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setUsuarios(d.data || []));

    fetch("/api/equipamentos/disponiveis", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setEquipamentos(data || []);
      });
  }, []);

  const toggleEquipamento = async (id: string) => {
    if (selectedEquipamentos.includes(id)) {
      setSelectedEquipamentos((prev) => prev.filter((e) => e !== id));
      setSelectedAcessorios((prev) => prev.filter((a) => {
        const equipAcessorios = acessoriosMap[id] || [];
        return !equipAcessorios.some((ac) => ac.id === a);
      }));
      setAcessoriosMap((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } else {
      setSelectedEquipamentos((prev) => [...prev, id]);
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`/api/equipamentos/${id}/acessorios`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const acessoriosData = (data || []).filter((a: Acessorio) => a.status === "ATIVO");
      setAcessoriosMap((prev) => ({ ...prev, [id]: acessoriosData }));
      setSelectedAcessorios((prev) => [
        ...prev,
        ...acessoriosData.map((a: Acessorio) => a.id),
      ]);
    }
  };

  const toggleAcessorio = (acessorioId: string) => {
    setSelectedAcessorios((prev) =>
      prev.includes(acessorioId)
        ? prev.filter((a) => a !== acessorioId)
        : [...prev, acessorioId],
    );
  };

  const createCautela = async () => {
    if (!selectedUsuario || selectedEquipamentos.length === 0 || !dataRetorno) {
      setError("Preencha todos os campos obrigatorios.");
      return null;
    }

    setError("");
    setLoading(true);
    const token = localStorage.getItem("accessToken");

    try {
      const res = await fetch("/api/cautelas", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          usuario_id: selectedUsuario,
          equipamento_ids: selectedEquipamentos,
          acessorio_ids: selectedAcessorios.length > 0 ? selectedAcessorios : undefined,
          data_prevista_retorno: new Date(dataRetorno).toISOString(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Erro ao criar cautela");
        setLoading(false);
        return null;
      }

      const data = await res.json();
      setLoading(false);
      return data.id as string;
    } catch {
      setError("Erro de rede. Tente novamente.");
      setLoading(false);
      return null;
    }
  };

  const handleSalvarRascunho = async () => {
    const id = await createCautela();
    if (id) router.push("/cautelas");
  };

  const handleEmitir = async () => {
    const id = await createCautela();
    if (id) {
      setCautelaCriadaId(id);
      setEmitirOpen(true);
    }
  };

  const handleEmitirSuccess = () => {
    router.push("/cautelas");
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Nova Cautela</h2>
      {error && <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-md">{error}</div>}

      <div className="space-y-6 max-w-2xl">
        <div>
          <Label htmlFor="colaborador">Colaborador *</Label>
          <select
            id="colaborador"
            className="w-full border rounded-md p-2 text-sm"
            value={selectedUsuario}
            onChange={(e) => setSelectedUsuario(e.target.value)}
          >
            <option value="">Selecione...</option>
            {usuarios.map((u: any) => (
              <option key={u.id} value={u.id}>
                {u.nome} — {u.matricula}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="dataRetorno">Data Prevista de Retorno *</Label>
          <Input
            id="dataRetorno"
            type="datetime-local"
            value={dataRetorno}
            onChange={(e) => setDataRetorno(e.target.value)}
          />
        </div>

        <div>
          <Label>Equipamentos Disponiveis *</Label>
          <div className="space-y-1 max-h-80 overflow-y-auto border rounded-md p-2 mt-1">
            {equipamentos.map((e: any) => (
              <div key={e.id}>
                <label className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedEquipamentos.includes(e.id)}
                    onChange={() => toggleEquipamento(e.id)}
                  />
                  <span>
                    {e.nome} ({e.codigo_patrimonial})
                  </span>
                </label>
                {selectedEquipamentos.includes(e.id) && acessoriosMap[e.id] && (
                  <div className="ml-8 space-y-1 mb-1">
                    {(acessoriosMap[e.id] || []).map((a) => (
                      <label
                        key={a.id}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedAcessorios.includes(a.id)}
                          onChange={() => toggleAcessorio(a.id)}
                        />
                        {a.nome}
                      </label>
                    ))}
                    {(acessoriosMap[e.id] || []).length === 0 && (
                      <p className="text-xs text-gray-400">Sem acessorios</p>
                    )}
                  </div>
                )}
              </div>
            ))}
            {equipamentos.length === 0 && (
              <p className="text-sm text-gray-400 p-2">Nenhum equipamento disponivel.</p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSalvarRascunho} disabled={loading}>
            Salvar Rascunho
          </Button>
          <Button onClick={handleEmitir} disabled={loading}>
            {loading ? "Salvando..." : "Emitir Cautela"}
          </Button>
        </div>
      </div>

      {cautelaCriadaId && (
        <CautelaEmitirDialog
          open={emitirOpen}
          onOpenChange={setEmitirOpen}
          cautelaId={cautelaCriadaId}
          onSuccess={handleEmitirSuccess}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | Select-String "nova.*page"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add "app/(dashboard)/cautelas/nova/page.tsx"
git commit -m "feat: refatora nova cautela com acessorios e emitir via dialog"
```

---

### Task 5: Pagina Detalhes da Cautela

**Files:**
- Modify: `app/(dashboard)/cautelas/[id]/page.tsx` (replace placeholder)

- [ ] **Step 1: Replace the page**

Replace entire content of `app/(dashboard)/cautelas/[id]/page.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePermission } from "@/src/hooks/use-permission";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/card";
import { STATUS_CAUTELA_LABELS, STATUS_CAUTELA_COLORS } from "@/src/lib/constants";
import CautelaEmitirDialog from "@/src/features/cautelas/views/cautela-emitir-dialog";

interface CautelaDetail {
  id: string;
  numero: number;
  status: string;
  data_emissao: string;
  data_prevista_retorno: string;
  data_retirada?: string;
  data_retorno?: string;
  observacoes?: string;
  usuario: { nome: string; matricula: string };
  createdBy: { nome: string };
  equipamentos: {
    equipamento: {
      id: string;
      nome: string;
      codigo_patrimonial: string;
    };
  }[];
  acessorios?: {
    acessorio: {
      id: string;
      nome: string;
    };
  }[];
  respostas?: {
    resposta: boolean;
    pergunta: { pergunta: string };
  }[];
}

function fmtDate(iso?: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export default function CautelaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isGestor } = usePermission();
  const id = params.id as string;
  const [cautela, setCautela] = useState<CautelaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [emitirOpen, setEmitirOpen] = useState(false);

  const fetchCautela = () => {
    const token = localStorage.getItem("accessToken");
    fetch(`/api/cautelas/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setCautela(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchCautela(); }, [id]);

  if (loading) return <div className="p-4 text-gray-500">Carregando...</div>;
  if (!cautela) return <div className="p-4 text-gray-500">Cautela nao encontrada.</div>;

  const showEmitir = isGestor && cautela.status === "ABERTA";

  return (
    <div>
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
        &larr; Voltar
      </Button>

      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold">Cautela #{cautela.numero || "-"}</h2>
        <Badge className={STATUS_CAUTELA_COLORS[cautela.status as keyof typeof STATUS_CAUTELA_COLORS] || ""}>
          {STATUS_CAUTELA_LABELS[cautela.status as keyof typeof STATUS_CAUTELA_LABELS]}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informacoes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="text-gray-500">Responsavel: </span>
              {cautela.usuario?.nome} ({cautela.usuario?.matricula})
            </div>
            <div>
              <span className="text-gray-500">Emitida por: </span>
              {cautela.createdBy?.nome || "-"}
            </div>
            <div>
              <span className="text-gray-500">Emissao: </span>
              {fmtDate(cautela.data_emissao)}
            </div>
            <div>
              <span className="text-gray-500">Prev. Retorno: </span>
              {fmtDate(cautela.data_prevista_retorno)}
            </div>
            <div>
              <span className="text-gray-500">Retirada: </span>
              {fmtDate(cautela.data_retirada)}
            </div>
            <div>
              <span className="text-gray-500">Devolucao: </span>
              {fmtDate(cautela.data_retorno)}
            </div>
            {cautela.observacoes && (
              <div>
                <span className="text-gray-500">Observacoes: </span>
                {cautela.observacoes}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Equipamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cautela.equipamentos?.map((ce) => (
                <div key={ce.equipamento.id} className="border rounded-md p-3">
                  <p className="font-medium text-sm">
                    {ce.equipamento.nome} ({ce.equipamento.codigo_patrimonial})
                  </p>
                  {cautela.acessorios && cautela.acessorios.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Acessorios:{" "}
                      {cautela.acessorios
                        .map((ca) => ca.acessorio.nome)
                        .join(", ")}
                    </p>
                  )}
                </div>
              ))}
              {(!cautela.equipamentos || cautela.equipamentos.length === 0) && (
                <p className="text-sm text-gray-400">Nenhum equipamento.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Checklist</CardTitle>
            {showEmitir && (
              <Button size="sm" onClick={() => setEmitirOpen(true)}>
                Emitir Cautela
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {cautela.respostas && cautela.respostas.length > 0 ? (
              <div className="space-y-2">
                {cautela.respostas.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Badge className={r.resposta ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {r.resposta ? "Sim" : "Nao"}
                    </Badge>
                    <span>{r.pergunta?.pergunta}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Nenhum checklist vinculado.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {showEmitir && (
        <CautelaEmitirDialog
          open={emitirOpen}
          onOpenChange={setEmitirOpen}
          cautelaId={cautela.id}
          onSuccess={fetchCautela}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Also update cautelas-list.tsx to show numero correctly**

In `src/features/cautelas/views/cautelas-list.tsx` line 62, the cell shows `c.numero || c.id.slice(0, 8)`. Update to use `c.numero` directly since it now exists:

```tsx
                    <td className="p-3 font-mono">{c.numero}</td>
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | Select-String "cautela"
```

Expected: only pre-existing errors.

- [ ] **Step 4: Commit**

```bash
git add "app/(dashboard)/cautelas/[id]/page.tsx" "src/features/cautelas/views/cautelas-list.tsx"
git commit -m "feat: implementa pagina de detalhes da cautela com emitir"
```

---

### Task 6: Integration Validation

**Files:** None (manual)

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Test fluxo completo de criacao com emissao (GESTOR)**

1. Ir para `/cautelas/nova`
2. Selecionar colaborador, data de retorno
3. Marcar equipamento → ver acessorios aninhados → selecionar alguns
4. Clicar "Emitir Cautela" → Dialog abre → selecionar checklist de saida
5. Responder perguntas obrigatorias → Confirmar Emissao
6. Verificar redirect para `/cautelas` com cautela criada

- [ ] **Step 3: Test criacao como rascunho**

1. Criar cautela sem selecionar checklist → "Salvar Rascunho"
2. Ir para detalhes da cautela → ver status ABERTA
3. Clicar "Emitir Cautela" → preencher checklist → emitir
4. Verificar status muda para EM_USO

- [ ] **Step 4: Test as COLABORADOR**

1. Logar como colaborador → ver listagem de cautelas (so as proprias)
2. Clicar "Ver" em uma cautela → pagina de detalhes carrega
3. Verificar que nao ha botao "Emitir Cautela" nem "Nova Cautela"

- [ ] **Step 5: Commit**

```bash
git commit -m "chore: validacao manual do fluxo de cautela com acessorios e checklist"
```

---

## Self-Review

**Spec coverage:**
- CautelaAcessorio migration: Task 1 ✓
- `acessorio_ids` no validator + service + route: Task 2 ✓
- CautelaEmitirDialog: Task 3 ✓
- Pagina nova cautela com acessorios aninhados: Task 4 ✓
- Pagina detalhes da cautela: Task 5 ✓
- Botao emitir nos detalhes (status ABERTA + GESTOR): Task 5 ✓
- Acessorios incluidos no getById: Task 2 Step 3 ✓
- Fluxo salvar rascunho vs emitir: Task 4 ✓

**Placeholder scan:** No TBD, TODO. All code is explicit. ✓

**Type consistency:**
- `CautelaAcessorio` model fields match service create usage ✓
- `CautelaEmitirDialog` props match usage in Task 4 and Task 5 ✓
- `createCautelaSchema.acessorio_ids` is `z.array(z.string().uuid()).optional()` ✓
