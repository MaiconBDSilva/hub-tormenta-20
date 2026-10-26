"use client";

import React from "react";
import Link from "next/link";
import { Shield, Sparkles, User, ChevronRight } from "lucide-react";
import { PersonagemRPG } from "@/tipos/personagem";
import styles from "./personagens.module.css";

interface CardPersonagemVitrineProps {
  personagem: PersonagemRPG;
  ehDono: boolean;
}

export function CardPersonagemVitrine({
  personagem,
  ehDono,
}: CardPersonagemVitrineProps) {
  // Cálculo percentual seguro para as barras de progresso (0% a 100%)
  const pvTotal = Math.max(1, personagem.pvMaximo || 1);
  const pvAtual = Math.max(0, personagem.pvAtual ?? pvTotal);
  const pctPv = Math.min(100, Math.max(0, Math.round((pvAtual / pvTotal) * 100)));

  const pmTotal = Math.max(1, personagem.pmMaximo || 1);
  const pmAtual = Math.max(0, personagem.pmAtual ?? pmTotal);
  const pctPm = Math.min(100, Math.max(0, Math.round((pmAtual / pmTotal) * 100)));

  return (
    <div className="flex flex-col items-center">
      <Link
        href={`/personagens/${personagem.id}`}
        className={`${styles.tarotCard} group ${ehDono ? styles.tarotCardDono : ""}`}
      >
        {/* Cantoneiras Metálicas nos 4 Cantos da Carta */}
        <span className={styles.tarotCornerTL} />
        <span className={styles.tarotCornerTR} />
        <span className={styles.tarotCornerBL} />
        <span className={styles.tarotCornerBR} />

        {/* Borda Interna Fina de Ouro Envelhecido */}
        <div className={styles.tarotBordaInterna} />

        {/* Selo / Insígnia de "Seu Personagem" (Topo Esquerdo) */}
        {ehDono && (
          <div className="absolute top-2.5 left-2.5 z-30 animate-pulse">
            <span className={styles.badgeTarotDono}>
              <Sparkles className="w-2.5 h-2.5 text-amber-200" />
              <span>VOCÊ</span>
            </span>
          </div>
        )}

        {/* Selo de Nível Estilo Brasão de Metal (Topo Direito) */}
        <div className={styles.seloNivelTarot}>
          <span className="text-[9px] uppercase font-serif font-black tracking-widest text-amber-300/80 block leading-tight">
            Nv.
          </span>
          <span className="text-sm font-serif font-black text-amber-200 leading-none">
            {personagem.nivel}
          </span>
        </div>

        {/* Imagem de Fundo (Preenchimento Vertical Completo) */}
        <div className={styles.tarotImagemContainer}>
          {personagem.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={personagem.avatarUrl}
              alt={personagem.nome}
              className={styles.tarotImagem}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-stone-950 text-stone-700">
              <Shield className="w-16 h-16 stroke-[1.2] mb-2" />
              <span className="text-[10px] font-serif uppercase tracking-widest text-stone-500">
                Sem Retrato
              </span>
            </div>
          )}

          {/* Vinheta Escura e Degradê da Base para Leitura */}
          <div className={styles.tarotDegradeBase} />
        </div>

        {/* Placa Ornamental Inferior com Nome e Linhagem */}
        <div className={styles.tarotPlacaInfo}>
          {/* Nome do Campeão */}
          <h3 className="font-serif font-black text-lg text-amber-100 group-hover:text-amber-300 transition-colors tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] truncate text-center">
            {personagem.nome}
          </h3>

          {/* Linhagem: Raça • Classe */}
          <p className="text-[11px] font-serif uppercase tracking-wider text-amber-200/80 text-center truncate mb-1">
            {personagem.raca} • {personagem.classe}
          </p>

          {/* Devoção / Origem */}
          {personagem.divindade ? (
            <p className="text-[10px] font-serif italic text-stone-400 text-center truncate mb-2.5">
              Devoto de {personagem.divindade}
            </p>
          ) : (
            <p className="text-[10px] font-serif italic text-stone-500 text-center truncate mb-2.5">
              {personagem.origem || "Aventureiro de Arton"}
            </p>
          )}

          {/* Mini-Barras de Vitalidade Lapidadas */}
          <div className="space-y-1 w-full pt-1.5 border-t border-amber-500/20">
            {/* PV */}
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono font-bold text-red-400 w-4 shrink-0">PV</span>
              <div className="h-1.5 flex-1 rounded-full bg-stone-950/80 border border-stone-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-linear-to-r from-red-700 to-red-500 transition-all duration-300"
                  style={{ width: `${pctPv}%` }}
                />
              </div>
            </div>

            {/* PM */}
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono font-bold text-sky-400 w-4 shrink-0">PM</span>
              <div className="h-1.5 flex-1 rounded-full bg-stone-950/80 border border-stone-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-linear-to-r from-sky-700 to-sky-400 transition-all duration-300"
                  style={{ width: `${pctPm}%` }}
                />
              </div>
            </div>
          </div>

          {/* Jogador Responsável */}
          <div className="mt-2 pt-1.5 border-t border-stone-800/60 flex items-center justify-between text-[10px] text-stone-400 w-full">
            <span className="flex items-center gap-1 truncate max-w-[90%]">
              <User className="w-3 h-3 text-amber-500/80 shrink-0" />
              <span className="truncate">{personagem.donoNome || "Sem Jogador"}</span>
            </span>
            <ChevronRight className="w-3 h-3 text-amber-400/80 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </Link>

      {/* Botão Placa de Metal "Ver Ficha" Externo ao Card */}
      <Link
        href={`/personagens/${personagem.id}`}
        className="mt-3.5 px-4 py-1.5 rounded-lg border border-amber-600/40 bg-linear-to-b from-stone-900 to-stone-950 text-amber-300 hover:text-amber-200 font-serif font-bold text-xs uppercase tracking-widest shadow-md transition-all hover:border-amber-400 hover:scale-105 hover:shadow-[0_0_12px_rgba(245,158,11,0.25)] flex items-center gap-1"
      >
        <span>Ver Ficha</span>
      </Link>
    </div>
  );
}