# Plano de Implementação: CRUD via Diálogos para Equipamentos, Usuários e Checklists

**Branch**: `002-crud-dialogs` | **Data**: 2026-06-01 | **Spec**: [spec.md](./spec.md)

**Entrada**: Especificação da funcionalidade em `specs/002-crud-dialogs/spec.md`

## Sumário

Adicionar diálogos modais (Dialog do ShadCN UI) para criação e edição de equipamentos,
manipulação de usuários (criação, edição, ativar/inativar) e criação/edição de checklists
com perguntas dinâmicas. Cada Dialog opera em modo duplo (criação/edição): ao abrir
a partir do botão global "Novo X", os campos iniciam vazios; ao abrir a partir do
botão de ação em uma linha da tabela, os campos são preenchidos com os dados do
registro selecionado.

Feature exclusivamente de frontend — todos os endpoints de API e services já existem
e suportam as operações necessárias (POST para criar, PUT para editar).

Abordagem técnica: componentes Dialog autocontidos com validação Zod client-side,
integrados às views de listagem existentes via estado local e callbacks de atualização.

## Contexto Técnico

**Linguagem/Versão**: TypeScript 5.x (strict mode habilitado)

**Dependências Principais**: Next.js 16.2.7 (App Router), React 19+, TailwindCSS,
ShadCN UI (Dialog, AlertDialog, Select, Label, Textarea), Zod (schemas existentes)

**Armazenamento**: PostgreSQL via Prisma 7+ (sem alterações de schema — usa entidades existentes)

**Testes**: Vitest (unitários + viewmodels), Testing Library (componentes de dialog)

**Plataforma Alvo**: Navegadores web modernos (Chrome, Firefox, Edge, Safari), responsivo

**Tipo de Projeto**: Aplicação web full-stack (Next.js App Router) — feature de frontend

**Metas de Performance**: Abertura de diálogo < 500ms, submissão < 2s, atualização de listagem < 2s

**Restrições**: Apenas GESTOR pode criar/editar; COLABORADOR tem acesso somente leitura.
Sem alterações no schema Prisma. Sem novas dependências além do ShadCN Dialog.

**Escala/Escopo**: 3 views existentes modificadas (adição de botão global + coluna de ações
com botão Editar por linha), 1 view nova criada (checklists-list com botão global + ações),
3 componentes Dialog em modo duplo criação/edição, 1 componente AlertDialog de confirmação,
~6 novos arquivos.

## Verificação da Constituição

*GATE: Deve passar antes da pesquisa da Fase 0. Reavaliar após o design da Fase 1.*

| Princípio | Status | Evidência |
|-----------|--------|-----------|
| I. Arquitetura MVVM e Separação | ✅ PASSA | Dialogs serão componentes em `src/features/{dominio}/views/`. Views orquestram estado; lógica de API segue em services. Nenhuma lógica de negócio nova — apenas UI. |
| II. Clean Code e Simplicidade | ✅ PASSA | Reutiliza schemas Zod e endpoints existentes. Componentes autocontidos com responsabilidade única. Sem dependências novas além do ShadCN Dialog. |
| III. Segurança e Rastreabilidade | ✅ PASSA | Controle de acesso via `usePermission` (já existente). API routes já validam perfil GESTOR no backend (403 para colaborador). Auditoria via `Historico` já implementada nos services. |
| IV. Integridade de Dados e Regras de Negócio | ✅ PASSA | Validação dupla: Zod no client (safeParse) + Zod no servidor (API routes). Unicidade validada no backend. Transação atômica para checklist + perguntas já implementada no service. |
| V. Documentação em pt-BR | ✅ PASSA | Todos os artefatos em pt-BR. Código em inglês (convenções da stack). |

**Resultado**: Todos os gates passam. Nenhuma violação a justificar.

## Estrutura do Projeto

### Documentação (desta funcionalidade)

```text
specs/002-crud-dialogs/
├── spec.md                          # Especificação da funcionalidade
├── plan.md                          # Este arquivo (plano de implementação)
├── research.md                      # Fase 0: pesquisa e decisões técnicas
├── data-model.md                    # Fase 1: modelo de dados (referência ao existente)
├── quickstart.md                    # Fase 1: guia de execução rápida
├── contracts/                       # Fase 1: contratos de API consumidos
│   ├── equipamentos.yaml
│   ├── usuarios.yaml
│   └── checklists.yaml
└── tasks.md                         # Fase 2: lista de tarefas (criado por /speckit.tasks)
```

### Código Fonte (raiz do repositório)

```text
src/
├── features/
│   ├── equipamentos/
│   │   └── views/
│   │       ├── equipamentos-list.tsx          # [MODIFICAR] + botão global "Novo Equipamento" + botão "Editar" por linha
│   │       └── equipamento-form-dialog.tsx    # [NOVO] Dialog duplo: criação (campos vazios) e edição (campos preenchidos via prop `equipamento`). Submete POST ou PUT conforme modo.
│   ├── usuarios/
│   │   └── views/
│   │       ├── usuarios-list.tsx              # [MODIFICAR] + botão global "Novo Usuário" + coluna ações (Editar, Ativar/Inativar)
│   │       ├── usuario-form-dialog.tsx        # [NOVO] Dialog duplo: criação (campos vazios, inclui senha) e edição (campos preenchidos, sem campo senha). Submete POST ou PUT.
│   │       └── usuario-status-dialog.tsx      # [NOVO] AlertDialog de confirmação para toggle ATIVO/INATIVO
│   └── checklists/
│       └── views/
│           ├── checklists-list.tsx            # [NOVO] Componente de listagem com botão global "Novo Checklist" + botão "Editar" por linha
│           └── checklist-form-dialog.tsx      # [NOVO] Dialog duplo: criação (lista de perguntas vazia) e edição (perguntas carregadas do registro existente). Submete POST ou PUT.
├── components/
│   └── ui/
│       ├── dialog.tsx                         # [NOVO] ShadCN UI Dialog (instalar)
│       ├── alert-dialog.tsx                   # [EXISTENTE] ShadCN UI AlertDialog
│       ├── select.tsx                         # [NOVO] ShadCN UI Select (instalar)
│       ├── label.tsx                          # [NOVO] ShadCN UI Label (instalar)
│       └── textarea.tsx                       # [NOVO] ShadCN UI Textarea (instalar)
└── lib/
    └── validators.ts                          # [SEM ALTERAÇÃO] Schemas Zod já existentes
```

**Estrutura de Decisão**: Estrutura existente do projeto (Next.js App Router com MVVM). Novos componentes vão em `src/features/{dominio}/views/` seguindo o padrão. Componentes ShadCN UI adicionados via CLI em `src/components/ui/`.

## Complexity Tracking

> Nenhuma violação da constituição. Seção vazia.
