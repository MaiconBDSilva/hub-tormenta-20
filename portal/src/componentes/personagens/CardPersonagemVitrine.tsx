"use client";

import React from "react";
import Link from "next/link";
import { Shield, Sparkles, User } from "lucide-react";
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
    <Link
      href={`/personagens/${personagem.id}`}
      className={`${styles.cardVitrine} group ${ehDono ? styles.cardVitrineDono : ""}`}
    >
      {/* Listra no topo: Dourada para o Dono, padrão Tormenta para os demais */}
      <div className={ehDono ? "t20-stripe-gold" : "t20-stripe"} />

      {/* Badge Flutuante caso seja o personagem do jogador autenticado */}
      {ehDono && (
        <div className="absolute top-3 right-3 z-20">
          <span className="t20-badge-dono">
            <Sparkles className="w-3 h-3" />
            Seu Personagem
          </span>
        </div>
      )}

      {/* Área da Imagem / Avatar */}
      <div className={styles.avatarContainer}>
        {personagem.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={personagem.avatarUrl}
            alt={personagem.nome}
            className={styles.avatarImagem}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-stone-900 text-stone-600">
            <Shield className="w-12 h-12 stroke-[1.5] mb-1" />
            <span className="text-xs font-serif uppercase tracking-widest">Sem Imagem</span>
          </div>
        )}
        <div className={styles.avatarDegrade} />
      </div>

      {/* Conteúdo Informativo */}
      <div className={styles.cardConteudo}>
        <div>
          {/* Nome e Nível */}
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <h3 className="font-serif font-bold text-lg text-stone-100 group-hover:text-amber-400 transition-colors truncate">
              {personagem.nome}
            </h3>
            <span className="text-xs font-serif font-bold text-amber-500 shrink-0 uppercase tracking-wider">
              Nv. {personagem.nivel}
            </span>
          </div>

          {/* Raça e Classe */}
          <p className="text-xs text-stone-400 font-sans truncate mb-3">
            {personagem.raca} • {personagem.classe}
          </p>
        </div>

        {/* Rodapé: Barras Gráficas Contínuas de PV e PM */}
        <div className="space-y-2 pt-2 border-t border-stone-800/80">
          {/* Barra de PV (Vermelha) */}
          <div className="t20-track-pv">
            <div
              className="t20-bar-pv"
              style={{ width: `${pctPv}%` }}
              title={`Vida: ${pctPv}%`}
            />
          </div>

          {/* Barra de PM (Azul) */}
          <div className="t20-track-pm">
            <div
              className="t20-bar-pm"
              style={{ width: `${pctPm}%` }}
              title={`Mana: ${pctPm}%`}
            />
          </div>

          {/* Indicador de Dono e Ação */}
          <div className="pt-1 flex items-center justify-between text-[11px] text-stone-500">
            <span className="flex items-center gap-1 truncate">
              <User className="w-3 h-3 text-stone-500 shrink-0" />
              {personagem.donoNome ? personagem.donoNome : "Sem Jogador"}
            </span>
            <span className="text-[10px] uppercase font-serif tracking-wider text-stone-500 group-hover:text-amber-400 transition-colors">
              Ver Ficha →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}