"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { usePermission } from "@/src/hooks/use-permission";

const navigation = [
  { href: "/", label: "Dashboard", icon: "📊", gestor: true, colaborador: true },
  { href: "/equipamentos", label: "Equipamentos", icon: "📦", gestor: true, colaborador: true },
  { href: "/categorias", label: "Categorias", icon: "🏷️", gestor: true, colaborador: false },
  { href: "/usuarios", label: "Usuarios", icon: "👥", gestor: true, colaborador: false },
  { href: "/cautelas", label: "Cautelas", icon: "📋", gestor: true, colaborador: true },
  { href: "/checklists", label: "Checklists", icon: "✅", gestor: true, colaborador: false },
  { href: "/relatorios", label: "Relatorios", icon: "📈", gestor: true, colaborador: false },
  { href: "/auditoria", label: "Auditoria", icon: "🔍", gestor: true, colaborador: false },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isGestor } = usePermission();

  const visibleNav = navigation.filter(
    (item) => (isGestor && item.gestor) || (!isGestor && item.colaborador),
  );

  return (
    <aside className="w-64 min-h-screen border-r border-border bg-muted/30 p-4 hidden md:block">
      <div className="mb-8 px-2">
        {/* <h1 className="text-lg font-bold text-foreground">Cautela MKT</h1> */}
        <img src="logos/logo_mkt.png" alt="Cautela MKT" className="h-26 w-auto" />
      </div>
      <nav className="space-y-1">
        {visibleNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent text-foreground/70"
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
