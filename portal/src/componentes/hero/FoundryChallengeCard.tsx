"use client";

import React, { useState } from "react";
import D203DCanvas from "./D203DCanvas";
import styles from "./HeroSection.module.css";

export interface FoundryChallengeCardProps {
  cd: number;
  foundryUrl?: string;
}

export default function FoundryChallengeCard({
  cd,
  foundryUrl = "http://rpgtormenta.servegame.com:30000",
}: FoundryChallengeCardProps) {
  const [d20Value, setD20Value] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [statusRoll, setStatusRoll] = useState<"idle" | "success" | "fail">("idle");

  const handleStartRoll = () => {
    if (isRolling) return;
    setIsRolling(true);
    setStatusRoll("idle");
    setD20Value(null);
  };

  const handleRollComplete = (finalValue: number) => {
    setD20Value(finalValue);
    setIsRolling(false);

    if (finalValue >= cd) {
      setStatusRoll("success");
    } else {
      setStatusRoll("fail");
    }
  };

  return (
    <div id="acessofoundry" className={styles.challengeCard}>
      <div className="text-center">
        <h3 className={styles.challengeTitle}>
          🛡️ O JOGO É PARA QUEM TEM SORTE 🛡️
        </h3>
        <p className={styles.challengeDescription}>
          <strong className="text-amber-400">CD {cd}</strong> para o guardião liberar a passagem para o Foundry VTT!
        </p>
      </div>

      {/* D20 3D Renderizado em Canvas com Interação */}
      <div onClick={handleStartRoll} className={styles.canvasWrapper}>
        <D203DCanvas
          isRolling={isRolling}
          targetValue={null}
          onRollComplete={handleRollComplete}
        />
      </div>

      {/* Mensagens de Feedback */}
      {statusRoll === "idle" && !isRolling && d20Value === null && (
        <p className={styles.feedbackIdle}>
          Clique no d20 para rolar! 🎲
        </p>
      )}

      {isRolling && (
        <p className={styles.feedbackRolling}>
          🎲 Rolando d20 no grid de Arton...
        </p>
      )}

      {statusRoll === "success" && (
        <div className={styles.feedbackSuccessWrapper}>
          <p className={styles.feedbackSuccessTitle}>
            ⚔️ SUCESSO! Você tirou {d20Value === 20 ? "20 (DECISIVO!)" : d20Value}!
          </p>
          <p className={styles.feedbackSuccessSubtitle}>
            O guardião liberou a passagem! Entrando no Foundry VTT...
          </p>
          <a
            href={foundryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.enterFoundryButton}
          >
            <span>🔥 Entrar na Mesa</span>
          </a>
        </div>
      )}

      {statusRoll === "fail" && (
        <div className={styles.feedbackFailWrapper}>
          <p className={styles.feedbackFailTitle}>
            💀 FALHA NO TESTE! Você tirou {d20Value === 1 ? "1! Que Piada 🤣" : d20Value}.
          </p>
          <p className={styles.feedbackFailSubtitle}>
            O guardião bloqueou sua entrada. Gaste seu azar antes do jogo!
          </p>
        </div>
      )}
    </div>
  );
}