"use client";

import { useAuth } from "@/src/hooks/use-auth";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen flex">
      <div className="w-64 shrink-0 border-r bg-gray-50/50 p-4 hidden md:block">
        <div className="mb-8 px-2">
          <h1 className="text-lg font-bold">Cautela MKT</h1>
        </div>
        <nav className="space-y-1">
          {[
            { href: "/dashboard", label: "Dashboard" },
            { href: "/dashboard/equipamentos", label: "Equipamentos" },
            ...(user.perfil === "GESTOR"
              ? [
                  { href: "/dashboard/categorias", label: "Categorias" },
                  { href: "/dashboard/usuarios", label: "Usuários" },
                  { href: "/dashboard/cautelas", label: "Cautelas" },
                  { href: "/dashboard/checklists", label: "Checklists" },
                  { href: "/dashboard/relatorios", label: "Relatórios" },
                  { href: "/dashboard/auditoria", label: "Auditoria" },
                ]
              : [
                  { href: "/dashboard/cautelas", label: "Cautelas" },
                ]),
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-200"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
      <div className="flex-1 flex flex-col">
        <header className="border-b bg-white px-6 py-3 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {user && `Olá, ${user.nome}`}
          </span>
          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
            {user?.perfil === "GESTOR" ? "Gestor" : "Colaborador"}
          </span>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
