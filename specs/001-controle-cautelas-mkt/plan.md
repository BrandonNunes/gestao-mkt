# Plano de Implementação: Controle de Equipamentos e Cautelas do Setor de Marketing

**Branch**: `001-controle-cautelas-mkt` | **Data**: 2026-06-01 | **Spec**: [spec.md](./spec.md)

**Entrada**: Especificação da funcionalidade em `specs/001-controle-cautelas-mkt/spec.md`

## Sumário

Sistema web completo para gerenciamento do catálogo de equipamentos do setor de
marketing, controle de empréstimos (cautelas), devoluções, checklists de saída e
retorno, dashboard gerencial e trilha de auditoria. O sistema implementa dois perfis
de acesso (Gestor e Colaborador), máquina de estados para equipamentos, sincronismo
automático entre cautelas e equipamentos, geração de PDF e exclusão lógica (soft
delete) em todas as entidades.

Abordagem técnica: Next.js 16.2.7 full-stack (App Router + API Routes) com MVVM em
`src/features/`, Prisma 7+ ORM sobre PostgreSQL, autenticação JWT via `jose`,
containers Docker.

## Contexto Técnico

**Linguagem/Versão**: TypeScript 5.x (strict mode habilitado)

**Dependências Principais**: Next.js 16.2.7 (App Router + API Routes), Prisma 7+,
React 19+, TailwindCSS, ShadCN UI, jose (JWT), Zod (validação), Puppeteer (PDF)

**Armazenamento**: PostgreSQL (via Prisma ORM + @prisma/adapter-pg), MinIO para arquivos/PDFs

**Testes**: Vitest (unitários + viewmodels), Testing Library (componentes), Supertest (API routes)

**Plataforma Alvo**: Navegadores web modernos (Chrome, Firefox, Edge, Safari),
compatível com dispositivos móveis (responsivo)

**Tipo de Projeto**: Aplicação web full-stack (Next.js App Router)

**Metas de Performance**: Operações CRUD < 2s, emissão de cautela < 5min (UX),
geração PDF < 30s, dashboard com atualização near real-time

**Restrições**: Responsivo, mobile-friendly, datas em UTC, conformidade LGPD,
soft delete em todos os registros, auditoria em todas as ações críticas

**Escala/Escopo**: ~9 entidades de domínio, 7 histórias de usuário, 30 requisitos
funcionais, 2 perfis de usuário, escopo inicial de 1 setor (Marketing)

## Verificação da Constituição

*GATE: Deve passar antes da pesquisa da Fase 0. Reavaliar após o design da Fase 1.*

| Princípio | Status | Evidência |
|-----------|--------|-----------|
| I. Arquitetura MVVM e Separação | ✅ PASSA | `app/` contém apenas roteamento + API routes finos. `src/features/{dominio}/views\|viewmodels\|services\|models`. `src/middleware.ts` para auth. |
| II. Clean Code e Simplicidade | ✅ PASSA | Stack única (Next.js full-stack), sem backend separado. DRY e SOLID nos services. YAGNI: P3 após P1/P2. |
| III. Segurança e Rastreabilidade | ✅ PASSA | JWT via jose com refresh tokens. RBAC no middleware + route handlers. Tabela de auditoria dedicada. Soft delete (campo `deletedAt`). LGPD. |
| IV. Integridade de Dados e Regras de Negócio | ✅ PASSA | Máquina de estados nos services. Validação de disponibilidade antes da emissão. Sincronismo automático via transações Prisma. RN001-RN014. |
| V. Documentação em pt-BR | ✅ PASSA | Todos os artefatos Speckit e documentação em pt-BR. Código em inglês (convenções da stack). |

**Resultado**: Todos os gates passam. Nenhuma violação a justificar.

## Estrutura do Projeto

### Documentação (desta funcionalidade)

```text
specs/001-controle-cautelas-mkt/
├── spec.md              # Especificação da funcionalidade
├── plan.md              # Este arquivo (plano de implementação)
├── research.md          # Fase 0: pesquisa e decisões técnicas
├── data-model.md        # Fase 1: modelo de dados
├── quickstart.md        # Fase 1: guia de execução rápida
├── contracts/           # Fase 1: contratos de API
│   ├── auth.yaml
│   ├── usuarios.yaml
│   ├── equipamentos.yaml
│   ├── cautelas.yaml
│   ├── dashboard.yaml
│   └── auditoria.yaml
└── tasks.md             # Fase 2: lista de tarefas (criado por /speckit.tasks)
```

### Código Fonte (raiz do repositório)

```text
cautela-mkt/
├── src/
│   ├── middleware.ts              # JWT verification + RBAC redirect
│   ├── features/                  # MVVM por domínio
│   │   ├── auth/
│   │   │   ├── views/             # Tela de login, recuperação
│   │   │   ├── viewmodels/        # useAuth, useLogin
│   │   │   ├── services/          # auth.service.ts (login, tokens, senha)
│   │   │   └── models/            # User, LoginCredentials, AuthTokens
│   │   ├── equipamentos/
│   │   │   ├── views/             # Lista, formulário, detalhe
│   │   │   ├── viewmodels/        # useEquipamentos, useEquipamentoForm
│   │   │   ├── services/          # equipamentos.service.ts (CRUD, máquina de estados)
│   │   │   └── models/            # Equipamento, Categoria, Acessorio
│   │   ├── cautelas/
│   │   │   ├── views/             # Lista, wizard emissão, detalhe, devolução
│   │   │   ├── viewmodels/        # useCautelas, useCautelaEmissao, useDevolucao
│   │   │   ├── services/          # cautelas.service.ts (emissão, devolução, PDF)
│   │   │   └── models/            # Cautela, StatusCautela, ChecklistResposta
│   │   ├── checklists/
│   │   │   ├── views/             # CRUD de checklists
│   │   │   ├── viewmodels/        # useChecklists
│   │   │   ├── services/          # checklists.service.ts
│   │   │   └── models/            # Checklist, ChecklistPergunta
│   │   ├── dashboard/
│   │   │   ├── views/             # Cards, gráficos
│   │   │   ├── viewmodels/        # useDashboard
│   │   │   ├── services/          # dashboard.service.ts (agregações)
│   │   │   └── models/            # Indicadores, DadosGrafico
│   │   ├── relatorios/
│   │   │   ├── views/             # Telas de relatório
│   │   │   ├── viewmodels/        # useRelatorios
│   │   │   ├── services/          # relatorios.service.ts
│   │   │   └── models/            # FiltrosRelatorio
│   │   ├── auditoria/
│   │   │   ├── views/             # Tela de consulta
│   │   │   ├── viewmodels/        # useAuditoria
│   │   │   ├── services/          # auditoria.service.ts (log + consulta)
│   │   │   └── models/            # RegistroAuditoria, FiltrosAuditoria
│   │   └── usuarios/
│   │       ├── views/             # CRUD de usuários
│   │       ├── viewmodels/        # useUsuarios
│   │       ├── services/          # usuarios.service.ts (CRUD, LGPD)
│   │       └── models/            # Usuario (admin view)
│   ├── components/                # Componentes UI compartilhados
│   │   ├── ui/                    # ShadCN UI wrappers
│   │   ├── layout/                # Sidebar, Header, Breadcrumb
│   │   ├── data-table/            # Tabela genérica com filtros e paginação
│   │   └── feedback/              # Toast, AlertDialog, Loading
│   ├── hooks/                     # Hooks React compartilhados
│   │   ├── use-auth.ts            # AuthContext + AuthProvider
│   │   ├── use-pagination.ts
│   │   ├── use-debounce.ts
│   │   └── use-permission.ts      # Verificação de perfil
│   └── lib/                       # Utilitários e infra
│       ├── prisma.ts              # Prisma client singleton (@prisma/adapter-pg)
│       ├── auth.ts                # JWT sign/verify com jose
│       ├── validators.ts          # Zod schemas compartilhados
│       ├── utils.ts               # cn(), formatDate(), formatCurrency()
│       └── constants.ts           # Status enums, labels pt-BR, rotas
├── app/                           # Next.js App Router — roteamento + API
│   ├── layout.tsx                 # Layout raiz com providers
│   ├── page.tsx                   # Redireciona para /login ou /dashboard
│   ├── globals.css                # Estilos globais + Tailwind
│   ├── (auth)/                    # Grupo de rotas públicas
│   │   ├── login/page.tsx
│   │   ├── recuperar-senha/page.tsx
│   │   └── layout.tsx             # Layout sem sidebar
│   ├── (dashboard)/               # Grupo de rotas autenticadas
│   │   ├── layout.tsx             # Layout com sidebar + proteção
│   │   ├── page.tsx               # Dashboard principal
│   │   ├── equipamentos/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── categorias/page.tsx
│   │   ├── usuarios/page.tsx
│   │   ├── cautelas/
│   │   │   ├── page.tsx
│   │   │   ├── nova/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── devolucao/page.tsx
│   │   ├── checklists/page.tsx
│   │   ├── relatorios/page.tsx
│   │   └── auditoria/page.tsx
│   └── api/                       # API Routes (handlers HTTP finos)
│       ├── auth/
│       │   ├── login/route.ts
│       │   ├── refresh/route.ts
│       │   ├── logout/route.ts
│       │   ├── forgot-password/route.ts
│       │   ├── reset-password/route.ts
│       │   └── change-password/route.ts
│       ├── usuarios/
│       │   ├── route.ts           # GET (list), POST (create)
│       │   └── [id]/route.ts      # GET, PUT, DELETE
│       ├── equipamentos/
│       │   ├── route.ts           # GET (list), POST (create)
│       │   ├── disponiveis/route.ts
│       │   └── [id]/
│       │       ├── route.ts       # GET, PUT, DELETE
│       │       ├── status/route.ts
│       │       └── acessorios/route.ts
│       ├── categorias/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       ├── acessorios/
│       │   └── [id]/route.ts
│       ├── cautelas/
│       │   ├── route.ts           # GET (list), POST (create)
│       │   ├── minhas/route.ts
│       │   └── [id]/
│       │       ├── route.ts       # GET (detail)
│       │       ├── emitir/route.ts
│       │       ├── devolver/route.ts
│       │       ├── cancelar/route.ts
│       │       ├── checklist-saida/route.ts
│       │       ├── checklist-devolucao/route.ts
│       │       └── pdf/route.ts
│       ├── checklists/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       ├── dashboard/
│       │   ├── indicadores/route.ts
│       │   └── graficos/route.ts
│       ├── relatorios/
│       │   ├── equipamentos/route.ts
│       │   ├── cautelas/route.ts
│       │   └── utilizacao/route.ts
│       └── auditoria/
│           ├── route.ts           # GET (list)
│           └── [entidade]/[entidade_id]/route.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── docker/
│   ├── docker-compose.yml
│   ├── Dockerfile
│   └── nginx.conf
└── .specify/
    ├── memory/
    │   └── constitution.md
    └── templates/
```

**Decisão de Estrutura**: Next.js full-stack. `app/` contém roteamento de páginas +
API routes. `src/features/{dominio}/` segue MVVM com subpastas `views/`, `viewmodels/`,
`services/` e `models/`. Services em `src/features/*/services/` contêm as regras de
negócio e são a única fonte de verdade — API routes apenas extraem parâmetros e
delegam. Middleware em `src/middleware.ts` protege rotas `(dashboard)`.

## Registro de Complexidade

> Nenhuma violação da constituição identificada. Esta seção permanece vazia.
