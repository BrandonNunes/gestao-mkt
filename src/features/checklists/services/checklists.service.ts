import prisma from "@/src/lib/prisma";

export async function list(tipo?: string) {
  const where: Record<string, unknown> = { deletedAt: null };
  if (tipo) where.tipo = tipo;
  return prisma.checklist.findMany({
    where,
    include: { _count: { select: { perguntas: true } } },
    orderBy: { nome: "asc" },
  });
}

export async function getById(id: string) {
  return prisma.checklist.findUnique({
    where: { id, deletedAt: null },
    include: { perguntas: { where: { deletedAt: null }, orderBy: { ordem: "asc" } } },
  });
}

export async function create(data: {
  nome: string;
  tipo: "SAIDA" | "DEVOLUCAO";
  perguntas: { pergunta: string; obrigatoria: boolean; ordem: number }[];
}) {
  return prisma.checklist.create({
    data: {
      nome: data.nome,
      tipo: data.tipo,
      perguntas: { create: data.perguntas },
    },
    include: { perguntas: true },
  });
}

export async function update(id: string, data: { nome?: string; perguntas?: { pergunta: string; obrigatoria: boolean; ordem: number }[] }) {
  return prisma.$transaction(async (tx) => {
    if (data.perguntas) {
      await tx.checklistPergunta.updateMany({ where: { checklist_id: id }, data: { deletedAt: new Date() } });
      await tx.checklistPergunta.createMany({
        data: data.perguntas.map((p) => ({ ...p, checklist_id: id })),
      });
    }
    return tx.checklist.update({
      where: { id },
      data: { nome: data.nome },
      include: { perguntas: { where: { deletedAt: null }, orderBy: { ordem: "asc" } } },
    });
  });
}

export async function softDelete(id: string) {
  await prisma.checklist.update({ where: { id }, data: { deletedAt: new Date() } });
}
