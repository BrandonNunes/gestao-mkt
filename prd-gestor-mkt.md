# PRD - Sistema de Controle de Equipamentos e Cautelas do Setor de Marketing

## 1. Visão Geral

### Objetivo

Desenvolver uma aplicação web para gerenciamento do catálogo de equipamentos utilizados pelo setor de marketing, permitindo controlar empréstimos (cautelas), devoluções, checklists de saída e retorno, histórico de utilização, disponibilidade dos equipamentos e responsabilidade dos colaboradores.

O sistema deverá garantir rastreabilidade dos equipamentos, redução de perdas, controle de avarias e formalização da responsabilidade dos usuários através da geração de cautelas.

---

# 2. Objetivos de Negócio

- Centralizar o controle dos equipamentos do setor.
- Reduzir extravios e perdas.
- Registrar responsáveis pelos equipamentos.
- Controlar estado de conservação dos equipamentos.
- Possibilitar auditoria completa de movimentações.
- Formalizar empréstimos através de cautelas.
- Facilitar a gestão de inventário.
- Garantir que apenas equipamentos disponíveis sejam emprestados.

---

# 3. Perfis de Usuário

## Gestor

Possui acesso total ao sistema.

### Permissões

- Cadastrar usuários.
- Editar usuários.
- Inativar usuários.
- Cadastrar equipamentos.
- Cadastrar acessórios.
- Cadastrar categorias.
- Criar checklists.
- Emitir cautelas.
- Registrar devoluções.
- Alterar status de equipamentos.
- Gerenciar pendências.
- Visualizar relatórios.
- Visualizar auditoria.

---

## Colaborador

Usuário responsável pela utilização dos equipamentos.

### Permissões

- Visualizar catálogo.
- Consultar equipamentos disponíveis.
- Visualizar suas cautelas.
- Consultar histórico próprio.
- Visualizar status de empréstimos.

---

# 4. Autenticação e Segurança

## Funcionalidades

- Login
- Logout
- Recuperação de senha
- Alteração de senha
- JWT
- Controle de sessão

---

# 5. Cadastro de Usuários

## Campos

| Campo     | Tipo                 |
| --------- | -------------------- |
| Nome      | Texto                |
| E-mail    | Texto                |
| Matrícula | Texto                |
| Telefone  | Texto                |
| Perfil    | Gestor / Colaborador |
| Status    | Ativo / Inativo      |
| Senha     | Hash                 |

---

# 6. Catálogo de Equipamentos

## Cadastro de Equipamentos

### Campos

| Campo              | Tipo           |
| ------------------ | -------------- |
| Código Patrimonial | Texto          |
| Nome               | Texto          |
| Categoria          | Relacionamento |
| Marca              | Texto          |
| Modelo             | Texto          |
| Número de Série    | Texto          |
| Descrição          | Texto          |
| Data de Aquisição  | Data           |
| Valor de Aquisição | Monetário      |
| Localização Atual  | Texto          |
| Status             | Enum           |
| Observações        | Texto          |

---

## Status dos Equipamentos

| Status        | Descrição                             |
| ------------- | ------------------------------------- |
| Disponível    | Pode ser emprestado                   |
| Emprestado    | Vinculado a cautela ativa             |
| Em Manutenção | Em manutenção preventiva ou corretiva |
| Avariado      | Possui defeito ou dano registrado     |
| Inativo       | Fora de operação                      |

---

# 7. Categorias

Exemplos:

- Câmeras
- Filmadoras
- Drones
- Microfones
- Iluminação
- Notebooks
- Tablets
- Projetores
- Estabilizadores

---

# 8. Cadastro de Acessórios

Cada equipamento poderá possuir diversos acessórios vinculados.

## Campos

| Campo          | Tipo          |
| -------------- | ------------- |
| Nome           | Texto         |
| Código Interno | Texto         |
| Descrição      | Texto         |
| Status         | Ativo/Inativo |

### Exemplos

Equipamento: Sony A7 IV

Acessórios:

- Bateria Principal
- Bateria Reserva
- Cartão SD
- Carregador
- Bolsa
- Lente 24-70mm

---

# 9. Checklists

O sistema deverá permitir a criação de checklists parametrizados.

## Tipos

### Checklist de Saída

Executado antes da retirada.

### Checklist de Devolução

Executado durante o retorno.

---

## Estrutura

| Campo         | Tipo    |
| ------------- | ------- |
| Pergunta      | Texto   |
| Obrigatória   | Sim/Não |
| Tipo Resposta | Sim/Não |
| Ordem         | Número  |

---

## Exemplos de Saída

- Equipamento está carregado?
- Equipamento está funcionando?
- Equipamento possui avarias?
- Todos os acessórios estão presentes?

---

## Exemplos de Devolução

- Equipamento foi devolvido carregado?
- Houve danos durante o uso?
- Todos os acessórios retornaram?
- Equipamento está funcionando normalmente?

---

# 10. Módulo de Cautelas

Responsável por controlar empréstimos e devoluções.

---

## Criação da Cautela

Somente usuários com perfil Gestor poderão emitir cautelas.

---

## Dados da Cautela

| Campo                      | Tipo       |
| -------------------------- | ---------- |
| Número                     | Sequencial |
| Data/Hora Emissão          | DataHora   |
| Data/Hora Retirada         | DataHora   |
| Data/Hora Prevista Retorno | DataHora   |
| Data/Hora Retorno          | DataHora   |
| Responsável                | Usuário    |
| Observações                | Texto      |

---

## Equipamentos da Cautela

Uma cautela poderá possuir:

- Um ou mais equipamentos.
- Acessórios vinculados aos equipamentos.

---

# 11. Validação de Disponibilidade

Antes da criação da cautela o sistema deverá validar a disponibilidade dos equipamentos selecionados.

## Regras

- Apenas equipamentos com status **Disponível** podem ser cautelados.
- Equipamentos **Emprestados** não poderão ser incluídos em nova cautela.
- Equipamentos **Em Manutenção** não poderão ser incluídos em nova cautela.
- Equipamentos **Avariados** não poderão ser incluídos em nova cautela.
- Equipamentos **Inativos** não poderão ser incluídos em nova cautela.

## Comportamento

Caso algum equipamento não esteja disponível:

- Impedir emissão da cautela.
- Exibir motivo da indisponibilidade.
- Registrar tentativa em auditoria (opcional).

---

# 12. Fluxo de Saída

1. Selecionar colaborador.
2. Selecionar equipamentos.
3. Validar disponibilidade.
4. Conferir acessórios.
5. Executar checklist de saída.
6. Emitir cautela.
7. Gerar documento PDF.
8. Atualizar status dos equipamentos.

---

# 13. Situações da Cautela

| Status        | Descrição                          |
| ------------- | ---------------------------------- |
| Aberta        | Criada e aguardando retirada       |
| Em Uso        | Equipamento retirado               |
| Atrasada      | Prazo expirado                     |
| Finalizada    | Devolução concluída                |
| Cancelada     | Empréstimo cancelado               |
| Com Pendência | Existem avarias ou itens faltantes |

---

# 14. Atualização Automática de Status dos Equipamentos

O sistema deverá manter sincronismo automático entre cautelas e equipamentos.

---

## Emissão da Cautela

### Ação

- Cautela → Em Uso
- Equipamento → Emprestado

### Resultado

O equipamento deixa de estar disponível para novas cautelas.

---

## Cancelamento da Cautela

### Ação

- Cautela → Cancelada
- Equipamento → Disponível

---

## Devolução sem Pendências

### Ação

- Cautela → Finalizada
- Equipamento → Disponível

---

## Devolução com Avarias

### Ação

- Cautela → Com Pendência
- Equipamento → Avariado

### Restrição

O equipamento não poderá ser emprestado até regularização.

---

## Encaminhamento para Manutenção

### Ação

- Equipamento → Em Manutenção

### Restrição

Não poderá ser cautelado.

---

## Finalização da Manutenção

### Ação

- Equipamento → Disponível

---

# 15. Fluxo de Estados

```text
Disponível
    │
    ▼
Emprestado
    │
    ├──► Disponível
    │
    ├──► Avariado
    │
    └──► Em Manutenção
                 │
                 ▼
            Disponível
```

---

# 16. Processo de Devolução

1. Localizar cautela.
2. Executar checklist de devolução.
3. Conferir acessórios.
4. Registrar observações.
5. Registrar avarias.
6. Atualizar status do equipamento.
7. Finalizar cautela.

---

# 17. Documento de Cautela

O sistema deverá gerar PDF contendo:

## Cabeçalho

- Logo da organização
- Nome da organização
- Número da cautela

## Responsável

- Nome
- Matrícula
- E-mail
- Telefone

## Equipamentos

- Nome
- Patrimônio
- Marca
- Modelo

## Acessórios

Lista completa dos acessórios entregues.

## Datas

- Emissão
- Retirada
- Retorno previsto
- Retorno efetivo

## Termo de Responsabilidade

Texto padrão definindo a responsabilidade do colaborador pela guarda e conservação dos equipamentos.

## Assinaturas

- Gestor
- Colaborador

---

# 18. Histórico e Auditoria

Registrar:

- Cadastro
- Alteração
- Exclusão lógica
- Emissão de cautela
- Cancelamento
- Devolução
- Mudança de status
- Registro de avarias
- Alterações de usuários
- Alterações de acessórios

---

# 19. Dashboard

## Indicadores

- Total de equipamentos
- Disponíveis
- Emprestados
- Em manutenção
- Avariados
- Cautelas abertas
- Cautelas atrasadas

## Gráficos

- Utilização mensal
- Equipamentos mais utilizados
- Histórico de empréstimos

---

# 20. Relatórios

## Equipamentos

- Disponíveis
- Emprestados
- Em manutenção
- Avariados

## Cautelas

- Em aberto
- Em uso
- Atrasadas
- Finalizadas
- Pendentes

## Utilização

- Equipamentos mais utilizados
- Usuários com mais empréstimos
- Histórico por período

---

# 21. Regras de Negócio

### RN001

Somente gestores podem emitir cautelas.

### RN002

Somente gestores podem cadastrar usuários.

### RN003

Toda cautela deve possuir checklist de saída preenchido.

### RN004

Toda devolução deve possuir checklist de retorno preenchido.

### RN005

Acessórios devem ser conferidos na saída e devolução.

### RN006

O sistema deve identificar automaticamente cautelas atrasadas.

### RN007

Toda ação deve gerar auditoria.

### RN008

O sistema deve validar disponibilidade antes da emissão da cautela.

### RN009

Equipamentos com status diferente de Disponível não podem ser cautelados.

### RN010

Ao emitir uma cautela, o equipamento deve ser automaticamente alterado para Emprestado.

### RN011

Ao devolver uma cautela sem pendências, o equipamento deve ser automaticamente alterado para Disponível.

### RN012

Ao devolver uma cautela com avarias, o equipamento deve ser automaticamente alterado para Avariado.

### RN013

Equipamentos Avariados somente podem retornar para Disponível mediante ação de um Gestor.

### RN014

Toda alteração automática de status deve gerar registro de auditoria.

---

# 22. Modelo Conceitual de Dados

## Usuario

- id
- nome
- email
- senha
- perfil
- status

## Categoria

- id
- nome

## Equipamento

- id
- categoria_id
- codigo_patrimonial
- nome
- marca
- modelo
- numero_serie
- status

## Acessorio

- id
- equipamento_id
- nome
- descricao

## Checklist

- id
- nome
- tipo

## ChecklistPergunta

- id
- checklist_id
- pergunta

## Cautela

- id
- numero
- usuario_id
- status
- data_emissao
- data_retirada
- data_prevista_retorno
- data_retorno

## CautelaEquipamento

- id
- cautela_id
- equipamento_id

## RespostaChecklist

- id
- cautela_id
- pergunta_id
- resposta

## Historico

- id
- entidade
- entidade_id
- acao
- usuario_id
- data_hora
- detalhes

---

# 23. Requisitos Não Funcionais

- Aplicação Web Responsiva.
- API REST.
- JWT Authentication.
- PostgreSQL.
- Docker.
- Docker Compose.
- Controle de acesso por perfil.
- Logs de auditoria.
- Exportação PDF.
- Soft Delete.
- Backup automatizado.
- Compatível com dispositivos móveis.
- Registro de datas em UTC.
- Adequação à LGPD.

---

# 24. Stack Recomendada

## Frontend

- Next.js
- React
- TypeScript
- TailwindCSS
- ShadCN UI

## Backend

- Prisma ORM
- JWT

## Banco de Dados

- PostgreSQL

## Infraestrutura

- Docker
- Docker Compose

## Relatórios

- Puppeteer

## Armazenamento de Arquivos

- MinIO
