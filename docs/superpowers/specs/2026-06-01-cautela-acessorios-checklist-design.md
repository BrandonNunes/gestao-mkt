# Design: Acessorios e Checklist na Cautela

**Data**: 2026-06-01
**Contexto**: Projeto Cautela MKT — a tela de criacao de cautela nao mostra acessorios dos equipamentos selecionados nem permite vincular checklist de saida. Pagina de detalhes da cautela e placeholder.

## Problema

1. Ao criar cautela, gestor nao ve quais acessorios cada equipamento possui, nem pode selecionar quais acessorios serao emprestados
2. Nao ha checklist de saida na criacao nem na pagina de detalhes — cautela fica ABERTA sem possibilidade de emissao via UI
3. Pagina de detalhes da cautela e placeholder

## Solucao

1. **Nova entidade** `CautelaAcessorio` (N:N) para registrar quais acessorios foram emprestados
2. **Pagina nova cautela** refatorada: equipamentos com acessorios aninhados e checkboxes; checklist opcional de saida
3. **Pagina detalhes** implementada com todos os dados + botao "Emitir" via Dialog
4. **Dialog compartilhado** `CautelaEmitirDialog` usado na criacao e nos detalhes

## Arquivos

### Modificados

```text
prisma/schema.prisma                                   (+ CautelaAcessorio, + acessorios[] em Cautela)
src/lib/validators.ts                                  (+ acessorio_ids em createCautelaSchema)
src/features/cautelas/services/cautelas.service.ts     (+ acessorios no create, getById)
app/api/cautelas/route.ts                              (+ acessorio_ids no POST)
app/(dashboard)/cautelas/nova/page.tsx                  (refatorar)
app/(dashboard)/cautelas/[id]/page.tsx                  (implementar)
```

### Novo

```text
src/features/cautelas/views/cautela-emitir-dialog.tsx   (Dialog checklist saida)
```

### Nao alterados

```text
app/api/cautelas/[id]/emitir/route.ts                   (ja pronto)
app/api/checklists/route.ts                             (GET com filtro tipo)
```

## Modelo de Dados

### CautelaAcessorio

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | UUID | PK |
| cautela_id | UUID | FK Cautela |
| acessorio_id | UUID | FK Acessorio |

Adicionar no model `Cautela`: `acessorios CautelaAcessorio[]`

### Schema Zod

Adicionar `acessorio_ids: z.array(z.string().uuid()).optional()` em `createCautelaSchema`.

## Componentes

### CautelaEmitirDialog

| Prop | Tipo | Descricao |
|------|------|-----------|
| open | boolean | Controle de abertura |
| onOpenChange | (open: boolean) => void | Fechamento |
| cautelaId | string | ID da cautela a emitir |
| onSuccess | () => void | Callback apos emissao |
| checklistPreSelected? | string | ID do checklist ja selecionado |

- Busca checklists tipo SAIDA via `GET /api/checklists?tipo=SAIDA`
- Ao selecionar checklist, busca `GET /api/checklists/[id]` para carregar perguntas
- Cada pergunta: radio Sim/Nao (obrigatorias marcadas com *)
- Validacao: todas obrigatorias respondidas
- Submete `POST /api/cautelas/[id]/emitir` com `{ checklist_id, respostas }`

### Pagina Nova Cautela

- Colaborador (Select), Data Retorno (datetime-local)
- Equipamentos disponiveis: fetch `GET /api/equipamentos/disponiveis`
  - Cada equipamento com checkbox + nome + codigo
  - Ao marcar equipamento, expande e mostra acessorios (fetch `GET /api/equipamentos/[id]/acessorios`) com checkboxes individuais
- Checklist de saida (opcional): Select com checklists tipo SAIDA. Ao selecionar, carrega perguntas com radio Sim/Nao
- Botoes:
  - **Salvar Rascunho**: cria cautela (ABERTA) com equipamentos + acessorios selecionados. Se checklist foi selecionado, vincula mas nao responde. Redireciona para `/cautelas`.
  - **Emitir Cautela**: igual Salvar Rascunho + chama emitir com checklist respondido. Exige checklist selecionado e todas obrigatorias respondidas. Redireciona para `/cautelas`.

### Pagina Detalhes

- Fetch `GET /api/cautelas/[id]` (ja inclui equipamentos, acessorios, respostas checklist)
- Secoes: Informacoes (responsavel, emissor, datas), Equipamentos com acessorios, Checklist (respostas ou "nao vinculado")
- Botao "Emitir Cautela" visivel se `status === ABERTA` e GESTOR → abre `CautelaEmitirDialog`

## Data Flow

### Criacao com Emissao

```
[Seleciona equipamentos + acessorios + checklist + responde perguntas]
  → POST /api/cautelas { usuario_id, equipamento_ids, acessorio_ids, data_prevista_retorno }
  → 201 { id }
  → POST /api/cautelas/[id]/emitir { checklist_id, respostas }
  → 200 → redirect /cautelas
```

### Criacao sem Emissao (Rascunho)

```
[Seleciona equipamentos + acessorios]
  → POST /api/cautelas { usuario_id, equipamento_ids, acessorio_ids, data_prevista_retorno }
  → 201 → redirect /cautelas
```

### Emissao pela Pagina de Detalhes

```
[Abre Dialog] → seleciona checklist → responde perguntas
  → POST /api/cautelas/[id]/emitir { checklist_id, respostas }
  → 200 → fecha dialog → recarrega detalhes
```

## Permissoes

| Acao | GESTOR | COLABORADOR |
|------|--------|-------------|
| Ver listagem de cautelas | Sim (todas) | Sim (so as proprias) |
| Criar cautela | Sim | Nao |
| Ver detalhes da cautela | Sim | Sim |
| Emitir cautela | Sim | Nao |

## Validacao

- [ ] Gestor cria cautela com equipamentos + acessorios → salvo corretamente
- [ ] Gestor cria cautela com checklist respondido → criada e emitida
- [ ] Gestor ve acessorios dos equipamentos na criacao
- [ ] Gestor abre detalhes e emite cautela via Dialog
- [ ] Colaborador ve detalhes mas nao ve botao Emitir
- [ ] Checklist obrigatorio validado antes de emitir
- [ ] Migration Prisma executada sem erros
