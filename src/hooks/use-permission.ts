"use client";

import { useAuth } from "./use-auth";

export function usePermission() {
  const { user } = useAuth();

  return {
    isGestor: user?.perfil === "GESTOR",
    isColaborador: user?.perfil === "COLABORADOR",
    isAuthenticated: !!user,
    canManage: user?.perfil === "GESTOR",
    canView: !!user,
  };
}
