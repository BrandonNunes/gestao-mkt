# Feature Specification: CRUD via Diálogos para Equipamentos, Usuários e Checklists

**Feature Branch**: `002-crud-dialogs`

**Created**: 2026-06-01

**Status**: Draft

**Input**: User description: "gere uma spec para implementar na tela de equipamentos um botão para ir a uma tela de cadastro de equipamento, siga o que esta no model de Equipamento, na tela de usuarios precisa ter a opçãon de conseguir manipular cada usuario(apenas perfil gestor pode manipular), tela de Checklists tambem não possui opção de cadastro nela, preciso que todas essas inclusões sejam feitas em Dialogs com um form para cada um"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Criação e Edição de Equipamento via Diálogo (Priority: P1)

Como gestor do setor de marketing, quero abrir um diálogo modal a partir da tela de listagem de equipamentos para cadastrar um novo equipamento ou editar um existente, preenchendo todos os campos do modelo (código patrimonial, nome, categoria, marca, modelo, número de série, descrição, data de aquisição, valor, localização e observações), para manter o catálogo atualizado sem sair da página de listagem.

**Why this priority**: O cadastro e edição de equipamentos são pré-requisitos para todo o fluxo de cautelas. O diálogo modal preserva o contexto da listagem, melhorando a experiência do usuário.

**Independent Test**: Pode ser totalmente testado acessando a tela de equipamentos como gestor, clicando no botão "Novo Equipamento" para criar ou no botão "Editar" em uma linha para alterar, preenchendo o formulário e verificando que o equipamento aparece atualizado na listagem após submissão bem-sucedida.

**Acceptance Scenarios**:

1. **Given** um gestor está na tela de listagem de equipamentos, **When** clica no botão "Novo Equipamento", **Then** um diálogo modal abre com um formulário contendo todos os campos do modelo Equipamento vazios.
2. **Given** o diálogo de cadastro está aberto, **When** o gestor preenche todos os campos obrigatórios e clica "Salvar", **Then** o equipamento é criado com status inicial "Disponível", o diálogo fecha e a listagem é atualizada automaticamente.
3. **Given** um gestor visualiza a tabela de equipamentos, **When** clica no botão "Editar" em uma linha, **Then** um diálogo modal abre com os dados atuais do equipamento preenchidos em todos os campos.
4. **Given** o diálogo de edição está aberto com dados preenchidos, **When** o gestor altera campos e clica "Salvar", **Then** o equipamento é atualizado, o diálogo fecha e a listagem reflete as alterações.
5. **Given** o diálogo está aberto, **When** o gestor submete o formulário com campos obrigatórios vazios, **Then** o sistema exibe mensagens de validação indicando quais campos são obrigatórios e impede a submissão.
6. **Given** o diálogo está aberto, **When** o gestor clica em "Cancelar" ou fora do diálogo, **Then** o diálogo fecha sem salvar e os dados preenchidos são descartados.
7. **Given** um colaborador está na tela de listagem de equipamentos, **When** visualiza a página, **Then** os botões "Novo Equipamento" e "Editar" não são exibidos.

---

### User Story 2 - Manipulação de Usuários via Diálogos (Priority: P1)

Como gestor do setor de marketing, quero poder cadastrar novos usuários e manipular cada usuário existente (editar dados, ativar/inativar) diretamente da tela de listagem através de diálogos modais, para gerenciar o acesso ao sistema de forma ágil e centralizada.

**Why this priority**: A gestão de usuários é essencial para controle de acesso. A tela atual apenas lista usuários sem oferecer ações. É necessário permitir cadastro, edição e ativação/inativação para que o sistema possa ser operado com diferentes perfis.

**Independent Test**: Pode ser testado acessando a tela de usuários como gestor, utilizando os botões de ação em cada linha da tabela para editar um usuário e ativar/inativar, além do botão global de cadastro, verificando que cada ação reflete corretamente na listagem.

**Acceptance Scenarios**:

1. **Given** um gestor está na tela de listagem de usuários, **When** clica no botão "Novo Usuário", **Then** um diálogo modal abre com formulário contendo campos: nome, e-mail, matrícula, telefone, perfil (Gestor/Colaborador) e senha inicial.
2. **Given** o diálogo de cadastro de usuário está aberto, **When** o gestor preenche todos os campos obrigatórios e clica "Salvar", **Then** o usuário é criado com status "Ativo", o diálogo fecha e a listagem é atualizada.
3. **Given** um gestor visualiza a tabela de usuários, **When** clica no botão "Editar" em uma linha, **Then** um diálogo modal abre com os dados atuais do usuário preenchidos, permitindo alterar nome, e-mail, matrícula, telefone e perfil.
4. **Given** o diálogo de edição está aberto, **When** o gestor altera campos e clica "Salvar", **Then** os dados do usuário são atualizados, o diálogo fecha e a listagem reflete as alterações.
5. **Given** um gestor visualiza a tabela de usuários, **When** clica no botão "Ativar" ou "Inativar" em uma linha, **Then** o status do usuário é alternado imediatamente (com confirmação prévia via diálogo de confirmação) e a listagem reflete a mudança.
6. **Given** um gestor tenta inativar o próprio usuário, **When** confirma a ação, **Then** o sistema impede a auto-inativação e exibe mensagem de erro apropriada.
7. **Given** um colaborador acessa a tela de usuários, **When** a página carrega, **Then** é exibida mensagem de acesso restrito e nenhum botão de ação é visível.

---

### User Story 3 - Criação e Edição de Checklists com Perguntas via Diálogo (Priority: P2)

Como gestor do setor de marketing, quero cadastrar e editar checklists (de saída e devolução) com suas respectivas perguntas através de um diálogo modal na tela de listagem, para definir e manter os roteiros de verificação usados nas cautelas sem sair do contexto da página.

**Why this priority**: Checklists são necessários para o fluxo completo de cautelas (emissão e devolução), mas dependem de equipamentos e usuários já cadastrados. É a última peça do CRUD a ser implementada.

**Independent Test**: Pode ser testado acessando a tela de checklists como gestor, clicando no botão "Novo Checklist" para criar ou "Editar" em uma linha para alterar, preenchendo nome, tipo e manipulando perguntas dinamicamente, verificando que o checklist aparece atualizado na listagem.

**Acceptance Scenarios**:

1. **Given** um gestor está na tela de listagem de checklists, **When** clica no botão "Novo Checklist", **Then** um diálogo modal abre com formulário vazio contendo campo de nome, seletor de tipo (Saída/Devolução) e uma seção para adicionar perguntas.
2. **Given** um gestor visualiza a tabela de checklists, **When** clica no botão "Editar" em uma linha, **Then** um diálogo modal abre com os dados atuais do checklist preenchidos (nome, tipo) e suas perguntas carregadas para edição.
3. **Given** o diálogo está aberto, **When** o gestor adiciona múltiplas perguntas (com texto, indicador de obrigatoriedade e ordem), preenche os demais campos e clica "Salvar", **Then** o checklist e todas as suas perguntas são salvos em uma única operação, o diálogo fecha e a listagem é atualizada.
4. **Given** o diálogo está aberto, **When** o gestor tenta salvar sem adicionar ao menos uma pergunta, **Then** o sistema exibe validação informando que é necessário ao menos uma pergunta.
5. **Given** o diálogo está aberto com perguntas já adicionadas, **When** o gestor remove uma pergunta da lista antes de salvar, **Then** a pergunta é removida do formulário e não será salva.
6. **Given** um colaborador está na tela de listagem de checklists, **When** visualiza a página, **Then** pode ver a lista de checklists mas os botões "Novo Checklist" e "Editar" não são exibidos.

---

### Edge Cases

- O que acontece quando o gestor tenta cadastrar um equipamento com código patrimonial já existente? O sistema exibe erro de unicidade e mantém o diálogo aberto com os dados preenchidos.
- O que acontece quando o gestor tenta cadastrar um usuário com e-mail ou matrícula já existentes? O sistema exibe erro de unicidade e mantém o diálogo aberto com os dados preenchidos.
- Como o sistema lida com falha de rede durante a submissão do formulário? Exibe mensagem de erro amigável e mantém o diálogo aberto para nova tentativa.
- O que acontece se o gestor fechar o diálogo acidentalmente (clicar fora ou pressionar Escape)? Os dados não salvos são perdidos — o sistema não persiste rascunhos.
- Como o formulário de checklist lida com a ordenação das perguntas? A ordem é definida automaticamente pela sequência de adição (1, 2, 3...) e pode ser alterada pelo usuário antes de salvar.

## Requirements *(mandatory)*

### Functional Requirements

#### Equipamentos

- **FR-001**: O sistema DEVE exibir um botão "Novo Equipamento" visível apenas para usuários com perfil GESTOR na tela de listagem de equipamentos.
- **FR-002**: O sistema DEVE abrir um diálogo modal (Dialog) ao clicar em "Novo Equipamento" contendo um formulário com todos os campos do modelo Equipamento vazios: código patrimonial (obrigatório), nome (obrigatório), categoria (obrigatório, selecionável de lista existente), marca, modelo, número de série, descrição, data de aquisição, valor de aquisição, localização e observações.
- **FR-003**: O sistema DEVE exibir um botão "Editar" em cada linha da tabela de equipamentos, visível apenas para GESTOR.
- **FR-004**: O sistema DEVE abrir o mesmo diálogo modal ao clicar em "Editar", com todos os campos preenchidos com os dados atuais do equipamento selecionado.
- **FR-005**: O sistema DEVE submeter POST para criação ou PUT para edição conforme o modo do diálogo.
- **FR-006**: O sistema DEVE validar campos obrigatórios antes da submissão e exibir mensagens de erro inline.
- **FR-007**: O sistema DEVE validar unicidade do código patrimonial no servidor e retornar erro específico em caso de duplicidade.
- **FR-008**: O sistema DEVE fechar o diálogo e atualizar a listagem automaticamente após criação ou edição bem-sucedida.
- **FR-009**: O sistema DEVE permitir fechar o diálogo pelo botão "Cancelar", clique fora da área do diálogo ou tecla Escape, descartando os dados preenchidos.

#### Usuários

- **FR-010**: O sistema DEVE exibir um botão "Novo Usuário" visível apenas para usuários com perfil GESTOR na tela de listagem de usuários.
- **FR-011**: O sistema DEVE abrir um diálogo modal ao clicar em "Novo Usuário" contendo formulário com os campos: nome (obrigatório), e-mail (obrigatório), matrícula (obrigatório), telefone (opcional), perfil (obrigatório, seletor Gestor/Colaborador) e senha inicial (obrigatório).
- **FR-012**: O sistema DEVE exibir um botão "Editar" em cada linha da tabela de usuários, visível apenas para GESTOR.
- **FR-013**: O sistema DEVE abrir um diálogo modal de edição ao clicar em "Editar", com os campos preenchidos com os dados atuais do usuário (exceto senha).
- **FR-014**: O sistema DEVE validar unicidade de e-mail e matrícula no servidor, retornando erro específico em caso de duplicidade.
- **FR-015**: O sistema DEVE exibir um botão "Ativar"/"Inativar" em cada linha da tabela de usuários, visível apenas para GESTOR.
- **FR-016**: O sistema DEVE abrir um diálogo de confirmação ao clicar em "Ativar" ou "Inativar", exibindo texto descritivo da ação antes de executá-la.
- **FR-017**: O sistema DEVE impedir que um gestor inative a si mesmo, exibindo mensagem de erro apropriada.
- **FR-018**: Colaboradores NÃO DEVEM visualizar botões de ação (Novo, Editar, Ativar/Inativar) na tela de usuários.

#### Checklists

- **FR-019**: O sistema DEVE exibir um botão "Novo Checklist" visível apenas para usuários com perfil GESTOR na tela de listagem de checklists.
- **FR-020**: O sistema DEVE abrir um diálogo modal ao clicar em "Novo Checklist" contendo formulário vazio com: nome do checklist (obrigatório), tipo (obrigatório, seletor Saída/Devolução) e uma lista dinâmica de perguntas.
- **FR-021**: O sistema DEVE exibir um botão "Editar" em cada linha da tabela de checklists, visível apenas para GESTOR.
- **FR-022**: O sistema DEVE abrir o mesmo diálogo modal ao clicar em "Editar", com nome, tipo e perguntas preenchidos com os dados atuais do checklist selecionado.
- **FR-023**: O sistema DEVE permitir adicionar perguntas dinamicamente no formulário, cada uma com: texto da pergunta (obrigatório), indicador de obrigatoriedade (padrão: obrigatória) e ordem (sequencial automática).
- **FR-024**: O sistema DEVE permitir remover perguntas da lista antes de salvar o checklist.
- **FR-025**: O sistema DEVE validar que ao menos uma pergunta foi adicionada antes de permitir a submissão.
- **FR-026**: O sistema DEVE salvar ou atualizar o checklist e todas as suas perguntas em uma única operação atômica (POST para criação, PUT para edição).

### Key Entities

- **Equipamento**: Código patrimonial (único), nome, categoria, marca, modelo, número de série, descrição, data de aquisição, valor de aquisição, localização, status (inicia como DISPONIVEL), observações.
- **Usuario**: Nome, e-mail (único), matrícula (único), telefone, perfil (GESTOR/COLABORADOR), status (ATIVO/INATIVO), senha (hash).
- **Checklist**: Nome, tipo (SAIDA/DEVOLUCAO). Associado a múltiplas ChecklistPergunta.
- **ChecklistPergunta**: Texto da pergunta, obrigatoriedade (booleano), ordem (inteiro sequencial). Vinculada a um Checklist.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um gestor consegue cadastrar um equipamento em até 2 minutos a partir do clique no botão "Novo Equipamento".
- **SC-002**: Um gestor consegue cadastrar um usuário em até 2 minutos a partir do clique no botão "Novo Usuário".
- **SC-003**: Um gestor consegue cadastrar um checklist com 5 perguntas em até 3 minutos a partir do clique no botão "Novo Checklist".
- **SC-004**: 100% das validações de campos obrigatórios e unicidade são aplicadas antes da submissão ao servidor (validação client-side) e reforçadas no servidor.
- **SC-005**: A listagem é atualizada em até 2 segundos após o fechamento bem-sucedido de qualquer diálogo de cadastro/edição.
- **SC-006**: Colaboradores não conseguem acessar nenhuma ação de criação/edição nas três telas (equipamentos, usuários, checklists).

## Assumptions

- O sistema já possui API endpoints para CRUD de equipamentos, usuários e checklists (conforme especificação 001-controle-cautelas-mkt).
- O componente Dialog utilizado será do ShadCN UI, já presente no projeto.
- A listagem de categorias já está disponível via API para popular o seletor de categoria no formulário de equipamento.
- O formulário de checklist permite criar e editar perguntas junto com o checklist (a edição substitui todas as perguntas via soft delete + recriação).
- A tela de listagem de checklists será criada como parte desta feature (atualmente não existe).
- Apenas o perfil GESTOR pode criar/editar; COLABORADOR tem acesso somente leitura às listagens.
- Senha de novo usuário é definida no cadastro (não há envio de e-mail de boas-vindas nesta feature).
