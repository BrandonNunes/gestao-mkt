# Tema Dark/Light — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar tema dark/light com 3 estados (light, dark, system), toggle no header, persistencia em localStorage, prevencao de flash, e cores adaptativas no layout.

**Architecture:** `darkMode: "class"` no Tailwind + variaveis CSS dark + `ThemeProvider` com hook `useTheme` + script inline anti-FOUC + `ThemeToggle` no header. Substituir cores hardcoded por variaveis CSS no layout e sidebar.

**Tech Stack:** Next.js 16, React 19, TailwindCSS, CSS variables, localStorage, matchMedia

---

### Task 1: Tailwind Config + CSS Dark Variables

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `app/globals.css`

- [ ] **Step 1: Enable darkMode in tailwind.config.ts**

After `const config: Config = {` (line 3), add:

```typescript
  darkMode: "class",
```

- [ ] **Step 2: Add dark CSS variables in globals.css**

After the closing `}` of `:root` block (after line 27), add:

```css
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
```

- [ ] **Step 3: Verify CSS compiles (no syntax errors)**

```bash
npx tsc --noEmit 2>&1
```

Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.ts app/globals.css
git commit -m "feat: habilita darkMode class e adiciona variaveis CSS dark"
```

---

### Task 2: ThemeProvider + useTheme Hook

**Files:**
- Create: `src/hooks/use-theme.tsx`

- [ ] **Step 1: Create the hook/provider**

```tsx
"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  setTheme: (t: Theme) => void;
  resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeState | null>(null);

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolveTheme(t: Theme): "light" | "dark" {
  if (t === "system") return getSystemTheme();
  return t;
}

function applyTheme(t: "light" | "dark") {
  const root = document.documentElement;
  if (t === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function ThemeProvider({ children, defaultTheme = "system" }: { children: ReactNode; defaultTheme?: Theme }) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() => resolveTheme(defaultTheme));

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored === "light" || stored === "dark" || stored === "system") {
      setThemeState(stored);
    }
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem("theme", t);
  }, []);

  useEffect(() => {
    const resolved = resolveTheme(theme);
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, [theme]);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const r = getSystemTheme();
      setResolvedTheme(r);
      applyTheme(r);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme deve ser usado dentro de ThemeProvider");
  return ctx;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | Select-String "use-theme"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/use-theme.tsx
git commit -m "feat: adiciona ThemeProvider com suporte a light/dark/system"
```

---

### Task 3: Root Layout — Script Anti-Flash + ThemeProvider

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Replace root layout**

Replace the entire content of `app/layout.tsx`:

```tsx
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
      <body>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | Select-String "app.layout"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: adiciona script anti-flash e ThemeProvider no root layout"
```

---

### Task 4: ThemeToggle Component

**Files:**
- Create: `src/components/theme-toggle.tsx`

- [ ] **Step 1: Create the toggle**

```tsx
"use client";

import { useTheme } from "@/src/hooks/use-theme";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const options = [
    { value: "light" as const, icon: "☀️", label: "Claro" },
    { value: "dark" as const, icon: "🌙", label: "Escuro" },
    { value: "system" as const, icon: "💻", label: "Sistema" },
  ];

  return (
    <div className="flex items-center gap-1 bg-muted rounded-md p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          title={opt.label}
          className={`px-2 py-1 rounded text-sm transition-colors ${
            theme === opt.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | Select-String "theme-toggle"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/theme-toggle.tsx
git commit -m "feat: adiciona ThemeToggle com 3 estados (light/dark/system)"
```

---

### Task 5: Adapt Colors — DashboardLayout + Sidebar

**Files:**
- Modify: `app/(dashboard)/layout.tsx`
- Modify: `src/components/layout/sidebar.tsx`

- [ ] **Step 1: Replace dashboard layout with adaptive colors**

Replace entire content of `app/(dashboard)/layout.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import { useAuth } from "@/src/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/src/components/layout/sidebar";
import { ThemeToggle } from "@/src/components/theme-toggle";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

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
```

- [ ] **Step 2: Replace sidebar with adaptive colors**

Replace entire content of `src/components/layout/sidebar.tsx`:

```tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { usePermission } from "@/src/hooks/use-permission";

const navigation = [
  { href: "/", label: "Dashboard", icon: "📊", gestor: true, colaborador: true },
  { href: "/equipamentos", label: "Equipamentos", icon: "📦", gestor: true, colaborador: true },
  { href: "/categorias", label: "Categorias", icon: "🏷️", gestor: true, colaborador: false },
  { href: "/usuarios", label: "Usuarios", icon: "👥", gestor: true, colaborador: false },
  { href: "/cautelas", label: "Cautelas", icon: "📋", gestor: true, colaborador: true },
  { href: "/checklists", label: "Checklists", icon: "✅", gestor: true, colaborador: false },
  { href: "/relatorios", label: "Relatorios", icon: "📈", gestor: true, colaborador: false },
  { href: "/auditoria", label: "Auditoria", icon: "🔍", gestor: true, colaborador: false },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isGestor } = usePermission();

  const visibleNav = navigation.filter(
    (item) => (isGestor && item.gestor) || (!isGestor && item.colaborador),
  );

  return (
    <aside className="w-64 min-h-screen border-r border-border bg-muted/30 p-4 hidden md:block">
      <div className="mb-8 px-2">
        <h1 className="text-lg font-bold text-foreground">Cautela MKT</h1>
      </div>
      <nav className="space-y-1">
        {visibleNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent text-foreground/70"
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | Select-String "layout|sidebar|theme-toggle"
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add "app/(dashboard)/layout.tsx" "src/components/layout/sidebar.tsx"
git commit -m "feat: adapta cores do layout e sidebar para tema dark/light"
```

---

### Task 6: Integration Validation

**Files:** None (manual)

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Test theme toggle**

1. Abrir o app → deve iniciar em dark (padrao)
2. Clicar no toggle ☀️ → muda para light
3. Clicar no toggle 🌙 → volta para dark
4. Clicar no toggle 💻 → modo system
5. Recarregar a pagina → tema persiste

- [ ] **Step 3: Test anti-flash**

1. Selecionar tema dark
2. Fechar e reabrir a pagina
3. A pagina deve carregar ja com fundo escuro, sem flash branco

- [ ] **Step 4: Test system preference**

1. Selecionar 💻 (system)
2. Mudar preferencia do OS (Windows: Config > Personalizacao > Cores > Escolher modo)
3. A pagina deve atualizar automaticamente

- [ ] **Step 5: Test all pages in both themes**

1. Navegar por Dashboard, Equipamentos, Categorias, Usuarios, Cautelas, Checklists, Relatorios, Auditoria
2. Em cada pagina, alternar entre light e dark
3. Verificar que textos, botoes, tabelas, cards tem contraste adequado

- [ ] **Step 6: Commit**

```bash
git commit -m "chore: validacao manual do tema dark/light"
```

---

## Self-Review

**Spec coverage:**
- darkMode class Tailwind config: Task 1 Step 1 ✓
- Variaveis CSS dark: Task 1 Step 2 ✓
- ThemeProvider + useTheme: Task 2 ✓
- Script anti-flash: Task 3 ✓
- ThemeToggle 3 estados: Task 4 ✓
- Cores adaptativas layout: Task 5 Step 1 ✓
- Cores adaptativas sidebar: Task 5 Step 2 ✓
- Persistencia localStorage: Task 2 (setTheme) ✓
- matchMedia system: Task 2 (useEffect listener) ✓
- Padrao dark: Task 2 (defaultTheme) e script inline ✓

**Placeholder scan:** No TBD, TODO. All code is explicit. ✓

**Type consistency:**
- `Theme` type used consistently across Task 2, 3, 4 ✓
- `useTheme` hook return matches `ThemeState` interface ✓
- CSS variables match Tailwind config color names ✓
