"use client";

import React from "react";
import Image from "next/image";
import campaignData from "../../data/campanha.json";
import SessionCard from "./SessionCard";
import FoundryChallengeCard from "./FoundryChallengeCard";
import styles from "./HeroSection.module.css";

export interface HeroSectionProps {
  foundryUrl?: string;
  dataProximaSessao?: string;
  tituloSessao?: string;
  statusDaSessao?: string;
  sessaoAnteriorNumero?: number;
  sessaoAnteriorTitulo?: string;
  sessaoAnteriorResumo?: string;
  sessaoAnteriorLink?: string;
}

export function HeroSection({
  foundryUrl = campaignData.servidor.foundryUrl,
  dataProximaSessao = campaignData.proximaSessao.data,
  tituloSessao = campaignData.proximaSessao.titulo,
  statusDaSessao = campaignData.proximaSessao.status,
  sessaoAnteriorNumero = campaignData.ultimaSessao.numero,
  sessaoAnteriorTitulo = campaignData.ultimaSessao.titulo,
  sessaoAnteriorLink = campaignData.ultimaSessao.linkWiki,
}: HeroSectionProps) {
  const cdTeste = campaignData.proximaSessao.dtTesteFoundry;

  return (
    <section className={styles.heroSection}>
      {/* Luzes de Fundo em tons de Rubi e Dourado de Arton */}
      <div aria-hidden="true" className={styles.ambientGlowRuby} />
      <div aria-hidden="true" className={styles.ambientGlowAmber} />

      <div className={styles.heroContentStack}>
        {/* 1. Logo Principal da Campanha */}
        <div className={styles.mainLogoWrapper}>
          <Image
            src="/logo-rpg.png"
            alt="Invocação do Herói — Tormenta 20"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 42vw"
            className={styles.mainLogoImage}
          />
        </div>

        {/* 2. Informações da Próxima Sessão */}
        <SessionCard
          tituloSessao={tituloSessao}
          dataProximaSessao={dataProximaSessao}
          statusDaSessao={statusDaSessao}
          sessaoAnteriorNumero={sessaoAnteriorNumero}
          sessaoAnteriorTitulo={sessaoAnteriorTitulo}
          sessaoAnteriorLink={sessaoAnteriorLink}
        />

        {/* 3. Desafio Interativo com o D20 3D em Canvas */}
        <FoundryChallengeCard
          cd={cdTeste}
          foundryUrl={foundryUrl}
        />
      </div>
    </section>
  );
}

export default HeroSection;