# Arquitetura & Design System — Hub Tormenta 20

Este documento reúne todas as decisões de engenharia, arquitetura de software, convenções de estilo e a estrutura de arquivos do projeto **Hub Tormenta 20**.

---

## 1. Stack Tecnológico

| Camada | Tecnologia | Detalhes e Justificativa |
| :--- | :--- | :--- |
| **Framework Principal** | Next.js 16.3.5 (App Router) | Compilação com **Turbopack** para hot-reload e builds em menos de 1 segundo. |
| **Linguagem** | TypeScript 5 | Tipagem estrita ponta a ponta (modelos, formulários, componentes e utilitários). |
| **Estilização** | Tailwind CSS v4 + CSS Modules | Design System diegético Tormenta 20 centralizado em `globals.css` combinado a CSS Modules pontuais. |
| **Ícones** | Lucide React | Ícones vetoriais modernos (`Calendar`, `Shield`, `Sparkles`, `BookOpen`, `Sword`, etc.). |
| **Wiki / Lore** | Quartz 5.0 (Digital Garden) | Compilação estática a partir das notas do Obsidian para `portal/public/wiki/`, servida via CDN da Vercel. |
| **Autenticação & Banco** | Firebase v11+ (Auth + Firestore) | Auth com Google Provider e Firestore para leitura e persistência em nuvem. |
| **Hospedagem & CI/CD** | Vercel | Deploy contínuo via GitHub na branch `main`. |

---

## 2. Design System & Convenções Estilísticas

### 2.1. Variáveis de Cor (`@theme` no `globals.css`)
O portal adota a paleta imersiva e diegética do universo Tormenta 20:

```css
--color-pedra-fundo: #0c0a09; /* stone-950 (Fundo escuro principal) */
--color-pedra-card:  #1c1917; /* stone-900 (Cards, painéis e modais) */
--color-pedra-borda: #292524; /* stone-800 (Divisórias e bordas sutis) */

--color-rubi:        #dc2626; /* red-600 (Acentos da Tormenta, perigo) */
--color-rubi-escuro: #7f1d1d; /* red-900 (Brilhos de fundo, PV e alertas) */

--color-dourado:        #f59e0b; /* amber-500 (Ouro e energia mística) */
--color-dourado-claro:  #fbbf24; /* amber-400 (Destaques, links ativos) */
--color-dourado-escuro: #d97706; /* amber-600 (Bordas e degradês de botões) */
```

### 2.2. Classes Utilitárias Globais Obrigatórias
Padronizadas em `portal/src/app/globals.css` para reaproveitamento em todo o portal:

* **Superfícies & Bordas:**
  - `.t20-card`: Container com fundo `stone-900/90`, borda `stone-800`, cantos `rounded-xl`, efeito de vidro fosco `backdrop-blur-md` e sombra profunda `shadow-2xl`.
  - `.t20-stripe`: Linha decorativa no topo com degradê rubi-âmbar-rubi.
  - `.t20-stripe-gold`: Linha decorativa dourada exclusiva para realçar o herói do jogador logado.
* **Cabeçalhos & Filtros:**
  - `.t20-section-header`: Container flexível para cabeçalho de abas ou painéis.
  - `.t20-section-title`: Título em fonte serifada Cinzel, cor dourada âmbar e tamanho padronizado.
  - `.t20-badge-counter`: Badge em fonte mono para contagem de itens em listas e abas.
  - `.t20-filter-pill`: Botão pílula para filtragem de categorias.
  - `.t20-filter-pill-active`: Estado ativo da pílula com borda âmbar e fundo iluminado.
* **Ações & Botões:**
  - `.t20-btn-primary`: Botão principal com degradê dourado, texto escuro `stone-950` e efeito de escala.
  - `.t20-btn-secondary`: Botão neutro de contorno em `stone-800` com destaque âmbar ao passar o mouse.
  - `.t20-btn-dashed`: Botão tracejado em `stone-800` para ações de adicionar compêndio.
  - `.t20-btn-cancel`: Botão de cancelamento discreto.
  - `.t20-form-actions`: Container flexível alinhado à direita para agrupamento de ações de salvar/cancelar.
* **Barras de Recursos Vitais:**
  - `.t20-track-pv` / `.t20-bar-pv`: Trilha e barra contínua de Pontos de Vida (vermelho vivo com brilho rubi).
  - `.t20-track-pm` / `.t20-bar-pm`: Trilha e barra contínua de Pontos de Mana (azul vivo a ciano com brilho místico).
* **Alertas:**
  - `.t20-alert-success`, `.t20-alert-error`, `.t20-alert-warning`: Banners contextuais com ícone e borda colorida.

### 2.3. Regra de Arquitetura CSS (Tailwind v4 + Turbopack)
- **Proibição de `@apply` com classes customizadas:** No Tailwind CSS v4, `@apply` dentro de arquivos `.module.css` só deve referenciar utilitários nativos do Tailwind, nunca classes customizadas de outros módulos.
- **Composição no TSX:** As classes globais são compostas diretamente no TSX: `className={`${styles.caixaAtributo} t20-card`}`.

---

## 3. Estrutura Completa de Diretórios

```text
hub-tormenta-20/
├── firestore.rules                     <-- Regras de segurança do Firestore na raiz do repositório
├── docs/                               <-- Documentação técnica modular
│   ├── arquitetura.md                  <-- Este documento
│   ├── banco-de-dados.md               <-- Modelagem Firestore e regras de acesso
│   ├── compendio.md                    <-- Ingestão de dados do Foundry VTT e Wiki Quartz
│   └── roadmap.md                      <-- Planejamento das próximas funcionalidades
├── portal/
│   ├── firestore.rules                 <-- Cópia sincronizada das regras no pacote Next.js
│   ├── eslint.config.mjs               <-- Configuração ESLint com ignores para wiki estática
│   ├── next.config.ts                  <-- Configurações do Next.js
│   ├── package.json                    <-- Scripts e dependências do portal
│   ├── public/
│   │   ├── logo-rpg.png                <-- Logo horizontal Tormenta 20 (desktop)
│   │   ├── logo-mobile.png             <-- Brasão compacto para mobile
│   │   └── wiki/                       <-- Arquivos HTML/CSS/JS compilados pelo Quartz
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   ├── foundry/
│   │   │   │   │   └── route.ts        <-- Endpoint de ping dinâmico do Foundry (consulta Firestore)
│   │   │   │   └── wiki/
│   │   │   │       └── [[...slug]]/    <-- Rota API para servir a wiki estática
│   │   │   ├── globals.css             <-- Design System Tormenta 20 (classes .t20-*)
│   │   │   ├── layout.tsx              <-- RootLayout com AuthProvider e MenuFixo
│   │   │   ├── page.tsx                <-- Landing page principal (HeroSection e Sessões)
│   │   │   ├── login/page.tsx          <-- Autenticação com Google Provider
│   │   │   ├── painel/page.tsx         <-- Painel do Mestre orquestrado em 3 abas
│   │   │   ├── personagens/
│   │   │   │   ├── page.tsx            <-- Vitrine pública dos personagens da mesa
│   │   │   │   └── [id]/page.tsx       <-- Ficha Imersiva Modular (6 abas temáticas)
│   │   │   └── wikitormenta/page.tsx   <-- Iframe isolado servindo a wiki Quartz
│   │   ├── componentes/
│   │   │   ├── hero/
│   │   │   │   ├── HeroSection.tsx     <-- Seção principal com status dinâmico da mesa
│   │   │   │   ├── SessionCard.tsx     <-- Card da próxima/última sessão com skeleton
│   │   │   │   ├── FoundryChallengeCard.tsx <-- Desafio de d20 para liberar acesso ao Foundry
│   │   │   │   └── D203DCanvas.tsx     <-- Minigame 3D com física e rolagem de dado
│   │   │   ├── menu/
│   │   │   │   ├── MenuFixo.tsx        <-- Header fixo com ping do Foundry e avatar
│   │   │   │   ├── MenuFixo.module.css <-- Estilização modular com altura precisa (61px / 53px)
│   │   │   │   └── FoundryStatusButton.tsx <-- Botão de status online/offline com atalho
│   │   │   ├── painel/
│   │   │   │   ├── FormCampanha.tsx    <-- Formulário de controle da campanha e link do Foundry
│   │   │   │   ├── GerenciadorPersonagens.tsx <-- Lista de heróis e moderação de fichas
│   │   │   │   ├── GerenciadorUsuarios.tsx    <-- Associação de jogadores com heróis
│   │   │   │   ├── CardModeracaoEdicao.tsx    <-- Diff comparativo entre ficha vigente e proposta
│   │   │   │   ├── ModalCriarPersonagem.tsx   <-- Criação rápida de ficha nível 1
│   │   │   │   └── TelaAcessoNegado.tsx       <-- Bloqueio visual para usuários sem permissão
│   │   │   └── personagens/
│   │   │       ├── CardPersonagemVitrine.tsx  <-- Card da vitrine com barras de PV/PM e badges
│   │   │       ├── CabecalhoFicha.tsx         <-- Topo da ficha com atributos T20 e modo edição
│   │   │       └── abas/
│   │   │           ├── AbaPrincipal.tsx       <-- Crônica, histórico e feitos memoráveis
│   │   │           ├── AbaPoderes.tsx         <-- Gerenciamento de poderes, subfiltros e compêndio
│   │   │           ├── AbaPericias.tsx        <-- Tabela completa com cálculo automático
│   │   │           ├── AbaMagias.tsx          <-- Grimório arcano e divino com aprimoramentos
│   │   │           ├── AbaEquipamentos.tsx    <-- Inventário, riquezas e atributos de combate
│   │   │           └── AbaNotas.tsx           <-- Diário secreto exclusivo de Dono e Mestre
│   │   ├── contextos/
│   │   │   └── AuthContext.tsx         <-- Provedor de autenticação e papel do usuário
│   │   ├── dados/
│   │   │   ├── equipamentos.json       <-- 211 itens exportados do Foundry VTT
│   │   │   ├── magias.json             <-- 200 magias exportadas do Foundry VTT
│   │   │   └── poderes.json            <-- 646 poderes exportados do Foundry VTT
│   │   ├── lib/
│   │   │   └── firebase.ts             <-- Inicialização do Firebase Auth e Firestore
│   │   ├── tipos/
│   │   │   ├── campanha.ts             <-- Modelos de sessão e servidor Foundry
│   │   │   └── personagem.ts           <-- Interfaces completas da ficha e atributos T20
│   │   └── utilitarios/
│   │       ├── FormatadorEquipamentosT20.ts <-- Conversor e extrator de combate de itens
│   │       ├── FormatadorMagiasT20.ts       <-- Conversor de escolas e custos de magias
│   │       └── FormatadorPoderesT20.ts      <-- Conversor de categorias e ações de poderes
│   └── wiki-quartz/                    <-- Projeto Quartz 5.0
│       ├── content/                    <-- Vault do Obsidian com as notas Markdown
│       ├── quartz.config.yaml          <-- Configuração de plugins, tema dark e local graph
│       └── quartz/components/Head.tsx  <-- Injeção do menu idêntico ao portal e tema estrito
└── README.md                           <-- Ponto de entrada amigável do repositório
```

