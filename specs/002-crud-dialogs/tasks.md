# Tasks: CRUD via Diálogos para Equipamentos, Usuários e Checklists

**Input**: Design documents from `specs/002-crud-dialogs/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested in specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Feature views**: `src/features/{dominio}/views/`
- **ShadCN UI components**: `src/components/ui/`
- **Schemas**: `src/lib/validators.ts` (already exists, no changes needed)
- **API routes**: `app/api/` (already exists, no changes needed)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install required ShadCN UI components not yet present in the project

- [x] T001 Install ShadCN UI Dialog component via `npx shadcn@latest add dialog`
- [x] T002 [P] Install ShadCN UI Select component via `npx shadcn@latest add select`
- [x] T003 [P] Install ShadCN UI Label component via `npx shadcn@latest add label`
- [x] T004 [P] Install ShadCN UI Textarea component via `npx shadcn@latest add textarea`

**Checkpoint**: ShadCN components available. AlertDialog already exists in project. Ready for user story implementation.

---

## Phase 2: User Story 1 - Criação e Edição de Equipamento via Diálogo (Priority: P1) 🎯 MVP

**Goal**: Gestor pode criar e editar equipamentos via diálogo modal na tela de listagem, com validação client-side e seleção de categoria. Colaborador vê apenas a listagem sem botões de ação.

**Independent Test**: Acessar tela de equipamentos como gestor, clicar "Novo Equipamento", preencher formulário, submeter, ver equipamento na listagem. Clicar "Editar" em uma linha, alterar dados, submeter, ver atualização refletida. Logar como colaborador e verificar que botões não aparecem.

### Implementation for User Story 1

- [x] T005 [P] [US1] Criar `src/features/equipamentos/views/equipamento-form-dialog.tsx` — Dialog duplo (criação/edição) com prop `equipamento?`: se undefined → POST com campos vazios; se definido → PUT com campos preenchidos. Campos: código patrimonial, nome, categoria (Select populado via GET /api/categorias), marca, modelo, número de série, descrição, data de aquisição, valor de aquisição, localização, observações. Validação com `createEquipamentoSchema.safeParse`. Prop `open` + `onOpenChange` + `onSuccess` callback.
- [x] T006 [US1] Modificar `src/features/equipamentos/views/equipamentos-list.tsx` — adicionar botão global "Novo Equipamento" (visível apenas se `isGestor`), adicionar botão "Editar" na coluna Ações de cada linha (visível apenas GESTOR), integrar `EquipamentoFormDialog` com estado local `dialogOpen` e `selectedEquipamento`. Callback `onSuccess` chama `fetchEquipamentos()`.

**Checkpoint**: US1 funcional — gestor cria e edita equipamentos via diálogo; colaborador não vê botões de ação.

---

## Phase 3: User Story 2 - Manipulação de Usuários via Diálogos (Priority: P1)

**Goal**: Gestor pode criar, editar e ativar/inativar usuários via diálogos modais na tela de listagem. Edição não expõe senha. Auto-inativação é bloqueada. Colaborador vê mensagem de acesso restrito.

**Independent Test**: Acessar tela de usuários como gestor, clicar "Novo Usuário", preencher formulário com senha, submeter, ver usuário na listagem. Clicar "Editar" em uma linha (sem campo senha), alterar dados, submeter. Clicar "Ativar"/"Inativar", confirmar no AlertDialog. Tentar inativar o próprio usuário e ver mensagem de erro. Logar como colaborador e ver tela de acesso restrito.

### Implementation for User Story 2

- [x] T007 [P] [US2] Criar `src/features/usuarios/views/usuario-form-dialog.tsx` — Dialog duplo (criação/edição) com prop `usuario?`: se undefined → POST com campos vazios (inclui campo senha obrigatório); se definido → PUT com campos preenchidos (sem campo senha). Campos: nome, email, matrícula, telefone, perfil (Select GESTOR/COLABORADOR), senha (apenas em criação). Validação com `createUsuarioSchema.safeParse` ou `updateUsuarioSchema.safeParse` conforme modo. Prop `open` + `onOpenChange` + `onSuccess` callback.
- [x] T008 [P] [US2] Criar `src/features/usuarios/views/usuario-status-dialog.tsx` — AlertDialog de confirmação para toggle ATIVO/INATIVO. Recebe prop `usuario`, `open`, `onOpenChange`, `onConfirm`. Texto: "Deseja [ativar/inativar] o usuário [nome]?". Impede auto-inativação: se `usuario.id === currentUser.id`, exibe erro e bloqueia confirmação. Submete `PUT /api/usuarios/:id` com `{ status: "ATIVO" | "INATIVO" }`.
- [x] T009 [US2] Modificar `src/features/usuarios/views/usuarios-list.tsx` — adicionar botão global "Novo Usuário" (visível apenas se `isGestor`), adicionar coluna "Ações" com botões "Editar" e "Ativar/Inativar" em cada linha (visíveis apenas GESTOR). Integrar `UsuarioFormDialog` e `UsuarioStatusDialog` com estados locais. Callback `onSuccess` chama `fetchUsuarios()`. Para colaborador, manter mensagem "Acesso restrito".

**Checkpoint**: US2 funcional — gestor gerencia usuários completamente via diálogos; colaborador bloqueado.

---

## Phase 4: User Story 3 - Criação e Edição de Checklists com Perguntas via Diálogo (Priority: P2)

**Goal**: Gestor pode criar e editar checklists com perguntas dinâmicas via diálogo modal na tela de listagem. Perguntas são adicionadas/removidas dinamicamente no formulário. Colaborador vê apenas a listagem sem botões de ação.

**Independent Test**: Acessar tela de checklists como gestor, clicar "Novo Checklist", preencher nome, selecionar tipo, adicionar perguntas, remover uma, submeter, ver checklist na listagem. Clicar "Editar" em uma linha, ver perguntas carregadas, alterar nome, adicionar/remover perguntas, submeter. Logar como colaborador e verificar que botões não aparecem.

### Implementation for User Story 3

- [x] T010 [P] [US3] Criar `src/features/checklists/views/checklists-list.tsx` — componente de listagem extraído da página. Recebe prop `checklists` e `onRefresh`. Exibe tabela com colunas: Nome, Tipo, Perguntas (contagem), Ações. Botão global "Novo Checklist" visível apenas GESTOR. Botão "Editar" em cada linha visível apenas GESTOR. Estados locais para controlar abertura dos dialogs.
- [x] T011 [P] [US3] Criar `src/features/checklists/views/checklist-form-dialog.tsx` — Dialog duplo (criação/edição) com prop `checklist?`: se undefined → POST com campos vazios e lista de perguntas vazia; se definido → PUT com campos preenchidos e perguntas carregadas (busca via `GET /api/checklists/:id` ao abrir). Campos: nome (Input), tipo (Select SAIDA/DEVOLUCAO), lista dinâmica de perguntas (cada pergunta: Input texto, Checkbox obrigatória, número ordem, botão Remover). Botão "Adicionar pergunta" expande lista. Validação: mínimo 1 pergunta, texto mínimo 5 caracteres, com `createChecklistSchema.safeParse`. Prop `open` + `onOpenChange` + `onSuccess` callback.
- [x] T012 [US3] Modificar `app/(dashboard)/checklists/page.tsx` — substituir lógica inline atual pelo componente `ChecklistsList`. Manter fetch via `/api/checklists` no useEffect da página. Passar `checklists` e callback `onRefresh` que refaz o fetch. Page mantém-se como wrapper fino (conforme MVVM), delegando UI para o componente em `views/`.

**Checkpoint**: US3 funcional — gestor cria e edita checklists com perguntas dinâmicas; colaborador vê listagem sem botões.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validação final e ajustes de consistência

- [x] T013 [P] Verificar que todos os dialogs fecham via botão Cancelar, clique fora (Dialog do ShadCN) e tecla Escape
- [x] T014 [P] Verificar que erros de unicidade (código patrimonial, e-mail, matrícula) mantêm o diálogo aberto com dados preenchidos
- [x] T015 Executar checklist de validação do quickstart.md em todas as 3 telas (equipamentos, usuários, checklists) com ambos os perfis (GESTOR e COLABORADOR)
- [x] T016 [P] Verificar responsividade: dialogs funcionam corretamente em viewport mobile (largura < 768px)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **User Story 1 (Phase 2)**: Depends on Setup (ShadCN Dialog, Select, Label, Textarea installed)
- **User Story 2 (Phase 3)**: Depends on Setup. Independent from US1.
- **User Story 3 (Phase 4)**: Depends on Setup. Independent from US1 and US2.
- **Polish (Phase 5)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other stories. Independent.
- **User Story 2 (P1)**: No dependencies on other stories. Independent.
- **User Story 3 (P2)**: No dependencies on other stories. Independent.

### Within Each User Story

- Create new components before modifying existing views
- Tasks marked [P] within a story can run in parallel
- Modification task (last in story) depends on new components being created

### Parallel Opportunities

- T001, T002, T003, T004 can run in parallel (different ShadCN components)
- T005 (Equipamento dialog) and T007 + T008 (Usuário dialogs) can run in parallel (different domains)
- T010 and T011 (Checklist components) can run in parallel (different files)
- US1, US2, US3 can start in parallel after Phase 1

---

## Parallel Example: User Story 2

```bash
# Launch independent new components together:
Task: "Criar usuario-form-dialog.tsx"
Task: "Criar usuario-status-dialog.tsx"

# After both complete:
Task: "Modificar usuarios-list.tsx to integrate both dialogs"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (install ShadCN components)
2. Complete Phase 2: User Story 1 (Equipamentos create/edit dialog)
3. **STOP and VALIDATE**: Test US1 independently as gestor and colaborador
4. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup → ShadCN components ready
2. Add US1 (Equipamentos) → Test independently → MVP
3. Add US2 (Usuários) → Test independently → Deploy/Demo
4. Add US3 (Checklists) → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Developer completes Setup (Phase 1)
2. Once Setup is done:
   - Developer A: User Story 1 (Equipamentos)
   - Developer B: User Story 2 (Usuários)
   - Developer C: User Story 3 (Checklists)
3. Stories complete and integrate independently — no cross-story conflicts

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- All API endpoints and Prisma services already exist — no backend changes needed
- Zod schemas in `src/lib/validators.ts` are reused client-side without modification
- ShadCN AlertDialog already exists in project (`@radix-ui/react-alert-dialog` in package.json)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
