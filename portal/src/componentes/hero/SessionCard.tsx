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
    return "text-amber-400 font-bold"; // Em votação / Padrão
  };

  if (carregando) {
    return (
      <div className={styles.sessionCard}>
        <div className={styles.sessionCardHeaderStripe} />
        
        {/* Esqueleto pulsante temático enquanto carrega do Firestore */}
        <div className="flex flex-col items-center animate-pulse space-y-4 py-2">
          <div className="h-4 w-28 bg-stone-800 rounded" />
          <div className="h-7 w-3/4 bg-stone-800 rounded" />
          <div className="h-4 w-40 bg-stone-800 rounded" />
          <div className="w-full pt-4 border-t border-stone-800/80 flex justify-between">
            <div className="h-4 w-24 bg-stone-800 rounded" />
            <div className="h-4 w-24 bg-stone-800 rounded" />
          </div>
          <div className="w-full flex justify-between">
            <div className="h-4 w-28 bg-stone-800 rounded" />
            <div className="h-4 w-36 bg-stone-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

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