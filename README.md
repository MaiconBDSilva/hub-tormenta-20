# ⚔️ Hub Tormenta 20

[![Next.js](https://img.shields.io/badge/Next.js-16.3.5-black?logo=next.js)](https://nextjs.org/)
[![Turbopack](https://img.shields.io/badge/Turbopack-Ready-blueviolet)](https://turbo.build/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-v11-orange?logo=firebase)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Quartz](https://img.shields.io/badge/Quartz-v5.0-brightgreen)](https://quartz.jzhao.xyz/)

Portal web imersivo e funcional desenvolvido para apoiar uma mesa contínua de RPG no sistema **Tormenta 20**. Combina a ambientação diegética de Arton com ferramentas em tempo real para o Mestre e os Jogadores.

---

## 🌟 Módulos do Portal

### 1. 🏰 Landing Page & Hero
- **Status da Campanha:** Consulta em tempo real da data da próxima sessão, resumo do último episódio e ping ao vivo do servidor Foundry VTT via API interna.
- **Desafio do d20 (Canvas 3D):** Minigame interativo com Three.js / React Three Fiber onde a rolagem de um d20 contra a DT da sessão libera o botão de acesso ao Foundry.

### 2. 📜 Vitrine & Fichas de Personagens (`/personagens`)
- **Vitrine Dinâmica:** Cards dos aventureiros com barras gráficas contínuas de PV e PM, badges e destaque dourado para o herói do jogador logado.
- **Ficha Imersiva em 6 Abas:**
  - **Principal:** Biografia, histórico e feitos memoráveis com editor de texto rico.
  - **Poderes:** Catálogo com 646 poderes do Foundry VTT, subfiltros dinâmicos por Classe (14 classes) e Raça (17 raças) e ordenação alfabética.
  - **Perícias:** Tabela completa com cálculo automático (treino + metade do nível + atributo).
  - **Magias:** Grimório arcano e divino do 1º ao 5º círculo com aprimoramentos e custos de PM.
  - **Equipamentos:** Inventário com atributos de combate em armas (dano, crítico, alcance), armaduras (defesa, penalidade) e moedas (TL, TO, TP, TC).
  - **Notas:** Diário secreto restrito com exclusividade ao Dono da ficha e ao Mestre.
- **Moderação Inteligente:** Jogadores editam livremente campos de jogo diário (PV, PM, itens, magias), enquanto aumentos de nível e atributos entram na fila de aprovação do Mestre.

### 3. 🛡️ Painel do Mestre (`/painel`)
- Área restrita protegida por cargo com 3 abas de gestão:
  1. **Campanha & Sessões:** Edição da próxima sessão, resumo da última e URL do servidor Foundry.
  2. **Gestão de Heróis:** Criação de novos personagens e aprovação/recusa fundamentada de fichas.
  3. **Vínculo de Usuários:** Associação direta de cada jogador autenticado à sua ficha principal.

### 4. 📚 Wiki da Campanha (`/wikitormenta`)
- Digital Garden alimentado pelas notas do Obsidian da mesa através do Quartz 5.0, em tema escuro estrito, com grafo local da página e menu superior unificado.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- **Node.js:** Versão 20 ou superior (Node 22 recomendado)
- **NPM:** Versão 10 ou superior

### Passo a Passo

1. **Clonar o Repositório:**
   ```bash
   git clone https://github.com/MaiconBDSilva/hub-tormenta-20.git
   cd hub-tormenta-20/portal
   ```

2. **Instalar Dependências:**
   ```bash
   npm install
   ```

3. **Configurar as Variáveis de Ambiente:**
   Crie o arquivo `.env.local` dentro da pasta `portal/` com as chaves do seu projeto Firebase:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
   ```

4. **Executar em Modo de Desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse `http://localhost:3000` no seu navegador.

5. **Compilar a Wiki do Obsidian (Quando houver novas notas):**
   ```bash
   npm run build:wiki
   ```

---

## 🛠️ Comandos Principais

Todos os comandos devem ser executados a partir do diretório `portal/`:

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor local Next.js com Turbopack em `localhost:3000`. |
| `npm run build` | Valida tipagem TypeScript e gera a build de produção otimizada. |
| `npm run build:wiki` | Compila as notas do Obsidian (`wiki-quartz/content/`) para `public/wiki/`. |
| `npm run start` | Executa o build de produção localmente. |

---

## 📖 Documentação Técnica Completa

Para aprofundar nas decisões técnicas, arquitetura e contratos de dados, consulte os documentos na pasta [`docs/`](./docs/):

* 🏛️ **[Arquitetura & Design System](./docs/arquitetura.md):** Stack tecnológico, convenções do Tailwind v4, classes utilitárias `.t20-*` e mapa detalhado de pastas.
* 🗄️ **[Banco de Dados & Segurança](./docs/banco-de-dados.md):** Schemas do Firestore (`configuracoes`, `usuarios`, `personagens`), fluxo de moderação e regras de segurança (`firestore.rules`).
* 📦 **[Compêndio T20 & Wiki Quartz](./docs/compendio.md):** Ingestão de dados do Foundry VTT, conversores de itens, subfiltros dinâmicos e customização do Quartz 5.
* 🗺️ **[Roadmap & Backlog](./docs/roadmap.md):** Especificação da Agenda estilo *When2Meet*, biblioteca de livros em PDF e automações de CI/CD.

---

## 📄 Licença
Projeto desenvolvido para uso da mesa de RPG **Invocação do Herói** baseada no sistema Tormenta 20 (Jambô Editora).
