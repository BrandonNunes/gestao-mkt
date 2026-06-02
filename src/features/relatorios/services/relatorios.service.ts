import { prisma } from "@/src/lib/prisma";
import { StatusEquipamento } from "@/src/lib/constants";

export async function relatorioEquipamentos(status?: string) {
  const where: Record<string, unknown> = { deletedAt: null };
  if (status) where.status = status;

  return prisma.equipamento.findMany({
    where,
    include: {
      categoria: { select: { nome: true } },
      cautelaEquipamentos: {
        orderBy: { cautela: { data_emissao: "desc" } },
        take: 1,
        include: { cautela: { select: { data_emissao: true } } },
      },
    },
    orderBy: { nome: "asc" },
  });
}

export async function relatorioCautelas(status?: string) {
  const where: Record<string, unknown> = { deletedAt: null };
  if (status) where.status = status;

  return prisma.cautela.findMany({
    where,
    include: {
      usuario: { select: { nome: true, matricula: true } },
      _count: { select: { equipamentos: true } },
    },
    orderBy: { data_emissao: "desc" },
  });
}

export async function relatorioUtilizacao(data_inicio: string, data_fim: string) {
  const where = {
    deletedAt: null,
    data_emissao: { gte: new Date(data_inicio), lte: new Date(data_fim) },
  };

  const [cautelas, equipamentosUsados, usuarios] = await Promise.all([
    prisma.cautela.count({ where }),
    prisma.cautelaEquipamento.groupBy({
      by: ["equipamento_id"],
      where: { cautela: where },
      _count: { equipamento_id: true },
      orderBy: { _count: { equipamento_id: "desc" } },
      take: 10,
    }),
    prisma.cautela.groupBy({
      by: ["usuario_id"],
      where,
      _count: { usuario_id: true },
      orderBy: { _count: { usuario_id: "desc" } },
      take: 10,
    }),
  ]);

  return {
    total_cautelas_periodo: cautelas,
    equipamentos_mais_utilizados: equipamentosUsados,
    usuarios_mais_emprestimos: usuarios,
  };
}
