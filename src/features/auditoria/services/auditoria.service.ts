import { prisma } from "@/src/lib/prisma";

export async function log(
  entidade: string,
  entidade_id: string,
  acao: string,
  usuario_id: string,
  detalhes?: Record<string, unknown>,
) {
  return prisma.historico.create({
    data: { entidade, entidade_id, acao, usuario_id, detalhes: (detalhes ?? undefined) as any },
  });
}

export async function list(params: {
  page: number;
  limit: number;
  entidade?: string;
  acao?: string;
  usuario_id?: string;
  data_inicio?: string;
  data_fim?: string;
}) {
  const { page, limit, entidade, acao, usuario_id, data_inicio, data_fim } = params;
  const where: Record<string, unknown> = {};

  if (entidade) where.entidade = entidade;
  if (acao) where.acao = acao;
  if (usuario_id) where.usuario_id = usuario_id;
  if (data_inicio || data_fim) {
    where.data_hora = {};
    if (data_inicio) (where.data_hora as Record<string, unknown>).gte = new Date(data_inicio);
    if (data_fim) (where.data_hora as Record<string, unknown>).lte = new Date(data_fim);
  }

  const [data, total] = await Promise.all([
    prisma.historico.findMany({
      where,
      include: { usuario: { select: { id: true, nome: true } } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { data_hora: "desc" },
    }),
    prisma.historico.count({ where }),
  ]);
  return { data, total, page, limit };
}

export async function getByEntidade(entidade: string, entidade_id: string) {
  return prisma.historico.findMany({
    where: { entidade, entidade_id },
    include: { usuario: { select: { nome: true } } },
    orderBy: { data_hora: "desc" },
  });
}
