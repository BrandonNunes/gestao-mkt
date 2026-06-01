# Guia de Início Rápido: Controle de Cautelas MKT

**Funcionalidade**: 001-controle-cautelas-mkt
**Data**: 2026-06-01

## Pré-requisitos

- Node.js 20+
- Docker e Docker Compose

## 1. Clonar e instalar dependências

```bash
git checkout 001-controle-cautelas-mkt
cd cautela-mkt
npm install
```

## 2. Configurar variáveis de ambiente

```bash
cp .env.example .env.local
```

**Variáveis essenciais (.env.local)**:
```
DATABASE_URL=postgresql://cautela:cautela@localhost:5432/cautela_mkt
JWT_SECRET=seu-segredo-aqui
JWT_REFRESH_SECRET=seu-refresh-segredo-aqui
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

## 3. Subir infraestrutura com Docker

```bash
docker compose -f docker/docker-compose.yml up -d
```

**Serviços iniciados**:
- PostgreSQL na porta 5432
- MinIO na porta 9000 (console em 9001)

## 4. Executar migrations do banco de dados

```bash
npx prisma migrate dev --name init
npx prisma db seed   # Cria usuário gestor padrão
```

**Credenciais iniciais**:
- Email: `admin@organizacao.com`
- Senha: `admin123` (trocar no primeiro login)

## 5. Iniciar em modo desenvolvimento

```bash
npm run dev            # http://localhost:3000
```

## 6. Primeiros passos no sistema

1. Acessar `http://localhost:3000/login`
2. Autenticar com as credenciais do gestor
3. Cadastrar categorias (ex.: Câmeras, Drones, Notebooks)
4. Cadastrar equipamentos com código patrimonial
5. Cadastrar acessórios vinculados aos equipamentos
6. Cadastrar usuários colaboradores
7. Criar checklists de saída e devolução
8. Emitir a primeira cautela

## 7. Executar testes

```bash
# Testes unitários (services + viewmodels)
npm run test

# Testes e2e (API routes)
npm run test:e2e
```

## 8. Comandos úteis

```bash
# Resetar banco de dados
npx prisma migrate reset

# Visualizar banco com Prisma Studio
npx prisma studio

# Gerar PDF de cautela (via API)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/cautelas/{id}/pdf \
  --output cautela.pdf

# Verificar logs do Docker
docker compose -f docker/docker-compose.yml logs -f
```

## Estrutura de diretórios (visão geral)

```
cautela-mkt/
├── app/                  # Next.js App Router — roteamento + API routes
│   ├── (auth)/           # Rotas públicas (login, recuperar senha)
│   ├── (dashboard)/      # Rotas autenticadas
│   └── api/              # API Routes (handlers HTTP finos)
├── src/
│   ├── middleware.ts      # JWT verification + proteção de rotas
│   ├── features/         # MVVM: auth, equipamentos, cautelas, ...
│   │   └── {dominio}/
│   │       ├── views/
│   │       ├── viewmodels/
│   │       ├── services/  # Regras de negócio (fonte de verdade)
│   │       └── models/
│   ├── components/       # UI components compartilhados
│   ├── hooks/            # Hooks React compartilhados
│   └── lib/              # prisma.ts, auth.ts (jose), validators.ts (zod)
├── prisma/               # Schema e migrations
│   └── schema.prisma
└── docker/               # Configurações Docker
    └── docker-compose.yml
```
