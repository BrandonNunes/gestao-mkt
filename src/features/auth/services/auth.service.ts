import { signAccessToken, signRefreshToken, verifyRefreshToken } from "@/src/lib/auth";
import bcrypt from "bcryptjs";
import type { AuthTokens, UsuarioPublic } from "../models";
import { prisma } from "@/src/lib/prisma";

function toPublic(user: {
  id: string;
  nome: string;
  email: string;
  matricula: string;
  perfil: string;
  status: string;
}): UsuarioPublic {
  return {
    id: user.id,
    nome: user.nome,
    email: user.email,
    matricula: user.matricula,
    perfil: user.perfil as "GESTOR" | "COLABORADOR",
    status: user.status as "ATIVO" | "INATIVO",
  };
}

export async function login(email: string, senha: string): Promise<AuthTokens> {
  const user = await prisma.usuario.findUnique({ where: { email, deletedAt: null } });
  if (!user) throw new Error("Credenciais inválidas");
  if (user.status === "INATIVO") throw new Error("Usuário inativo");

  const valid = await bcrypt.compare(senha, user.senha);
  if (!valid) throw new Error("Credenciais inválidas");

  const payload = {
    sub: user.id,
    email: user.email,
    nome: user.nome,
    perfil: user.perfil as "GESTOR" | "COLABORADOR",
  };
  const accessToken = await signAccessToken(payload);
  const refreshToken = await signRefreshToken(payload);

  return { accessToken, refreshToken, usuario: toPublic(user) };
}

export async function refreshSession(refreshTokenStr: string): Promise<AuthTokens> {
  const payload = await verifyRefreshToken(refreshTokenStr);
  if (!payload) throw new Error("Token inválido");

  const user = await prisma.usuario.findUnique({ where: { id: payload.sub, deletedAt: null } });
  if (!user || user.status === "INATIVO") throw new Error("Usuário não encontrado ou inativo");

  const newPayload = {
    sub: user.id,
    email: user.email,
    nome: user.nome,
    perfil: user.perfil as "GESTOR" | "COLABORADOR",
  };
  const accessToken = await signAccessToken(newPayload);
  const refreshTokenNew = await signRefreshToken(newPayload);

  return { accessToken, refreshToken: refreshTokenNew, usuario: toPublic(user) };
}

export async function forgotPassword(email: string): Promise<void> {
  const user = await prisma.usuario.findUnique({ where: { email, deletedAt: null } });
  if (!user) return;

  const token = await signAccessToken({
    sub: user.id,
    email: user.email,
    nome: user.nome,
    perfil: user.perfil as "GESTOR" | "COLABORADOR",
  });
  // TODO: send email with reset link containing token
}

export async function resetPassword(token: string, novaSenha: string): Promise<void> {
  const payload = await verifyRefreshToken(token);
  if (!payload) throw new Error("Token inválido ou expirado");

  const hash = await bcrypt.hash(novaSenha, 12);
  await prisma.usuario.update({
    where: { id: payload.sub },
    data: { senha: hash },
  });
}

export async function changePassword(
  userId: string,
  senhaAtual: string,
  novaSenha: string,
): Promise<void> {
  const user = await prisma.usuario.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Usuário não encontrado");

  const valid = await bcrypt.compare(senhaAtual, user.senha);
  if (!valid) throw new Error("Senha atual incorreta");

  const hash = await bcrypt.hash(novaSenha, 12);
  await prisma.usuario.update({ where: { id: userId }, data: { senha: hash } });
}
