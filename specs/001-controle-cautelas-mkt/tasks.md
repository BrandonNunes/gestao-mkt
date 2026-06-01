# Tarefas: Controle de Equipamentos e Cautelas do Setor de Marketing

**Entrada**: Design documents de `specs/001-controle-cautelas-mkt/`

**Pré-requisitos**: plan.md (obrigatório), spec.md (obrigatório), research.md, data-model.md, contracts/

**Organização**: Tarefas agrupadas por história de usuário para permitir implementação e teste independentes.

## Formato: `- [ ] [ID] [P?] [Story?] Descrição`

- **[P]**: Pode executar em paralelo (arquivos diferentes, sem dependências)
- **[Story]**: História de usuário à qual a tarefa pertence (US1, US2, etc.)
- Incluir caminhos exatos de arquivos nas descrições

---

## Phase 1: Setup (Infraestrutura Compartilhada)

**Propósito**: Inicialização do projeto, configuração de ferramentas e estrutura base

- [x] T001 Criar estrutura de diretórios do projeto conforme plan.md (app/, src/features/, src/components/, src/hooks/, src/lib/, prisma/, docker/)
- [x] T002 [P] Inicializar projeto Next.js 16.2.7 com TypeScript 5.x strict mode em package.json e tsconfig.json
- [x] T003 [P] Configurar TailwindCSS e ShadCN UI em tailwind.config.ts e src/lib/utils.ts
- [x] T004 [P] Instalar dependências: prisma @prisma/adapter-pg @prisma/client jose zod puppeteer minio bcryptjs recharts react-hook-form @hookform/resolvers
- [x] T005 [P] Configurar ESLint e Prettier (.eslintrc.json, .prettierrc)
- [x] T006 [P] Criar docker-compose.yml em docker/ com serviços PostgreSQL e MinIO
- [x] T007 [P] Criar Dockerfile em docker/ e nginx.conf em docker/
- [x] T008 [P] Criar .env.example e .env.local com variáveis de ambiente (DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, MINIO_*)
- [x] T009 Criar src/lib/constants.ts com enums de status (StatusEquipamento, StatusCautela, Perfil, TipoChecklist) e labels em pt-BR
- [x] T010 [P] Criar src/lib/utils.ts com helpers cn(), formatDate(), formatCurrency()

---

## Phase 2: Foundational (Pré-requisitos Bloqueantes)

**Propósito**: Infraestrutura core que DEVE estar completa antes de QUALQUER história de usuário

**⚠️ CRÍTICO**: Nenhuma história de usuário pode iniciar antes desta fase concluída

- [x] T011 Criar schema Prisma em prisma/schema.prisma com todas as entidades (Usuario, Categoria, Equipamento, Acessorio, Checklist, ChecklistPergunta, Cautela, CautelaEquipamento, RespostaChecklist, Historico), campos, relações, enums e índices; campo deletedAt em todas as tabelas; campo consentimento_lgpd e data_exclusao_lgpd em Usuario
- [x] T012 Executar migration inicial do Prisma (`npx prisma migrate dev --name init`) e `npx prisma generate`
- [x] T013 Criar src/lib/prisma.ts com Prisma client singleton (globalForPrisma, @prisma/adapter-pg, connectionString) conforme padrão Prisma 7 + Next.js
- [x] T014 [P] Criar src/lib/auth.ts com funções signAccessToken, signRefreshToken, verifyToken usando jose (HS256, encodedKey)
- [x] T015 [P] Criar src/lib/validators.ts com Zod schemas base (email, senha, uuid) e schemas de entrada por domínio (createUsuarioSchema, updateUsuarioSchema, createEquipamentoSchema, etc.)
- [x] T016 Criar src/middleware.ts com verificação JWT (jose jwtVerify do cookie accessToken), proteção de rotas /dashboard/*, redirect para /login, matcher config excluindo api/_next/static/_next/image
- [x] T017 [P] Criar src/hooks/use-auth.ts com AuthContext, AuthProvider (login, logout, refresh token, perfil, estado de autenticação)
- [x] T018 [P] Criar src/hooks/use-permission.ts com verificação de perfil (isGestor, isColaborador)
- [x] T019 [P] Criar src/hooks/use-pagination.ts e src/hooks/use-debounce.ts
- [x] T020 Criar app/layout.tsx (layout raiz com AuthProvider e ThemeProvider)
- [x] T021 Criar app/globals.css com diretivas Tailwind e variáveis CSS do ShadCN
- [x] T022 [P] Criar src/components/ui/ com wrappers ShadCN: button, input, select, dialog, table, card, toast, dropdown-menu, badge, separator, skeleton, tabs, date-picker, alert-dialog, form
- [x] T023 [P] Criar src/components/layout/sidebar.tsx com navegação por perfil (links condicionais Gestor/Colaborador)
- [x] T024 [P] Criar src/components/layout/header.tsx com breadcrumb, nome do usuário e logout
- [x] T025 [P] Criar src/components/data-table/data-table.tsx (tabela genérica com paginação, busca, ordenação)
- [x] T026 [P] Criar src/components/feedback/toast.tsx e src/components/feedback/loading.tsx (skeleton e spinner)

**Checkpoint**: Infraestrutura pronta — implementação das histórias de usuário pode iniciar em paralelo

---

## Phase 3: História de Usuário 1 — Autenticação e Gestão de Usuários (Prioridade: P1) 🎯 MVP

**Objetivo**: Login, logout, recuperação de senha e CRUD de usuários com perfis Gestor/Colaborador

**Teste Independente**: Criar usuários com perfis distintos, realizar login/logout, verificar controle de acesso via middleware e recuperação de senha

### Services (regras de negócio)

- [x] T027 [P] [US1] Criar src/features/auth/models/index.ts com interfaces LoginCredentials, AuthTokens, UsuarioPublic
- [x] T028 [US1] Criar src/features/auth/services/auth.service.ts com funções: login (validar credenciais, gerar tokens), refreshToken, logout, forgotPassword (token + envio email), resetPassword, changePassword
- [x] T029 [P] [US1] Criar src/features/usuarios/models/index.ts com interface UsuarioAdmin (campos completos)
- [x] T030 [US1] Criar src/features/usuarios/services/usuarios.service.ts com funções: list (paginado + filtros), getById, getMe, create (hash bcrypt, consentimento LGPD), update, softDelete, anonimizacaoLGPD

### API Routes

- [x] T031 [P] [US1] Criar app/api/auth/login/route.ts (POST — chama authService.login, seta cookie httpOnly refreshToken, retorna accessToken + usuario)
- [x] T032 [P] [US1] Criar app/api/auth/refresh/route.ts (POST — lê cookie refreshToken, chama authService.refreshToken, seta novo cookie)
- [x] T033 [P] [US1] Criar app/api/auth/logout/route.ts (POST — limpa cookie refreshToken)
- [x] T034 [P] [US1] Criar app/api/auth/forgot-password/route.ts (POST)
- [x] T035 [P] [US1] Criar app/api/auth/reset-password/route.ts (POST)
- [x] T036 [P] [US1] Criar app/api/auth/change-password/route.ts (POST — requer auth)
- [x] T037 [US1] Criar app/api/usuarios/route.ts (GET list paginado + POST create; GET protege com verificação de perfil GESTOR no handler)
- [x] T038 [US1] Criar app/api/usuarios/[id]/route.ts (GET, PUT, DELETE; proteção GESTOR)
- [x] T039 [US1] Criar app/api/usuarios/me/route.ts (GET — perfil do autenticado)

### Frontend

- [x] T040 [P] [US1] Criar src/features/auth/viewmodels/use-login.ts (hook com estado, validação Zod, chamada fetch API, redirect por perfil, setAuth)
- [x] T041 [P] [US1] Criar src/features/auth/viewmodels/use-forgot-password.ts e use-reset-password.ts
- [x] T042 [US1] Criar src/features/auth/views/login-form.tsx (formulário com validação, mensagem de erro, redirect)
- [x] T043 [P] [US1] Criar src/features/auth/views/forgot-password-form.tsx e reset-password-form.tsx
- [x] T044 [US1] Criar app/(auth)/login/page.tsx importando LoginForm
- [x] T045 [P] [US1] Criar app/(auth)/recuperar-senha/page.tsx
- [x] T046 [P] [US1] Criar app/(auth)/layout.tsx (layout simples sem sidebar)
- [x] T047 [P] [US1] Criar src/features/usuarios/viewmodels/use-usuarios.ts (listagem, paginação, filtros) e use-usuario-form.ts (criar/editar)
- [x] T048 [US1] Criar src/features/usuarios/views/usuarios-list.tsx (tabela: nome, email, matricula, perfil, status, ações)
- [x] T049 [P] [US1] Criar src/features/usuarios/views/usuario-form-dialog.tsx (modal CRUD com validação Zod)
- [x] T050 [US1] Criar app/(dashboard)/usuarios/page.tsx importando UsuariosList
- [x] T051 [US1] Criar app/(dashboard)/layout.tsx com verificação de autenticação (redirect /login se não autenticado) e sidebar
- [x] T052 [US1] Criar app/(dashboard)/page.tsx (redireciona para dashboard)

**Checkpoint**: Autenticação e gestão de usuários 100% funcionais

---

## Phase 4: História de Usuário 2 — Cadastro de Equipamentos, Categorias e Acessórios (Prioridade: P1)

**Objetivo**: CRUD completo de categorias, equipamentos (com máquina de estados) e acessórios vinculados

**Teste Independente**: Cadastrar categorias, equipamentos, vincular acessórios, verificar filtros e transições de status

### Services

- [x] T053 [P] [US2] Criar src/features/equipamentos/models/index.ts com interfaces Equipamento, Categoria, Acessorio, StatusEquipamento, FiltrosEquipamento, transicoesStatus (mapa de transições válidas)
- [x] T054 [US2] Criar src/features/equipamentos/services/equipamentos.service.ts com funções: list (paginado + filtros por status/categoria), getDisponiveis, getById (com acessórios), create (status inicial DISPONIVEL), update, updateStatus (validar transição), softDelete; validação de exclusão (impedir se emprestado)
- [x] T055 [P] [US2] Criar src/features/equipamentos/services/categorias.service.ts com CRUD e validação de exclusão (impedir se equipamentos vinculados)
- [x] T056 [P] [US2] Criar src/features/equipamentos/services/acessorios.service.ts com CRUD vinculado ao equipamento

### API Routes

- [x] T057 [P] [US2] Criar app/api/equipamentos/route.ts (GET list + POST create; proteção GESTOR no POST)
- [x] T058 [P] [US2] Criar app/api/equipamentos/disponiveis/route.ts (GET)
- [x] T059 [P] [US2] Criar app/api/equipamentos/[id]/route.ts (GET detail, PUT update, DELETE softDelete)
- [x] T060 [P] [US2] Criar app/api/equipamentos/[id]/status/route.ts (PUT — chama equipamentosService.updateStatus)
- [x] T061 [P] [US2] Criar app/api/equipamentos/[id]/acessorios/route.ts (GET list + POST create)
- [x] T062 [P] [US2] Criar app/api/acessorios/[id]/route.ts (PUT, DELETE)
- [x] T063 [P] [US2] Criar app/api/categorias/route.ts (GET list + POST create)
- [x] T064 [P] [US2] Criar app/api/categorias/[id]/route.ts (PUT, DELETE)

### Frontend

- [x] T065 [US2] Criar src/features/equipamentos/viewmodels/use-equipamentos.ts (listagem, filtros, paginação)
- [x] T066 [P] [US2] Criar src/features/equipamentos/viewmodels/use-equipamento-form.ts e use-equipamento-detail.ts
- [x] T067 [P] [US2] Criar src/features/equipamentos/viewmodels/use-categorias.ts e use-acessorios.ts
- [x] T068 [US2] Criar src/features/equipamentos/views/equipamentos-list.tsx (tabela: patrimônio, nome, categoria, status badge, ações; filtros)
- [x] T069 [P] [US2] Criar src/features/equipamentos/views/equipamento-form-dialog.tsx (modal com todos os campos)
- [x] T070 [P] [US2] Criar src/features/equipamentos/views/equipamento-detail.tsx (abas: dados, acessórios, histórico)
- [x] T071 [P] [US2] Criar src/features/equipamentos/views/status-badge.tsx e status-change-dialog.tsx
- [x] T072 [P] [US2] Criar src/features/equipamentos/views/acessorios-list.tsx e acessorio-form-dialog.tsx
- [x] T073 [US2] Criar app/(dashboard)/equipamentos/page.tsx e app/(dashboard)/equipamentos/[id]/page.tsx
- [x] T074 [P] [US2] Criar app/(dashboard)/categorias/page.tsx com CRUD inline

**Checkpoint**: Catálogo de equipamentos 100% funcional

---

## Phase 5: História de Usuário 3 — Emissão de Cautela com Validação e Checklist (Prioridade: P1)

**Objetivo**: CRUD de checklists, wizard de emissão de cautela (selecionar colaborador → equipamentos → validar disponibilidade → checklist saída → emitir), gerar PDF

**Teste Independente**: Criar checklists, emitir cautela completa, validar bloqueio de indisponíveis, gerar PDF

### Services

- [x] T075 [P] [US3] Criar src/features/checklists/models/index.ts com interfaces Checklist, ChecklistPergunta
- [x] T076 [US3] Criar src/features/checklists/services/checklists.service.ts com CRUD de checklists e perguntas
- [x] T077 [P] [US3] Criar src/features/cautelas/models/index.ts com interfaces Cautela, CautelaEquipamento, StatusCautela, ChecklistResposta
- [x] T078 [US3] Criar src/features/cautelas/services/cautelas.service.ts com funções:
  - create (status ABERTA, valida disponibilidade — FR-011)
  - preencherChecklistSaida (valida obrigatórias)
  - emitir (ABERTA → EM_USO, transação Prisma: atualiza cautela + equipamentos → EMPRESTADO — FR-013, gera número sequencial — FR-014)
  - getById (detalhe completo com equipamentos, acessórios, checklists)
  - list (paginado + filtros por status, usuario, busca)
  - getMinhas (filtrado por usuario_id do autenticado)
  - gerarPDF (Puppeteer HTML→PDF, salva MinIO, retorna URL)
- [x] T079 [US3] Criar src/features/cautelas/services/auditoria.service.ts com função log(entidade, entidadeId, acao, usuarioId, detalhes) usada por todos os services

### API Routes

- [x] T080 [P] [US3] Criar app/api/checklists/route.ts (GET + POST)
- [x] T081 [P] [US3] Criar app/api/checklists/[id]/route.ts (GET, PUT, DELETE)
- [x] T082 [US3] Criar app/api/cautelas/route.ts (GET list + POST create rascunho ABERTA; proteção GESTOR no POST)
- [x] T083 [P] [US3] Criar app/api/cautelas/minhas/route.ts (GET — colaborador vê suas cautelas)
- [x] T084 [P] [US3] Criar app/api/cautelas/[id]/route.ts (GET detail)
- [x] T085 [P] [US3] Criar app/api/cautelas/[id]/checklist-saida/route.ts (POST)
- [x] T086 [US3] Criar app/api/cautelas/[id]/emitir/route.ts (POST — chama cautelasService.emitir)
- [x] T087 [P] [US3] Criar app/api/cautelas/[id]/pdf/route.ts (GET — download PDF)

### Frontend

- [x] T088 [P] [US3] Criar src/features/checklists/viewmodels/use-checklists.ts e use-checklist-form.ts
- [x] T089 [US3] Criar src/features/checklists/views/checklists-list.tsx e checklist-form-dialog.tsx
- [x] T090 [US3] Criar app/(dashboard)/checklists/page.tsx
- [x] T091 [US3] Criar src/features/cautelas/viewmodels/use-cautela-emissao.ts (hook wizard 5 etapas com validação por etapa)
- [x] T092 [P] [US3] Criar src/features/cautelas/viewmodels/use-cautelas-list.ts
- [x] T093 [US3] Criar src/features/cautelas/views/cautela-emissao-wizard.tsx (container com steps visuais)
- [x] T094 [P] [US3] Criar src/features/cautelas/views/step-selecionar-colaborador.tsx (busca usuários ativos)
- [x] T095 [P] [US3] Criar src/features/cautelas/views/step-selecionar-equipamentos.tsx (lista disponíveis, multi-select, bloqueia indisponíveis)
- [x] T096 [P] [US3] Criar src/features/cautelas/views/step-conferir-acessorios.tsx
- [x] T097 [P] [US3] Criar src/features/cautelas/views/step-checklist-saida.tsx (perguntas Sim/Não, valida obrigatórias)
- [x] T098 [P] [US3] Criar src/features/cautelas/views/step-confirmar-emissao.tsx (resumo, data prevista retorno, observações, botão emitir)
- [x] T099 [US3] Criar src/features/cautelas/views/cautelas-list.tsx (tabela: número, responsável, status badge, datas, ações)
- [x] T100 [US3] Criar app/(dashboard)/cautelas/page.tsx e app/(dashboard)/cautelas/nova/page.tsx

**Checkpoint**: MVP principal — emissão de cautelas completa com validação, checklist e PDF

---

## Phase 6: História de Usuário 4 — Devolução de Equipamentos com Checklist (Prioridade: P2)

**Objetivo**: Devolução (checklist retorno → registrar avarias ou finalizar), cancelamento, detecção automática de atrasos

**Teste Independente**: Localizar cautela, preencher checklist devolução, finalizar com/sem avarias, verificar atualização de status

### Services

- [x] T101 [US4] Adicionar funções em src/features/cautelas/services/cautelas.service.ts:
  - devolver (EM_USO/ATRASADA → FINALIZADA ou PENDENTE; checklist obrigatório; atualiza equipamentos; registra auditoria)
  - cancelar (ABERTA/EM_USO → CANCELADA; retorna equipamentos para DISPONIVEL)
  - verificarAtrasos (query: status EM_USO + data_prevista_retorno < NOW → ATRASADA)
- [x] T102 [P] [US4] Criar app/api/cron/verificar-atrasos/route.ts (GET — chamado por Vercel Cron / cron job; chama verificarAtrasos)

### API Routes

- [x] T103 [P] [US4] Criar app/api/cautelas/[id]/checklist-devolucao/route.ts (POST)
- [x] T104 [US4] Criar app/api/cautelas/[id]/devolver/route.ts (POST — chama cautelasService.devolver)
- [x] T105 [P] [US4] Criar app/api/cautelas/[id]/cancelar/route.ts (POST)

### Frontend

- [x] T106 [P] [US4] Criar src/features/cautelas/viewmodels/use-cautela-devolucao.ts
- [x] T107 [US4] Criar src/features/cautelas/views/cautela-detail.tsx (detalhes completos com abas; botões: devolver, cancelar, PDF)
- [x] T108 [P] [US4] Criar src/features/cautelas/views/devolucao-form.tsx (checklist, flag avarias, descrição, observações)
- [x] T109 [US4] Criar app/(dashboard)/cautelas/[id]/page.tsx e app/(dashboard)/cautelas/[id]/devolucao/page.tsx

**Checkpoint**: Ciclo completo emissão + devolução funcional

---

## Phase 7: História de Usuário 5 — Dashboard e Indicadores (Prioridade: P2)

**Objetivo**: Cards de indicadores e gráficos de utilização

### Service + API Route

- [x] T110 [US5] Criar src/features/dashboard/services/dashboard.service.ts com funções: getIndicadores (agregações: equipamentos por status, cautelas abertas/atrasadas), getGraficos (utilização mensal, ranking equipamentos)
- [x] T111 [P] [US5] Criar app/api/dashboard/indicadores/route.ts (GET)
- [x] T112 [P] [US5] Criar app/api/dashboard/graficos/route.ts (GET)

### Frontend

- [x] T113 [P] [US5] Criar src/features/dashboard/models/index.ts com interfaces Indicadores, DadosGrafico, UtilizacaoMensal
- [x] T114 [US5] Criar src/features/dashboard/viewmodels/use-dashboard.ts (carrega indicadores + gráficos, refresh automático)
- [x] T115 [US5] Criar src/features/dashboard/views/indicadores-cards.tsx (grid cards com ícones e cores)
- [x] T116 [P] [US5] Criar src/features/dashboard/views/grafico-utilizacao-mensal.tsx (recharts bar/line chart)
- [x] T117 [P] [US5] Criar src/features/dashboard/views/grafico-mais-utilizados.tsx (recharts horizontal bar)
- [x] T118 [US5] Criar src/features/dashboard/views/dashboard-page.tsx (layout responsivo)
- [x] T119 [US5] Atualizar app/(dashboard)/page.tsx para importar DashboardPage

---

## Phase 8: História de Usuário 6 — Histórico e Auditoria (Prioridade: P3)

**Objetivo**: Registro automático de ações e tela de consulta

### Service + API Route

- [x] T120 [US6] Criar src/features/auditoria/services/auditoria.service.ts com funções: log (usado pelos services), list (paginado + filtros: entidade, ação, usuário, período), getByEntidade
- [x] T121 [P] [US6] Criar app/api/auditoria/route.ts (GET list)
- [x] T122 [P] [US6] Criar app/api/auditoria/[entidade]/[entidade_id]/route.ts (GET)
- [x] T123 [US6] Integrar auditoriaService.log nos services existentes: auth, usuarios, equipamentos, cautelas, checklists (chamada em cada ação crítica)

### Frontend

- [x] T124 [P] [US6] Criar src/features/auditoria/models/index.ts com interfaces RegistroAuditoria, FiltrosAuditoria
- [x] T125 [US6] Criar src/features/auditoria/viewmodels/use-auditoria.ts (paginação e filtros)
- [x] T126 [US6] Criar src/features/auditoria/views/auditoria-list.tsx (tabela: entidade, ação, usuário, data/hora UTC, detalhes expansíveis; filtros avançados)
- [x] T127 [US6] Criar app/(dashboard)/auditoria/page.tsx

---

## Phase 9: História de Usuário 7 — Relatórios e Exportação (Prioridade: P3)

**Objetivo**: Relatórios de equipamentos, cautelas e utilização por período

### Service + API Route

- [x] T128 [US7] Criar src/features/relatorios/services/relatorios.service.ts com funções: relatorioEquipamentos (por status), relatorioCautelas (por situação), relatorioUtilizacao (ranking + total por período)
- [x] T129 [P] [US7] Criar app/api/relatorios/equipamentos/route.ts (GET)
- [x] T130 [P] [US7] Criar app/api/relatorios/cautelas/route.ts (GET)
- [x] T131 [P] [US7] Criar app/api/relatorios/utilizacao/route.ts (GET)

### Frontend

- [x] T132 [P] [US7] Criar src/features/relatorios/models/index.ts com interfaces
- [x] T133 [US7] Criar src/features/relatorios/viewmodels/use-relatorios.ts
- [x] T134 [US7] Criar src/features/relatorios/views/relatorios-page.tsx (abas: Equipamentos, Cautelas, Utilização; tabelas com filtros)
- [x] T135 [US7] Criar app/(dashboard)/relatorios/page.tsx

---

## Phase 10: Polish & Cross-Cutting Concerns

- [x] T136 [P] Adicionar responsividade em todos os componentes (testar breakpoints 320px, 768px, 1024px)
- [x] T137 [P] Adicionar validação Zod + React Hook Form em todos os formulários com mensagens de erro em pt-BR
- [x] T138 [P] Adicionar estados de loading (skeleton) em todas as listagens e formulários
- [x] T139 [P] Adicionar estados de empty ("Nenhum registro encontrado") em todas as listagens
- [x] T140 Adicionar confirmação (AlertDialog) antes de ações destrutivas (excluir, cancelar, inativar)
- [x] T141 [P] Adicionar breadcrumbs dinâmicos em todas as páginas
- [x] T142 [P] Configurar metadados (title, description, favicon) em app/layout.tsx
- [x] T143 [P] Escrever testes unitários para services com Vitest (auth, equipamentos, cautelas) em src/features/*/services/__tests__/
- [x] T144 [P] Escrever testes de viewmodel com Vitest + React Testing Library em src/features/*/viewmodels/__tests__/
- [x] T145 Executar validação do quickstart.md (seguir guia passo a passo em ambiente limpo)
- [x] T146 Revisão de código: verificar conformidade com constituição (MVVM, Clean Code, sem gambiarras)

---

## Dependências e Ordem de Execução

### Dependências de Fase

- **Setup (Phase 1)**: Sem dependências
- **Foundational (Phase 2)**: Depende de Setup — BLOQUEIA todas as histórias
- **US1 (Phase 3)**: Depende de Foundational — Não depende de outras histórias
- **US2 (Phase 4)**: Depende de Foundational — Pode executar em paralelo com US1
- **US3 (Phase 5)**: Depende de US1 (usuários) e US2 (equipamentos)
- **US4 (Phase 6)**: Depende de US3 (cautelas emitidas)
- **US5 (Phase 7)**: Depende de US2 e US3 (dados para indicadores)
- **US6 (Phase 8)**: Depende de US1-US4 (ações para auditar)
- **US7 (Phase 9)**: Depende de US2, US3 e US4 (dados para relatórios)
- **Polish (Phase 10)**: Depende de todas as histórias desejadas

---

## Oportunidades de Paralelismo

### Entre histórias
- US1 e US2 podem executar em paralelo após Foundational
- US6 e US7 podem executar em paralelo após US3+US4

### Dentro de cada história
- Models + Services podem iniciar em paralelo
- API Routes podem iniciar em paralelo entre si (arquivos diferentes)
- Frontend views/viewmodels podem iniciar em paralelo

---

## Estratégia de Implementação

### MVP Primeiro (US1 + US2 + US3)

1. Phase 1: Setup (10 tasks)
2. Phase 2: Foundational (16 tasks)
3. Phase 3: US1 — Auth e Usuários (26 tasks)
4. Phase 4: US2 — Catálogo (22 tasks)
5. Phase 5: US3 — Emissão Cautela (26 tasks)
6. **PARAR e VALIDAR**: Testar fluxo MVP completo

### TDD

Escrever testes unitários (T143) e de viewmodel (T144) ANTES da implementação de
cada service e viewmodel, seguindo Red-Green-Refactor.

---

## Notas

- [P] = arquivos diferentes, sem dependências entre si
- [Story] = mapeia tarefa para história de usuário
- Backend = Next.js API Routes (`app/api/*/route.ts`) + Services (`src/features/*/services/`)
- Services são a única fonte de verdade para regras de negócio
- API routes são handlers HTTP finos: extraem params, validam, delegam para services
- Middleware (`src/middleware.ts`) protege rotas /dashboard/*
- Prisma client singleton em `src/lib/prisma.ts` com @prisma/adapter-pg
- JWT via `jose` em `src/lib/auth.ts`
- Validação via Zod em `src/lib/validators.ts`
- Documentação e commits em pt-BR; código em inglês
