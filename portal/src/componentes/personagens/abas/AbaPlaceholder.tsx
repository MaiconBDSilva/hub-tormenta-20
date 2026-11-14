"use client";

import React from "react";
import { Sparkles, Scroll, Sword, Compass } from "lucide-react";
import { AbaFicha } from "@/tipos/personagem";
import styles from "../personagens.module.css";

interface AbaPlaceholderProps {
  aba: AbaFicha;
}

const configAbas: Record<
  string,
  { titulo: string; descricao: string; icone: React.ElementType }
> = {
  poderes: {
    titulo: "Grimório de Poderes & Habilidades",
    descricao: "Habilidades de raça, classe, poderes de combate e poderes da Tormenta serão catalogados aqui.",
    icone: Sparkles,
  },
  pericias: {
    titulo: "Perícias & Testes de Arton",
    descricao: "Tabela completa com treino, meio-nível e modificadores para testes ágeis durante as sessões.",
    icone: Compass,
  },
  magias: {
    titulo: "Grimório Místico de Magias",
    descricao: "Círculos de magia, custo em PM, tempo de execução e aprimoramentos arcanos e divinos.",
    icone: Scroll,
  },
  equipamentos: {
    titulo: "Inventário, Armas & Carga",
    descricao: "Gestão de itens empunhados, armaduras, tibares de ouro e controle dinâmico de sobrecarga.",
    icone: Sword,
  },
};

export function AbaPlaceholder({ aba }: AbaPlaceholderProps) {
  const info = configAbas[aba] || {
    titulo: "Módulo Artoniano",
    descricao: "Em desenvolvimento para os Tomos da Fase 2.",
    icone: Sparkles,
  };

  const Icone = info.icone;

  return (
    <div className={styles.placeholderBox}>
      <div className={styles.placeholderIcone}>
        <Icone className="w-6 h-6 stroke-[1.5]" />
      </div>

      <div className="max-w-md">
        <div className={styles.placeholderBadge}>
          Fase 2 da Campanha
        </div>
        <h3 className={styles.placeholderTitulo}>{info.titulo}</h3>
        <p className={styles.placeholderTexto}>{info.descricao}</p>
      </div>
    </div>
  );
}