import { ItemEquipamento, CategoriaEquipamento } from "@/tipos/personagem";

export const MAPA_CATEGORIAS_EQUIPAMENTO: Record<string, CategoriaEquipamento> = {
  arma: "Arma",
  armas: "Arma",
  armadura: "Armadura",
  armaduras: "Armadura",
  pesada: "Armadura",
  leve: "Armadura",
  escudo: "Escudo",
  escudos: "Escudo",
  acessorio: "Acessório",
  acessorios: "Acessório",
  vestuario: "Acessório",
  traje: "Acessório",
  esoterico: "Acessório",
  consumivel: "Consumível",
  pocao: "Consumível",
  pocoes: "Consumível",
  alquimico: "Consumível",
  alchemy: "Consumível",
  food: "Consumível",
  equipamento: "Geral",
  geral: "Geral",
  material: "Geral",
  ferramenta: "Geral",
  ammo: "Geral",
  tesouro: "Geral",
};

export const MAPA_SUBTIPOS_EQUIPAMENTO: Record<string, string> = {
  pesada: "Armadura Pesada",
  leve: "Armadura Leve",
  escudo: "Escudo",
  esoterico: "Item Esotérico",
  traje: "Vestuário / Traje",
  alchemy: "Alquimia",
  food: "Alimento",
  ammo: "Munição",
  material: "Material",
  ferramenta: "Ferramenta",
};

export const MAPA_EMPUNHADURA: Record<string, string> = {
  uma: "1 Mão",
  duas: "2 Mãos",
  leve: "Arma Leve",
};

export const MAPA_ALCANCE_EQUIPAMENTO: Record<string, string> = {
  short: "Curto (9m)",
  medium: "Médio (30m)",
  long: "Longo (90m)",
};

export const MAPA_TIPOS_DANO: Record<string, string> = {
  perfuracao: "Perfuração",
  corte: "Corte",
  impacto: "Impacto",
  fogo: "Fogo",
  frio: "Frio",
  eletricidade: "Eletricidade",
  acido: "Ácido",
  trevas: "Trevas",
  luz: "Luz",
  essencia: "Essência",
};

export function sanitizarTextoEquipamento(html: string): string {
  if (!html) return "";
  return html
    .replace(/@UUID\[[^\]]+\]\{([^}]+)\}/gi, "$1")
    .replace(/<br\s*[\/]?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/gi, "")
    .replace(/&ecirc;/g, "ê")
    .replace(/&eacute;/g, "é")
    .replace(/&agrave;/g, "à")
    .replace(/&aacute;/g, "á")
    .replace(/&atilde;/g, "ã")
    .replace(/&ccedil;/g, "ç")
    .replace(/&ocirc;/g, "ô")
    .replace(/&oacute;/g, "ó")
    .replace(/&iacute;/g, "í")
    .replace(/&uacute;/g, "ú")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&ordm;/g, "º")
    .replace(/&ordf;/g, "ª")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .trim();
}

export function formatarPrecoT20(preco: any): string {
  if (preco === undefined || preco === null) return "-";
  const num = Number(preco);
  if (isNaN(num) || num <= 0) return "-";
  return `T$ ${num.toLocaleString("pt-BR")}`;
}

export function converterItemFoundryParaEquipamento(item: any): ItemEquipamento {
  const sys = item.system || {};
  const tipoBruto = (sys.tipo || "").toLowerCase();
  const itemType = (item.type || "").toLowerCase();

  let categoria: CategoriaEquipamento =
    MAPA_CATEGORIAS_EQUIPAMENTO[tipoBruto] ||
    MAPA_CATEGORIAS_EQUIPAMENTO[itemType] ||
    "Geral";

  if (itemType === "arma") {
    categoria = "Arma";
  } else if (
    ["pesada", "leve"].includes(tipoBruto) ||
    tipoBruto.includes("armadura") ||
    itemType === "armadura"
  ) {
    categoria = "Armadura";
  } else if (tipoBruto === "escudo" || itemType === "escudo") {
    categoria = "Escudo";
  } else if (
    itemType === "consumivel" ||
    ["alchemy", "food", "pocao"].includes(tipoBruto)
  ) {
    categoria = "Consumível";
  }

  const subtipoDescritivo =
    MAPA_SUBTIPOS_EQUIPAMENTO[tipoBruto] ||
    sys.subtipo ||
    sys.tipo ||
    undefined;

  // Extração de Dano e Crítico para Armas
  let dano: string | undefined;
  let tipoDano: string | undefined;
  let critico: string | undefined;
  let empunhadura: string | undefined;
  let alcance: string | undefined;

  if (categoria === "Arma") {
    const danoRoll = (sys.rolls || []).find((r: any) => r.type === "dano");
    if (danoRoll?.parts?.[0]?.[0]) {
      dano = danoRoll.parts[0][0];
    }
    const rawTipoDano = (danoRoll?.parts?.[0]?.[1] || "").toLowerCase();
    if (rawTipoDano) {
      tipoDano = MAPA_TIPOS_DANO[rawTipoDano] || rawTipoDano;
    }

    const critM = Number(sys.criticoM) || 20;
    const critX = Number(sys.criticoX) || 2;
    critico = critM < 20 ? `${critM}/x${critX}` : `x${critX}`;

    if (sys.empunhadura) {
      empunhadura = MAPA_EMPUNHADURA[sys.empunhadura] || sys.empunhadura;
    }

    if (sys.alcance) {
      alcance = MAPA_ALCANCE_EQUIPAMENTO[sys.alcance] || sys.alcance;
    } else {
      alcance = "Corpo a corpo";
    }
  }

  // Extração de Defesa e Penalidade para Armaduras e Escudos
  let bonusDefesa: number | undefined;
  let penalidadeArmadura: number | undefined;

  if (categoria === "Armadura" || categoria === "Escudo") {
    if (sys.armadura?.value !== undefined && sys.armadura?.value !== null) {
      bonusDefesa = Number(sys.armadura.value);
    }
    if (sys.armadura?.penalidade !== undefined && sys.armadura?.penalidade !== null) {
      penalidadeArmadura = Number(sys.armadura.penalidade);
    }
  }

  const espacos =
    sys.espacos !== undefined && sys.espacos !== null ? Number(sys.espacos) : undefined;

  // Constrói objeto sem NENHUM campo undefined (compatível com Firestore)
  const itemLimpo: ItemEquipamento = {
    id: item._id || `item_${Date.now()}`,
    nome: item.name || "Item sem Nome",
    categoria,
    quantidade: Number(sys.qtd) > 0 ? Number(sys.qtd) : 1,
    equipado: Boolean(sys.equipado),
    descricao: sanitizarTextoEquipamento(sys.description?.value || ""),
    ehCustomizado: false,
  };

  if (item._id) itemLimpo.origemId = item._id;
  if (subtipoDescritivo) itemLimpo.subtipo = subtipoDescritivo;
  if (sys.preco !== undefined && sys.preco !== null) itemLimpo.precoTexto = formatarPrecoT20(sys.preco);
  if (dano) itemLimpo.dano = dano;
  if (tipoDano) itemLimpo.tipoDano = tipoDano;
  if (critico) itemLimpo.critico = critico;
  if (empunhadura) itemLimpo.empunhadura = empunhadura;
  if (alcance) itemLimpo.alcance = alcance;
  if (bonusDefesa !== undefined) itemLimpo.bonusDefesa = bonusDefesa;
  if (penalidadeArmadura !== undefined) itemLimpo.penalidadeArmadura = penalidadeArmadura;
  if (espacos !== undefined) itemLimpo.espacos = espacos;

  return itemLimpo;
}
