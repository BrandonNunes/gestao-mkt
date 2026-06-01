# Modelo de Dados: Controle de Equipamentos e Cautelas

**Funcionalidade**: 001-controle-cautelas-mkt
**Data**: 2026-06-01

## Diagrama de Entidades e Relacionamentos

```text
┌──────────┐       ┌──────────────┐       ┌──────────┐
│  Usuario │       │   Cautela    │       │ Categoria│
├──────────┤       ├──────────────┤       ├──────────┤
│ id       │──┐    │ id           │    ┌──│ id       │
│ nome     │  │    │ numero       │    │  │ nome     │
│ email    │  │    │ status       │    │  └──────────┘
│ senha    │  │    │ data_emissao │    │
│ matricula│  │    │ data_retirada│    │  ┌────────────────┐
│ telefone │  │    │ data_prevista│    │  │  Equipamento   │
│ perfil   │  │    │ data_retorno │    │  ├────────────────┤
│ status   │  │    │ observacoes  │    │  │ id             │
│ consent. │  │    │ usuario_id ──┼────┘  │ codigo_patrim. │
│ deletedAt│  │    │ createdAt    │    ┌──│ categoria_id ──┼──► Categoria
└──────────┘  │    │ updatedAt    │    │  │ nome           │
              │    │ deletedAt    │    │  │ marca          │
              │    └──────────────┘    │  │ modelo         │
              │           │            │  │ num_serie      │
              │           │ 1:N        │  │ descricao      │
              │           ▼            │  │ data_aquisicao │
              │    ┌─────────────────┐ │  │ valor_aquisicao│
              │    │CautelaEquipamento│ │  │ localizacao    │
              │    ├─────────────────┤ │  │ status         │
              │    │ id              │ │  │ observacoes    │
              │    │ cautela_id ─────┼─┘  │ deletedAt      │
              └────│ equipamento_id ─┼────│                │
                   └─────────────────┘    └────────────────┘
                                                    │
                   ┌─────────────────┐              │ 1:N
                   │RespostaChecklist│              ▼
                   ├─────────────────┤    ┌────────────────┐
                   │ id              │    │   Acessorio    │
                   │ cautela_id      │    ├────────────────┤
                   │ pergunta_id ────┼──┐ │ id             │
                   │ resposta        │  │ │ equipamento_id─┼──► Equipamento
                   └─────────────────┘  │ │ nome           │
                                        │ │ codigo_interno │
                   ┌─────────────────┐  │ │ descricao      │
                   │    Checklist    │  │ │ status         │
                   ├─────────────────┤  │ │ deletedAt      │
                   │ id              │  │ └────────────────┘
                   │ nome            │  │
                   │ tipo (S/D)      │  │ ┌────────────────┐
                   │ deletedAt       │  │ │   Historico    │
                   └─────────────────┘  │ ├────────────────┤
                          │ 1:N         │ │ id             │
                          ▼             │ │ entidade       │
                   ┌─────────────────┐  │ │ entidade_id    │
                   │ChecklistPergunta│  │ │ acao           │
                   ├─────────────────┤  │ │ usuario_id ────┼──► Usuario
                   │ id              │  │ │ data_hora      │
                   │ checklist_id ───┼──┘ │ detalhes (JSON)│
                   │ pergunta        │    └────────────────┘
                   │ obrigatoria     │
                   │ ordem           │
                   │ deletedAt       │
                   └─────────────────┘
```

## Entidades

### Usuario

Representa um usuário do sistema (Gestor ou Colaborador).

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | UUID | Sim | Identificador único |
| nome | String | Sim | Nome completo |
| email | String (unique) | Sim | E-mail institucional |
| senha | String (hash) | Sim | Hash bcrypt da senha |
| matricula | String (unique) | Sim | Número de matrícula |
| telefone | String | Não | Telefone de contato |
| perfil | Enum (GESTOR, COLABORADOR) | Sim | Perfil de acesso |
| status | Enum (ATIVO, INATIVO) | Sim | Status do usuário |
| consentimento_lgpd | DateTime | Não | Data de aceite dos termos LGPD |
| data_exclusao_lgpd | DateTime | Não | Data de solicitação de exclusão LGPD |
| createdAt | DateTime | Sim | Data de criação |
| updatedAt | DateTime | Sim | Data de última atualização |
| deletedAt | DateTime | Não | Soft delete |

**Regras**:
- Email e matrícula são únicos no sistema.
- Senha armazenada como hash bcrypt (nunca em texto plano).
- Usuários inativos não podem autenticar.
- Ao solicitar exclusão LGPD, dados são anonimizados (nome → "Usuário Excluído",
  email → hash aleatório) em vez de removidos fisicamente.

---

### Categoria

Agrupamento de equipamentos por tipo.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | UUID | Sim | Identificador único |
| nome | String (unique) | Sim | Nome da categoria |
| createdAt | DateTime | Sim | Data de criação |
| updatedAt | DateTime | Sim | Data de última atualização |
| deletedAt | DateTime | Não | Soft delete |

**Regras**:
- Não pode ser excluída se houver equipamentos vinculados.
- Nome é único no sistema.

---

### Equipamento

Item patrimonial gerenciado pelo sistema.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | UUID | Sim | Identificador único |
| codigo_patrimonial | String (unique) | Sim | Código de patrimônio |
| nome | String | Sim | Nome do equipamento |
| categoria_id | UUID | Sim | FK para Categoria |
| marca | String | Não | Fabricante |
| modelo | String | Não | Modelo |
| numero_serie | String | Não | Número de série |
| descricao | Text | Não | Descrição detalhada |
| data_aquisicao | DateTime | Não | Data de aquisição |
| valor_aquisicao | Decimal | Não | Valor de aquisição |
| localizacao | String | Não | Localização física atual |
| status | Enum (DISPONIVEL, EMPRESTADO, MANUTENCAO, AVARIADO, INATIVO) | Sim | Status atual |
| observacoes | Text | Não | Observações gerais |
| createdAt | DateTime | Sim | Data de criação |
| updatedAt | DateTime | Sim | Data de última atualização |
| deletedAt | DateTime | Não | Soft delete |

**Regras (Máquina de Estados)**:
```
DISPONIVEL → EMPRESTADO   (via emissão de cautela)
DISPONIVEL → MANUTENCAO   (via ação do gestor)
DISPONIVEL → INATIVO      (via ação do gestor)
EMPRESTADO → DISPONIVEL   (via devolução sem avarias)
EMPRESTADO → AVARIADO     (via devolução com avarias)
EMPRESTADO → MANUTENCAO   (via ação do gestor)
AVARIADO  → DISPONIVEL    (via ação do gestor)
AVARIADO  → MANUTENCAO    (via ação do gestor)
MANUTENCAO → DISPONIVEL   (via ação do gestor)
INATIVO   → DISPONIVEL    (via ação do gestor)
```

Apenas equipamentos `DISPONIVEL` podem ser incluídos em novas cautelas.

---

### Acessorio

Item complementar vinculado a um equipamento.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | UUID | Sim | Identificador único |
| equipamento_id | UUID | Sim | FK para Equipamento |
| nome | String | Sim | Nome do acessório |
| codigo_interno | String | Não | Código interno de controle |
| descricao | Text | Não | Descrição do acessório |
| status | Enum (ATIVO, INATIVO) | Sim | Status do acessório |
| createdAt | DateTime | Sim | Data de criação |
| updatedAt | DateTime | Sim | Data de última atualização |
| deletedAt | DateTime | Não | Soft delete |

**Regras**:
- Acessórios inativos não aparecem em novas cautelas, mas mantêm histórico.
- Um acessório pertence a exatamente um equipamento.

---

### Checklist

Conjunto de perguntas parametrizadas para verificação de saída ou devolução.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | UUID | Sim | Identificador único |
| nome | String | Sim | Nome do checklist |
| tipo | Enum (SAIDA, DEVOLUCAO) | Sim | Tipo do checklist |
| createdAt | DateTime | Sim | Data de criação |
| updatedAt | DateTime | Sim | Data de última atualização |
| deletedAt | DateTime | Não | Soft delete |

---

### ChecklistPergunta

Pergunta individual de um checklist.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | UUID | Sim | Identificador único |
| checklist_id | UUID | Sim | FK para Checklist |
| pergunta | String | Sim | Texto da pergunta |
| obrigatoria | Boolean | Sim | Se a resposta é obrigatória |
| ordem | Int | Sim | Ordem de exibição |
| createdAt | DateTime | Sim | Data de criação |
| updatedAt | DateTime | Sim | Data de última atualização |
| deletedAt | DateTime | Não | Soft delete |

---

### Cautela

Documento que formaliza o empréstimo de equipamentos.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | UUID | Sim | Identificador único |
| numero | Int (auto-increment) | Sim | Número sequencial da cautela |
| usuario_id | UUID | Sim | FK para Usuario (responsável/colaborador) |
| status | Enum (ABERTA, EM_USO, ATRASADA, FINALIZADA, CANCELADA, PENDENTE) | Sim | Situação da cautela |
| data_emissao | DateTime | Sim | Data/hora de emissão |
| data_retirada | DateTime | Não | Data/hora efetiva de retirada |
| data_prevista_retorno | DateTime | Sim | Data/hora prevista para devolução |
| data_retorno | DateTime | Não | Data/hora efetiva de devolução |
| observacoes | Text | Não | Observações gerais |
| createdBy_id | UUID | Sim | FK para Usuario (gestor que emitiu) |
| createdAt | DateTime | Sim | Data de criação |
| updatedAt | DateTime | Sim | Data de última atualização |
| deletedAt | DateTime | Não | Soft delete |

**Regras**:
- `numero` é sequencial e único, gerado automaticamente.
- `usuario_id` é o colaborador responsável (quem retirou).
- `createdBy_id` é o gestor que emitiu a cautela.
- Status "ABERTA" → "EM_USO" na emissão; "EM_USO" → "ATRASADA" automaticamente
  quando `data_prevista_retorno < NOW()` e `data_retorno` é nulo.
- Status "EM_USO" → "FINALIZADA" na devolução sem pendências.
- Status "EM_USO" → "PENDENTE" na devolução com avarias.
- Status "ABERTA" ou "EM_USO" → "CANCELADA" via ação do gestor.

---

### CautelaEquipamento

Associação N:N entre Cautela e Equipamento.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | UUID | Sim | Identificador único |
| cautela_id | UUID | Sim | FK para Cautela |
| equipamento_id | UUID | Sim | FK para Equipamento |

**Regras**:
- Um equipamento não pode estar em duas cautelas ativas simultaneamente.
- Garantido por validação no service (status do equipamento).

---

### RespostaChecklist

Resposta a uma pergunta de checklist durante uma cautela específica.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | UUID | Sim | Identificador único |
| cautela_id | UUID | Sim | FK para Cautela |
| pergunta_id | UUID | Sim | FK para ChecklistPergunta |
| resposta | Boolean | Sim | Resposta (true = Sim, false = Não) |

**Regras**:
- Todas as perguntas obrigatórias devem ser respondidas antes da emissão/devolução.
- Vinculada a uma cautela específica (não reutilizável).

---

### Historico (Auditoria)

Registro imutável de todas as ações no sistema.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | UUID | Sim | Identificador único |
| entidade | String | Sim | Nome da entidade afetada (ex.: "Equipamento") |
| entidade_id | UUID | Sim | ID da entidade afetada |
| acao | String | Sim | Ação realizada (ex.: "CRIACAO", "ALTERACAO_STATUS") |
| usuario_id | UUID | Sim | FK para Usuario que realizou a ação |
| data_hora | DateTime | Sim | Data/hora em UTC da ação |
| detalhes | JSON | Não | Detalhes específicos da ação (ex.: status anterior/novo) |

**Regras**:
- Registro imutável: nunca é alterado ou excluído (nem soft delete).
- Gerado automaticamente via `AuditInterceptor` + `AuditoriaService.log()`.
- Detalhes armazenados como JSON para flexibilidade.

---

## Índices Recomendados

| Tabela | Índice | Tipo | Justificativa |
|--------|--------|------|---------------|
| Usuario | email | UNIQUE | Login e unicidade |
| Usuario | matricula | UNIQUE | Unicidade |
| Equipamento | codigo_patrimonial | UNIQUE | Unicidade |
| Equipamento | status | BTREE | Filtro por status (dashboard, disponibilidade) |
| Equipamento | categoria_id | BTREE | FK e listagem por categoria |
| Cautela | status | BTREE | Filtro por situação (dashboard) |
| Cautela | usuario_id | BTREE | FK e consulta por colaborador |
| Cautela | data_prevista_retorno | BTREE | Detecção de atrasos |
| Historico | entidade, entidade_id | BTREE | Consulta de auditoria por entidade |
| Historico | usuario_id | BTREE | Consulta por usuário |
| Historico | data_hora | BTREE | Filtro por período |
