# Pesquisa Técnica: CRUD via Diálogos para Equipamentos, Usuários e Checklists

**Funcionalidade**: 002-crud-dialogs
**Data**: 2026-06-01

## 1. ShadCN UI Dialog Component

**Decisão**: Utilizar `@radix-ui/react-dialog` via ShadCN UI (`npx shadcn@latest add dialog`) como base para todos os diálogos modais da feature.

**Fundamentação**: A constituição (Stack Tecnológica) define ShadCN UI como framework de UI. O Dialog do ShadCN é um wrapper sobre Radix UI Dialog, oferecendo acessibilidade (ARIA), animações, fechamento por Escape/clique fora e suporte a foco. Todos esses comportamentos são requeridos pela spec (FR-006).

**Alternativas consideradas**:
- Dialog HTML nativo (`<dialog>`): Sem suporte consistente a estilos TailwindCSS e animações.
- Modal customizado do zero: Viola o princípio YAGNI; reinventa funcionalidade já disponível no stack.
- AlertDialog do ShadCN: Focado em confirmações, não em formulários. Pode ser usado para diálogos de confirmação (Ativar/Inativar), mas não para forms de cadastro.

**Implementação**: Instalar via `npx shadcn@latest add dialog`. Componente disponível em `src/components/ui/dialog.tsx`.

---

## 2. Formulários com Validação Client-Side

**Decisão**: Validação client-side usando Zod (schemas já existentes em `src/lib/validators.ts`) com feedback de erro inline nos campos do formulário.

**Fundamentação**: A spec requer validação antes da submissão (FR-003). O Zod já é usado no backend para validação de API routes. Reutilizar os mesmos schemas no frontend (via validação `safeParse` antes de enviar) garante consistência entre validações client-side e server-side sem duplicação de lógica.

**Alternativas consideradas**:
- React Hook Form + Zod: Adiciona complexidade desnecessária para formulários simples de diálogo.
- Validação nativa HTML5: Insuficiente para regras de unicidade e validações de negócio.
- Validação apenas no servidor: Viola SC-004 (100% validação client-side + server-side).

**Implementação**: Cada Dialog component importará o schema Zod correspondente e executará `schema.safeParse(formData)` antes da submissão. Erros são exibidos inline em cada campo.

---

## 3. Estratégia de Submissão e Atualização de Listagem

**Decisão**: Cada Dialog é responsável por sua própria lógica de submissão (POST/PUT fetch para API). Ao fechar com sucesso, emite um callback que a view pai usa para recarregar a listagem.

**Fundamentação**: Mantém os Dialogs autocontidos (single responsibility). A view pai apenas passa callbacks e controla o estado de abertura/fechamento. Segue o princípio MVVM: views orquestram componentes, Dialogs são componentes de UI puros com callbacks.

**Alternativas consideradas**:
- Zustand/Redux para estado global: Desnecessário; o estado dos dialogs é local à página.
- React Context por feature: Overengineering para 3 telas com um dialog cada.
- SWR/TanStack Query com mutate: Adiciona dependência; a estratégia de refetch simples é suficiente e consistente com o padrão existente no projeto.

---

## 4. Checklist: Formulário com Lista Dinâmica de Perguntas

**Decisão**: Estado local (`useState`) para gerenciar array de perguntas no formulário de checklist. Cada pergunta adicionada recebe um `id` temporário para permitir remoção antes da submissão.

**Fundamentação**: A spec requer adição/remoção dinâmica de perguntas (FR-018, FR-019). O estado local é suficiente porque o ciclo de vida do formulário é curto (abrir, preencher, submeter ou cancelar). IDs temporários (ex.: `crypto.randomUUID()`) permitem identificar itens para remoção.

**Alternativas consideradas**:
- useReducer: Mais verboso, mas mais previsível para listas. Pode ser usado se a lógica crescer.
- useFieldArray do React Hook Form: Adiciona dependência desnecessária.

---

## 5. Confirmação para Ativar/Inativar Usuário

**Decisão**: Utilizar AlertDialog do ShadCN UI (`npx shadcn@latest add alert-dialog`) para diálogo de confirmação antes de alternar status do usuário.

**Fundamentação**: A spec (FR-012, FR-013) exige confirmação antes de ativar/inativar. O AlertDialog já está presente no projeto (`@radix-ui/react-alert-dialog` no package.json) e é semanticamente correto para ações destrutivas/mutação de estado.

**Alternativas consideradas**:
- Dialog comum com botões de confirmação: Funcionalmente equivalente, mas menos semântico e não comunica a gravidade da ação.

---

## 6. Atualização do Status de Usuário

**Decisão**: Utilizar o endpoint `PUT /api/usuarios/[id]` com body `{ status: "ATIVO" | "INATIVO" }`. O schema `updateUsuarioSchema` já suporta campo `status`.

**Fundamentação**: O endpoint PUT já existe e suporta atualização parcial de usuários. O schema Zod (`updateUsuarioSchema`) aceita campo `status` como opcional. Reutilizar infraestrutura existente evita criar endpoints redundantes.

---

## 7. Categorias no Seletor do Form de Equipamento

**Decisão**: Buscar lista de categorias via `GET /api/categorias` ao abrir o diálogo de cadastro de equipamento, usando fetch com token JWT.

**Fundamentação**: O campo `categoria_id` é obrigatório (FR-002) e deve ser selecionado de uma lista existente. A API de categorias já existe em `src/features/equipamentos/services/categorias.service.ts`. O frontend fará fetch ao montar o diálogo.

**Alternativas consideradas**:
- Cache de categorias via SWR: Adiciona dependência; como categorias raramente mudam, um fetch simples no mount é suficiente.
- Passar categorias via props: Acoplaria a view pai à API de categorias desnecessariamente.
