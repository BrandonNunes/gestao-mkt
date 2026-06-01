<!--
  Sync Impact Report
  ==================
  Version change: 1.0.0 → 1.0.1
  Rationale: PATCH — correções de redação e alinhamento de stack após análise.
  - Stack: removido NestJS, adicionado Next.js API Routes como backend
  - Versão Next.js: 16+ → 16.2.7
  - Estrutura: removido backend/, adicionados app/api/ + src/middleware.ts + src/features/*/services/
  - Restrição L199: "NestJS" → "Next.js API Routes"

  Artefatos dependentes atualizados:
  ✅ plan.md — regerado com estrutura Next.js full-stack
  ✅ tasks.md — regerado com tasks de API routes + services

  Itens pendentes:
  - Nenhum.
-->

# Constituição do Cautela MKT

## Princípios Fundamentais

### I. Arquitetura MVVM e Separação de Responsabilidades

A aplicação segue o padrão MVVM (Model-View-ViewModel) com separação estrita entre camadas:

- A pasta `app/` do Next.js deve conter APENAS definições de roteamento
  (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`) e API routes
  (`route.ts` dentro de `app/api/`). Nenhuma regra de negócio, lógica de domínio
  ou estado complexo deve residir nela.
- API routes (`app/api/*/route.ts`) são handlers HTTP finos: extraem parâmetros,
  validam entrada e delegam para services em `src/features/*/services/`.
- Telas (Views), ViewModels, Services e regras de negócio devem residir em
  `src/features/`, organizadas por domínio funcional (ex.: `src/features/equipamentos/`,
  `src/features/cautelas/`, `src/features/auth/`).
- Cada feature deve ser autocontida: seus models, viewmodels, services, hooks e
  componentes específicos residem dentro da sua própria pasta.
- Componentes compartilhados entre features devem ficar em `src/components/`.
- Autenticação e controle de acesso são implementados via `src/middleware.ts`
  (JWT verification + RBAC redirect) e `src/lib/auth.ts` (token utilities).

**Razão**: Esta separação garante que o framework de roteamento seja apenas a camada de
entrada, mantendo a lógica de negócio independente, testável e portável. Evita o
acoplamento típico de projetos Next.js que misturam lógica de negócio com páginas.

### II. Clean Code e Simplicidade

Todo código produzido deve aderir aos princípios de Clean Code:

- Código deve ser legível e autoexplicativo. Nomes de variáveis, funções e classes
  devem comunicar sua intenção claramente.
- Funções devem ter uma única responsabilidade e serem curtas.
- DRY (Don't Repeat Yourself): evitar duplicação de código e de conhecimento.
- SOLID: respeitar os princípios de design orientado a objetos quando aplicável.
- YAGNI (You Ain't Gonna Need It): não implementar funcionalidades que não sejam
  estritamente necessárias agora.
- Sem "gambiarras" ou workarounds: todo código deve ser intencional e justificável.
- Complexidade acidental deve ser eliminada; complexidade essencial deve ser isolada
  e documentada.

**Razão**: Código limpo reduz o custo de manutenção, facilita onboarding de novos
desenvolvedores e diminui a incidência de bugs. Gambiarras acumulam dívida técnica
que compromete a entrega de longo prazo.

### III. Segurança e Rastreabilidade

O sistema lida com equipamentos de alto valor e responsabilidade formal de colaboradores:

- Autenticação via JWT com controle de sessão.
- Controle de acesso baseado em perfis (Gestor e Colaborador), com permissões
  estritamente definidas conforme PRD.
- Toda ação crítica (criação, edição, exclusão lógica, emissão de cautela, devolução,
  mudança de status) deve gerar registro de auditoria com: entidade afetada, ação
  realizada, usuário responsável, data/hora UTC e detalhes relevantes.
- Soft delete como padrão: registros nunca são removidos fisicamente do banco.
- Conformidade com LGPD: dados pessoais devem ser tratados com proteção adequada,
  possibilidade de exclusão/anonimização e registro de consentimento quando aplicável.

**Razão**: O sistema formaliza responsabilidade sobre equipamentos. A trilha de
auditoria é essencial para segurança jurídica e operacional. Soft delete garante
que nenhum dado seja perdido acidentalmente.

### IV. Integridade de Dados e Regras de Negócio

As regras de negócio definidas no PRD são não-negociáveis e devem ser implementadas
exatamente como especificadas:

- Validação de disponibilidade antes da emissão de cautela (RN008, RN009).
- Sincronismo automático entre status de cautela e status de equipamento (RN010-RN013).
- Apenas equipamentos com status "Disponível" podem ser cautelados.
- Checklists de saída e devolução são obrigatórios (RN003, RN004).
- Todas as regras de negócio devem ser validadas no backend, nunca confiar apenas
  em validação de frontend.
- Transições de status devem seguir a máquina de estados definida no PRD (seção 15).

**Razão**: As regras de negócio são o núcleo de valor do sistema. Violá-las compromete
o controle patrimonial e a confiabilidade do sistema. Validação dupla (frontend +
backend) segue o princípio de defesa em profundidade.

### V. Documentação em Português (pt-BR)

Todos os artefatos gerados pelo Speckit e documentação do projeto devem estar em
português brasileiro (pt-BR):

- Especificações (spec.md), planos (plan.md), tarefas (tasks.md), checklists e
  documentos de arquitetura.
- Commits e mensagens de PR também devem estar em pt-BR.
- O código em si (nomes de variáveis, funções, comentários) pode estar em inglês,
  seguindo convenções da stack, mas a documentação de negócio e artefatos Speckit
  são obrigatoriamente em pt-BR.

**Razão**: O domínio do problema é intrinsicamente brasileiro (LGPD, termos como
"cautela", "patrimônio"). A documentação em pt-BR garante alinhamento com stakeholders
de negócio e reduz ambiguidade na comunicação.

---

## Estrutura do Projeto

A organização de diretórios deve seguir o padrão abaixo:

```text
cautela-mkt/
├── app/                    # Next.js App Router — APENAS roteamento + API
│   ├── layout.tsx
│   ├── page.tsx
│   ├── (auth)/             # Grupo de rotas de autenticação
│   ├── (dashboard)/        # Grupo de rotas do dashboard
│   └── api/                # API Routes (handlers HTTP finos)
│       ├── auth/
│       ├── usuarios/
│       ├── equipamentos/
│       ├── cautelas/
│       ├── dashboard/
│       ├── relatorios/
│       └── auditoria/
├── src/
│   ├── middleware.ts        # JWT verification + RBAC redirect
│   ├── features/           # MVVM: features organizadas por domínio
│   │   ├── auth/
│   │   │   ├── views/       # Telas (componentes de página)
│   │   │   ├── viewmodels/  # Lógica de apresentação e estado
│   │   │   ├── services/    # Regras de negócio (chamadas por API routes)
│   │   │   └── models/      # Tipos e interfaces do domínio
│   │   ├── equipamentos/
│   │   │   ├── views/
│   │   │   ├── viewmodels/
│   │   │   ├── services/
│   │   │   └── models/
│   │   ├── cautelas/
│   │   │   ├── views/
│   │   │   ├── viewmodels/
│   │   │   ├── services/
│   │   │   └── models/
│   │   └── ...
│   ├── components/         # Componentes UI compartilhados
│   ├── hooks/              # Hooks React compartilhados
│   └── lib/                # Utilitários, prisma client, auth, validators
│       ├── prisma.ts       # Prisma client singleton
│       ├── auth.ts         # JWT sign/verify utilities (jose)
│       └── validators.ts   # Zod schemas compartilhados
├── prisma/                 # Schema e migrations
│   └── schema.prisma
├── docker/                 # Configurações Docker
│   └── ...
└── .specify/               # Artefatos Speckit
    ├── memory/
    │   └── constitution.md
    └── templates/
```

Regras estruturais:

- `app/` contém apenas arquivos `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`
  e `route.ts`. Nenhum `use client` fora do necessário para interatividade de entrada.
- `app/api/*/route.ts` são handlers HTTP finos que delegam regras de negócio para
  services em `src/features/*/services/`.
- Cada pasta em `src/features/` representa um domínio de negócio autocontido com
  subpastas `views/`, `viewmodels/`, `services/` e `models/`.
- ViewModels encapsulam estado, lógica de apresentação e chamadas a services.
- Models definem tipos TypeScript puros, sem dependência de frameworks.
- Services contêm as regras de negócio e são a única fonte de verdade do sistema.

---

## Stack Tecnológica

| Camada        | Tecnologia                         |
| ------------- | ---------------------------------- |
| Frontend      | Next.js 16.2.7 (App Router)        |
| Backend       | Next.js API Routes (App Router)    |
| Linguagem     | TypeScript 5.x (strict mode)       |
| UI Framework  | React 19+                          |
| Estilos       | TailwindCSS + ShadCN UI            |
| ORM           | Prisma 7+                          |
| Banco         | PostgreSQL                         |
| Auth          | JWT via jose (access + refresh)    |
| PDF           | Puppeteer                          |
| Storage       | MinIO (S3-compatible)              |
| Infra         | Docker + Docker Compose            |
| Reverse Proxy | Nginx                              |

Restrições:

- TypeScript strict mode deve estar habilitado.
- O backend (Next.js API Routes + services em `src/features/*/services/`) é a única
  fonte de verdade para regras de negócio.
- Todas as dependências devem ser justificadas — não adicionar bibliotecas sem
  necessidade clara.

---

## Governança

Esta constituição é o documento de mais alto nível do projeto Cautela MKT. Ela
prevalece sobre quaisquer outras práticas, convenções ou decisões ad hoc.

### Procedimento de Emendas

1. Propor a emenda com justificativa clara e análise de impacto.
2. Discutir com os membros relevantes da equipe.
3. Atualizar este documento com a nova versão.
4. Registrar no Sync Impact Report no topo do arquivo.
5. Revisar e atualizar artefatos dependentes (templates, planos ativos) conforme
   necessário.

### Versionamento

Esta constituição segue versionamento semântico (MAJOR.MINOR.PATCH):

- **MAJOR**: Remoção ou redefinição de princípios fundamentais, mudanças de stack
  obrigatória, alterações incompatíveis com versões anteriores.
- **MINOR**: Adição de novo princípio, seção ou orientação materialmente expansiva.
- **PATCH**: Correções de redação, clareza, ajustes não-semânticos.

### Revisão de Conformidade

- Todo Pull Request deve ser verificado contra os princípios desta constituição.
- O template `plan-template.md` contém o gate "Constitution Check" que deve ser
  executado antes da Fase 0 e reavaliado após a Fase 1 de qualquer plano.
- Violações devem ser justificadas no quadro "Complexity Tracking" do plano e
  aprovadas explicitamente.
- O arquivo `AGENTS.md` contém diretrizes complementares de execução para agentes.

**Version**: 1.0.1 | **Ratified**: 2026-06-01 | **Last Amended**: 2026-06-01
