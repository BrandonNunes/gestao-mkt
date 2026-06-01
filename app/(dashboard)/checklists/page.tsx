"use client";

import { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";

export default function ChecklistsPage() {
  const [checklists, setChecklists] = useState<any[]>([]);

  const fetchChecklists = async () => {
    const token = localStorage.getItem("accessToken");
    const res = await fetch("/api/checklists", { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setChecklists(data || []);
  };

  useEffect(() => { fetchChecklists(); }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Checklists</h2>
      <div className="space-y-2">
        {checklists.map((c: any) => (
          <div key={c.id} className="p-3 border rounded-md flex justify-between">
            <span>{c.nome}</span>
            <span className="text-sm text-gray-500">{c.tipo === "SAIDA" ? "Saída" : "Devolução"} — {c._count?.perguntas ?? 0} perguntas</span>
          </div>
        ))}
        {checklists.length === 0 && <p className="text-gray-500">Nenhum checklist cadastrado.</p>}
      </div>
    </div>
  );
}
