# Design: Devolucao de Cautela com Status Atrasada

**Data**: 2026-06-02
**Contexto**: Projeto Cautela MKT — backend de devolucao ja existe. Falta interface para devolver e exibir status ATRASADA visualmente.

## Problema

1. Nao ha interface para devolver cautela (pagina placeholder)
2. Status ATRASADA nao e exibido visualmente — o banco so atualiza com `verificarAtrasos()` que nunca e chamado

## Solucao

1. **CautelaDevolverDialog** — Dialog modal na pagina de detalhes com checklist DEVOLUCAO + flag avarias + observacoes
2. **Status efetivo no frontend** — funcao que verifica `data_prevista_retorno < now && EM_USO` e trata como ATRASADA para exibicao, sem alterar o banco

## Arquivos

### Novo

```text
src/features/cautelas/views/cautela-devolver-dialog.tsx
```

### Modificado

```text
app/(dashboard)/cautelas/[id]/page.tsx  (+ botao Devolver, + getEffectiveStatus)
```

### Nao alterados

```text
app/api/cautelas/[id]/devolver/route.ts          (ja pronto)
src/features/cautelas/services/cautelas.service.ts (devolver ja implementado)
src/lib/validators.ts                              (devolverCautelaSchema pronto)
```

## CautelaDevolverDialog

| Prop | Tipo | Descricao |
|------|------|-----------|
| open | boolean | Controle |
| onOpenChange | (open: boolean) => void | Fechamento |
| cautelaId | string | ID da cautela |
| onSuccess | () => void | Callback |

- Busca checklists tipo DEVOLUCAO via `GET /api/checklists?tipo=DEVOLUCAO`
- Ao selecionar checklist, carrega perguntas
- Perguntas: radio Sim/Nao (obrigatorias marcadas *)
- Checkbox "Possui avarias?" + textarea condicional para descricao
- Textarea observacoes (opcional)
- Valida: checklist selecionado + obrigatorias respondidas
- Submete `POST /api/cautelas/[id]/devolver`

## Status Atrasada (Frontend)

```ts
function getEffectiveStatus(c: {
  status: string;
  data_prevista_retorno: string;
  data_retorno: string | null;
}) {
  if (c.status === "EM_USO" && !c.data_retorno && new Date(c.data_prevista_retorno) < new Date()) {
    return "ATRASADA";
  }
  return c.status;
}
```

Usada na pagina de detalhes e na listagem para exibir o badge/label correto.

## Pagina Detalhes — Botao Devolver

Botao "Devolver Cautela" visivel quando:
- `getEffectiveStatus(cautela) ∈ (EM_USO, ATRASADA)`
- Usuario e GESTOR

Ao clicar, abre `CautelaDevolverDialog`.

## Permissoes

| Acao | GESTOR | COLABORADOR |
|------|--------|-------------|
| Ver detalhes da cautela | Sim | Sim |
| Ver status ATRASADA | Sim | Sim |
| Devolver cautela | Sim | Nao |

## Validacao

- [ ] Gestor abre detalhes de cautela EM_USO → ve botao "Devolver Cautela"
- [ ] Clica "Devolver" → Dialog abre com checklists DEVOLUCAO
- [ ] Seleciona checklist → perguntas carregam → responde → marca "sem avarias" → confirma
- [ ] Cautela status muda para FINALIZADA, equipamentos voltam DISPONIVEL
- [ ] Cautela com data_prevista_retorno vencida exibe badge "Atrasada"
- [ ] Gestor devolve com avarias → status PENDENTE, equipamentos AVARIADO
- [ ] Colaborador ve detalhes mas nao ve botao Devolver
