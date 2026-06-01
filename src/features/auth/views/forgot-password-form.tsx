"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/card";
import Link from "next/link";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setSent(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recuperar Senha</CardTitle>
      </CardHeader>
      <CardContent>
        {sent ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Se o e-mail existir, um link de recuperação será enviado.</p>
            <Link href="/login"><Button variant="outline" className="w-full">Voltar ao login</Button></Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Button type="submit" className="w-full">Enviar</Button>
            <Link href="/login" className="block text-center text-sm text-blue-600 hover:underline">Voltar</Link>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
