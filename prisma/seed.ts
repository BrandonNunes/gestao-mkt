import { PrismaClient } from "../app/generated/prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("admin123", 12);

  const gestor = await prisma.usuario.upsert({
    where: { email: "admin@organizacao.com" },
    update: {},
    create: {
      nome: "Administrador",
      email: "admin@organizacao.com",
      senha: hash,
      matricula: "000001",
      perfil: "GESTOR",
      status: "ATIVO",
      consentimento_lgpd: new Date(),
    },
  });

  console.log(`Usuário gestor criado: ${gestor.email}`);

  const colaborador = await prisma.usuario.upsert({
    where: { email: "colaborador@organizacao.com" },
    update: {},
    create: {
      nome: "Colaborador Teste",
      email: "colaborador@organizacao.com",
      senha: hash,
      matricula: "000002",
      perfil: "COLABORADOR",
      status: "ATIVO",
      consentimento_lgpd: new Date(),
    },
  });

  console.log(`Usuário colaborador criado: ${colaborador.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
