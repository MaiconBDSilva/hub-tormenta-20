# Diretrizes do Projeto — Hub Tormenta 20

- **Diretório da aplicação Next.js:** Todos os comandos `npm` (`npm run dev`, `npm run build`, `npm run build:wiki`) devem ser executados dentro de `portal/`.
- **Tailwind CSS v4:** Nunca use `@apply` com classes customizadas (como `.t20-*`) dentro de arquivos `.module.css`; componha classes globais diretamente no TSX.
- **Firestore:** Sempre sanitize payloads antes de `updateDoc`/`setDoc` (ex.: `JSON.parse(JSON.stringify(payload))`) para evitar campos `undefined`. Ao editar regras de segurança, mantenha `firestore.rules` na raiz e `portal/firestore.rules` sincronizados.
- **Validação:** Após alterações em TypeScript/Next.js, execute `npm run build` em `portal/`. Após alterações em `portal/wiki-quartz/`, execute `npm run build:wiki` em `portal/`.

