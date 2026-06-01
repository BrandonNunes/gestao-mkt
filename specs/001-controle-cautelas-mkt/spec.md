# Especificação da Funcionalidade: Controle de Equipamentos e Cautelas do Setor de Marketing

**Branch da Funcionalidade**: `001-controle-cautelas-mkt`

**Criado em**: 2026-06-01

**Status**: Rascunho

**Entrada**: PRD - Sistema de Controle de Equipamentos e Cautelas do Setor de Marketing

## Cenários de Usuário e Testes *(obrigatório)*

### História de Usuário 1 - Autenticação e Gestão de Usuários (Prioridade: P1)

Como gestor do setor de marketing, quero cadastrar e gerenciar usuários com diferentes
perfis de acesso (Gestor e Colaborador) para que apenas pessoas autorizadas utilizem
o sistema e cada perfil tenha acesso apenas às funcionalidades adequadas à sua
responsabilidade.

**Por que esta prioridade**: A autenticação e o controle de acesso são a base de
segurança do sistema. Sem isso, não é possível garantir que apenas gestores emitam
cautelas ou que colaboradores vejam apenas seus próprios dados.

**Teste Independente**: Pode ser totalmente testado criando usuários com perfis
distintos, realizando login/logout e verificando que cada perfil acessa apenas as
funcionalidades permitidas.

**Cenários de Aceitação**:

1. **Dado** que o sistema está em execução, **Quando** um gestor acessa a tela de
   cadastro de usuários, **Então** pode preencher nome, e-mail, matrícula, telefone,
   perfil (Gestor/Colaborador) e salvar o usuário com senha inicial.
2. **Dado** que existe um usuário cadastrado, **Quando** ele informa e-mail e senha
   corretos, **Então** o sistema autentica e redireciona para o dashboard conforme
   seu perfil.
3. **Dado** que um usuário está autenticado, **Quando** tenta acessar uma
   funcionalidade exclusiva de gestor (ex.: cadastro de usuários), **Então** o
   sistema bloqueia o acesso se seu perfil for Colaborador.
4. **Dado** que um usuário esqueceu sua senha, **Quando** solicita recuperação pelo
   e-mail cadastrado, **Então** recebe um link para redefinir a senha.
5. **Dado** que um gestor deseja desativar um usuário, **Quando** altera o status
   para Inativo, **Então** o usuário não consegue mais autenticar-se no sistema.

---

### História de Usuário 2 - Cadastro de Equipamentos, Categorias e Acessórios (Prioridade: P1)

Como gestor, quero cadastrar e gerenciar o catálogo completo de equipamentos do
setor, incluindo categorias e acessórios vinculados, para manter o inventário
organizado e atualizado antes de iniciar o controle de empréstimos.

**Por que esta prioridade**: Sem equipamentos cadastrados não há o que emprestar.
O catálogo é pré-requisito para o módulo de cautelas.

**Teste Independente**: Pode ser totalmente testado cadastrando categorias,
equipamentos com todos os campos e acessórios vinculados, verificando listagem,
edição e consulta.

**Cenários de Aceitação**:

1. **Dado** que um gestor está autenticado, **Quando** cadastra uma nova categoria
   (ex.: "Câmeras"), **Então** ela aparece disponível para vinculação a equipamentos.
2. **Dado** que um gestor está autenticado, **Quando** cadastra um equipamento com
   código patrimonial, nome, categoria, marca, modelo, número de série, descrição,
   data de aquisição e valor, **Então** o equipamento é salvo com status inicial
   "Disponível".
3. **Dado** que um equipamento existe, **Quando** o gestor vincula acessórios
   (ex.: bateria, carregador, cartão SD), **Então** estes ficam associados ao
   equipamento e visíveis na consulta.
4. **Dado** que o catálogo possui equipamentos, **Quando** um colaborador acessa
   a listagem, **Então** visualiza todos os equipamentos com seus status atuais,
   mas não pode editar nem excluir.
5. **Dado** que um equipamento possui acessórios vinculados, **Quando** um
   acessório é desativado, **Então** ele não aparece mais nas novas cautelas,
   mas mantém o histórico.

---

### História de Usuário 3 - Emissão de Cautela com Validação e Checklist (Prioridade: P1)

Como gestor, quero emitir uma cautela selecionando o colaborador responsável, os
equipamentos desejados e executando o checklist de saída, para formalizar o
empréstimo com validação de disponibilidade e registro de responsabilidade.

**Por que esta prioridade**: A emissão de cautela é a funcionalidade central do
sistema — sem ela, o controle de empréstimos não existe. Esta história entrega o
MVP principal.

**Teste Independente**: Pode ser totalmente testado criando uma cautela completa:
selecionar colaborador, escolher equipamentos disponíveis, verificar bloqueio de
indisponíveis, preencher checklist de saída, emitir a cautela e verificar que o
status dos equipamentos mudou para "Emprestado".

**Cenários de Aceitação**:

1. **Dado** que um gestor está autenticado, **Quando** inicia uma nova cautela e
   seleciona um colaborador ativo, **Então** prossegue para a seleção de equipamentos.
2. **Dado** que o gestor selecionou equipamentos, **Quando** um deles está com
   status diferente de "Disponível", **Então** o sistema bloqueia a emissão e exibe
   o motivo da indisponibilidade.
3. **Dado** que todos os equipamentos estão disponíveis, **Quando** o gestor confere
   os acessórios e preenche o checklist de saída (respondendo todas as perguntas
   obrigatórias), **Então** a cautela é emitida com número sequencial e status
   "Em Uso".
4. **Dado** que a cautela foi emitida, **Quando** o sistema processa a emissão,
   **Então** o status de cada equipamento é automaticamente alterado para
   "Emprestado" e a cautela fica registrada com data/hora de emissão e retirada.
5. **Dado** que a cautela foi emitida, **Quando** o gestor solicita, **Então** o
   sistema gera um documento PDF com cabeçalho da organização, dados do responsável,
   lista de equipamentos e acessórios, datas e termo de responsabilidade.

---

### História de Usuário 4 - Devolução de Equipamentos com Checklist (Prioridade: P2)

Como gestor, quero registrar a devolução de equipamentos emprestados, executando o
checklist de retorno e registrando eventuais avarias ou pendências, para finalizar
o ciclo de empréstimo e atualizar a disponibilidade dos equipamentos.

**Por que esta prioridade**: A devolução fecha o ciclo de empréstimo. Embora seja
parte essencial do processo, depende da existência de cautelas emitidas (US3).

**Teste Independente**: Pode ser testado localizando uma cautela em uso, executando
o checklist de devolução, registrando ou não avarias, finalizando a devolução e
verificando a atualização correta dos status.

**Cenários de Aceitação**:

1. **Dado** que existem cautelas em uso, **Quando** o gestor localiza uma cautela
   específica, **Então** visualiza todos os dados da cautela e pode iniciar a
   devolução.
2. **Dado** que a devolução foi iniciada, **Quando** o gestor preenche o checklist
   de retorno sem registrar avarias e confere os acessórios, **Então** a cautela é
   finalizada e os equipamentos retornam para status "Disponível".
3. **Dado** que durante a devolução são identificadas avarias, **Quando** o gestor
   registra os danos no checklist, **Então** a cautela fica com status "Com
   Pendência" e os equipamentos avariados ficam com status "Avariado".
4. **Dado** que um equipamento está "Avariado", **Quando** um gestor tenta
   emprestá-lo, **Então** o sistema impede até que o gestor regularize o status
   manualmente.
5. **Dado** que uma cautela tem data prevista de retorno expirada, **Quando** o
   sistema verifica as cautelas, **Então** ela é automaticamente marcada como
   "Atrasada".

---

### História de Usuário 5 - Dashboard e Indicadores (Prioridade: P2)

Como gestor, quero visualizar um dashboard com indicadores e gráficos sobre o
estado dos equipamentos e cautelas, para tomar decisões rápidas sobre
disponibilidade, gargalos e utilização.

**Por que esta prioridade**: A visibilidade gerencial é importante, mas o sistema
pode operar sem dashboard nos estágios iniciais. A operação básica (US1-US4) tem
precedência.

**Teste Independente**: Pode ser testado acessando o dashboard após operações de
cadastro e cautelas, verificando se os contadores e gráficos refletem corretamente
os dados do sistema.

**Cenários de Aceitação**:

1. **Dado** que existem equipamentos cadastrados, **Quando** o gestor acessa o
   dashboard, **Então** visualiza os indicadores: total de equipamentos,
   disponíveis, emprestados, em manutenção e avariados.
2. **Dado** que existem cautelas registradas, **Quando** o gestor acessa o
   dashboard, **Então** visualiza os indicadores: cautelas abertas e atrasadas.
3. **Dado** que há histórico de utilização, **Quando** o gestor visualiza os
   gráficos, **Então** vê a utilização mensal e os equipamentos mais utilizados.

---

### História de Usuário 6 - Histórico e Auditoria (Prioridade: P3)

Como gestor, quero consultar o histórico completo de todas as ações realizadas no
sistema, para fins de auditoria, rastreabilidade e conformidade.

**Por que esta prioridade**: A auditoria é um requisito de conformidade, mas não
bloqueia a operação do sistema. Pode ser implementada incrementalmente enquanto as
funcionalidades principais já registram os eventos.

**Teste Independente**: Pode ser testado realizando ações no sistema (cadastros,
cautelas, devoluções) e verificando que cada ação gerou um registro de auditoria
com data/hora, usuário, entidade, ação e detalhes.

**Cenários de Aceitação**:

1. **Dado** que um usuário realiza qualquer ação de cadastro, alteração ou exclusão,
   **Quando** o sistema processa a ação, **Então** um registro de auditoria é gerado
   automaticamente com entidade, ID, ação, usuário responsável, data/hora UTC e
   detalhes.
2. **Dado** que existem registros de auditoria, **Quando** o gestor acessa a tela
   de histórico, **Então** pode filtrar por entidade, ação, usuário e período.
3. **Dado** que um registro foi excluído logicamente (soft delete), **Quando** o
   gestor consulta o histórico, **Então** a exclusão aparece registrada sem que
   os dados originais sejam perdidos.

---

### História de Usuário 7 - Relatórios e Exportação (Prioridade: P3)

Como gestor, quero gerar relatórios sobre equipamentos, cautelas e utilização, com
possibilidade de exportação, para análise gerencial e prestação de contas.

**Por que esta prioridade**: Relatórios agregam valor analítico, mas dependem da
existência de dados operacionais. São o último nível de maturidade do sistema.

**Teste Independente**: Pode ser testado gerando cada tipo de relatório e verificando
a precisão dos dados exibidos e a exportação em formato utilizável.

**Cenários de Aceitação**:

1. **Dado** que existem equipamentos em diversos status, **Quando** o gestor solicita
   o relatório de equipamentos, **Então** visualiza listas segmentadas por status
   (disponíveis, emprestados, em manutenção, avariados).
2. **Dado** que existem cautelas em diferentes situações, **Quando** o gestor solicita
   o relatório de cautelas, **Então** visualiza listas segmentadas (em aberto, em
   uso, atrasadas, finalizadas, pendentes).
3. **Dado** que há histórico de empréstimos, **Quando** o gestor solicita o
   relatório de utilização por período, **Então** visualiza equipamentos mais
   utilizados e usuários com mais empréstimos.

---

### Casos de Borda

- O que acontece quando um colaborador tenta retirar equipamento sem que o checklist
  de saída esteja completamente preenchido? O sistema deve bloquear a emissão da
  cautela.
- O que acontece se um equipamento for danificado durante o empréstimo e o
  colaborador reportar antes da devolução formal? O sistema deve permitir o registro
  da avaria a qualquer momento durante o período de empréstimo.
- Como o sistema lida com múltiplas cautelas ativas para o mesmo colaborador? O
  sistema deve permitir que um colaborador tenha várias cautelas simultâneas, desde
  que envolvam equipamentos diferentes.
- O que acontece quando uma cautela atrasada precisa ser renovada? O gestor deve
  poder estender a data prevista de retorno, gerando registro de auditoria.
- O que acontece se um acessório for perdido mas o equipamento principal retornar
  intacto? A cautela fica "Com Pendência" para o acessório faltante, e o equipamento
  pode retornar para "Disponível" após registro da pendência.
- Como o sistema trata a exclusão de uma categoria que possui equipamentos
  vinculados? Deve impedir a exclusão enquanto houver equipamentos associados.
- O que acontece com a cautela se o colaborador responsável for desativado? A
  cautela mantém o vínculo histórico, mas o colaborador não pode mais autenticar-se.

## Requisitos *(obrigatório)*

### Requisitos Funcionais

- **FR-001**: O sistema DEVE permitir autenticação de usuários por e-mail e senha,
  com emissão de token de autenticação segura e controle de sessão.
- **FR-002**: O sistema DEVE oferecer recuperação de senha via e-mail cadastrado e
  permitir alteração de senha pelo usuário autenticado.
- **FR-003**: O sistema DEVE possuir dois perfis de acesso: Gestor (acesso total) e
  Colaborador (acesso restrito a consulta de catálogo e histórico próprio).
- **FR-004**: O sistema DEVE permitir ao Gestor cadastrar, editar, inativar e
  reativar usuários com os campos: nome, e-mail, matrícula, telefone, perfil e
  status.
- **FR-005**: O sistema DEVE permitir ao Gestor cadastrar, editar, desativar e
  excluir logicamente categorias de equipamentos.
- **FR-006**: O sistema DEVE permitir ao Gestor cadastrar, editar e gerenciar
  equipamentos com os campos: código patrimonial, nome, categoria, marca, modelo,
  número de série, descrição, data de aquisição, valor de aquisição, localização
  atual e observações.
- **FR-007**: Cada equipamento DEVE possuir um status entre: Disponível,
  Emprestado, Em Manutenção, Avariado e Inativo.
- **FR-008**: O sistema DEVE permitir ao Gestor cadastrar, editar, ativar e
  desativar acessórios vinculados a equipamentos.
- **FR-009**: O sistema DEVE permitir ao Gestor criar checklists parametrizados
  (saída e devolução) com perguntas de resposta Sim/Não, indicando quais são
  obrigatórias e sua ordem de exibição.
- **FR-010**: O sistema DEVE permitir ao Gestor emitir cautelas selecionando um
  colaborador responsável e um ou mais equipamentos com seus acessórios.
- **FR-011**: Antes da emissão, o sistema DEVE validar que todos os equipamentos
  selecionados estão com status "Disponível". Caso contrário, DEVE bloquear a
  emissão e exibir o motivo.
- **FR-012**: Toda cautela emitida DEVE ter o checklist de saída preenchido
  integralmente, incluindo perguntas obrigatórias.
- **FR-013**: Ao emitir uma cautela, o sistema DEVE automaticamente alterar:
  cautela para "Em Uso" e equipamentos para "Emprestado".
- **FR-014**: O sistema DEVE gerar um número sequencial único para cada cautela.
- **FR-015**: O sistema DEVE permitir ao Gestor registrar a devolução de cautelas,
  executando o checklist de retorno e conferindo acessórios.
- **FR-016**: Na devolução sem avarias, o sistema DEVE automaticamente alterar:
  cautela para "Finalizada" e equipamentos para "Disponível".
- **FR-017**: Na devolução com avarias registradas, o sistema DEVE automaticamente
  alterar: cautela para "Com Pendência" e equipamentos para "Avariado".
- **FR-018**: Equipamentos "Avariados" somente podem retornar para "Disponível"
  mediante ação explícita de um Gestor.
- **FR-019**: O sistema DEVE identificar automaticamente cautelas cuja data prevista
  de retorno foi excedida e marcá-las como "Atrasadas".
- **FR-020**: O sistema DEVE permitir ao Gestor cancelar uma cautela, retornando os
  equipamentos para "Disponível".
- **FR-021**: O sistema DEVE permitir ao Gestor encaminhar um equipamento para
  manutenção (status "Em Manutenção") e finalizar a manutenção retornando para
  "Disponível".
- **FR-022**: O sistema DEVE gerar um documento PDF da cautela contendo: cabeçalho
  da organização, dados do responsável, lista de equipamentos e acessórios, datas,
  termo de responsabilidade e campos para assinatura.
- **FR-023**: O sistema DEVE registrar automaticamente em trilha de auditoria toda
  ação de: cadastro, alteração, exclusão lógica, emissão de cautela, cancelamento,
  devolução, mudança de status e registro de avarias.
- **FR-024**: Cada registro de auditoria DEVE conter: entidade afetada, ID da
  entidade, ação realizada, usuário responsável, data/hora em UTC e detalhes.
- **FR-025**: O sistema DEVE disponibilizar um dashboard com indicadores: total de
  equipamentos, disponíveis, emprestados, em manutenção, avariados, cautelas
  abertas e cautelas atrasadas.
- **FR-026**: O dashboard DEVE exibir gráficos de utilização mensal e equipamentos
  mais utilizados.
- **FR-027**: O sistema DEVE oferecer relatórios de equipamentos por status,
  cautelas por situação e utilização por período.
- **FR-028**: O sistema DEVE adotar exclusão lógica (soft delete) para todos os
  registros, garantindo que dados nunca sejam fisicamente removidos.
- **FR-029**: O colaborador DEVE poder visualizar o catálogo de equipamentos,
  consultar equipamentos disponíveis, visualizar suas próprias cautelas e
  histórico.
- **FR-030**: O sistema DEVE ser responsivo, funcionando adequadamente em
  dispositivos móveis.

### Entidades-Chave

- **Usuário**: Pessoa que acessa o sistema. Possui nome, e-mail, matrícula,
  telefone, perfil (Gestor/Colaborador), status (Ativo/Inativo) e senha.
  Relaciona-se com Cautelas como responsável.
- **Categoria**: Agrupamento de equipamentos por tipo (ex.: Câmeras, Drones).
  Possui nome.
- **Equipamento**: Item patrimonial gerenciado pelo sistema. Possui código
  patrimonial, nome, categoria, marca, modelo, número de série, descrição, data
  de aquisição, valor, localização, status e observações. Pode ter múltiplos
  Acessórios e ser incluído em múltiplas Cautelas.
- **Acessório**: Item complementar vinculado a um Equipamento. Possui nome, código
  interno, descrição e status (Ativo/Inativo).
- **Checklist**: Conjunto de perguntas parametrizadas para verificação. Possui nome
  e tipo (Saída/Devolução). Contém múltiplas Perguntas.
- **Pergunta de Checklist**: Item individual do checklist. Possui texto, indicador
  de obrigatoriedade e ordem.
- **Cautela**: Documento que formaliza o empréstimo. Possui número sequencial,
  responsável (Usuário), status, datas de emissão, retirada, previsão de retorno e
  retorno efetivo, além de observações. Contém múltiplos Equipamentos e suas
  respostas de checklist.
- **Resposta de Checklist**: Resposta a uma pergunta de checklist durante uma
  cautela específica. Vincula Cautela, Pergunta e a resposta (Sim/Não).
- **Histórico/Auditoria**: Registro imutável de cada ação no sistema. Possui
  entidade, ID da entidade, ação, usuário, data/hora UTC e detalhes.

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **SC-001**: Um gestor consegue cadastrar um novo equipamento em menos de 2
  minutos.
- **SC-002**: Um gestor consegue emitir uma cautela completa (seleção de
  colaborador, equipamentos, checklist e confirmação) em menos de 5 minutos.
- **SC-003**: Um gestor consegue registrar uma devolução completa (localização da
  cautela, checklist e finalização) em menos de 3 minutos.
- **SC-004**: O sistema identifica e sinaliza cautelas atrasadas em até 1 minuto
  após a data prevista de retorno ser excedida.
- **SC-005**: 100% das ações críticas (cadastro, alteração, exclusão, emissão de
  cautela, devolução, mudança de status) geram registro de auditoria.
- **SC-006**: O dashboard reflete os indicadores com precisão de 100% em relação
  aos dados do sistema, com atualização em tempo real ou quase real.
- **SC-007**: O sistema bloqueia 100% das tentativas de emissão de cautela com
  equipamentos indisponíveis, exibindo o motivo corretamente.
- **SC-008**: A geração do PDF da cautela é concluída em menos de 30 segundos após
  a solicitação.

## Suposições

- Os usuários possuem acesso a um navegador web moderno e conexão com a internet.
- A organização possui um logo e nome formal que serão configurados no sistema para
  uso nos documentos PDF.
- O termo de responsabilidade segue um texto padrão definido pela organização, que
  será cadastrado no sistema pelo Gestor.
- As assinaturas no documento PDF são campos para assinatura física (o documento é
  impresso e assinado manualmente), não sendo necessária assinatura digital
  certificada na versão inicial.
- O backup automatizado será executado diariamente, em horário de menor utilização.
- Os dados pessoais tratados pelo sistema limitam-se a nome, e-mail, matrícula e
  telefone, sendo armazenados conforme diretrizes da LGPD (finalidade específica,
  consentimento, possibilidade de exclusão).
- A aplicação atenderá inicialmente um único setor (Marketing), mas a arquitetura
  permitirá expansão futura para outros setores.
- O colaborador pode ter múltiplas cautelas ativas simultaneamente, desde que para
  equipamentos diferentes.
- As datas registradas no sistema seguem o padrão UTC para consistência,
  independentemente do fuso horário do usuário.
