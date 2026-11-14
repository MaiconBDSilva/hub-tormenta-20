---
name: wiki-quartz
description: >-
  Use when editing Obsidian Markdown notes, Quartz 5.0 configuration, or wiki
  components in portal/wiki-quartz/, or when rebuilding the static wiki.
---

# Wiki da Campanha (Quartz 5.0 + Obsidian)

A Wiki é alimentada pelas notas do Obsidian em `portal/wiki-quartz/content/` e compilada para `portal/public/wiki/`.

## 1. Configurações Críticas (`portal/wiki-quartz/quartz.config.yaml`)
- **Tema escuro permanente:** Manter `mode: dark` no `@quartz-themes/core` para evitar flash ou fundo claro.
- **Ocultação de propriedades:** `@quartz-community/note-properties` deve manter `hidePropertiesView: true` para não expor tabelas brutas de aliases/frontmatter.
- **Grafo local:** `@quartz-community/graph` configurado com `depth: 1` (cores rubi `#dc2626` e âmbar `#fbbf24`), mantendo o grafo global oculto.

## 2. Cabeçalho Sincronizado (`portal/wiki-quartz/quartz/components/Head.tsx`)
- O menu superior injetado na wiki deve corresponder exatamente às alturas do `MenuFixo.module.css` do portal: `61px` no desktop e `53px` no mobile.
- Manter a detecção de iframe (`window.self !== window.top`) usada pela rota `/wikitormenta` para alinhar o layout sem sobras de margem.

## 3. Build & Validação
Sempre que adicionar/editar notas em `portal/wiki-quartz/content/` ou alterar configurações/componentes do Quartz:
```powershell
cd portal
npm run build:wiki
```
Verifique se o comando conclui sem erros e gera os arquivos atualizados em `portal/public/wiki/`.

