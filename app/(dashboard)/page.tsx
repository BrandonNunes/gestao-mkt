"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/card";

export default function DashboardPage() {
  const [indicadores, setIndicadores] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    fetch("/api/dashboard/indicadores", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(setIndicadores);
  }, []);

  if (!indicadores) return <div className="p-4 text-gray-500">Carregando...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-foreground">Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{indicadores.equipamentos.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-green-600">Disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {indicadores.equipamentos.disponiveis}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-blue-600">Emprestados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">
              {indicadores.equipamentos.emprestados}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-red-600">Avariados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{indicadores.equipamentos.avariados}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Cautelas Abertas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{indicadores.cautelas.abertas}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-orange-600">Atrasadas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">{indicadores.cautelas.atrasadas}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
