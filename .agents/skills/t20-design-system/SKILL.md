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
- Sempre prefira `var(--color-*)` em vez de hexadecimais literais.

## 2. Regra Anti-"Sopa de Classes" no TSX
- No TSX, `className` deve compor classes globais `.t20-*`, classes de módulo `styles.*` e no máximo **2 a 3 utilitários estruturais simples** (`flex`, `items-center`, `gap-*`, `mt-*`).
- Qualquer elemento visual (card, botão, badge, input, item de lista, cabeçalho, alerta, modal) ou combinação com **4+ utilitários** de cor, borda, tipografia ou sombra deve ser extraído:
  - **Reutilizável em 2+ áreas do portal:** defina `.t20-<nome>` em `portal/src/app/globals.css`.
  - **Específico de um componente/página:** crie ou use `<Componente>.module.css` na mesma pasta com `@reference "../../app/globals.css";` (ajuste o caminho relativo) e `@apply` apenas com utilitários nativos do Tailwind v4.

## 3. Classes Utilitárias Globais (`.t20-*`)
Reutilize as classes já padronizadas em `portal/src/app/globals.css` antes de criar estilos novos:
- **Superfícies:** `.t20-card`, `.t20-stripe`, `.t20-stripe-gold`, `.t20-modal-overlay`, `.t20-compendio-card`
- **Cabeçalhos e filtros:** `.t20-section-header`, `.t20-section-title`, `.t20-badge-counter`, `.t20-filter-pill`, `.t20-filter-pill-active`, `.scrollbar-none`
- **Botões, inputs e ações:** `.t20-btn-primary`, `.t20-btn-secondary`, `.t20-btn-dashed`, `.t20-btn-cancel`, `.t20-form-actions`, `.t20-input`, `.t20-field-input`, `.t20-field-select`
- **Alertas:** `.t20-alert-success`, `.t20-alert-error`, `.t20-alert-warning`
- *(Barras de PV/PM da ficha/vitrine usam `.trilhaVitalidade`, `.barraPvGema` e `.barraPmGema` em `personagens.module.css`.)*

## 4. Regra Crítica de Tailwind v4 + CSS Modules & Acessibilidade
- **Nunca** use `@apply` referenciando classes customizadas (como `.t20-card`) dentro de arquivos `.module.css`.
- Em `.module.css`, use `@apply` apenas com utilitários nativos do Tailwind.
- Faça a composição das classes globais diretamente no TSX:
  ```tsx
  className={`${styles.meuContainer} t20-card`}
  ```
- Garanta `:focus-visible`, `type="button"` em botões não-submit e fechamento por `Escape` + clique no backdrop em modais.

## 5. Verificação
Após alterar componentes ou estilos, rode em `portal/`: `npm run typecheck`, `npm run lint` e `npm run build`.
