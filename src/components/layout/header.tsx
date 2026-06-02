"use client";

import { useAuth } from "@/src/hooks/use-auth";
import { Button } from "@/src/components/ui/button";
import Link from "next/link";

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b bg-background px-6 py-3 flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        {user && <span>Olá, {user.nome}</span>}
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <>
            <span className="text-xs bg-muted px-2 py-1 rounded">
              {user.perfil === "GESTOR" ? "Gestor" : "Colaborador"}
            </span>
            <Link href="/login" onClick={logout}>
              <Button variant="outline" size="sm">Sair</Button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
