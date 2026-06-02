# Guia de Execução Rápida: CRUD via Diálogos

**Funcionalidade**: 002-crud-dialogs
**Data**: 2026-06-01

## Pré-requisitos

- PostgreSQL rodando (via Docker: `docker compose -f docker/docker-compose.yml up -d postgres`)
- Migrations aplicadas (`npx prisma migrate dev`)
- Seed executado (`npx prisma db seed`)
- Servidor Next.js rodando (`npm run dev`)

## Instalação do Componente ShadCN

```bash
npx shadcn@latest add dialog
npx shadcn@latest add alert-dialog
npx shadcn@latest add select
npx shadcn@latest add label
npx shadcn@latest add textarea
```

## Ordem de Desenvolvimento

### 1. Equipamentos (P1)

1. Criar `src/features/equipamentos/views/equipamento-form-dialog.tsx`
   - Formulário: código patrimonial, nome, categoria (select), marca, modelo, n/série, descrição, data aquisição, valor, localização, observações
   - Validação client-side com `createEquipamentoSchema`
   - Fetch de categorias para popular o select
   - **Modo duplo**: recebe prop `equipamento?`. Se undefined → criação (POST); se definido → edição (PUT) com campos preenchidos
2. Modificar `src/features/equipamentos/views/equipamentos-list.tsx`:
   - Adicionar botão global "Novo Equipamento" (visível apenas GESTOR)
   - Adicionar botão "Editar" em cada linha da tabela (visível apenas GESTOR)
   - Ambos abrem o mesmo Dialog, com `equipamento` como `undefined` ou o registro selecionado
   - Callback `onSuccess` que chama `fetchEquipamentos()`

### 2. Usuários (P1)

1. Criar `src/features/usuarios/views/usuario-form-dialog.tsx`
   - **Modo duplo**: recebe prop `usuario?`. Se undefined → criação (POST, inclui campo senha); se definido → edição (PUT, sem campo senha)
   - Campos: nome, email, matrícula, telefone, perfil (select), senha (só em criação)
2. Modificar `src/features/usuarios/views/usuarios-list.tsx`:
   - Adicionar botão global "Novo Usuário" (visível apenas GESTOR)
   - Adicionar coluna "Ações" com botão "Editar" em cada linha (visível apenas GESTOR)
   - Adicionar botão "Ativar"/"Inativar" em cada linha (visível apenas GESTOR)
   - Botão "Editar" abre Dialog com `usuario` preenchido
   - Botão global abre Dialog com campos vazios
3. Criar `src/features/usuarios/views/usuario-status-dialog.tsx` (AlertDialog de confirmação para toggle ATIVO/INATIVO)

### 3. Checklists (P2)

1. Refatorar `app/(dashboard)/checklists/page.tsx` para extrair lógica em componente:
   - Criar `src/features/checklists/views/checklists-list.tsx` (tabela/listagem)
2. Criar `src/features/checklists/views/checklist-form-dialog.tsx`
   - **Modo duplo**: recebe prop `checklist?`. Se undefined → criação (POST); se definido → edição (PUT, com perguntas carregadas)
   - Campos: nome, tipo (select), lista dinâmica de perguntas
   - Cada pergunta: texto, checkbox obrigatória, botão remover
   - Botão "Adicionar pergunta" para expandir lista
   - Validação: mínimo 1 pergunta, texto mínimo 5 caracteres
3. Integrar Dialog na listagem:
   - Botão global "Novo Checklist" (visível apenas GESTOR) → Dialog vazio
   - Botão "Editar" em cada linha (visível apenas GESTOR) → Dialog preenchido

## Validação Pós-Implementação

- [ ] Gestor consegue cadastrar equipamento e vê-lo na listagem
- [ ] Gestor consegue editar equipamento via botão "Editar" na linha e ver alterações refletidas
- [ ] Gestor consegue cadastrar usuário e vê-lo na listagem
- [ ] Gestor consegue editar usuário via botão "Editar" na linha e ver alterações refletidas
- [ ] Dialog de edição de usuário NÃO exibe campo de senha
- [ ] Gestor consegue ativar/inativar usuário com confirmação
- [ ] Gestor NÃO consegue inativar a si mesmo
- [ ] Gestor consegue cadastrar checklist com múltiplas perguntas
- [ ] Gestor consegue editar checklist via botão "Editar" na linha com perguntas carregadas
- [ ] Colaborador NÃO vê botões de ação em nenhuma das 3 telas
- [ ] Validações inline aparecem para campos obrigatórios vazios
- [ ] Erro de unicidade (código patrimonial, e-mail, matrícula) exibe mensagem e mantém diálogo aberto
