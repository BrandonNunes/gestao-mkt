# Design: Tema Dark/Light com System Preference

**Data**: 2026-06-02
**Contexto**: Projeto Cautela MKT — atualmente so tem cores light com variaveis CSS. Tailwind nao tem darkMode ativado.

## Problema

A interface so funciona em tema claro. Nao ha toggle de tema, nem suporte a dark mode ou preferencia do sistema.

## Solucao

1. Ativar `darkMode: "class"` no Tailwind + variaveis CSS escuras
2. `ThemeProvider` com suporte a 3 estados: light, dark, system
3. Script inline anti-flash (FOUC) no `<head>`
4. Toggle de 3 posicoes no header do dashboard
5. Substituir cores hardcoded por variaveis CSS nos componentes de layout

## Arquivos

### Modificados

```text
tailwind.config.ts                      (+ darkMode: "class")
app/globals.css                         (+ .dark variables)
app/layout.tsx                          (+ ThemeProvider, script inline)
app/(dashboard)/layout.tsx              (+ toggle no header, cores adaptativas)
src/components/layout/sidebar.tsx       (cores adaptativas)
```

### Novos

```text
src/components/theme-toggle.tsx          (botao switch 3 estados)
src/hooks/use-theme.tsx                  (ThemeProvider + useTheme hook)
```

## CSS — Variaveis Dark

Adicionar bloco `.dark` no globals.css invertendo as cores:

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

## ThemeProvider + useTheme

### Estados

| Valor | Comportamento |
|-------|--------------|
| `"system"` | Segue `prefers-color-scheme`, atualiza automaticamente |
| `"dark"` | Forca dark |
| `"light"` | Forca light |

### Hook

```ts
const { theme, setTheme, resolvedTheme } = useTheme();
```

- `theme`: valor atual (light/dark/system)
- `setTheme(t)`: altera e persiste em localStorage
- `resolvedTheme`: "light" ou "dark" resolvido (considerando system)

### Ciclo de vida

1. Montagem: le `localStorage("theme")`, se nao existir usa `"system"`
2. Aplica/remove classe `dark` no `document.documentElement`
3. Se `"system"`: escuta `matchMedia("prefers-color-scheme: dark")` para mudancas
4. Persiste em localStorage a cada `setTheme`

## Script Anti-Flash

Inline no `<head>` (antes do React carregar):

```html
<script>
  (function() {
    var t = localStorage.getItem("theme");
    if (t === "dark" || (t !== "light" && window.matchMedia("(prefers-color-scheme:dark)").matches)) {
      document.documentElement.classList.add("dark");
    }
  })();
</script>
```

## ThemeToggle

Renderizado no header do dashboard:

```
[☀️ 🌙 💻]  ← 3 icones clicaveis (sol = light, lua = dark, monitor = system)
```

Estado ativo destacado com cor primaria.

## Cores Adaptativas — Substituicoes

| Antes | Depois |
|-------|--------|
| `bg-white` | `bg-background` |
| `bg-gray-50/50` | `bg-muted/50` |
| `bg-gray-100` | `bg-muted` |
| `text-gray-500` | `text-muted-foreground` |
| `text-gray-700` | `text-foreground/70` |
| `text-gray-800` | `text-foreground/80` |
| `text-gray-900` | `text-foreground` |
| `border-gray-200` | `border-border` |
| `border-gray-900` | `border-foreground/10` |
| `hover:bg-gray-200` | `hover:bg-accent` |

Aplicar no `DashboardLayout` (header, loading), `Sidebar` (aside, nav items).

## Permissoes

Toggle visivel para todos os usuarios (GESTOR e COLABORADOR). Preferencia individual por navegador.

## Validacao

- [ ] Toggle muda entre light/dark/system, pagina atualiza sem reload
- [ ] Script inline previne flash: recarregar pagina no dark → fundo ja escuro
- [ ] Preferencia persiste apos fechar e reabrir o navegador
- [ ] Modo system segue configuracao do OS
- [ ] Sidebar, header, e conteudo principal adaptam cores corretamente
- [ ] Componentes de Dialog, Card, Badge, Button mantem contraste adequado
