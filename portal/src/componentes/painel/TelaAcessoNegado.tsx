"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import styles from "./painel.module.css";

export function TelaAcessoNegado() {
  return (
    <main className={styles.acessoNegadoMain}>
      {/* Halos de iluminação do Design System */}
      <div aria-hidden="true" className="t20-glow-ruby" />
      <div aria-hidden="true" className="t20-glow-amber" />

      <div className={styles.acessoNegadoCard}>
        {/* Faixa decorativa tricolor no topo */}
        <div className="t20-stripe" />

        <div className={styles.iconeEscudoWrapper}>
          <ShieldAlert className="w-8 h-8 drop-shadow-[0_0_12px_rgba(220,38,38,0.5)]" />
        </div>

        <h1 className="text-2xl font-bold font-serif tracking-wide text-stone-100 mb-2">
          Acesso Restrito
        </h1>

        <p className="text-sm text-stone-400 leading-relaxed mb-8">
          Esta câmara é de uso exclusivo do{" "}
          <span className="text-red-400 font-semibold">Mestre da Campanha</span>.
          Forasteiros e aventureiros comuns não possuem autorização para alterar os tomos de Arton.
        </p>

        {/* Botão de retorno centralizado com estilo global t20-btn-ghost */}
        <Link href="/" className="t20-btn-ghost">
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          Retornar à Taverna
        </Link>
      </div>
    </main>
  );
}