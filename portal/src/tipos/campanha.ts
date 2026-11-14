export type StatusSessao = "Confirmada" | "Em Votação" | "Cancelada";

export interface DadosCampanha {
  proximaSessao: {
    titulo: string;
    data: string;
    status: StatusSessao;
    dtTesteFoundry: number;
  };
  ultimaSessao: {
    numero: number;
    titulo: string;
    resumo: string;
    linkWiki: string;
  };
  servidor: {
    foundryUrl: string;
  };
}