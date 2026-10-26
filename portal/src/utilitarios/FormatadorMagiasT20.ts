import {
  ItemMagiaPersonagem,
  EscolaMagiaT20,
  TipoMagiaT20,
  AprimoramentoMagia,
} from "@/tipos/personagem";

// Mapeia códigos de escola do Foundry T20
export const MAPA_ESCOLAS: Record<string, EscolaMagiaT20> = {
  abj: "Abjuração",
  adv: "Adivinhação",
  con: "Convocação",
  enc: "Encantamento",
  evo: "Evocação",
  ilu: "Ilusão",
  nec: "Necromancia",
  tra: "Transmutação",
};

// Mapeia códigos de tipo arcano/divino do Foundry
export const MAPA_TIPOS: Record<string, TipoMagiaT20> = {
  arc: "Arcana",
  div: "Divina",
  uni: "Universal",
};

// Mapeia códigos de execução
export const MAPA_EXECUCAO: Record<string, string> = {
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

// Mapeia códigos de alcance
export const MAPA_ALCANCE: Record<string, string> = {
  personal: "Pessoal",
  touch: "Toque",
  short: "Curto (9m)",
  medium: "Médio (30m)",
  long: "Longo (90m)",
  unlimited: "Ilimitado",
};

// Mapeia códigos de duração
export const MAPA_DURACAO: Record<string, string> = {
  inst: "Instantânea",
  sust: "Sustentada",
  scene: "Cena",
  turn: "1 rodada",
  day: "1 dia",
  perm: "Permanente",
};

// Remove tags HTML vindas do Foundry (<p>, </p>, etc.) e decodifica entidades
export function sanitizarTextoHtml(html: string): string {
  if (!html) return "";
  return html
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
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .trim();
}

// Converte um item do Foundry para a tipagem interna do nosso portal
export function converterItemFoundryParaMagia(item: any): ItemMagiaPersonagem {
  const sys = item.system || {};
  const ativacao = sys.ativacao || {};
  const duracao = sys.duracao || {};
  const resistencia = sys.resistencia || {};

  const aprimoramentos: AprimoramentoMagia[] = (item.effects || [])
    .filter((ef: any) => ef.name && ef.name.trim().length > 0)
    .map((ef: any, idx: number) => {
      const custo = ef.flags?.tormenta20?.custo || "";
      const prefixoCusto = custo ? `+${custo} PM` : "";
      return {
        id: ef._id || `apr_${idx}`,
        custoPm: prefixoCusto,
        descricao: ef.name.trim(),
      };
    });

  const escolaSigla = (sys.escola || "").toLowerCase();
  const tipoSigla = (sys.tipo || "").toLowerCase();
  const execucaoSigla = (ativacao.execucao || "").toLowerCase();
  const alcanceSigla = (sys.alcance || "").toLowerCase();
  const duracaoSigla = (duracao.units || "").toLowerCase();

  const custoNum = ativacao.custo ?? (sys.circulo === 1 ? 1 : sys.circulo * 3 - 3);

  return {
    id: item._id || `magia_${Date.now()}`,
    origemId: item._id,
    nome: item.name || "Magia sem Nome",
    circulo: Number(sys.circulo) || 1,
    tipo: MAPA_TIPOS[tipoSigla] || "Arcana",
    escola: MAPA_ESCOLAS[escolaSigla] || "Evocação",
    execucao: MAPA_EXECUCAO[execucaoSigla] || ativacao.execucao || "Padrão",
    alcance: MAPA_ALCANCE[alcanceSigla] || sys.alcance || "Curto",
    alvoOuArea: sys.alvo || sys.area || sys.efeito || "",
    duracao: MAPA_DURACAO[duracaoSigla] || duracao.units || "Instantânea",
    resistencia: resistencia.txt || (resistencia.atributo ? `${resistencia.atributo.toUpperCase()}` : "Nenhuma"),
    custoPm: `${custoNum} PM`,
    descricao: sanitizarTextoHtml(sys.description?.value || ""),
    aprimoramentos,
    ehCustomizada: false,
  };
}