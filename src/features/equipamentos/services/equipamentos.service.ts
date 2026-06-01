import prisma from "@/src/lib/prisma";
import { StatusEquipamento, TRANSICOES_EQUIPAMENTO } from "@/src/lib/constants";

export async function list(params: {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  categoria_id?: string;
}) {
  const { page, limit, search, status, categoria_id } = params;
  const where: Record<string, unknown> = { deletedAt: null };
  if (search) {
    where.OR = [
      { nome: { contains: search } },
      { codigo_patrimonial: { contains: search } },
      { marca: { contains: search } },
    ];
  }
  if (status) where.status = status;
  if (categoria_id) where.categoria_id = categoria_id;

  const [data, total] = await Promise.all([
    prisma.equipamento.findMany({
      where,
      include: { categoria: true, _count: { select: { acessorios: true, cautelaEquipamentos: true } } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { nome: "asc" },
    }),
    prisma.equipamento.count({ where }),
  ]);
  return { data, total, page, limit };
}

export async function getDisponiveis() {
  return prisma.equipamento.findMany({
    where: { deletedAt: null, status: StatusEquipamento.DISPONIVEL },
    include: { categoria: true, acessorios: { where: { deletedAt: null, status: "ATIVO" } } },
    orderBy: { nome: "asc" },
  });
}

export async function getById(id: string) {
  return prisma.equipamento.findUnique({
    where: { id, deletedAt: null },
    include: {
      categoria: true,
      acessorios: { where: { deletedAt: null }, orderBy: { nome: "asc" } },
    },
  });
}

export async function create(data: {
  codigo_patrimonial: string;
  nome: string;
  categoria_id: string;
  marca?: string;
  modelo?: string;
  numero_serie?: string;
  descricao?: string;
  data_aquisicao?: string;
  valor_aquisicao?: number;
  localizacao?: string;
  observacoes?: string;
}) {
  return prisma.equipamento.create({
    data: {
      ...data,
      data_aquisicao: data.data_aquisicao ? new Date(data.data_aquisicao) : undefined,
      status: StatusEquipamento.DISPONIVEL,
    },
    include: { categoria: true },
  });
}

export async function update(id: string, data: Record<string, unknown>) {
  return prisma.equipamento.update({ where: { id }, data, include: { categoria: true } });
}

export async function updateStatus(
  id: string,
  novoStatus: StatusEquipamento,
  observacao?: string,
) {
  const equip = await prisma.equipamento.findUnique({ where: { id } });
  if (!equip) throw new Error("Equipamento não encontrado");

  const statusAtual = equip.status as StatusEquipamento;
  const permitidas = TRANSICOES_EQUIPAMENTO[statusAtual] || [];
  if (!permitidas.includes(novoStatus)) {
    throw new Error(`Transição de ${statusAtual} para ${novoStatus} não permitida`);
  }

  return prisma.equipamento.update({
    where: { id },
    data: {
      status: novoStatus,
      observacoes: observacao
        ? `${equip.observacoes ?? ""}\n${new Date().toISOString()}: ${observacao}`.trim()
        : equip.observacoes,
    },
    include: { categoria: true },
  });
}

export async function softDelete(id: string) {
  const equip = await prisma.equipamento.findUnique({ where: { id } });
  if (!equip) throw new Error("Equipamento não encontrado");
  if (equip.status === StatusEquipamento.EMPRESTADO) {
    throw new Error("Não é possível excluir equipamento emprestado");
  }
  await prisma.equipamento.update({ where: { id }, data: { deletedAt: new Date() } });
}
