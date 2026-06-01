"use client";

import { useState, useEffect } from "react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<any[]>([]);
  const [nome, setNome] = useState("");

  const fetchCategorias = async () => {
    const token = localStorage.getItem("accessToken");
    const res = await fetch("/api/categorias", { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setCategorias(data.data || []);
  };

  useEffect(() => { fetchCategorias(); }, []);

  const handleCreate = async () => {
    if (!nome.trim()) return;
    const token = localStorage.getItem("accessToken");
    await fetch("/api/categorias", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ nome }),
    });
    setNome("");
    fetchCategorias();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Categorias</h2>
      <div className="flex gap-2 mb-4">
        <Input placeholder="Nova categoria" value={nome} onChange={(e) => setNome(e.target.value)} />
        <Button onClick={handleCreate}>Adicionar</Button>
      </div>
      <div className="space-y-2">
        {categorias.map((c: any) => (
          <div key={c.id} className="p-3 border rounded-md flex justify-between">
            <span>{c.nome}</span>
            <span className="text-gray-500 text-sm">{c._count?.equipamentos ?? 0} equipamento(s)</span>
          </div>
        ))}
        {categorias.length === 0 && <p className="text-gray-500">Nenhuma categoria cadastrada.</p>}
      </div>
    </div>
  );
}
