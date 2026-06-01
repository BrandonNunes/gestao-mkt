import prisma from "@/src/lib/prisma";
import { StatusCautela } from "@/src/lib/constants";

export async function getIndicadores() {
  const [equipamentos, cautelas] = await Promise.all([
    prisma.equipamento.groupBy({
      by: ["status"],
      where: { deletedAt: null },
      _count: true,
    }),
    prisma.cautela.groupBy({
      by: ["status"],
      where: { deletedAt: null },
      _count: true,
    }),
  ]);

  const equipStatus = (s: string) => equipamentos.find((e) => e.status === s)?._count ?? 0;

  return {
    equipamentos: {
      total: equipamentos.reduce((sum, e) => sum + e._count, 0),
      disponiveis: equipStatus("DISPONIVEL"),
      emprestados: equipStatus("EMPRESTADO"),
      em_manutencao: equipStatus("MANUTENCAO"),
      avariados: equipStatus("AVARIADO"),
    },
    cautelas: {
      abertas: cautelas.find((c) => c.status === "ABERTA")?._count ?? 0,
      em_uso: cautelas.find((c) => c.status === "EM_USO")?._count ?? 0,
      atrasadas: cautelas.find((c) => c.status === "ATRASADA")?._count ?? 0,
    },
  };
}

export async function getGraficos(meses = 6) {
  const dataInicio = new Date();
  dataInicio.setMonth(dataInicio.getMonth() - meses);

  const utilizacaoMensal = await prisma.cautela.groupBy({
    by: ["data_emissao"],
    where: { deletedAt: null, data_emissao: { gte: dataInicio } },
    _count: true,
  });

  const equipamentos = await prisma.cautelaEquipamento.groupBy({
    by: ["equipamento_id"],
    _count: { equipamento_id: true },
    orderBy: { _count: { equipamento_id: "desc" } },
    take: 10,
  });

  return {
    utilizacao_mensal: utilizacaoMensal.map((u) => ({
      mes: u.data_emissao.toISOString().slice(0, 7),
      total: u._count,
    })),
    equipamentos_mais_utilizados: equipamentos.map((e) => ({
      equipamento_id: e.equipamento_id,
      total_emprestimos: e._count.equipamento_id,
    })),
  };
}
