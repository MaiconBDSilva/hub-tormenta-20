"use client";

import React, { useState } from "react";
import { Check, X, AlertTriangle, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PersonagemRPG } from "@/tipos/personagem";

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

      const refDoc = doc(db, "personagens", personagem.id);
      await updateDoc(refDoc, updates);
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
      const refDoc = doc(db, "personagens", personagem.id);
      await updateDoc(refDoc, {
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
      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
        Aguardando Aprovação
      </span>
    ) : (
      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30">
        Recusada Anteriormente
      </span>
    );

  return (
    <div className="t20-card p-4 border border-stone-800 bg-stone-900/60 mb-3">
      {/* Cabeçalho do Card */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-stone-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-950 border border-stone-800 shrink-0">
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
          onClick={() => setExpandido(!expandido)}
          className="text-stone-400 hover:text-stone-200 p-1 rounded"
        >
          {expandido ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>
      </div>

      {erro && (
        <div className="my-2 p-2 rounded bg-red-950/50 border border-red-800/80 text-red-300 text-xs">
          {erro}
        </div>
      )}

      {expandido && (
        <div className="pt-3 space-y-3">
          {/* Motivo registrado se estiver em status de recusa */}
          {solicitacao.status === "recusada" && solicitacao.motivoRecusa && (
            <div className="p-2.5 rounded bg-red-950/30 border border-red-900/40 text-xs text-red-300 flex items-start gap-2">
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
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-stone-400 border-b border-stone-800 font-serif uppercase tracking-wider">
                  <th className="py-1 px-2">Atributo</th>
                  <th className="py-1 px-2">Valor Vigente</th>
                  <th className="py-1 px-2 text-amber-400">Novo Valor Solicitado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60 font-sans">
                {camposAlterados.map((campo) => {
                  const valorAtual = personagem[campo as keyof PersonagemRPG];
                  const valorNovo = solicitacao.campos[campo];

                  return (
                    <tr key={campo} className="hover:bg-stone-950/40">
                      <td className="py-2 px-2 capitalize font-semibold text-stone-300">
                        {campo}
                      </td>
                      <td className="py-2 px-2 text-stone-400">
                        {String(valorAtual ?? "—")}
                      </td>
                      <td className="py-2 px-2 font-bold text-amber-400">
                        {String(valorNovo)}
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
              <label className="block text-xs font-serif font-bold text-red-400 uppercase tracking-wider">
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
                  onClick={() => setModoRecusa(false)}
                  disabled={processando}
                  className="t20-btn-ghost text-xs"
                >
                  Voltar
                </button>
                <button
                  onClick={handleRecusar}
                  disabled={processando}
                  className="px-3 py-1.5 rounded-lg text-xs font-serif font-bold bg-red-800/80 hover:bg-red-700 text-stone-100 transition-colors flex items-center gap-1"
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
            <div className="flex justify-end gap-2 pt-2 border-t border-stone-800">
              <button
                onClick={() => setModoRecusa(true)}
                disabled={processando}
                className="px-3 py-1.5 rounded-lg text-xs font-serif font-bold bg-stone-900 border border-stone-700 hover:border-red-500/50 hover:text-red-400 text-stone-300 transition-colors flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                Recusar com Justificativa
              </button>
              <button
                onClick={handleAprovar}
                disabled={processando}
                className="t20-btn-primary text-xs flex items-center gap-1"
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