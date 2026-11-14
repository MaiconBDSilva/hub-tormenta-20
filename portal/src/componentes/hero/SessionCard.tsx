import React from "react";
import styles from "./HeroSection.module.css";

export interface SessionCardProps {
  carregando?: boolean;
  tituloSessao?: string;
  dataProximaSessao?: string;
  statusDaSessao?: string;
  sessaoAnteriorNumero?: number;
  sessaoAnteriorTitulo?: string;
  sessaoAnteriorLink?: string;
}

export default function SessionCard({
  carregando = false,
  tituloSessao = "Carregando Sessão...",
  dataProximaSessao = "A Definir",
  statusDaSessao = "Em Votação",
  sessaoAnteriorNumero = 0,
  sessaoAnteriorTitulo = "Buscando anais da história...",
  sessaoAnteriorLink = "#",
}: SessionCardProps) {
  // Padronização da validação de status
  const statusFormatado = statusDaSessao.toLowerCase();
  const ehConfirmada = statusFormatado === "confirmada";
  const ehCancelada = statusFormatado === "cancelada";

  const getStatusClass = () => {
    if (ehConfirmada) return styles.statusConfirmed;
    if (ehCancelada) return styles.statusPending;
    return styles.statusVoting;
  };

  if (carregando) {
    return (
      <div className={styles.sessionCard}>
        <div className="t20-stripe" />

        {/* Esqueleto pulsante temático enquanto carrega do Firestore */}
        <div className={styles.skeletonStack}>
          <div className={styles.skeletonLineSm} />
          <div className={styles.skeletonLineLg} />
          <div className={styles.skeletonLineMd} />
          <div className={styles.skeletonFooter}>
            <div className={styles.skeletonPill} />
            <div className={styles.skeletonPill} />
          </div>
          <div className={styles.skeletonRow}>
            <div className={styles.skeletonLineSm} />
            <div className={styles.skeletonLineMd} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.sessionCard}>
      <div className="t20-stripe" />
      
      <div className={styles.sessionCardBadge}>
        <span className={styles.sessionCardBadgeDot} />
        Próxima Sessão
      </div>

      <h2 className={styles.sessionTitle}>
        {tituloSessao}
      </h2>

      <p className={styles.sessionDateText}>
        <span>📅 {dataProximaSessao}</span>
      </p>

      <div className={styles.sessionFooterRow}>
        <span>
          <strong className="text-stone-200">Tormenta 20:</strong> Arco 2
        </span>
        <span>
          Status:{" "}
          <strong className={getStatusClass()}>
            {statusDaSessao}
          </strong>
        </span>
      </div>

      <div className={styles.sessionFooterRow}>
        <span>
          <strong className="text-stone-200">Diário Anterior: </strong>
        </span>
        <span className="text-amber-400">
          <a href={sessaoAnteriorLink} className="hover:underline">
            <strong>Sessão {sessaoAnteriorNumero} - </strong> {sessaoAnteriorTitulo}
          </a>
        </span>
      </div>
    </div>
  );
}