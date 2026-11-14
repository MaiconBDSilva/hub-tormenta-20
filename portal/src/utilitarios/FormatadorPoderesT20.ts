import type { ItemPoder, CategoriaPoder, TipoAcaoPoder } from "@/tipos/personagem";
import { type FoundryItemRaw, sanitizarTextoFoundry } from "./SanitizadorFoundry.ts";

export const MAPA_CATEGORIAS_PODER: Record<string, CategoriaPoder> = {
  classe: "Classe",
  ability: "Classe",
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
  action: "Padrão",
  padrao: "Padrão",
  move: "Movimento",
  movimento: "Movimento",
  full: "Completa",
  completa: "Completa",
  reaction: "Reação",
  reacao: "Reação",
  free: "Livre",
  livre: "Livre",
  special: "Especial",
  hour: "Especial",
};

function normalizarSubtipo(subtipo: string): string {
  const limpo = subtipo.trim();
  if (!limpo) return "";
  return limpo.charAt(0).toUpperCase() + limpo.slice(1);
}

export function converterItemFoundryParaPoder(item: FoundryItemRaw): ItemPoder {
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
  if (sys.subtipo) poderLimpo.subtipo = normalizarSubtipo(sys.subtipo);

  return poderLimpo;
}
