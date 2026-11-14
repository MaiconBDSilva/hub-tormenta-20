# ⚔️ Hub Tormenta 20

[![Next.js](https://img.shields.io/badge/Next.js-16.3.5-black?logo=next.js)](https://nextjs.org/)
[![Turbopack](https://img.shields.io/badge/Turbopack-Ready-blueviolet)](https://turbo.build/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-v13-orange?logo=firebase)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Quartz](https://img.shields.io/badge/Quartz-v5.0-brightgreen)](https://quartz.jzhao.xyz/)

Portal web desenvolvido para apoiar a mesa contínua de RPG **Invocação do Herói** no sistema **Tormenta 20**, unindo ambientação diegética de Arton, fichas interativas em tempo real com Firebase, compêndio do Foundry VTT e Digital Garden no Obsidian.

---

## 🌟 Módulos do Portal

- **Home (`/`):** Status da próxima sessão, resumo do último episódio, ping ao vivo do servidor Foundry VTT (`/api/foundry`) e Desafio do d20 em 3D (Three.js).
- **Vitrine & Fichas (`/personagens` e `/personagens/[id]`):** Vitrine dos heróis com barras de PV/PM e ficha completa em 6 abas (*Principal, Poderes, Perícias, Magias, Equipamentos e Notas privadas*), com edição livre para recursos de jogo e fila de moderação do Mestre para atributos/nível.
- **Painel do Mestre (`/painel`):** Controle da campanha, criação de fichas, aprovação/recusa de alterações e vínculo atômico entre jogadores e personagens.
- **Wiki da Campanha (`/wiki/wiki.html`):** Digital Garden compilado a partir do vault do Obsidian via Quartz 5.0 em tema escuro, com grafo local e cabeçalho sincronizado (e redirecionamento automático de `/wikitormenta`).

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- **Node.js 20+** (Node 22+ recomendado) e **npm 10+**

### Passo a Passo
1. **Instalar dependências** (a partir da raiz do repositório):
   ```bash
   cd portal
   npm install
   ```
2. **Configurar variáveis de ambiente** em `portal/.env.local`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
   ```
3. **Iniciar o servidor local:**
   ```bash
   npm run dev
   ```
   Acesse `http://localhost:3000`.

---

## 🛠️ Comandos Oficiais

Execute os comandos do portal dentro de `portal/`:

| Comando | Local | Descrição |
| :--- | :--- | :--- |
| `npm run dev` | `portal/` | Servidor local Next.js com Turbopack (`localhost:3000`). |
| `npm run typecheck` | `portal/` | Valida tipagem TypeScript (`tsc --noEmit`). |
| `npm run lint` | `portal/` | Executa ESLint (`eslint .`). |
| `npm test` | `portal/` | Executa testes unitários dos formatadores e sanitização. |
| `npm run build` | `portal/` | Gera o build de produção otimizado do Next.js. |
| `npm run build:wiki` | `portal/` | Compila as notas do Obsidian (`wiki-quartz/content/`) para `public/wiki/`. |
| `npx -y firebase-tools@latest deploy --only firestore:rules` | Raiz | Publica as regras de segurança (`firestore.rules`) no Firebase. |

---

## 📖 Documentação & Diretrizes

- 🤖 **[AGENTS.md](./AGENTS.md):** Regras obrigatórias de arquitetura, CSS semântico/modular, segurança e validação automatizada.
- 🏛️ **[Arquitetura & Design System](./docs/arquitetura.md):** Stack, tokens CSS, classes `.t20-*` e estrutura de pastas.
- 🗄️ **[Banco de Dados & Segurança](./docs/banco-de-dados.md):** Schemas do Firestore, ciclo de moderação e `firestore.rules`.
- 📦 **[Compêndio T20 & Wiki Quartz](./docs/compendio.md):** Ingestão de dados do Foundry VTT, conversores e configuração do Quartz 5.0.
- 🗺️ **[Roadmap & Backlog](./docs/roadmap.md):** Próximas funcionalidades planejadas (Agenda *When2Meet*, biblioteca PDF, etc.).
