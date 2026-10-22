"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DadosCampanha } from "@/tipos/campanha";
import SessionCard from "./SessionCard";
import FoundryChallengeCard from "./FoundryChallengeCard";
import styles from "./HeroSection.module.css";

export function HeroSection() {
  const [dados, setDados] = useState<DadosCampanha | null>(null);
  const [carregando, setCarregando] = useState<boolean>(true);

  useEffect(() => {
    async function carregarDadosFirestore() {
      try {
        const docRef = doc(db, "configuracoes", "campanha");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setDados(docSnap.data() as DadosCampanha);
        }
      } catch (erro) {
        console.error("Erro ao recuperar os registros da campanha:", erro);
      } finally {
        setCarregando(false);
      }
    }

    carregarDadosFirestore();
  }, []);

  return (
    <section className={styles.heroSection}>
      {/* Halos de iluminação temática Tormenta 20 */}
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

        {/* 2. Informações da Próxima Sessão (com estado de carregamento integrado) */}
        <SessionCard
          carregando={carregando}
          tituloSessao={dados?.proximaSessao?.titulo}
          dataProximaSessao={dados?.proximaSessao?.data}
          statusDaSessao={dados?.proximaSessao?.status}
          sessaoAnteriorNumero={dados?.ultimaSessao?.numero}
          sessaoAnteriorTitulo={dados?.ultimaSessao?.titulo}
          sessaoAnteriorLink={dados?.ultimaSessao?.linkWiki}
        />

        {/* 3. Desafio Interativo com o D20 Canvas */}
        <FoundryChallengeCard
          cd={dados?.proximaSessao?.dtTesteFoundry ?? 13}
          foundryUrl={dados?.servidor?.foundryUrl ?? ""}
        />
      </div>
    </section>
  );
}

export default HeroSection;