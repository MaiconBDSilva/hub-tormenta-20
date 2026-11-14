---
name: t20-design-system
description: >-
  Use when creating or editing UI components, pages, or styles in the Hub Tormenta 20
  portal (Tailwind CSS v4, .t20-* utility classes, CSS Modules, and Arton dark theme).
---

# Design System — Hub Tormenta 20

Siga estas convenções ao criar ou modificar interfaces em `portal/src/`:

## 1. Paleta & Tema (`portal/src/app/globals.css`)
- **Superfícies e bordas:** `--color-pedra-fundo` (`#0c0a09`), `--color-pedra-card` (`#1c1917`), `--color-pedra-borda` (`#292524`), `--color-pedra-borda-clara` (`#44403c`)
- **Tipografia:** `--color-texto-primario` (`#f5f5f4`), `--color-texto-secundario` (`#d6d3d1`), `--color-texto-mutado` (`#a8a29e`), `--color-texto-sutil` (`#78716c`)
- **Dourado (destaques / ações):** `--color-dourado-palido` (`#fde68a`), `--color-dourado-claro` (`#fbbf24`), `--color-dourado` (`#f59e0b`), `--color-dourado-escuro` (`#d97706`)
- **Rubi (Tormenta / PV / alertas):** `--color-rubi-claro` (`#f87171`), `--color-rubi` (`#dc2626`), `--color-rubi-escuro` (`#7f1d1d`)
- **Mana / Safira (PM):** `--color-mana-claro` (`#38bdf8`), `--color-mana` (`#0284c7`), `--color-mana-escuro` (`#075985`)
- **Feedback positivo:** `--color-esmeralda` (`#10b981`), `--color-esmeralda-claro` (`#a7f3d0`)
- Sempre prefira `var(--color-*)` em vez de hexadecimais literais.

## 2. Regra Anti-"Sopa de Classes" no TSX
- No TSX, `className` deve compor classes globais `.t20-*`, classes de módulo `styles.*` e no máximo **2 a 3 utilitários estruturais simples** (`flex`, `items-center`, `gap-*`, `mt-*`).
- Qualquer elemento visual (card, botão, badge, input, item de lista, cabeçalho, alerta, modal) ou combinação com **4+ utilitários** de cor, borda, tipografia ou sombra deve ser extraído:
  - **Reutilizável em 2+ áreas do portal:** defina `.t20-<nome>` em `portal/src/app/globals.css`.
  - **Específico de um componente/página:** crie ou use `<Componente>.module.css` na mesma pasta com `@reference "../../app/globals.css";` (ajuste o caminho relativo) e `@apply` apenas com utilitários nativos do Tailwind v4.

## 3. Classes Utilitárias Globais (`.t20-*`)
Reutilize as classes já padronizadas em `portal/src/app/globals.css` antes de criar estilos novos:
- **Superfícies & Atmosfera:** `.t20-card`, `.t20-stripe`, `.t20-stripe-gold`, `.t20-glow-ruby`, `.t20-glow-amber`, `.t20-prose-box`, `.t20-compendio-card`, `.animate-fade-in` (respeita `prefers-reduced-motion`)
- **Cabeçalhos, Abas & Filtros:** `.t20-page-header`, `.t20-section-header`, `.t20-section-title`, `.t20-tabs-nav`, `.t20-tab-btn`, `.t20-tab-btn-active`, `.t20-filter-pill`, `.t20-filter-pill-active`, `.scrollbar-none`
- **Badges:** `.t20-badge-counter`, `.t20-badge` + variantes (`.t20-badge-amber`, `.t20-badge-emerald`, `.t20-badge-red`, `.t20-badge-tormenta`, `.t20-badge-blue`, `.t20-badge-sky`, `.t20-badge-purple`, `.t20-badge-pink`, `.t20-badge-orange`, `.t20-badge-cyan`, `.t20-badge-stone`)
- **Botões & Ações:** `.t20-btn-primary`, `.t20-btn-secondary`, `.t20-btn-ghost`, `.t20-btn-dashed`, `.t20-btn-cancel`, `.t20-btn-danger`, `.t20-btn-sm` (evite overrides `!important`), `.t20-form-actions`
- **Inputs & Busca:** `.t20-input`, `.t20-field-label`, `.t20-field-input`, `.t20-field-select`, `.t20-search-wrapper`, `.t20-search-icon`, `.t20-search-input`
- **Modais:** `.t20-modal-overlay`, `.t20-modal-container`, `.t20-modal-header`, `.t20-modal-toolbar`, `.t20-modal-body`, `.t20-modal-footer`
- **Estados & Alertas:** `.t20-loading-box`, `.t20-empty-state`, `.t20-alert-success`, `.t20-alert-error`, `.t20-alert-warning`
- *(Barras de PV/PM da ficha/vitrine usam `.trilhaVitalidade`, `.barraPvGema` e `.barraPmGema` em `personagens.module.css`.)*

## 4. Regra Crítica de Tailwind v4 + CSS Modules & Acessibilidade
- **Nunca** use `@apply` referenciando classes customizadas (como `.t20-card`) dentro de arquivos `.module.css`.
- Em `.module.css`, use `@apply` apenas com utilitários nativos do Tailwind e inclua `@reference` para `globals.css` no topo do arquivo (a raiz do workspace mantém `.vscode/settings.json` com `"css.lint.unknownAtRules": "ignore"`).
- Faça a composição das classes globais diretamente no TSX:
  ```tsx
  className={`${styles.meuContainer} t20-card`}
  ```
- Garanta `:focus-visible`, `type="button"` em botões não-submit, `scope="col"` em cabeçalhos de tabela (`<th>`) e, em modais, `role="dialog"`, `aria-modal="true"` e fechamento por `Escape` + clique no backdrop.

## 5. Verificação
Após alterar componentes ou estilos, rode em `portal/`: `npm run typecheck`, `npm run lint` e `npm run build`.
