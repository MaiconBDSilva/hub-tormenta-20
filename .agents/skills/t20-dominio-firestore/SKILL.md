---
name: t20-dominio-firestore
description: >-
  Use when working on Firestore schemas, character sheets, moderation flow,
  Foundry VTT compendium converters (powers, spells, equipment), or firestore.rules
  in Hub Tormenta 20.
---

# Domínio Tormenta 20, Firestore & Compêndio

Consulte `docs/banco-de-dados.md` e `docs/compendio.md` para detalhes completos quando necessário.

## 1. Coleções Firestore & Moderação
- **`configuracoes/campanha`:** `proximaSessao` (incluindo `dtTesteFoundry`), `ultimaSessao`, `servidor.foundryUrl`.
- **`usuarios/{uid}`:** `role` (`"mestre"` | `"jogador"`), `personagemId`.
- **`personagens/{id}`:**
  - **Campos Livres** (Dono ou Mestre salvam direto): `pvAtual`, `pmAtual`, `avatarUrl`, `descricao`, `anotacoes`, `pericias`, `poderes`, `magias`, `equipamentos`, `moedas` (`tl`, `to`, `tp`, `tc`).
  - **Campos Protegidos** (Mestre aplica direto; Jogador cria `solicitacaoPendente`): `nome`, `raca`, `classe`, `origem`, `nivel`, `divindade`, `pvMaximo`, `pmMaximo`, `defesa`, `atributos` (`for`, `des`, `con`, `int`, `sab`, `car`).
- **Privacidade:** `anotacoes` (`AbaNotas.tsx`) é restrito exclusivamente ao dono da ficha (`donoUid`) e ao Mestre.

## 2. Regras de Persistência & Segurança
- **Prevenção de `undefined` no Firestore:** O SDK do Firestore lança erro fatal se houver `undefined` em objetos ou arrays enviados ao `updateDoc`/`setDoc`. Sempre sanitize payloads antes de gravar:
  ```typescript
  const payloadLimpo = JSON.parse(JSON.stringify(dados));
  ```
- **Sincronia de `firestore.rules`:** Mantenha `firestore.rules` (raiz) e `portal/firestore.rules` sincronizados ao alterar regras de acesso.

## 3. Compêndio Foundry VTT (`portal/src/dados/` e `portal/src/utilitarios/`)
- **`FormatadorPoderesT20.ts`:** No Foundry, poderes raciais vêm com tipo `"racial"` (mapear para `"Raça"`) e poderes da Tormenta vêm como `tipo: "geral"` + `subtipo: "Tormenta"` (priorizar categoria `"Tormenta"`).
- **`FormatadorEquipamentosT20.ts`:** Armaduras vêm como `type: "equipamento"` com `system.tipo: "pesada"` ou `"leve"`.
- **`FormatadorMagiasT20.ts`:** Mapear siglas de escola (`abj`, `adv`, `con`, `enc`, `evo`, `ilu`, `nec`, `tra`) e tipo (`arc`, `div`, `uni`), extraindo aprimoramentos e custos de PM.
- **Ordenação alfabética:** Todas as listas de itens, magias e poderes devem usar ordenação natural em português:
  ```typescript
  lista.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" }));
  ```

