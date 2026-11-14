"use client";

import React, { useState } from "react";
import { Check, X, AlertTriangle, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { AtributosT20, PersonagemRPG } from "@/tipos/personagem";
import { atualizarPersonagem } from "@/servicos/personagensService";
import styles from "./painel.module.css";

function formatarValorCampoModeracao(valor: unknown): string {
  if (valor === undefined || valor === null || valor === "") return "—";
  if (typeof valor === "object") {
    const attrs = valor as Partial<AtributosT20>;
    const mapa: Array<[keyof AtributosT20, string]> = [
      ["forca", "FOR"],
      ["destreza", "DES"],
      ["constituicao", "CON"],
      ["inteligencia", "INT"],
      ["sabedoria", "SAB"],
      ["carisma", "CAR"],
    ];
    const partes = mapa
      .filter(([k]) => attrs[k] !== undefined)
      .map(([k, sigla]) => `${sigla}: ${attrs[k]}`);
    if (partes.length > 0) return partes.join(", ");
    return JSON.stringify(valor);
  }
  return String(valor);
}

interface CardModeracaoEdicaoProps {
  personagem: PersonagemRPG;
  onAtualizacao: () => void;
}

export function CardModeracaoEdicao({
  personagem,
  onAtualizacao,
}: CardModeracaoEdicaoProps) {
  const [expandido, setExpandido] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [modoRecusa, setModoRecusa] = useState(false);
  const [motivoRecusa, setMotivoRecusa] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  const solicitacao = personagem.solicitacaoPendente;
  if (!solicitacao) return null;

  const camposAlterados = Object.keys(
    solicitacao.campos
  ) as (keyof typeof solicitacao.campos)[];

  // Aprovação: aplica os campos protegidos na ficha e remove o nó de solicitação
  const handleAprovar = async () => {
    setProcessando(true);
    setErro(null);

    try {
      const updates: Record<string, unknown> = {
        solicitacaoPendente: null,
        atualizadoEm: new Date().toISOString(),
      };

      camposAlterados.forEach((campo) => {
        updates[campo] = solicitacao.campos[campo];
      });

      await atualizarPersonagem(personagem.id, updates);
      onAtualizacao();
    } catch (err) {
      console.error("Erro ao aprovar ficha:", err);
      setErro("Falha ao aprovar as alterações no Firestore.");
    } finally {
      setProcessando(false);
    }
  };

  // Recusa: altera o status para 'recusada' e registra o motivo sem deletar os dados enviados
  const handleRecusar = async () => {
    setProcessando(true);
    setErro(null);

    try {
      await atualizarPersonagem(personagem.id, {
        "solicitacaoPendente.status": "recusada",
        "solicitacaoPendente.motivoRecusa": motivoRecusa.trim() || "Alteração não aprovada pelo Mestre.",
        atualizadoEm: new Date().toISOString(),
      });
      setModoRecusa(false);
      onAtualizacao();
    } catch (err) {
      console.error("Erro ao recusar ficha:", err);
      setErro("Falha ao registrar recusa.");
    } finally {
      setProcessando(false);
    }
  };

  const statusBadge =
    solicitacao.status === "pendente" ? (
      <span className="t20-badge t20-badge-amber">
        Aguardando Aprovação
      </span>
    ) : (
      <span className="t20-badge t20-badge-red">
        Recusada Anteriormente
      </span>
    );

  return (
    <div className={`${styles.moderacaoCard} t20-card`}>
      {/* Cabeçalho do Card */}
      <div className={styles.moderacaoHeader}>
        <div className="flex items-center gap-3">
          <div className={styles.moderacaoAvatar}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={personagem.avatarUrl}
              alt={personagem.nome}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-serif font-bold text-stone-200">
                {personagem.nome}
              </h4>
              {statusBadge}
            </div>
            <p className="text-xs text-stone-400">
              Jogador:{" "}
              <span className="text-stone-300 font-medium">
                {personagem.donoNome || "Sem Dono Vinculado"}
              </span>{" "}
              • Enviado em:{" "}
              {new Date(solicitacao.solicitadoEm).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpandido(!expandido)}
          aria-label={expandido ? "Recolher detalhes" : "Expandir detalhes"}
          className={styles.moderacaoToggleBtn}
        >
          {expandido ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>
      </div>

      {erro && (
        <div className="t20-alert-error my-2">
          {erro}
        </div>
      )}

      {expandido && (
        <div className="pt-3 space-y-3">
          {/* Motivo registrado se estiver em status de recusa */}
          {solicitacao.status === "recusada" && solicitacao.motivoRecusa && (
            <div className={styles.boxMotivoRecusa}>
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-serif text-red-200">
                  Motivo da recusa anterior:
                </strong>
                {solicitacao.motivoRecusa}
              </div>
            </div>
          )}

          {/* Tabela comparativa dos campos modificados */}
          <div className="overflow-x-auto">
            <table className={styles.tabelaModeracao}>
              <thead>
                <tr>
                  <th scope="col">Atributo</th>
                  <th scope="col">Valor Vigente</th>
                  <th scope="col" className="text-amber-400">Novo Valor Solicitado</th>
                </tr>
              </thead>
              <tbody>
                {camposAlterados.map((campo) => {
                  const valorAtual = personagem[campo as keyof PersonagemRPG];
                  const valorNovo = solicitacao.campos[campo];

                  return (
                    <tr key={campo}>
                      <td className="capitalize font-semibold text-stone-300">
                        {campo}
                      </td>
                      <td className="text-stone-400">
                        {formatarValorCampoModeracao(valorAtual)}
                      </td>
                      <td className="font-bold text-amber-400">
                        {formatarValorCampoModeracao(valorNovo)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Modo de preenchimento de justificativa de recusa */}
          {modoRecusa ? (
            <div className="pt-2 border-t border-stone-800 space-y-2">
              <label className="t20-field-label text-red-400">
                Motivo / Instrução para o Jogador:
              </label>
              <textarea
                rows={2}
                value={motivoRecusa}
                onChange={(e) => setMotivoRecusa(e.target.value)}
                placeholder="Ex: O aumento de nível só ocorre após o término do arco da Mina..."
                className="t20-input text-xs resize-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModoRecusa(false)}
                  disabled={processando}
                  className="t20-btn-ghost t20-btn-sm"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={handleRecusar}
                  disabled={processando}
                  className="t20-btn-danger"
                >
                  {processando ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <X className="w-3.5 h-3.5" />
                  )}
                  Confirmar Recusa
                </button>
              </div>
            </div>
          ) : (
            /* Botões de Ação de Moderação */
            <div className="t20-form-actions">
              <button
                type="button"
                onClick={() => setModoRecusa(true)}
                disabled={processando}
                className="t20-btn-cancel"
              >
                <X className="w-3.5 h-3.5" />
                Recusar com Justificativa
              </button>
              <button
                type="button"
                onClick={handleAprovar}
                disabled={processando}
                className="t20-btn-primary t20-btn-sm"
              >
                {processando ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                Aprovar Alterações
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}