import { prisma } from "@/src/lib/prisma";

export async function listByEquipamento(equipamento_id: string) {
  return prisma.acessorio.findMany({
    where: { equipamento_id, deletedAt: null },
    orderBy: { nome: "asc" },
  });
}

export async function create(
  equipamento_id: string,
  data: { nome: string; codigo_interno?: string; descricao?: string },
) {
  return prisma.acessorio.create({ data: { ...data, equipamento_id } });
}

export async function update(id: string, data: Record<string, unknown>) {
  return prisma.acessorio.update({ where: { id }, data });
}

export async function softDelete(id: string) {
  await prisma.acessorio.update({ where: { id }, data: { deletedAt: new Date() } });
}
