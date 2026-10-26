import { Timestamp } from "firebase/firestore";

export type PapelUsuario = "jogador" | "mestre";

export interface PerfilUsuario {
  uid: string;
  nome: string;
  email: string;
  papel: PapelUsuario;
  fotoUrl?: string;
  personagemId?: string | null;
  criadoEm?: string;
  atualizadoEm?: string;
}

export type AbaFicha = "principal" | "poderes" | "pericias" | "magias" | "equipamentos" | "notas";

// Tipo utilizado no Painel do Mestre (/painel)
export type AbaPainelMestre = "campanha" | "personagens" | "usuarios";

export type AtributoChaveSigla = "FOR" | "DES" | "CON" | "INT" | "SAB" | "CAR";

export interface AtributosT20 {
  forca: number;
  destreza: number;
  constituicao: number;
  inteligencia: number;
  sabedoria: number;
  carisma: number;
}

export interface BlocoProtegidoPersonagem {
  nome: string;
  raca: string;
  classe: string;
  origem: string;
  nivel: number;
  divindade: string;
  pvMaximo: number;
  pmMaximo: number;
  defesa: number;
  atributos?: AtributosT20;
}

export interface ItemPericia {
  id: string;
  nome: string;
  atributoChave: AtributoChaveSigla;
  treinada: boolean;
  total: number;
  ehOficioPersonalizado?: boolean;
}

export type CategoriaPoder =
  | "Classe"
  | "Raça"
  | "Origem"
  | "Geral"
  | "Concedido"
  | "Tormenta";

export type TipoAcaoPoder =
  | "Passiva"
  | "Padrão"
  | "Movimento"
  | "Completa"
  | "Livre"
  | "Reação";

export interface ItemPoder {
  id: string;
  origemId?: string;
  nome: string;
  tipo: CategoriaPoder;
  subtipo?: string;
  tipoAcao: TipoAcaoPoder;
  custoPm: string;
  descricao: string;
  ehCustomizado?: boolean;
}

// ==========================================
// Módulo de Magias & Grimório de Tormenta 20
// ==========================================
export type EscolaMagiaT20 =
  | "Abjuração"
  | "Adivinhação"
  | "Convocação"
  | "Encantamento"
  | "Evocação"
  | "Ilusão"
  | "Necromancia"
  | "Transmutação";

export type TipoMagiaT20 = "Arcana" | "Divina" | "Universal";

export interface AprimoramentoMagia {
  id: string;
  custoPm: string;
  descricao: string;
}

export interface ItemMagiaPersonagem {
  id: string;
  origemId?: string;
  nome: string;
  circulo: number;
  tipo: TipoMagiaT20;
  escola: EscolaMagiaT20;
  execucao: string;
  alcance: string;
  alvoOuArea?: string;
  duracao: string;
  resistencia: string;
  custoPm: string;
  descricao: string;
  aprimoramentos?: AprimoramentoMagia[];
  ehCustomizada?: boolean;
}

// ==========================================
// Módulo de Equipamentos & Riquezas de Arton
// ==========================================
export type CategoriaEquipamento =
  | "Arma"
  | "Armadura"
  | "Escudo"
  | "Acessório"
  | "Consumível"
  | "Geral";

export interface MoedasT20 {
  tl: number; // Tibar de Platina (1 TL = 10 TO)
  to: number; // Tibar de Ouro (Moeda padrão T$ / TO)
  tp: number; // Tibar de Prata (10 TP = 1 TO)
  tc: number; // Tibar de Cobre (100 TC = 1 TO)
}

export interface ItemEquipamento {
  id: string;
  origemId?: string;
  nome: string;
  categoria: CategoriaEquipamento;
  subtipo?: string;
  quantidade: number;
  precoTexto?: string;
  equipado: boolean;
  descricao: string;
  ehCustomizado?: boolean;
}

export interface SolicitacaoPendentePersonagem {
  status: "pendente" | "recusada";
  solicitadoEm: string;
  motivoRecusa?: string;
  campos: Partial<BlocoProtegidoPersonagem>;
}

export interface BlocoLivrePersonagem {
  pvAtual: number;
  pmAtual: number;
  avatarUrl: string;
  descricao: string;
  anotacoes: string;
  pericias?: ItemPericia[];
  poderes?: ItemPoder[];
  magias?: ItemMagiaPersonagem[];
  equipamentos?: ItemEquipamento[];
  moedas?: MoedasT20;
}

export interface PersonagemRPG extends BlocoProtegidoPersonagem, BlocoLivrePersonagem {
  id: string;
  donoUid?: string;
  donoNome?: string;
  criadoEm?: string | Timestamp;
  atualizadoEm?: string | Timestamp;
  solicitacaoPendente?: SolicitacaoPendentePersonagem | null;
}