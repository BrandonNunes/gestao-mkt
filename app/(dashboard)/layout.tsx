"use client";

import { useEffect, useCallback } from "react";
import { useAuth } from "@/src/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/src/components/layout/sidebar";
import { ThemeToggle } from "@/src/components/theme-toggle";
import { Button } from "@/src/components/ui/button";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    await logout();
    router.push("/login");
  }, [logout, router]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground/20" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="border-b border-border bg-background px-6 py-3 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {user && `Ola, ${user.nome}`}
          </span>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={handleLogout}>Sair</Button>
            <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
              {user?.perfil === "GESTOR" ? "Gestor" : "Colaborador"}
            </span>
          </div>
        </header>
        <main className="flex-1 p-6 bg-background">{children}</main>
      </div>
    </div>
  );
}
