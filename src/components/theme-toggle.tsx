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
