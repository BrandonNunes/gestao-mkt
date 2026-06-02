import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/src/lib/auth";

const protectedPaths = ["/", "/equipamentos", "/categorias", "/usuarios", "/cautelas", "/checklists", "/relatorios", "/auditoria"];
const publicPaths = ["/login", "/recuperar-senha"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  if (path.startsWith("/api/")) {
    return NextResponse.next();
  }

  const isProtected = protectedPaths.some((p) => path === p || (p !== "/" && path.startsWith(p + "/")));
  const isPublic = publicPaths.some((p) => path.startsWith(p));

  if (!isProtected) {
    return NextResponse.next();
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (token) {
    const payload = await verifyAccessToken(token);
    if (!payload && isProtected) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$|favicon.ico).*)"],
};
