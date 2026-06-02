# Design: Gestao de Acessorios nos Equipamentos

**Data**: 2026-06-01
**Contexto**: Projeto Cautela MKT — acessorios sao vinculados a equipamentos e usados nas cautelas. API ja existe, mas nao ha interface de gestao.

## Problema

Nao ha local para cadastrar, editar ou remover acessorios dos equipamentos. A pagina de detalhes do equipamento esta como placeholder. O dialog de criacao/edicao de equipamento nao tem secao de acessorios.

## Solucao

Duas frentes complementares:

1. **EquipamentoFormDialog**: adicionar secao "Acessorios" com lista dinamica (adicionar/remover/editar). Mesmo padrao do `checklist-form-dialog`.
2. **Pagina de detalhes**: implementar `equipamentos/[id]/page.tsx` exibindo todos os campos do equipamento + tabela de acessorios vinculados (somente leitura).

## Arquivos

### Modificados

```text
src/features/equipamentos/views/equipamento-form-dialog.tsx
app/(dashboard)/equipamentos/[id]/page.tsx
```

### Nao alterados

```text
app/api/equipamentos/[id]/acessorios/route.ts    (GET list, POST create)
app/api/acessorios/[id]/route.ts                  (PUT update, DELETE)
src/features/equipamentos/services/acessorios.service.ts
src/lib/validators.ts                             (schemas prontos)
```

## EquipamentoFormDialog — Secao Acessorios

Estado local: `acessorios: { id: string; nome: string; codigo_interno: string; descricao: string; ativo: boolean; _exists?: boolean }[]`

- `_exists` indica se ja existe no banco (para diferenciar create vs update no save)
- IDs temporarios com `crypto.randomUUID()` para novos

Ao abrir em modo edicao: `GET /api/equipamentos/[id]/acessorios` → popula `acessorios` com `_exists: true`.

Cada linha: Input nome (obrigatorio), Input codigo interno, Input descricao, checkbox Ativo, botao Remover. Botao "Adicionar acessorio" no fim da lista.

### Fluxo de save

**Criacao (POST /api/equipamentos)**:
1. Criar equipamento → obter `id` da resposta 201
2. Para cada acessorio: `POST /api/equipamentos/[id]/acessorios`

**Edicao (PUT /api/equipamentos/[id])**:
1. Atualizar equipamento
2. Acessorios novos (sem `_exists`): `POST /api/equipamentos/[id]/acessorios`
3. Acessorios existentes editados (`_exists`): `PUT /api/acessorios/[aid]` com body `{ nome, codigo_interno, descricao, status }`
4. Acessorios removidos (nao estao mais na lista): `DELETE /api/acessorios/[aid]`

## Pagina de Detalhes (`/equipamentos/[id]`)

Buscar `GET /api/equipamentos/[id]` (retorna equipamento + categoria + acessorios ativos).

### Secoes

- **Cabecalho**: nome do equipamento + badge de status
- **Detalhes**: grid 2 colunas com todos os campos (patrimonio, categoria, marca, modelo, n/serie, localizacao, data aquisicao, valor, descricao, observacoes)
- **Acessorios**: tabela com nome, codigo interno, descricao, status (badge ATIVO/INATIVO)

Apenas leitura. Colaboradores e gestores veem a mesma pagina.

## Data Flow

```
Dialog abrir (modo edicao):
  GET /api/equipamentos/[id]/acessorios → popula lista

Dialog salvar (criacao):
  POST /api/equipamentos → 201 { id }
  → for each acessorio: POST /api/equipamentos/[id]/acessorios

Dialog salvar (edicao):
  PUT /api/equipamentos/[id]
  → novos: POST /api/equipamentos/[id]/acessorios
  → editados: PUT /api/acessorios/[aid]
  → removidos: DELETE /api/acessorios/[aid]
```

## Permissoes

| Acao | GESTOR | COLABORADOR |
|------|--------|-------------|
| Ver detalhes do equipamento | Sim | Sim |
| Ver acessorios nos detalhes | Sim | Sim |
| Gerenciar acessorios no dialog | Sim | Nao (dialog so abre para GESTOR) |

## Validacao

- [ ] Gestor cria equipamento com acessorios → equipamento + acessorios salvos
- [ ] Gestor edita equipamento, adiciona/edita/remove acessorios → sincronizado
- [ ] Pagina de detalhes exibe todos os campos + tabela de acessorios
- [ ] Colaborador ve detalhes mas nao tem acesso ao dialog (via tela de listagem)
- [ ] Campos obrigatorios do acessorio validados antes do submit
