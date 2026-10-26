import { ItemEquipamento, CategoriaEquipamento } from "@/tipos/personagem";

export const MAPA_CATEGORIAS_EQUIPAMENTO: Record<string, CategoriaEquipamento> = {
  arma: "Arma",
  armas: "Arma",
  armadura: "Armadura",
  armaduras: "Armadura",
  escudo: "Escudo",
  escudos: "Escudo",
  acessorio: "Acessório",
  acessorios: "Acessório",
  vestuario: "Acessório",
  traje: "Acessório",
  consumivel: "Consumível",
  pocao: "Consumível",
  pocoes: "Consumível",
  alquimico: "Consumível",
  equipamento: "Geral",
  geral: "Geral",
  material: "Geral",
  ferramenta: "Geral",
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
  const tipoBruto = (sys.tipo || item.type || "").toLowerCase();

  let categoria: CategoriaEquipamento = MAPA_CATEGORIAS_EQUIPAMENTO[tipoBruto] || "Geral";

  if (item.type === "arma") categoria = "Arma";
  if (item.type === "armadura") categoria = "Armadura";
  if (item.type === "consumivel") categoria = "Consumível";

  return {
    id: item._id || `item_${Date.now()}`,
    origemId: item._id,
    nome: item.name || "Item sem Nome",
    categoria,
    subtipo: sys.subtipo || sys.tipo || undefined,
    quantidade: Number(sys.qtd) > 0 ? Number(sys.qtd) : 1,
    precoTexto: formatarPrecoT20(sys.preco),
    equipado: Boolean(sys.equipado),
    descricao: sanitizarTextoEquipamento(sys.description?.value || ""),
    ehCustomizado: false,
  };
}