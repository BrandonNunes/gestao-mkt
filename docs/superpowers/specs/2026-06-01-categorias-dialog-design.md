# Design: CRUD de Categorias via Dialog

**Data**: 2026-06-01
**Contexto**: Projeto Cautela MKT — spec 002-crud-dialogs ja implementada para Equipamentos, Usuarios e Checklists. Categorias ficou de fora.

## Problema

A tela `/categorias` tem um input inline + botao "Adicionar" que funciona (POST), mas nao segue o padrao de Dialog modal adotado nas outras telas. Nao ha edicao nem exclusao de categorias existentes. A API `PUT /api/categorias/[id]` nao existe (o service `update` ja esta implementado, mas sem rota).

## Solucao

Criar Dialog modal seguindo exatamente o mesmo padrao dos componentes implementados em `002-crud-dialogs`:

- **CategoriaFormDialog**: modo duplo criacao/edicao
- **AlertDialog inline**: confirmacao de exclusao
- **Nova API route**: `app/api/categorias/[id]/route.ts` (PUT + DELETE)
- **Extracao de componente**: `CategoriasList` separado da pagina

## Arquivos

### Novos

```text
src/features/equipamentos/views/categoria-form-dialog.tsx
src/features/equipamentos/views/categorias-list.tsx
app/api/categorias/[id]/route.ts
```

### Modificados

```text
app/(dashboard)/categorias/page.tsx
```

### Nao alterados

```text
src/features/equipamentos/services/categorias.service.ts  (ja tem create, update, softDelete)
src/lib/validators.ts                                      (ja tem createCategoriaSchema)
prisma/schema.prisma                                       (ja tem model Categoria)
```

## Componentes

### CategoriaFormDialog

| Prop | Tipo | Descricao |
|------|------|-----------|
| open | boolean | Controla abertura |
| onOpenChange | (open: boolean) => void | Fechamento |
| onSuccess | () => void | Callback apos salvar |
| categoria? | { id, nome } \| null | Se definido → modo edicao |

- **Modo criacao** (`categoria` undefined): campos vazios, submete `POST /api/categorias`
- **Modo edicao** (`categoria` definido): campos preenchidos, submete `PUT /api/categorias/[id]`
- **Validacao**: `createCategoriaSchema.safeParse` — nome obrigatorio, minimo 2 caracteres. Erro inline no campo.
- **Erro de unicidade**: 409 "Nome ja existe" — mensagem exibida no Dialog, sem fechar.

### CategoriasList

| Prop | Tipo | Descricao |
|------|------|-----------|
| categorias | Array | Dados da listagem |
| onRefresh | () => void | Callback para recarregar |

- Tabela: Nome, Equipamentos (contagem), Acoes (apenas GESTOR)
- Botoes: "Editar" (abre CategoriaFormDialog em modo edicao)
- Botao "Excluir" visivel apenas se `_count.equipamentos === 0` (client-side). Confirmacao via AlertDialog inline.
- Botao global "Nova Categoria" visivel apenas GESTOR.

### AlertDialog de exclusao

- Texto: "Deseja excluir a categoria [nome]?"
- Ao confirmar: `DELETE /api/categorias/[id]`
- Se houver equipamentos vinculados (erro 409): exibe mensagem no AlertDialog, nao fecha.
- Se sucesso: fecha, recarrega listagem.

## API Route: `app/api/categorias/[id]/route.ts`

```
PUT  /api/categorias/[id]   → categoriasService.update(id, nome)
DELETE /api/categorias/[id] → categoriasService.softDelete(id)
```

- Autenticacao: Bearer token via `getTokenFromRequest`
- Autorizacao: apenas GESTOR (403 caso contrario)
- PUT: body `{ nome: string }`, validado com `createCategoriaSchema`
- DELETE: tratamento de erro do `softDelete` → 409 se equipamentos vinculados

## Data Flow

```
[Usuario clica "Nova Categoria"]
  → CategoriaFormDialog abre (vazio)
  → Preenche nome, clica Salvar
  → POST /api/categorias { nome }
  → 201 → fecha dialog → onRefresh() recarrega listagem

[Usuario clica "Editar" na linha]
  → CategoriaFormDialog abre (preenchido)
  → Altera nome, clica Salvar
  → PUT /api/categorias/[id] { nome }
  → 200 → fecha dialog → onRefresh()

[Usuario clica "Excluir"]
  → AlertDialog abre: "Deseja excluir a categoria X?"
  → Confirma
  → DELETE /api/categorias/[id]
  → 200 → fecha → onRefresh()
  → 409 → mostra erro no AlertDialog (nao fecha)
```

## Permissoes

| Acao | GESTOR | COLABORADOR |
|------|--------|-------------|
| Ver listagem | Sim | Sim |
| Criar categoria | Sim | Nao (botao oculto) |
| Editar categoria | Sim | Nao (botao oculto) |
| Excluir categoria | Sim | Nao (botao oculto) |

## Validacao

- [ ] Gestor cadastra categoria e ve na listagem
- [ ] Gestor edita categoria e ve alteracao refletida
- [ ] Gestor exclui categoria sem equipamentos vinculados
- [ ] Gestor tenta excluir categoria com equipamentos → erro 409
- [ ] Nome duplicado → erro de unicidade mantem dialog aberto
- [ ] Colaborador ve listagem sem botoes de acao
- [ ] Dialog fecha via Cancelar, clique fora, Escape
