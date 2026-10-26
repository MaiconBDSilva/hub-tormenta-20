/**
 * Hub Tormenta 20 - Tipagens do Módulo de Personagens
 * Contratos de dados para o Firestore e regras de moderação
 */

// Campos que o jogador Dono pode atualizar imediatamente sem mediação do Mestre
export interface BlocoLivrePersonagem {
  pvAtual: number;
  pmAtual: number;
  avatarUrl: string;       // URL direta da imagem (Imgur, Discord, etc.)
  descricao: string;       // Lore, histórico e trejeitos visíveis para a mesa
  anotacoes: string;       // Anotações secretas (visíveis exclusivamente para Dono e Mestre)
}

// Campos protegidos que exigem validação e aprovação do Mestre para jogadores
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
}

export type StatusSolicitacao = "pendente" | "recusada";

// Estrutura do nó temporário de solicitação de edição
export interface SolicitacaoEdicaoPendente {
  status: StatusSolicitacao;
  solicitadoEm: string;    // Data ISO do momento do envio
  motivoRecusa?: string;   // Justificativa preenchida pelo Mestre caso recuse
  campos: Partial<BlocoProtegidoPersonagem>; // Armazena apenas o que sofreu alteração
}

// Modelo completo da ficha no Firestore (coleção: "personagens")
export interface PersonagemRPG extends BlocoLivrePersonagem, BlocoProtegidoPersonagem {
  id: string;
  donoUid: string | null;  // UID do usuário autenticado no Firebase Auth
  donoNome?: string;      // Cache do nome do jogador para listagens rápidas
  criadoEm: string;        // Data ISO de criação
  atualizadoEm: string;    // Data ISO da última modificação
  solicitacaoPendente?: SolicitacaoEdicaoPendente | null;
}

// Identificadores das 6 abas modulares da ficha imersiva
export type AbaFicha =
  | "principal"
  | "poderes"
  | "pericias"
  | "magias"
  | "equipamentos"
  | "notas";

// Identificadores das abas superiores de navegação do Painel do Mestre
export type AbaPainelMestre = "campanha" | "personagens" | "usuarios";