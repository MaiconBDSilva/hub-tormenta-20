import test from "node:test";
import assert from "node:assert/strict";
import { sanitizarTextoFoundry } from "../SanitizadorFoundry.ts";
import { converterItemFoundryParaMagia } from "../FormatadorMagiasT20.ts";
import { converterItemFoundryParaPoder } from "../FormatadorPoderesT20.ts";
import { converterItemFoundryParaEquipamento } from "../FormatadorEquipamentosT20.ts";
import { sanitizarPayload } from "../../servicos/firestoreHelpers.ts";

test("sanitizarTextoFoundry remove tags, UUIDs, rolagens inline e decodifica entidades", () => {
  const bruto =
    "<p>&ldquo;Aura&rdquo; com @UUID[Compendium.t20.poderes.abc]{M&atilde;o} e [[/r 2+(@Tormenta2*2)]] &bull; 90&deg;</p><p>Linha 2</p>";
  const limpo = sanitizarTextoFoundry(bruto);

  assert.equal(limpo, '"Aura" com Mão e 2+(@Tormenta2*2) • 90°\n\nLinha 2');
});

test("converterItemFoundryParaMagia traduz action, self e round corretamente", () => {
  const magia = converterItemFoundryParaMagia({
    _id: "mag_1",
    name: "Bola de Fogo",
    system: {
      circulo: 2,
      tipo: "arc",
      escola: "evo",
      alcance: "medium",
      ativacao: { execucao: "action", custo: 3 },
      duracao: { units: "round", value: 3 },
      description: { value: "<p>Causa dano &agrave; dist&acirc;ncia.</p>" },
    },
  });

  assert.equal(magia.execucao, "Padrão");
  assert.equal(magia.alcance, "Médio (30m)");
  assert.equal(magia.duracao, "3 rodadas");

  const magiaPessoal = converterItemFoundryParaMagia({
    _id: "mag_2",
    name: "Armadura Arcana",
    system: {
      circulo: 1,
      tipo: "arc",
      escola: "abj",
      alcance: "self",
      ativacao: { execucao: "action" },
      duracao: { units: "scene" },
    },
  });

  assert.equal(magiaPessoal.alcance, "Pessoal");
});

test("converterItemFoundryParaPoder mapeia ability para Classe, normaliza subtipo e detecta Tormenta", () => {
  const poderClasse = converterItemFoundryParaPoder({
    _id: "pod_1",
    name: "Engenhosidade",
    system: {
      tipo: "ability",
      subtipo: "inventor",
      ativacao: { execucao: "action", custo: 2 },
    },
  });

  assert.equal(poderClasse.tipo, "Classe");
  assert.equal(poderClasse.subtipo, "Inventor");
  assert.equal(poderClasse.tipoAcao, "Padrão");
  assert.equal(poderClasse.custoPm, "2 PM");

  const poderTormenta = converterItemFoundryParaPoder({
    _id: "pod_2",
    name: "Pele Corrompida",
    system: {
      tipo: "geral",
      subtipo: "Tormenta",
      ativacao: { execucao: "passive" },
    },
  });

  assert.equal(poderTormenta.tipo, "Tormenta");
  assert.equal(poderTormenta.tipoAcao, "Passiva");
});

test("converterItemFoundryParaEquipamento trata alcance '-' como Corpo a corpo e armadura pesada", () => {
  const arma = converterItemFoundryParaEquipamento({
    _id: "eq_1",
    name: "Espada Longa",
    type: "arma",
    system: {
      alcance: "-",
      criticoM: 19,
      criticoX: 2,
      rolls: [{ type: "dano", parts: [["1d8", "corte"]] }],
    },
  });

  assert.equal(arma.categoria, "Arma");
  assert.equal(arma.alcance, "Corpo a corpo");
  assert.equal(arma.dano, "1d8");
  assert.equal(arma.tipoDano, "Corte");
  assert.equal(arma.critico, "19/x2");

  const armadura = converterItemFoundryParaEquipamento({
    _id: "eq_2",
    name: "Armadura Completa",
    type: "equipamento",
    system: {
      tipo: "pesada",
      armadura: { value: 10, penalidade: -5 },
    },
  });

  assert.equal(armadura.categoria, "Armadura");
  assert.equal(armadura.bonusDefesa, 10);
  assert.equal(armadura.penalidadeArmadura, -5);
});

test("sanitizarPayload remove campos undefined mantendo null, numeros e textos", () => {
  const resultado = sanitizarPayload({
    nome: "Damascus",
    nivel: 5,
    donoUid: null,
    subtipo: undefined,
    itens: [{ id: "1", obs: undefined, qtd: 2 }],
  });

  assert.deepEqual(resultado, {
    nome: "Damascus",
    nivel: 5,
    donoUid: null,
    itens: [{ id: "1", qtd: 2 }],
  });
});

