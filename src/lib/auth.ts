import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { type NextRequest } from "next/server";

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);
const refreshSecretKey = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET);

export interface TokenPayload {
  sub: string;
  email: string;
  nome: string;
  perfil: "GESTOR" | "COLABORADOR";
  iat?: number;
  exp?: number;
}

export async function signAccessToken(payload: Omit<TokenPayload, "iat" | "exp">): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("15m")
    .setIssuedAt()
    .sign(secretKey);
}

export async function signRefreshToken(payload: Omit<TokenPayload, "iat" | "exp">): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .setIssuedAt()
    .sign(refreshSecretKey);
}

export async function verifyAccessToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, refreshSecretKey, {
      algorithms: ["HS256"],
    });
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function getTokenFromRequest(request: NextRequest): Promise<TokenPayload | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    if (!token) return null;
    return verifyAccessToken(token);
  }
  return verifyAccessToken(authHeader.slice(7));
}

export function setRefreshTokenCookie(token: string): string {
  return `refreshToken=${token}; HttpOnly; Path=/; Secure; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`;
}

export function clearRefreshTokenCookie(): string {
  return "refreshToken=; HttpOnly; Path=/; Max-Age=0";
}
