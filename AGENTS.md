# Diretrizes do Projeto — Hub Tormenta 20

## 1. Diretório Base & Comandos
- Todos os comandos `npm` (`npm run dev`, `npm run build`, `npm run build:wiki`, `npm run typecheck`, `npm run lint`, `npm test`) devem ser executados dentro de `portal/`.
- No Windows PowerShell, caso a política de execução bloqueie `.ps1`, invoque `npm.cmd` e `npx.cmd`.

## 2. Regra Estrita de CSS Semântico & Modular (Proibição de "Sopa de Classes")
- No TSX, `className` deve usar classes semânticas globais `.t20-*` (`portal/src/app/globals.css`), classes de CSS Modules (`styles.*` de `<Componente>.module.css`) e no máximo **2 a 3 utilitários estruturais simples** de layout/espaçamento (`flex`, `items-center`, `gap-*`, `mt-*`).
- Qualquer elemento visual (card, botão, badge, input, item de lista, cabeçalho, alerta, modal) ou combinação com **4+ utilitários** de cor, borda, tipografia ou sombra deve ser extraído:
  - **Reutilizável em 2+ áreas do portal:** criar classe semântica `.t20-<nome>` em `portal/src/app/globals.css`.
  - **Específico de um componente/página:** criar ou usar `<Componente>.module.css` na mesma pasta com `@reference "../../app/globals.css";` (ajustando o caminho relativo) no topo e `@apply` **apenas** com utilitários nativos do Tailwind v4.
- **Nunca** use `@apply` com classes customizadas (como `.t20-*`) dentro de `.module.css`; componha ambas diretamente no TSX (`className={`${styles.item} t20-card`}`).
- Use variáveis de tema (`var(--color-*)`) em vez de cores hexadecimais soltas.
- Garanta `:focus-visible`, `type="button"` em botões não-submit, e fechamento por `Escape` + clique no backdrop em modais.

## 3. Arquitetura & Camada Firestore
- **Proibido** chamar `getDoc`, `getDocs`, `setDoc`, `updateDoc` ou `addDoc` diretamente em novos componentes ou páginas; centralize em `portal/src/servicos/` usando `sanitizarPayload` (contra `undefined`) e `writeBatch` para operações multi-documento.
- Mantenha arquivos `page.tsx` como Server Components por padrão; use `"use client"` apenas nos componentes folha interativos.
- Dados confidenciais ficam em subcoleções privadas (`personagens/{id}/privado/*`), nunca no documento raiz.
- Ao editar regras de segurança, mantenha `firestore.rules` (raiz) e `portal/firestore.rules` 100% idênticos e publique com `npx -y firebase-tools@latest deploy --only firestore:rules` somente **após** o deploy do frontend.

## 4. Testes & Validação Obrigatória
- Após alterações em código TypeScript, Next.js ou CSS, execute dentro de `portal/`:
  1. `npm run typecheck` (`tsc --noEmit`)
  2. `npm run lint` (`eslint .`)
  3. `npm test` (testes unitários em Node.js)
  4. `npm run build`
- Após alterações em `portal/wiki-quartz/`, execute `npm run build:wiki` dentro de `portal/`.
- **Validação em navegador (Chrome DevTools):** NÃO executar por padrão a cada alteração; realizar somente quando solicitado explicitamente pelo usuário.
