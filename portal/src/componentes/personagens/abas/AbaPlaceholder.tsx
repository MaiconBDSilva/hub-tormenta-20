"use client";

import React from "react";
import { Sparkles, Scroll, Sword, Compass } from "lucide-react";
import { AbaFicha } from "@/tipos/personagem";

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
    <div className="p-12 text-center rounded-xl bg-stone-900/40 border border-dashed border-stone-800 flex flex-col items-center justify-center space-y-3">
      <div className="w-12 h-12 rounded-full bg-stone-950 border border-stone-800 flex items-center justify-center text-amber-500">
        <Icone className="w-6 h-6 stroke-[1.5]" />
      </div>

      <div className="max-w-md">
        <div className="inline-block px-2 py-0.5 mb-2 rounded text-[10px] font-serif font-bold tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
          Fase 2 da Campanha
        </div>
        <h3 className="font-serif font-bold text-stone-200 text-base">{info.titulo}</h3>
        <p className="text-xs text-stone-400 mt-1 leading-relaxed">{info.descricao}</p>
      </div>
    </div>
  );
}