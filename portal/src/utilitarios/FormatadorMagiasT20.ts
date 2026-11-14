import type {
  ItemMagiaPersonagem,
  EscolaMagiaT20,
  TipoMagiaT20,
  AprimoramentoMagia,
} from "@/tipos/personagem";
import { type FoundryItemRaw, sanitizarTextoFoundry } from "./SanitizadorFoundry.ts";

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
  hour: "1 hora",
  minute: "1 minuto",
};

// Mapeia códigos de alcance
export const MAPA_ALCANCE: Record<string, string> = {
  personal: "Pessoal",
  self: "Pessoal",
  touch: "Toque",
  short: "Curto (9m)",
  medium: "Médio (30m)",
  long: "Longo (90m)",
  km: "Quilômetros",
  any: "Qualquer",
  spec: "Especial",
  unlimited: "Ilimitado",
};

// Mapeia códigos de duração
export const MAPA_DURACAO: Record<string, string> = {
  inst: "Instantânea",
  sust: "Sustentada",
  scene: "Cena",
  turn: "1 rodada",
  round: "Rodadas",
  day: "1 dia",
  perm: "Permanente",
  special: "Especial",
};

// Converte um item do Foundry para a tipagem interna do nosso portal
export function converterItemFoundryParaMagia(item: FoundryItemRaw): ItemMagiaPersonagem {
  const sys = item.system || {};
  const ativacao = sys.ativacao || {};
  const duracao = sys.duracao || {};
  const resistencia = sys.resistencia || {};

  const aprimoramentos: AprimoramentoMagia[] = (item.effects || [])
    .filter((ef) => ef.name && ef.name.trim().length > 0)
    .map((ef, idx) => {
      const custo = ef.flags?.tormenta20?.custo || "";
      const prefixoCusto = custo ? `+${custo} PM` : "";
      return {
        id: ef._id || `apr_${idx}`,
        custoPm: prefixoCusto,
        descricao: (ef.name || "").trim(),
      };
    });

  const escolaSigla = (sys.escola || "").toLowerCase();
  const tipoSigla = (sys.tipo || "").toLowerCase();
  const execucaoSigla = (ativacao.execucao || "").toLowerCase();
  const alcanceSigla = (sys.alcance || "").toLowerCase();
  const duracaoSigla = (duracao.units || "").toLowerCase();

  const circuloNum = Number(sys.circulo) || 1;
  const custoNum = ativacao.custo ?? (circuloNum === 1 ? 1 : circuloNum * 3 - 3);

  let duracaoFormatada = MAPA_DURACAO[duracaoSigla] || duracao.units || "Instantânea";
  if (duracaoSigla === "round" && duracao.value) {
    const val = Number(duracao.value);
    duracaoFormatada = val === 1 ? "1 rodada" : `${val} rodadas`;
  }

  return {
    id: item._id || `magia_${Date.now()}`,
    origemId: item._id,
    nome: item.name || "Magia sem Nome",
    circulo: circuloNum,
    tipo: MAPA_TIPOS[tipoSigla] || "Arcana",
    escola: MAPA_ESCOLAS[escolaSigla] || "Evocação",
    execucao: MAPA_EXECUCAO[execucaoSigla] || ativacao.execucao || "Padrão",
    alcance: MAPA_ALCANCE[alcanceSigla] || sys.alcance || "Curto",
    alvoOuArea: sys.alvo || sys.area || sys.efeito || "",
    duracao: duracaoFormatada,
    resistencia: resistencia.txt || (resistencia.atributo ? `${resistencia.atributo.toUpperCase()}` : "Nenhuma"),
    custoPm: `${custoNum} PM`,
    descricao: sanitizarTextoFoundry(sys.description?.value || ""),
    aprimoramentos,
    ehCustomizada: false,
  };
}