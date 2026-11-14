---
name: t20-design-system
description: >-
  Use when creating or editing UI components, pages, or styles in the Hub Tormenta 20
  portal (Tailwind CSS v4, .t20-* utility classes, CSS Modules, and Arton dark theme).
---

# Design System — Hub Tormenta 20

Siga estas convenções ao criar ou modificar interfaces em `portal/src/`:

## 1. Paleta & Tema (`portal/src/app/globals.css`)
- **Fundo principal:** `#0c0a09` (`--color-pedra-fundo` / `stone-950`)
- **Cards e painéis:** `#1c1917` (`--color-pedra-card` / `stone-900`)
- **Bordas:** `#292524` (`--color-pedra-borda` / `stone-800`)
- **Rubi (Tormenta / PV / alertas):** `#dc2626` (`--color-rubi`) e `#7f1d1d` (`--color-rubi-escuro`)
- **Dourado (destaques / ações / PM/energia):** `#f59e0b` (`--color-dourado`), `#fbbf24` (`--color-dourado-claro`), `#d97706` (`--color-dourado-escuro`)

## 2. Classes Utilitárias Globais (`.t20-*`)
Reutilize as classes já padronizadas em `portal/src/app/globals.css` antes de criar estilos novos:
- **Superfícies:** `.t20-card`, `.t20-stripe`, `.t20-stripe-gold`
- **Cabeçalhos e filtros:** `.t20-section-header`, `.t20-section-title`, `.t20-badge-counter`, `.t20-filter-pill`, `.t20-filter-pill-active`
- **Botões e ações:** `.t20-btn-primary`, `.t20-btn-secondary`, `.t20-btn-dashed`, `.t20-btn-cancel`, `.t20-form-actions`
- **Recursos vitais:** `.t20-track-pv` / `.t20-bar-pv`, `.t20-track-pm` / `.t20-bar-pm`
- **Alertas:** `.t20-alert-success`, `.t20-alert-error`, `.t20-alert-warning`

## 3. Regra Crítica de Tailwind v4 + CSS Modules
- **Nunca** use `@apply` referenciando classes customizadas (como `.t20-card`) dentro de arquivos `.module.css`.
- Em `.module.css`, use `@apply` apenas com utilitários nativos do Tailwind.
- Faça a composição das classes globais diretamente no TSX:
  ```tsx
  className={`${styles.meuContainer} t20-card`}
  ```

## 4. Verificação
Após alterar componentes ou estilos, rode `npm run build` dentro de `portal/` para garantir que o Turbopack e o TypeScript compilam sem erros.

