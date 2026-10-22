"use client";

import React from "react";
import { Calendar, Scroll, Server, Dices, Save, Loader2 } from "lucide-react";
import { DadosCampanha, StatusSessao } from "@/tipos/campanha";
import styles from "./painel.module.css";

interface FormCampanhaProps {
  dados: DadosCampanha;
  salvando: boolean;
  onCampoProximaSessaoChange: (
    campo: keyof DadosCampanha["proximaSessao"],
    valor: string | number
  ) => void;
  onCampoUltimaSessaoChange: (
    campo: keyof DadosCampanha["ultimaSessao"],
    valor: string | number
  ) => void;
  onCampoServidorChange: (
    campo: keyof DadosCampanha["servidor"],
    valor: string
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function FormCampanha({
  dados,
  salvando,
  onCampoProximaSessaoChange,
  onCampoUltimaSessaoChange,
  onCampoServidorChange,
  onSubmit,
}: FormCampanhaProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {/* Bloco 1: Próxima Sessão */}
      <section className={styles.secaoCard}>
        <div className="t20-stripe" />

        <div className={styles.secaoTitulo}>
          <Calendar className="w-5 h-5 text-amber-400" />
          <h2>Próxima Sessão</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className={styles.formLabel}>Título da Sessão</label>
            <input
              type="text"
              required
              value={dados.proximaSessao.titulo}
              onChange={(e) =>
                onCampoProximaSessaoChange("titulo", e.target.value)
              }
              placeholder="Ex: Sessão 12: A Mina Inexplorada"
              className="t20-input"
            />
          </div>

          <div>
            <label className={styles.formLabel}>Data / Horário</label>
            <input
              type="text"
              required
              value={dados.proximaSessao.data}
              onChange={(e) =>
                onCampoProximaSessaoChange("data", e.target.value)
              }
              placeholder="Ex: Sábado, 20:00 ou A Definir"
              className="t20-input"
            />
          </div>

          <div>
            <label className={styles.formLabel}>Status da Sessão</label>
            <select
              value={dados.proximaSessao.status}
              onChange={(e) =>
                onCampoProximaSessaoChange(
                  "status",
                  e.target.value as StatusSessao
                )
              }
              className={styles.selectInput}
            >
              <option value="Confirmada" className="text-emerald-400 bg-stone-950">
                Confirmada
              </option>
              <option value="Em Votação" className="text-amber-400 bg-stone-950">
                Em Votação
              </option>
              <option value="Cancelada" className="text-red-500 bg-stone-950">
                Cancelada
              </option>
            </select>
          </div>

          <div>
            <label className={`${styles.formLabel} flex items-center gap-2`}>
              <Dices className="w-4 h-4 text-amber-500" />
              DT do Teste de Dado (Foundry)
            </label>
            <input
              type="number"
              min={1}
              max={30}
              required
              value={dados.proximaSessao.dtTesteFoundry}
              onChange={(e) =>
                onCampoProximaSessaoChange(
                  "dtTesteFoundry",
                  parseInt(e.target.value, 10) || 0
                )
              }
              className="t20-input"
            />
          </div>
        </div>
      </section>

      {/* Bloco 2: Última Sessão Concluída */}
      <section className={styles.secaoCard}>
        <div className="t20-stripe" />

        <div className={styles.secaoTitulo}>
          <Scroll className="w-5 h-5 text-amber-400" />
          <h2>Última Sessão Concluída</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <label className={styles.formLabel}>Número da Sessão</label>
            <input
              type="number"
              min={0}
              required
              value={dados.ultimaSessao.numero}
              onChange={(e) =>
                onCampoUltimaSessaoChange(
                  "numero",
                  parseInt(e.target.value, 10) || 0
                )
              }
              className="t20-input"
            />
          </div>

          <div className="md:col-span-2">
            <label className={styles.formLabel}>Título da Última Sessão</label>
            <input
              type="text"
              required
              value={dados.ultimaSessao.titulo}
              onChange={(e) =>
                onCampoUltimaSessaoChange("titulo", e.target.value)
              }
              placeholder="Ex: Teias de Sombras e Ouro"
              className="t20-input"
            />
          </div>

          <div className="md:col-span-3">
            <label className={styles.formLabel}>Resumo do Episódio</label>
            <textarea
              rows={3}
              required
              value={dados.ultimaSessao.resumo}
              onChange={(e) =>
                onCampoUltimaSessaoChange("resumo", e.target.value)
              }
              placeholder="Descreva brevemente os acontecimentos marcantes da sessão..."
              className={`${styles.selectInput} resize-none`}
            />
          </div>

          <div className="md:col-span-3">
            <label className={styles.formLabel}>Link da Nota na Wiki</label>
            <input
              type="text"
              required
              value={dados.ultimaSessao.linkWiki}
              onChange={(e) =>
                onCampoUltimaSessaoChange("linkWiki", e.target.value)
              }
              placeholder="Ex: /wiki/diário-de-campanha/arco-2/diário-11"
              className="t20-input"
            />
          </div>
        </div>
      </section>

      {/* Bloco 3: Servidor Foundry VTT */}
      <section className={styles.secaoCard}>
        <div className="t20-stripe" />

        <div className={styles.secaoTitulo}>
          <Server className="w-5 h-5 text-amber-400" />
          <h2>Servidor Foundry VTT</h2>
        </div>

        <div>
          <label className={styles.formLabel}>URL de Conexão</label>
          <input
            type="url"
            required
            value={dados.servidor.foundryUrl}
            onChange={(e) => onCampoServidorChange("foundryUrl", e.target.value)}
            placeholder="Ex: http://rpgtormenta.servegame.com:30000"
            className="t20-input"
          />
        </div>
      </section>

      {/* Botão de Gravação com estilo global unificado */}
      <div className="flex justify-end pt-4">
        <button type="submit" disabled={salvando} className="t20-btn-primary">
          {salvando ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Gravando nos Tomos...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Salvar Alterações
            </>
          )}
        </button>
      </div>
    </form>
  );
}