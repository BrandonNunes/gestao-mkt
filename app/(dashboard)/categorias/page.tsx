"use client";

import { useState, useEffect, useCallback } from "react";
import CategoriasList from "@/src/features/equipamentos/views/categorias-list";

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<any[]>([]);

  const fetchCategorias = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    const res = await fetch("/api/categorias?limit=100", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setCategorias(data.data || []);
  }, []);

  useEffect(() => { fetchCategorias(); }, [fetchCategorias]);

  return <CategoriasList categorias={categorias} onRefresh={fetchCategorias} />;
}
