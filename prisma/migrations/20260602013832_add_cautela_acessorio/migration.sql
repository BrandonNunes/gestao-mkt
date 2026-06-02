-- CreateTable
CREATE TABLE "CautelaAcessorio" (
    "id" TEXT NOT NULL,
    "cautela_id" TEXT NOT NULL,
    "acessorio_id" TEXT NOT NULL,

    CONSTRAINT "CautelaAcessorio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CautelaAcessorio_cautela_id_idx" ON "CautelaAcessorio"("cautela_id");

-- CreateIndex
CREATE INDEX "CautelaAcessorio_acessorio_id_idx" ON "CautelaAcessorio"("acessorio_id");

-- AddForeignKey
ALTER TABLE "CautelaAcessorio" ADD CONSTRAINT "CautelaAcessorio_cautela_id_fkey" FOREIGN KEY ("cautela_id") REFERENCES "Cautela"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CautelaAcessorio" ADD CONSTRAINT "CautelaAcessorio_acessorio_id_fkey" FOREIGN KEY ("acessorio_id") REFERENCES "Acessorio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
