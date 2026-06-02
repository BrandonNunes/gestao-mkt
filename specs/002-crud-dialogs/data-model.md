# Modelo de Dados: CRUD via Diálogos

**Funcionalidade**: 002-crud-dialogs
**Data**: 2026-06-01

## Visão Geral

Esta feature é exclusivamente de frontend e não introduz novas entidades ou alterações no schema do banco. Todas as entidades de domínio já estão definidas no schema Prisma (`prisma/schema.prisma`) e documentadas em `specs/001-controle-cautelas-mkt/data-model.md`.

## Entidades Impactadas

### Equipamento

A feature adiciona interface de cadastro via diálogo. Campos preenchidos no formulário:

| Campo | Obrigatório | Validação |
|---|---|---|
| codigo_patrimonial | Sim | String não vazia, único |
| nome | Sim | Mínimo 3 caracteres |
| categoria_id | Sim | UUID de Categoria existente |
| marca | Não | — |
| modelo | Não | — |
| numero_serie | Não | — |
| descricao | Não | — |
| data_aquisicao | Não | ISO 8601 datetime |
| valor_aquisicao | Não | Número positivo |
| localizacao | Não | — |
| observacoes | Não | — |

Status inicia como `DISPONIVEL` (padrão do schema).

### Usuario

A feature adiciona interfaces de cadastro e edição via diálogo, além de toggle de status.

**Cadastro** (mesmo schema `createUsuarioSchema`):

| Campo | Obrigatório | Validação |
|---|---|---|
| nome | Sim | Mínimo 3 caracteres |
| email | Sim | E-mail válido, único |
| matricula | Sim | Não vazia, única |
| telefone | Não | — |
| perfil | Sim | GESTOR ou COLABORADOR |
| senha | Sim | Mínimo 8 caracteres |

**Edição** (campo `updateUsuarioSchema`):

| Campo | Obrigatório | Validação |
|---|---|---|
| nome | Opcional | Mínimo 3 caracteres |
| email | Opcional | E-mail válido, único |
| matricula | Opcional | Não vazia, única |
| telefone | Opcional | — |
| perfil | Opcional | GESTOR ou COLABORADOR |

A edição não expõe o campo senha. O toggle de status usa `PUT /api/usuarios/[id]` com `{ status: "ATIVO" | "INATIVO" }`.

### Checklist + ChecklistPergunta

A feature adiciona interface de cadastro com perguntas em lote.

**Checklist** (schema `createChecklistSchema`):

| Campo | Obrigatório | Validação |
|---|---|---|
| nome | Sim | Mínimo 3 caracteres |
| tipo | Sim | SAIDA ou DEVOLUCAO |
| perguntas | Sim (mín. 1) | Array de ChecklistPergunta |

**ChecklistPergunta** (aninhada no schema):

| Campo | Obrigatório | Validação |
|---|---|---|
| pergunta | Sim | Mínimo 5 caracteres |
| obrigatoria | Não (default: true) | Booleano |
| ordem | Sim | Inteiro sequencial |

Todas as perguntas são criadas na mesma transação que o checklist (operação atômica via `prisma.checklist.create` com `perguntas: { create: [...] }`).

## Relacionamentos Relevantes

- Equipamento N:1 Categoria (campo `categoria_id` no form de equipamento referencia categoria existente)
- Checklist 1:N ChecklistPergunta (criadas em cascata no service)
- Nenhuma nova relação é introduzida por esta feature.
