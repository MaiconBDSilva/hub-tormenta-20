"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Edit3, Eye, Shield, Sparkles, User, AlertCircle, Clock } from "lucide-react";
import { PersonagemRPG } from "@/tipos/personagem";
import styles from "./personagens.module.css";

interface CabecalhoFichaProps {
  personagem: PersonagemRPG;
  ehDono: boolean;
  ehMestre: boolean;
  modoEdicao: boolean;
  onAlternarModoEdicao: () => void;
}

export function CabecalhoFicha({
  personagem,
  ehDono,
  ehMestre,
  modoEdicao,
  onAlternarModoEdicao,
}: CabecalhoFichaProps) {
  const podeEditar = ehDono || ehMestre;

  // Cálculo percentual seguro para as barras de progresso
  const pvTotal = Math.max(1, personagem.pvMaximo || 1);
  const pvAtual = Math.max(0, personagem.pvAtual ?? pvTotal);
  const pctPv = Math.min(100, Math.max(0, Math.round((pvAtual / pvTotal) * 100)));

  const pmTotal = Math.max(1, personagem.pmMaximo || 1);
  const pmAtual = Math.max(0, personagem.pmAtual ?? pmTotal);
  const pctPm = Math.min(100, Math.max(0, Math.round((pmAtual / pmTotal) * 100)));

  const solicitacao = personagem.solicitacaoPendente;

  return (
    <div className="space-y-4">
      {/* Botão de retorno à Vitrine */}
      <div className="flex items-center justify-between">
        <Link href="/personagens" className="t20-btn-ghost text-xs flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          Voltar para a Vitrine
        </Link>

        {podeEditar && (
          <button
            onClick={onAlternarModoEdicao}
            className={`text-xs px-3.5 py-1.5 rounded-lg font-serif font-bold flex items-center gap-2 transition-all ${
              modoEdicao
                ? "bg-amber-500 text-stone-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                : "t20-btn-ghost text-amber-400 border-amber-500/40 hover:bg-stone-800"
            }`}
          >
            {modoEdicao ? (
              <>
                <Eye className="w-4 h-4" />
                Modo Leitura
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4" />
                Editar Ficha
              </>
            )}
          </button>
        )}
      </div>

      {/* Banner Informativo de Moderação (Pendente ou Recusado) */}
      {solicitacao && (
        <>
          {solicitacao.status === "pendente" && (
            <div className={`${styles.bannerStatusAprovacao} ${styles.bannerPendente}`}>
              <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-serif text-amber-300">
                  Alterações sob Moderação do Mestre
                </strong>
                <p className="text-xs text-stone-300 mt-0.5">
                  Você enviou alterações em atributos protegidos em{" "}
                  {new Date(solicitacao.solicitadoEm).toLocaleDateString("pt-BR")}. O Mestre revisará em breve.
                </p>
              </div>
            </div>
          )}

          {solicitacao.status === "recusada" && (
            <div className={`${styles.bannerStatusAprovacao} ${styles.bannerRecusado}`}>
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-serif text-red-200">
                  Pedido Anterior Recusado pelo Mestre
                </strong>
                <p className="text-xs text-red-300 mt-0.5">
                  Motivo: &quot;{solicitacao.motivoRecusa || "Ajuste os valores e envie novamente."}&quot;
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Caixa do Cabeçalho Principal */}
      <div className={styles.fichaCabecalho}>
        <div className={ehDono ? "t20-stripe-gold" : "t20-stripe"} />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Avatar com moldura */}
          <div className={styles.fichaAvatarBox}>
            {personagem.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={personagem.avatarUrl}
                alt={personagem.nome}
                className={styles.avatarImagem}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-stone-600">
                <Shield className="w-8 h-8 stroke-[1.5]" />
              </div>
            )}
          </div>

          {/* Dados Resumidos */}
          <div className="flex-1 min-w-0 w-full">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-serif font-bold text-2xl sm:text-3xl text-stone-100 truncate">
                  {personagem.nome}
                </h1>
                {ehDono && (
                  <span className="t20-badge-dono">
                    <Sparkles className="w-3 h-3" />
                    Seu Herói
                  </span>
                )}
              </div>

              <span className="font-serif font-bold text-base text-amber-500 uppercase tracking-wider">
                Nível {personagem.nivel}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-stone-400 font-sans mb-3">
              {personagem.raca} • {personagem.classe} • {personagem.origem} • Devoto de {personagem.divindade}
            </p>

            {/* Barras de PV e PM com valores numéricos no cabeçalho */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-800">
              <div>
                <div className="flex justify-between text-[11px] font-serif font-bold mb-1">
                  <span className="text-red-400">Pontos de Vida (PV)</span>
                  <span className="text-stone-300">
                    {personagem.pvAtual} / {personagem.pvMaximo}
                  </span>
                </div>
                <div className="t20-track-pv">
                  <div className="t20-bar-pv" style={{ width: `${pctPv}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-serif font-bold mb-1">
                  <span className="text-cyan-400">Pontos de Mana (PM)</span>
                  <span className="text-stone-300">
                    {personagem.pmAtual} / {personagem.pmMaximo}
                  </span>
                </div>
                <div className="t20-track-pm">
                  <div className="t20-bar-pm" style={{ width: `${pctPm}%` }} />
                </div>
              </div>
            </div>

            {/* Dono / Jogador */}
            <div className="mt-3 flex items-center justify-between text-xs text-stone-500">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                Jogador: {personagem.donoNome || "Sem Jogador Vinculado"}
              </span>
              <span className="font-serif text-amber-400/90 font-semibold">
                Defesa: {personagem.defesa}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}