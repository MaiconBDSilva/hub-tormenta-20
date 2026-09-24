"use client";

import React, { useState, useEffect } from "react";
import styles from "./MenuFixo.module.css";

export default function FoundryStatusButton() {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  const checarStatusFoundry = async () => {
    try {
      const res = await fetch("/api/foundry");
      const data = await res.json();
      setIsOnline(Boolean(data.online));
    } catch {
      setIsOnline(false);
    }
  };

  useEffect(() => {
    checarStatusFoundry();
    const intervalo = setInterval(checarStatusFoundry, 60000);
    return () => clearInterval(intervalo);
  }, []);

  const getDotStatusClass = () => {
    if (isOnline === null) return styles.statusDotChecking;
    return isOnline ? styles.statusDotOnline : styles.statusDotOffline;
  };

  return (
    <a
      href="#acessofoundry"
      title={isOnline ? "Foundry Online" : "Mesa Offline"}
      className={styles.btnFoundry}
    >
      <span className={`${styles.statusDot} ${getDotStatusClass()}`} />
      <span className={styles.btnFoundryText}>
        {isOnline === null
          ? "Checando..."
          : isOnline
            ? "Foundry Online"
            : "Mesa Offline"}
      </span>
    </a>
  );
}