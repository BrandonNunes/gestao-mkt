"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { usePermission } from "@/src/hooks/use-permission";
import { useAuth } from "@/src/hooks/use-auth";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: "📊", gestor: true, colaborador: true },
  { href: "/dashboard/equipamentos", label: "Equipamentos", icon: "📦", gestor: true, colaborador: true },
  { href: "/dashboard/categorias", label: "Categorias", icon: "🏷️", gestor: true, colaborador: false },
  { href: "/dashboard/usuarios", label: "Usuários", icon: "👥", gestor: true, colaborador: false },
  { href: "/dashboard/cautelas", label: "Cautelas", icon: "📋", gestor: true, colaborador: true },
  { href: "/dashboard/checklists", label: "Checklists", icon: "✅", gestor: true, colaborador: false },
  { href: "/dashboard/relatorios", label: "Relatórios", icon: "📈", gestor: true, colaborador: false },
  { href: "/dashboard/auditoria", label: "Auditoria", icon: "🔍", gestor: true, colaborador: false },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isGestor } = usePermission();

  const visibleNav = navigation.filter(
    (item) => (isGestor && item.gestor) || (!isGestor && item.colaborador),
  );

  return (
    <aside className="w-64 min-h-screen border-r bg-gray-50/50 p-4 hidden md:block">
      <div className="mb-8 px-2">
        <h1 className="text-lg font-bold">Cautela MKT</h1>
      </div>
      <nav className="space-y-1">
        {visibleNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "hover:bg-gray-200 text-gray-700"
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
