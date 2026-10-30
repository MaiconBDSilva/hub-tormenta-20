# Compêndio T20 & Integração Wiki Quartz — Hub Tormenta 20

Este documento descreve como os dados do sistema Tormenta 20 são consumidos a partir do Foundry VTT, como funcionam os conversores e como a Wiki é gerada através do Quartz 5.

---

## 1. Arquivos Estáticos do Compêndio (Foundry VTT)

Os dados oficiais de Tormenta 20 residem em `portal/src/dados/`:
- **`poderes.json`:** 646 poderes de classes, raças, origens, deuses e Tormenta.
- **`magias.json`:** 200 magias do 1º ao 5º círculo (arcanas, divinas e universais).
- **`equipamentos.json`:** 211 itens (armas, armaduras, escudos, acessórios e consumíveis).

Esses arquivos são carregados em memória (`useMemo`) nas abas da ficha, permitindo busca instantânea e filtros sem requisições de rede.

---

## 2. Peculiaridades do Foundry T20 & Conversores

O módulo de Tormenta 20 do Foundry VTT possui peculiaridades de schema que exigem mapeamento inteligente:

### 2.1. Poderes ([`FormatadorPoderesT20.ts`](file:///e:/Maicon/RPG/hub-tormenta-20/portal/src/utilitarios/FormatadorPoderesT20.ts))

* **Poderes Raciais:** No Foundry, o tipo vem gravado como `"racial"` (não `"raca"` ou `"raça"`). O conversor mapeia para `"Raça"`.
* **Poderes da Tormenta:** No livro básico, são poderes gerais. No Foundry, vêm com `tipo: "geral"` e `subtipo: "Tormenta"`. O conversor prioriza a detecção de `"Tormenta"` e classifica na categoria própria.
* **Distribuição do Compêndio (646 poderes):**
  - **Classe:** 300 poderes
  - **Geral:** 161 poderes (Combate, Destino, Magia)
  - **Concedido:** 70 poderes
  - **Raça:** 55 poderes
  - **Origem:** 35 poderes
  - **Tormenta:** 25 poderes

#### Subfiltros Dinâmicos de Classe & Raça:
Ao selecionar as categorias "Classe" ou "Raça" (tanto na aba da ficha quanto no modal do Compêndio), um seletor dinâmico é exibido:
- **14 Classes:** *Arcanista, Bárbaro, Bardo, Bucaneiro, Caçador, Cavaleiro, Clérigo, Druida, Guerreiro, Inventor, Ladino, Lutador, Nobre, Paladino*.
- **17 Raças:** *Anão, Dahllan, Elfo, Goblin, Golem, Humano, Hynne, Kliren, Lefou, Medusa, Minotauro, Osteon, Qareen, Sereia/Tritão, Sílfide, Suraggel, Trog*.

---

### 2.2. Equipamentos ([`FormatadorEquipamentosT20.ts`](file:///e:/Maicon/RPG/hub-tormenta-20/portal/src/utilitarios/FormatadorEquipamentosT20.ts))

* **Armaduras:** No Foundry, não existe `item.type === "armadura"`. Armaduras vêm como `type: "equipamento"` com `system.tipo: "pesada"` ou `"leve"`. O conversor as categoriza como `"Armadura"`.
* **Extração de Atributos de Combate:**
  - **Armas:** Dano (`1d8`, `2d6`), tipo de dano (`Perfuração`, `Corte`, `Impacto`), crítico (`19/x2`, `x3`), empunhadura (`1 Mão`, `2 Mãos`, `Arma Leve`) e alcance (`Curto`, `Médio`, `Corpo a corpo`).
  - **Armaduras e Escudos:** Bônus de Defesa (`+5 Defesa`), penalidade de armadura (`Pen. -2`) e espaços ocupados.
  - **Preços:** Formatados em moeda nacional artoniana (`T$ 100`).

---

### 2.3. Magias ([`FormatadorMagiasT20.ts`](file:///e:/Maicon/RPG/hub-tormenta-20/portal/src/utilitarios/FormatadorMagiasT20.ts))

* Mapeamento de siglas do Foundry para termos em português:
  - **Escolas:** `abj` (Abjuração), `adv` (Adivinhação), `con` (Convocação), `enc` (Encantamento), `evo` (Evocação), `ilu` (Ilusão), `nec` (Necromancia), `tra` (Transmutação).
  - **Tipos:** `arc` (Arcana), `div` (Divina), `uni` (Universal).
  - **Aprimoramentos:** Extraídos da lista de efeitos do item com cálculo de custo adicional (`+1 PM`, `+2 PM`).

---

### 2.4. Ordenação Alfabética em Todas as Listas
Todas as listas de poderes, magias e equipamentos (tanto os itens que o personagem já possui quanto os catálogos dentro dos modais) são ordenadas alfabeticamente usando a regra natural de ordenação do português:

```typescript
lista.sort((a, b) =>
  a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
);
```

---

## 3. Wiki da Campanha (Quartz 5.0)

A Wiki é mantida no Obsidian no diretório `portal/wiki-quartz/content/` e compilada para HTML estático em `portal/public/wiki/`.

### 3.1. Configurações Críticas (`quartz.config.yaml`)
- **Tema Escuro Permanente:** Configurado com `mode: dark` no `@quartz-themes/core` para prevenir fundo branco ou flashes de modo claro.
- **Ocultação de Aliases / Frontmatter:** O plugin `@quartz-community/note-properties` atua como transformer para consumir os metadados do YAML, mas com `hidePropertiesView: true` para que nenhuma tabela bruta de aliases vaze para a visualização.
- **Grafo Local:** O componente `@quartz-community/graph` opera com profundidade restrita à página atual (`depth: 1`, nós em rubi `#dc2626` e âmbar `#fbbf24`), com o botão do grafo global oculto.

### 3.2. Menu Superior Sincronizado (`Head.tsx`)
Em `portal/wiki-quartz/quartz/components/Head.tsx`, é injetado o cabeçalho idêntico ao do portal principal:
- **Altura Desktop:** `61px` (idêntica ao `MenuFixo.module.css`).
- **Altura Mobile:** `53px`.
- **Efeito Iframe:** Quando aberto dentro do iframe de `/wikitormenta`, o script detecta `window.self !== window.top` e alinha o conteúdo sem sobras de margem. Quando acessado por link direto fora do portal, o menu superior garante navegação de volta para todas as rotas do portal.

### 3.3. Como Atualizar a Wiki
Após adicionar ou editar notas Markdown no Obsidian (`portal/wiki-quartz/content/`), rode:

```bash
cd portal
npm run build:wiki
```

A build compilará as notas em ~7 segundos e emitirá os arquivos HTML/CSS prontos em `portal/public/wiki/`.

