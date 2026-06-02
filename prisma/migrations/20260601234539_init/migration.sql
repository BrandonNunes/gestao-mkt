-- CreateEnum
CREATE TYPE "Perfil" AS ENUM ('GESTOR', 'COLABORADOR');

-- CreateEnum
CREATE TYPE "StatusUsuario" AS ENUM ('ATIVO', 'INATIVO');

-- CreateEnum
CREATE TYPE "StatusEquipamento" AS ENUM ('DISPONIVEL', 'EMPRESTADO', 'MANUTENCAO', 'AVARIADO', 'INATIVO');

-- CreateEnum
CREATE TYPE "StatusCautela" AS ENUM ('ABERTA', 'EM_USO', 'ATRASADA', 'FINALIZADA', 'CANCELADA', 'PENDENTE');

-- CreateEnum
CREATE TYPE "TipoChecklist" AS ENUM ('SAIDA', 'DEVOLUCAO');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "matricula" TEXT NOT NULL,
    "telefone" TEXT,
    "perfil" "Perfil" NOT NULL DEFAULT 'COLABORADOR',
    "status" "StatusUsuario" NOT NULL DEFAULT 'ATIVO',
    "consentimento_lgpd" TIMESTAMP(3),
    "data_exclusao_lgpd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipamento" (
    "id" TEXT NOT NULL,
    "codigo_patrimonial" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "categoria_id" TEXT NOT NULL,
    "marca" TEXT,
    "modelo" TEXT,
    "numero_serie" TEXT,
    "descricao" TEXT,
    "data_aquisicao" TIMESTAMP(3),
    "valor_aquisicao" DECIMAL(65,30),
    "localizacao" TEXT,
    "status" "StatusEquipamento" NOT NULL DEFAULT 'DISPONIVEL',
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Equipamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Acessorio" (
    "id" TEXT NOT NULL,
    "equipamento_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "codigo_interno" TEXT,
    "descricao" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ATIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Acessorio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Checklist" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoChecklist" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Checklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecklistPergunta" (
    "id" TEXT NOT NULL,
    "checklist_id" TEXT NOT NULL,
    "pergunta" TEXT NOT NULL,
    "obrigatoria" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ChecklistPergunta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cautela" (
    "id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "status" "StatusCautela" NOT NULL DEFAULT 'ABERTA',
    "data_emissao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_retirada" TIMESTAMP(3),
    "data_prevista_retorno" TIMESTAMP(3) NOT NULL,
    "data_retorno" TIMESTAMP(3),
    "observacoes" TEXT,
    "createdBy_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Cautela_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CautelaEquipamento" (
    "id" TEXT NOT NULL,
    "cautela_id" TEXT NOT NULL,
    "equipamento_id" TEXT NOT NULL,

    CONSTRAINT "CautelaEquipamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RespostaChecklist" (
    "id" TEXT NOT NULL,
    "cautela_id" TEXT NOT NULL,
    "pergunta_id" TEXT NOT NULL,
    "resposta" BOOLEAN NOT NULL,

    CONSTRAINT "RespostaChecklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Historico" (
    "id" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidade_id" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "data_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "detalhes" JSONB,

    CONSTRAINT "Historico_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_matricula_key" ON "Usuario"("matricula");

-- CreateIndex
CREATE INDEX "Usuario_email_idx" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Usuario_matricula_idx" ON "Usuario"("matricula");

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_nome_key" ON "Categoria"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Equipamento_codigo_patrimonial_key" ON "Equipamento"("codigo_patrimonial");

-- CreateIndex
CREATE INDEX "Equipamento_codigo_patrimonial_idx" ON "Equipamento"("codigo_patrimonial");

-- CreateIndex
CREATE INDEX "Equipamento_status_idx" ON "Equipamento"("status");

-- CreateIndex
CREATE INDEX "Equipamento_categoria_id_idx" ON "Equipamento"("categoria_id");

-- CreateIndex
CREATE INDEX "Acessorio_equipamento_id_idx" ON "Acessorio"("equipamento_id");

-- CreateIndex
CREATE INDEX "ChecklistPergunta_checklist_id_idx" ON "ChecklistPergunta"("checklist_id");

-- CreateIndex
CREATE UNIQUE INDEX "Cautela_numero_key" ON "Cautela"("numero");

-- CreateIndex
CREATE INDEX "Cautela_status_idx" ON "Cautela"("status");

-- CreateIndex
CREATE INDEX "Cautela_usuario_id_idx" ON "Cautela"("usuario_id");

-- CreateIndex
CREATE INDEX "Cautela_data_prevista_retorno_idx" ON "Cautela"("data_prevista_retorno");

-- CreateIndex
CREATE INDEX "CautelaEquipamento_cautela_id_idx" ON "CautelaEquipamento"("cautela_id");

-- CreateIndex
CREATE INDEX "CautelaEquipamento_equipamento_id_idx" ON "CautelaEquipamento"("equipamento_id");

-- CreateIndex
CREATE INDEX "RespostaChecklist_cautela_id_idx" ON "RespostaChecklist"("cautela_id");

-- CreateIndex
CREATE INDEX "Historico_entidade_entidade_id_idx" ON "Historico"("entidade", "entidade_id");

-- CreateIndex
CREATE INDEX "Historico_usuario_id_idx" ON "Historico"("usuario_id");

-- CreateIndex
CREATE INDEX "Historico_data_hora_idx" ON "Historico"("data_hora");

-- AddForeignKey
ALTER TABLE "Equipamento" ADD CONSTRAINT "Equipamento_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Acessorio" ADD CONSTRAINT "Acessorio_equipamento_id_fkey" FOREIGN KEY ("equipamento_id") REFERENCES "Equipamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistPergunta" ADD CONSTRAINT "ChecklistPergunta_checklist_id_fkey" FOREIGN KEY ("checklist_id") REFERENCES "Checklist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cautela" ADD CONSTRAINT "Cautela_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cautela" ADD CONSTRAINT "Cautela_createdBy_id_fkey" FOREIGN KEY ("createdBy_id") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CautelaEquipamento" ADD CONSTRAINT "CautelaEquipamento_cautela_id_fkey" FOREIGN KEY ("cautela_id") REFERENCES "Cautela"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CautelaEquipamento" ADD CONSTRAINT "CautelaEquipamento_equipamento_id_fkey" FOREIGN KEY ("equipamento_id") REFERENCES "Equipamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RespostaChecklist" ADD CONSTRAINT "RespostaChecklist_cautela_id_fkey" FOREIGN KEY ("cautela_id") REFERENCES "Cautela"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RespostaChecklist" ADD CONSTRAINT "RespostaChecklist_pergunta_id_fkey" FOREIGN KEY ("pergunta_id") REFERENCES "ChecklistPergunta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Historico" ADD CONSTRAINT "Historico_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
