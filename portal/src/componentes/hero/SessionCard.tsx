import React from "react";
import styles from "./HeroSection.module.css";

export interface SessionCardProps {
  tituloSessao: string;
  dataProximaSessao: string;
  statusDaSessao: string;
  sessaoAnteriorNumero: number;
  sessaoAnteriorTitulo: string;
  sessaoAnteriorLink: string;
}

export default function SessionCard({
  tituloSessao,
  dataProximaSessao,
  statusDaSessao,
  sessaoAnteriorNumero,
  sessaoAnteriorTitulo,
  sessaoAnteriorLink,
}: SessionCardProps) {
  return (
    <div className={styles.sessionCard}>
      <div className={styles.sessionCardHeaderStripe} />
      
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
          <strong className={statusDaSessao === "Confirmada" ? styles.statusConfirmed : styles.statusPending}>
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