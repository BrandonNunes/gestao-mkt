import type { Metadata } from "next";
import { AuthProvider } from "@/src/hooks/use-auth";
import { ThemeProvider } from "@/src/hooks/use-theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cautela MKT",
  description: "Sistema de Controle de Equipamentos e Cautelas do Setor de Marketing",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var t = localStorage.getItem("theme");
                if (t === "dark" || (t !== "light" && window.matchMedia("(prefers-color-scheme:dark)").matches)) {
                  document.documentElement.classList.add("dark");
                }
              })();
            `,
          }}
        />
      </head>
      <body className="bg-background text-foreground">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
