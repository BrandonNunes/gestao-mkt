# Pesquisa Técnica: Controle de Equipamentos e Cautelas

**Funcionalidade**: 001-controle-cautelas-mkt
**Data**: 2026-06-01

## 1. Autenticação e Autorização

**Decisão**: JWT com access token + refresh token via `jose`, middleware Next.js para
proteção de rotas, RBAC inline nos route handlers.

**Fundamentação**: O PRD especifica JWT como mecanismo de autenticação. O padrão
access + refresh token permite sessões seguras com renovação transparente. O
middleware (`src/middleware.ts`) verifica o token JWT via `jose` e redireciona para
/login se ausente ou inválido. A verificação de perfil (Gestor/Colaborador) é feita
inline nos route handlers, checando o payload do token.

**Tokens**:
- Access token: 15 min, enviado no header Authorization: Bearer <token>
- Refresh token: 7 dias, armazenado em httpOnly cookie
- Biblioteca: `jose` (recomendada pela documentação Next.js para JWT sign/verify com HS256)

---

## 2. Soft Delete com Prisma

**Decisão**: Campo `deletedAt` (DateTime nullable) em todas as tabelas, com
middleware Prisma que automaticamente filtra registros não excluídos.

**Fundamentação**: A constituição (Princípio III) exige soft delete em todos os
registros. O Prisma suporta middleware global que pode injetar `WHERE deletedAt IS NULL`
em queries `findMany`, `findFirst`, `findUnique`, `count`. Para exclusões, usa-se
`UPDATE SET deletedAt = NOW()` em vez de `DELETE`.

**Implementação**:
- Campo `deletedAt DateTime?` em todas as tabelas no schema Prisma.
- Queries explicitamente filtram `where: { deletedAt: null }`.
- Exclusão lógica via `update({ data: { deletedAt: new Date() } })` em vez de `delete()`.
- O middleware `$use` do Prisma não é mais recomendado; prefere-se filtro explícito.

---

## 3. Máquina de Estados dos Equipamentos

**Decisão**: Enum no modelo Prisma + validação de transições no service layer.

**Fundamentação**: A máquina de estados definida no PRD (seção 15) tem 5 estados
e transições bem definidas. Não justifica uma biblioteca de state machine dedicada.
A validação é feita no `EquipamentosService` com um mapa de transições permitidas.

**Transições válidas**:
```
Disponível    → Emprestado, Em Manutenção, Inativo
Emprestado    → Disponível, Avariado, Em Manutenção
Avariado      → Disponível, Em Manutenção (apenas Gestor)
Em Manutenção → Disponível
Inativo       → Disponível
```

**Sincronismo com Cautelas**: As transições `Disponível → Emprestado` e `Emprestado
→ Disponível/Avariado` são disparadas automaticamente pelo `CautelasService` durante
emissão e devolução, dentro da mesma transação Prisma (`$transaction`).

---

## 4. Geração de PDF

**Decisão**: Puppeteer para renderização HTML → PDF.

**Fundamentação**: O PRD especifica Puppeteer como ferramenta de geração de
relatórios. A abordagem HTML → PDF oferece controle preciso de layout via CSS e
permite templates reutilizáveis. O PDF é gerado sob demanda no endpoint de cautela
e armazenado no MinIO para referência futura.

**Fluxo**:
1. Frontend solicita PDF via `GET /cautelas/:id/pdf`
2. Backend renderiza template HTML com dados da cautela
3. Puppeteer converte HTML → PDF (buffer)
4. Salva no MinIO (bucket `cautelas-pdf`)
5. Retorna URL de download ou stream

**Alternativas consideradas**:
- jsPDF / pdfmake: Rejeitado por complexidade de layout (tabelas, logo, assinaturas).
  HTML/CSS é mais flexível e de fácil manutenção.
- Gerar no frontend: Rejeitado por necessidade de consistência (PDF deve ser
  imutável após geração e armazenado no servidor).

---

## 5. Auditoria (Trilha de Ações)

**Decisão**: Função utilitária `auditoriaService.log()` chamada pelos services em
cada ação crítica. Registro gravado na tabela `Historico`.

**Fundamentação**: RN007 exige que toda ação crítica gere auditoria. Cada service
chama `auditoriaService.log(entidade, entidadeId, acao, usuarioId, detalhes)` após
operações de criação, alteração, exclusão, emissão, devolução e mudança de status.

---

## 6. LGPD e Proteção de Dados Pessoais

**Decisão**: Consentimento explícito no cadastro, soft delete para exclusão, campo
`consentimento_lgpd` no modelo Usuario.

**Fundamentação**: A constituição (Princípio III) exige conformidade com LGPD. Os
dados pessoais tratados são nome, e-mail, matrícula e telefone. Implementa-se:
- Campo `consentimento_lgpd` (DateTime) registrando quando o usuário aceitou os termos.
- Campo `data_exclusao_lgpd` (DateTime) para solicitações de exclusão de dados.
- Soft delete já cobre a exclusão lógica. Para exclusão definitiva (LGPD), os dados
  são anonimizados em vez de removidos (nome → "Usuário Excluído", email → hash).

---

## 7. Estratégia de Testes

**Decisão**: Testes unitários (Jest/Vitest), testes de integração (Supertest + Prisma
em memória), testes e2e para fluxos críticos.

**Cobertura alvo**:
- Services (backend): 80%+ de cobertura unitária.
- Controllers (backend): testes de integração para todos os endpoints.
- Fluxos críticos e2e: emissão de cautela, devolução, validação de disponibilidade.
- Frontend: testes de viewmodel (hooks) com Vitest + React Testing Library.

**Alternativas consideradas**:
- Cypress/Playwright para e2e: Será considerado na Fase 2, mas Vitest + Supertest
  cobrem os cenários críticos com menor custo de configuração inicial.

---

## 8. MVVM no Next.js App Router

**Decisão**: ViewModels implementados como custom hooks React (`useEquipamentos`,
`useCautelaForm`). Views são Server Components que recebem dados iniciais e delegam
interatividade para Client Components que usam os hooks.

**Fundamentação**: A constituição (Princípio I) exige MVVM com `src/features/`.
No ecossistema React/Next.js:
- **Model**: tipos TypeScript puros em `models/` (interfaces, enums, tipos).
- **ViewModel**: custom hooks em `viewmodels/` que encapsulam estado, lógica de
  apresentação e chamadas a serviços.
- **View**: componentes React em `views/` que consomem os hooks.

Server Components do App Router são usados para a camada inicial de renderização
(SEO, carregamento inicial), enquanto Client Components com hooks implementam a
interatividade. O `app/` contém apenas `page.tsx` que importa e renderiza a View
correspondente.

---

## 9. Estrutura Backend (Next.js API Routes + Services)

**Decisão**: Next.js API Routes (`app/api/*/route.ts`) como handlers HTTP finos,
services em `src/features/*/services/` como fonte de verdade para regras de negócio.
Middleware em `src/middleware.ts` para autenticação.

**Fundamentação**: Alinhado com a constituição (Princípios I, II, IV). Stack única
Next.js full-stack reduz complexidade operacional (sem processo NestJS separado).
Services contêm as regras de negócio (validação de disponibilidade, máquina de
estados, sincronismo automático). API routes apenas extraem parâmetros da request,
validam com Zod e delegam para services.

**Padrão de API route**:
```typescript
// app/api/equipamentos/route.ts
import { NextRequest, NextResponse } from "next/server"
import * as equipamentosService from "@/src/features/equipamentos/services/equipamentos.service"
import { verifyToken } from "@/src/lib/auth"

export async function GET(request: NextRequest) {
  const user = await verifyToken(request)
  const { searchParams } = request.nextUrl
  const page = Number(searchParams.get("page")) || 1
  const result = await equipamentosService.list({ page, limit: 20 })
  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  const user = await verifyToken(request)
  if (user.perfil !== "GESTOR") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }
  const body = await request.json()
  const equipamento = await equipamentosService.create(body, user.id)
  return NextResponse.json(equipamento, { status: 201 })
}
```

**Padrão de service**:
```typescript
// src/features/equipamentos/services/equipamentos.service.ts
import prisma from "@/src/lib/prisma"
import * as auditoriaService from "@/src/features/cautelas/services/auditoria.service"

export async function list(filtros: FiltrosEquipamento) {
  return prisma.equipamento.findMany({
    where: { deletedAt: null, ...buildWhere(filtros) },
    include: { categoria: true, _count: { select: { acessorios: true } } },
    skip: (filtros.page - 1) * filtros.limit,
    take: filtros.limit,
  })
}
```
