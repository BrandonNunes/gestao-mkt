import { prisma } from "@/src/lib/prisma";
import { StatusCautela, StatusEquipamento } from "@/src/lib/constants";

export async function create(data: {
  usuario_id: string;
  equipamento_ids: string[];
  acessorio_ids?: string[];
  data_prevista_retorno: string;
}) {
  const equipamentos = await prisma.equipamento.findMany({
    where: { id: { in: data.equipamento_ids }, deletedAt: null },
  });

  const indisponiveis = equipamentos.filter((e) => e.status !== StatusEquipamento.DISPONIVEL);
  if (indisponiveis.length > 0) {
    throw new Error(
      `Equipamentos indisponiveis: ${indisponiveis.map((e) => `${e.nome} (${e.status})`).join(", ")}`,
    );
  }

  return prisma.cautela.create({
    data: {
      usuario_id: data.usuario_id,
      createdBy_id: data.usuario_id,
      data_prevista_retorno: new Date(data.data_prevista_retorno),
      equipamentos: {
        create: data.equipamento_ids.map((eid) => ({ equipamento_id: eid })),
      },
      acessorios: data.acessorio_ids?.length
        ? {
            create: data.acessorio_ids.map((aid) => ({ acessorio_id: aid })),
          }
        : undefined,
    },
    include: { equipamentos: true, usuario: true },
  });
}

export async function emitir(
  id: string,
  checklist_id: string,
  respostas: { pergunta_id: string; resposta: boolean }[],
  usuarioId: string,
  observacoes?: string,
) {
  const cautela = await prisma.cautela.findUnique({
    where: { id },
    include: { equipamentos: true },
  });

  if (!cautela) throw new Error("Cautela não encontrada");
  if (cautela.status !== StatusCautela.ABERTA) throw new Error("Cautela não está em aberto");

  const perguntas = await prisma.checklistPergunta.findMany({
    where: { checklist_id, deletedAt: null },
  });
  const obrigatorias = perguntas.filter((p) => p.obrigatoria);
  const respondidasIds = respostas.map((r) => r.pergunta_id);
  const faltantes = obrigatorias.filter((p) => !respondidasIds.includes(p.id));
  if (faltantes.length > 0) {
    throw new Error(
      `Perguntas obrigatórias não respondidas: ${faltantes.map((p) => p.pergunta).join(", ")}`,
    );
  }

  const equipamentos = await prisma.equipamento.findMany({
    where: { id: { in: cautela.equipamentos.map((e) => e.equipamento_id) }, deletedAt: null },
  });
  const indisponiveis = equipamentos.filter((e) => e.status !== StatusEquipamento.DISPONIVEL);
  if (indisponiveis.length > 0) {
    throw new Error(
      `Equipamentos indisponíveis: ${indisponiveis.map((e) => `${e.nome} (${e.status})`).join(", ")}`,
    );
  }

  return prisma.$transaction(async (tx) => {
    await tx.respostaChecklist.createMany({
      data: respostas.map((r) => ({
        cautela_id: id,
        pergunta_id: r.pergunta_id,
        resposta: r.resposta,
      })),
    });

    await tx.equipamento.updateMany({
      where: { id: { in: equipamentos.map((e) => e.id) } },
      data: { status: StatusEquipamento.EMPRESTADO },
    });

    return tx.cautela.update({
      where: { id },
      data: {
        status: StatusCautela.EM_USO,
        data_retirada: new Date(),
        observacoes,
      },
      include: { equipamentos: { include: { equipamento: true } }, usuario: true },
    });
  });
}

export async function devolver(
  id: string,
  checklist_id: string,
  respostas: { pergunta_id: string; resposta: boolean }[],
  tem_avarias: boolean,
  avarias_descricao?: string,
  observacoes?: string,
) {
  const cautela = await prisma.cautela.findUnique({
    where: { id },
    include: { equipamentos: true },
  });
  if (!cautela) throw new Error("Cautela não encontrada");
  if (cautela.status !== StatusCautela.EM_USO && cautela.status !== StatusCautela.ATRASADA) {
    throw new Error("Cautela não pode ser devolvida neste status");
  }

  const perguntas = await prisma.checklistPergunta.findMany({
    where: { checklist_id, deletedAt: null },
  });
  const obrigatorias = perguntas.filter((p) => p.obrigatoria);
  const respondidasIds = respostas.map((r) => r.pergunta_id);
  const faltantes = obrigatorias.filter((p) => !respondidasIds.includes(p.id));
  if (faltantes.length > 0) {
    throw new Error(
      `Perguntas obrigatórias não respondidas: ${faltantes.map((p) => p.pergunta).join(", ")}`,
    );
  }

  const novoStatus = tem_avarias ? StatusCautela.PENDENTE : StatusCautela.FINALIZADA;
  const novoStatusEquip = tem_avarias ? StatusEquipamento.AVARIADO : StatusEquipamento.DISPONIVEL;

  return prisma.$transaction(async (tx) => {
    await tx.respostaChecklist.createMany({
      data: respostas.map((r) => ({
        cautela_id: id,
        pergunta_id: r.pergunta_id,
        resposta: r.resposta,
      })),
    });

    await tx.equipamento.updateMany({
      where: { id: { in: cautela.equipamentos.map((e) => e.equipamento_id) } },
      data: { status: novoStatusEquip },
    });

    return tx.cautela.update({
      where: { id },
      data: {
        status: novoStatus,
        data_retorno: new Date(),
        observacoes:
          [observacoes, avarias_descricao ? `Avarias: ${avarias_descricao}` : null]
            .filter(Boolean)
            .join("\n") || undefined,
      },
    });
  });
}

export async function cancelar(id: string) {
  const cautela = await prisma.cautela.findUnique({
    where: { id },
    include: { equipamentos: true },
  });
  if (!cautela) throw new Error("Cautela não encontrada");
  if (cautela.status !== StatusCautela.ABERTA && cautela.status !== StatusCautela.EM_USO) {
    throw new Error("Cautela não pode ser cancelada neste status");
  }

  return prisma.$transaction(async (tx) => {
    await tx.equipamento.updateMany({
      where: { id: { in: cautela.equipamentos.map((e) => e.equipamento_id) } },
      data: { status: StatusEquipamento.DISPONIVEL },
    });
    return tx.cautela.update({ where: { id }, data: { status: StatusCautela.CANCELADA } });
  });
}

export async function getById(id: string) {
  return prisma.cautela.findUnique({
    where: { id, deletedAt: null },
    include: {
      usuario: true,
      createdBy: true,
      equipamentos: {
        include: {
          equipamento: {
            include: {
              categoria: true,
              acessorios: { where: { deletedAt: null } },
            },
          },
        },
      },
      acessorios: {
        include: {
          acessorio: true,
        },
      },
      respostas: { include: { pergunta: true } },
    },
  });
}

export async function list(params: {
  page: number;
  limit: number;
  status?: string;
  usuario_id?: string;
  search?: string;
}) {
  const { page, limit, status, usuario_id, search } = params;
  const where: Record<string, unknown> = { deletedAt: null };
  if (status) where.status = status;
  if (usuario_id) where.usuario_id = usuario_id;
  if (search) {
    where.OR = [
      { usuario: { nome: { contains: search } } },
      { usuario: { matricula: { contains: search } } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.cautela.findMany({
      where,
      include: {
        usuario: { select: { id: true, nome: true, matricula: true } },
        _count: { select: { equipamentos: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { data_emissao: "desc" },
    }),
    prisma.cautela.count({ where }),
  ]);
  return { data, total, page, limit };
}

export async function verificarAtrasos() {
  return prisma.cautela.updateMany({
    where: {
      status: StatusCautela.EM_USO,
      data_prevista_retorno: { lt: new Date() },
      data_retorno: null,
    },
    data: { status: StatusCautela.ATRASADA },
  });
}
