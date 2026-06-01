import prisma from "@/src/lib/prisma";
import bcrypt from "bcryptjs";
import type { UsuarioAdmin } from "../models";

function toAdmin(user: Record<string, unknown>): UsuarioAdmin {
  return {
    id: user.id as string,
    nome: user.nome as string,
    email: user.email as string,
    matricula: user.matricula as string,
    telefone: user.telefone as string | null,
    perfil: user.perfil as "GESTOR" | "COLABORADOR",
    status: user.status as "ATIVO" | "INATIVO",
    consentimento_lgpd: user.consentimento_lgpd ? String(user.consentimento_lgpd) : null,
    createdAt: String(user.createdAt),
  };
}

export async function list(params: { page: number; limit: number; search?: string; perfil?: string; status?: string }) {
  const { page, limit, search, perfil, status } = params;
  const where: Record<string, unknown> = { deletedAt: null };

  if (search) {
    where.OR = [
      { nome: { contains: search } },
      { email: { contains: search } },
      { matricula: { contains: search } },
    ];
  }
  if (perfil) where.perfil = perfil;
  if (status) where.status = status;

  const [data, total] = await Promise.all([
    prisma.usuario.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { nome: "asc" },
    }),
    prisma.usuario.count({ where }),
  ]);

  return { data: data.map(toAdmin), total, page, limit };
}

export async function getById(id: string): Promise<UsuarioAdmin | null> {
  const user = await prisma.usuario.findUnique({ where: { id, deletedAt: null } });
  return user ? toAdmin(user as unknown as Record<string, unknown>) : null;
}

export async function getMe(id: string) {
  const user = await prisma.usuario.findUnique({ where: { id, deletedAt: null } });
  if (!user) throw new Error("Usuário não encontrado");
  return {
    id: user.id,
    nome: user.nome,
    email: user.email,
    matricula: user.matricula,
    telefone: user.telefone,
    perfil: user.perfil,
    status: user.status,
  };
}

export async function create(data: {
  nome: string;
  email: string;
  matricula: string;
  telefone?: string;
  perfil: string;
  senha: string;
}) {
  const existing = await prisma.usuario.findFirst({
    where: { deletedAt: null, OR: [{ email: data.email }, { matricula: data.matricula }] },
  });
  if (existing) throw new Error("Email ou matrícula já cadastrados");

  const hash = await bcrypt.hash(data.senha, 12);
  const user = await prisma.usuario.create({
    data: {
      nome: data.nome,
      email: data.email,
      matricula: data.matricula,
      telefone: data.telefone,
      perfil: data.perfil as "GESTOR" | "COLABORADOR",
      senha: hash,
    },
  });

  return toAdmin(user as unknown as Record<string, unknown>);
}

export async function update(id: string, data: Record<string, unknown>) {
  await prisma.usuario.update({ where: { id }, data });
  return getById(id);
}

export async function softDelete(id: string) {
  await prisma.usuario.update({ where: { id }, data: { deletedAt: new Date() } });
}
