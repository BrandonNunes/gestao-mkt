import { prisma } from "@/src/lib/prisma";

export async function list(page = 1, limit = 50, search?: string) {
  const where: Record<string, unknown> = { deletedAt: null };
  if (search) where.nome = { contains: search };
  const [data, total] = await Promise.all([
    prisma.categoria.findMany({
      where,
      include: { _count: { select: { equipamentos: { where: { deletedAt: null } } } } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { nome: "asc" },
    }),
    prisma.categoria.count({ where }),
  ]);
  return { data, total };
}

export async function create(nome: string) {
  return prisma.categoria.create({ data: { nome } });
}

export async function update(id: string, nome: string) {
  return prisma.categoria.update({ where: { id }, data: { nome } });
}

export async function softDelete(id: string) {
  const count = await prisma.equipamento.count({ where: { categoria_id: id, deletedAt: null } });
  if (count > 0) throw new Error("Existem equipamentos vinculados a esta categoria");
  await prisma.categoria.update({ where: { id }, data: { deletedAt: new Date() } });
}
