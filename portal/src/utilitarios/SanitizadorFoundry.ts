export interface FoundryEffectRaw {
  _id?: string;
  name?: string;
  flags?: {
    tormenta20?: {
      custo?: string | number;
    };
  };
}

export interface FoundryRollRaw {
  type?: string;
  parts?: Array<[string?, string?]>;
}

export interface FoundrySystemRaw {
  tipo?: string;
  subtipo?: string;
  escola?: string;
  circulo?: number | string;
  alvo?: string;
  area?: string;
  efeito?: string;
  alcance?: string;
  empunhadura?: string;
  criticoM?: number | string;
  criticoX?: number | string;
  preco?: number | string | null;
  qtd?: number | string;
  equipado?: boolean;
  espacos?: number | string | null;
  rolls?: FoundryRollRaw[];
  armadura?: {
    value?: number | string | null;
    penalidade?: number | string | null;
  };
  ativacao?: {
    execucao?: string;
    custo?: number | string | null;
  };
  duracao?: {
    units?: string;
    value?: number | string | null;
  };
  resistencia?: {
    txt?: string;
    atributo?: string;
  };
  description?: {
    value?: string;
  };
}

export interface FoundryItemRaw {
  _id?: string;
  name?: string;
  type?: string;
  system?: FoundrySystemRaw;
  effects?: FoundryEffectRaw[];
}

export interface FoundryCompendioRaw {
  items?: FoundryItemRaw[];
}

const ENTIDADES_HTML: Record<string, string> = {
  aacute: "á",
  Aacute: "Á",
  agrave: "à",
  Agrave: "À",
  acirc: "â",
  Acirc: "Â",
  atilde: "ã",
  Atilde: "Ã",
  auml: "ä",
  Auml: "Ä",
  eacute: "é",
  Eacute: "É",
  egrave: "è",
  Egrave: "È",
  ecirc: "ê",
  Ecirc: "Ê",
  iacute: "í",
  Iacute: "Í",
  icirc: "î",
  Icirc: "Î",
  oacute: "ó",
  Oacute: "Ó",
  ocirc: "ô",
  Ocirc: "Ô",
  otilde: "õ",
  Otilde: "Õ",
  uacute: "ú",
  Uacute: "Ú",
  uuml: "ü",
  Uuml: "Ü",
  ccedil: "ç",
  Ccedil: "Ç",
  ntilde: "ñ",
  Ntilde: "Ñ",
  ndash: "–",
  mdash: "—",
  ldquo: '"',
  rdquo: '"',
  lsquo: "'",
  rsquo: "'",
  bull: "•",
  deg: "°",
  ordm: "º",
  ordf: "ª",
  minus: "−",
  times: "×",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
  amp: "&",
};

/**
 * Remove marcações HTML, referências (@UUID, @Compendium) e rolagens inline
 * vindas de compêndios do Foundry VTT, decodificando entidades HTML.
 */
export function sanitizarTextoFoundry(html: string): string {
  if (!html) return "";

  const textoLimpo = html
    .replace(/@UUID\[[^\]]+\]\{([^}]+)\}/gi, "$1")
    .replace(/@Compendium\[[^\]]+\]\{([^}]+)\}/gi, "$1")
    .replace(/\[\[(?:\/r\s*)?([^\]]+)\]\]/gi, "$1")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/gi, "");

  return textoLimpo
    .replace(/&([a-zA-Z]+);/g, (match, entidade) => ENTIDADES_HTML[entidade] ?? match)
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

