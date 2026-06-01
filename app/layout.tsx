import type { Metadata } from "next";
import { AuthProvider } from "@/src/hooks/use-auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cautela MKT",
  description: "Sistema de Controle de Equipamentos e Cautelas do Setor de Marketing",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
