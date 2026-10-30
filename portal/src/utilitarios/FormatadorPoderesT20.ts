import { ItemPoder, CategoriaPoder, TipoAcaoPoder } from "@/tipos/personagem";

export const MAPA_CATEGORIAS_PODER: Record<string, CategoriaPoder> = {
  classe: "Classe",
  raca: "Raça",
  raça: "Raça",
  racial: "Raça",
  origem: "Origem",
  geral: "Geral",
  combate: "Geral",
  destino: "Geral",
  magia: "Geral",
  concedido: "Concedido",
  tormenta: "Tormenta",
};

export const MAPA_ACOES_PODER: Record<string, TipoAcaoPoder> = {
  passive: "Passiva",
  passiva: "Passiva",
  standard: "Padrão",
  padrao: "Padrão",
  move: "Movimento",
  movimento: "Movimento",
  full: "Completa",
  completa: "Completa",
  reaction: "Reação",
  reacao: "Reação",
  free: "Livre",
  livre: "Livre",
};

export function sanitizarTextoFoundry(html: string): string {
  if (!html) return "";
  return html
    .replace(/@UUID\[[^\]]+\]\{([^}]+)\}/gi, "$1") // Remove referências UUID do Foundry mantendo o nome do item
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

export function converterItemFoundryParaPoder(item: any): ItemPoder {
  const sys = item.system || {};
  const ativacao = sys.ativacao || {};

  const tipoRaw = (sys.tipo || "").toLowerCase();
  const subtipoRaw = (sys.subtipo || "").toLowerCase();
  const execucaoRaw = (ativacao.execucao || "").toLowerCase();

  let categoria: CategoriaPoder = MAPA_CATEGORIAS_PODER[tipoRaw] || "Geral";

  // Identificação robusta dos poderes da Tormenta
  if (subtipoRaw.includes("tormenta") || tipoRaw.includes("tormenta")) {
    categoria = "Tormenta";
  }
  // Identificação robusta de poderes de Raça
  else if (
    tipoRaw === "racial" ||
    subtipoRaw.includes("racial") ||
    tipoRaw === "raca" ||
    tipoRaw === "raça"
  ) {
    categoria = "Raça";
  }

  const tipoAcao: TipoAcaoPoder = MAPA_ACOES_PODER[execucaoRaw] || "Passiva";

  const custoNum = ativacao.custo;
  const custoPm =
    custoNum && Number(custoNum) > 0 ? `${custoNum} PM` : "-";

  const poderLimpo: ItemPoder = {
    id: item._id || `poder_${Date.now()}`,
    nome: item.name || "Poder sem Nome",
    tipo: categoria,
    tipoAcao,
    custoPm,
    descricao: sanitizarTextoFoundry(sys.description?.value || ""),
    ehCustomizado: false,
  };

  if (item._id) poderLimpo.origemId = item._id;
  if (sys.subtipo) poderLimpo.subtipo = sys.subtipo;

  return poderLimpo;
}
