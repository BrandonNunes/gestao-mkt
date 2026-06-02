"use client";

import { useState, useEffect, useCallback } from "react";
import ChecklistsList from "@/src/features/checklists/views/checklists-list";

export default function ChecklistsPage() {
  const [checklists, setChecklists] = useState<any[]>([]);

  const fetchChecklists = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    const res = await fetch("/api/checklists", { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setChecklists(data || []);
  }, []);

  useEffect(() => { fetchChecklists(); }, [fetchChecklists]);

  return <ChecklistsList checklists={checklists} onRefresh={fetchChecklists} />;
}
