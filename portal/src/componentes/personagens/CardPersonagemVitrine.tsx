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
          <h3 className={styles.tarotNome}>
            {personagem.nome}
          </h3>

          {/* Linhagem: Raça • Classe */}
          <p className={styles.tarotLinhagem}>
            {personagem.raca} • {personagem.classe}
          </p>

          {/* Devoção / Origem */}
          {personagem.divindade ? (
            <p className={styles.tarotDevocao}>
              Devoto de {personagem.divindade}
            </p>
          ) : (
            <p className={styles.tarotDevocao}>
              {personagem.origem || "Aventureiro de Arton"}
            </p>
          )}

          {/* Mini-Barras de Vitalidade Lapidadas */}
          <div className="space-y-1 w-full pt-1.5 border-t border-amber-500/20">
            {/* PV */}
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono font-bold text-red-400 w-4 shrink-0">PV</span>
              <div className={`${styles.tarotMiniBarraTrilha} flex-1`}>
                <div
                  className={styles.tarotMiniBarraPv}
                  style={{ width: `${pctPv}%` }}
                />
              </div>
            </div>

            {/* PM */}
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono font-bold text-sky-400 w-4 shrink-0">PM</span>
              <div className={`${styles.tarotMiniBarraTrilha} flex-1`}>
                <div
                  className={styles.tarotMiniBarraPm}
                  style={{ width: `${pctPm}%` }}
                />
              </div>
            </div>
          </div>

          {/* Jogador Responsável */}
          <div className={styles.tarotRodapeDono}>
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
        className={`${styles.btnVerFichaPlaca} mt-3.5 max-w-[15rem]`}
      >
        <span>Ver Ficha</span>
      </Link>
    </div>
  );
}