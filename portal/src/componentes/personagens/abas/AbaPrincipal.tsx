"use client";

import React, { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PersonagemRPG, BlocoProtegidoPersonagem } from "@/tipos/personagem";
import { Save, Loader2, CheckCircle2, AlertCircle, Lock, Unlock } from "lucide-react";
import styles from "../personagens.module.css";

interface AbaPrincipalProps {
  personagem: PersonagemRPG;
  ehDono: boolean;
  ehMestre: boolean;
  modoEdicao: boolean;
  onAtualizacao: () => void;
}

export function AbaPrincipal({
  personagem,
  ehDono,
  ehMestre,
  modoEdicao,
  onAtualizacao,
}: AbaPrincipalProps) {
  // Estado local com os valores da ficha para edição
  const [form, setForm] = useState({
    nome: personagem.nome,
    raca: personagem.raca,
    classe: personagem.classe,
    origem: personagem.origem,
    nivel: personagem.nivel,
    divindade: personagem.divindade,
    defesa: personagem.defesa,
    pvMaximo: personagem.pvMaximo,
    pmMaximo: personagem.pmMaximo,
    pvAtual: personagem.pvAtual,
    pmAtual: personagem.pmAtual,
    avatarUrl: personagem.avatarUrl,
    descricao: personagem.descricao,
  });

  const [salvando, setSalvando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const handleChange = (campo: string, valor: string | number) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setMensagemSucesso(null);
    setErro(null);

    try {
      const agoraIso = new Date().toISOString();
      const updates: Record<string, unknown> = {
        atualizadoEm: agoraIso,
      };

      // 1. Campos Livres: sempre gravados imediatamente
      updates.pvAtual = Number(form.pvAtual);
      updates.pmAtual = Number(form.pmAtual);
      updates.avatarUrl = form.avatarUrl.trim();
      updates.descricao = form.descricao.trim();

      // 2. Análise de Campos Protegidos
      const camposProtegidosModificados: Partial<BlocoProtegidoPersonagem> = {};

      if (form.nome !== personagem.nome) camposProtegidosModificados.nome = form.nome.trim();
      if (form.raca !== personagem.raca) camposProtegidosModificados.raca = form.raca.trim();
      if (form.classe !== personagem.classe) camposProtegidosModificados.classe = form.classe.trim();
      if (form.origem !== personagem.origem) camposProtegidosModificados.origem = form.origem.trim();
      if (Number(form.nivel) !== personagem.nivel) camposProtegidosModificados.nivel = Number(form.nivel);
      if (form.divindade !== personagem.divindade) camposProtegidosModificados.divindade = form.divindade.trim();
      if (Number(form.defesa) !== personagem.defesa) camposProtegidosModificados.defesa = Number(form.defesa);
      if (Number(form.pvMaximo) !== personagem.pvMaximo) camposProtegidosModificados.pvMaximo = Number(form.pvMaximo);
      if (Number(form.pmMaximo) !== personagem.pmMaximo) camposProtegidosModificados.pmMaximo = Number(form.pmMaximo);

      const temAlteracaoProtegida = Object.keys(camposProtegidosModificados).length > 0;

      if (ehMestre) {
        // Mestre grava tudo imediatamente direto no documento
        Object.assign(updates, camposProtegidosModificados);
        // Se tinha solicitação pendente do jogador e o mestre editou, pode limpar
        updates.solicitacaoPendente = null;
      } else if (temAlteracaoProtegida) {
        // Jogador Dono: gera/substitui a solicitação pendente
        updates.solicitacaoPendente = {
          status: "pendente",
          solicitadoEm: agoraIso,
          campos: camposProtegidosModificados,
        };
      }

      const refDoc = doc(db, "personagens", personagem.id);
      await updateDoc(refDoc, updates);

      if (temAlteracaoProtegida && !ehMestre) {
        setMensagemSucesso("Campos livres salvos! Alterações protegidas foram enviadas para moderação do Mestre.");
      } else {
        setMensagemSucesso("Ficha salva com sucesso nos Tomos!");
      }

      onAtualizacao();
    } catch (err) {
      console.error("Erro ao salvar ficha:", err);
      setErro("Falha ao gravar alterações no Firestore.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <form onSubmit={handleSalvar} className="space-y-6">
      {mensagemSucesso && (
        <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{mensagemSucesso}</span>
        </div>
      )}

      {erro && (
        <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{erro}</span>
        </div>
      )}

      {/* Grid de Atributos Protegidos */}
      <div className="space-y-2">
        <div className="flex items-center justify-between pb-1 border-b border-stone-800">
          <span className="font-serif text-xs font-bold text-stone-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5 text-amber-500" />
            Atributos Protegidos (Requer Moderação para Jogadores)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {/* Nome */}
          <div className={`${styles.caixaAtributo} col-span-2`}>
            <span className={`${styles.labelCampo} ${styles.labelCampoProtegido}`}>Nome</span>
            {modoEdicao ? (
              <input
                type="text"
                required
                value={form.nome}
                onChange={(e) => handleChange("nome", e.target.value)}
                className="t20-input text-xs py-1"
              />
            ) : (
              <span className={styles.valorCampo}>{personagem.nome}</span>
            )}
          </div>

          {/* Raça */}
          <div className={styles.caixaAtributo}>
            <span className={`${styles.labelCampo} ${styles.labelCampoProtegido}`}>Raça</span>
            {modoEdicao ? (
              <input
                type="text"
                required
                value={form.raca}
                onChange={(e) => handleChange("raca", e.target.value)}
                className="t20-input text-xs py-1"
              />
            ) : (
              <span className={styles.valorCampo}>{personagem.raca}</span>
            )}
          </div>

          {/* Classe */}
          <div className={styles.caixaAtributo}>
            <span className={`${styles.labelCampo} ${styles.labelCampoProtegido}`}>Classe</span>
            {modoEdicao ? (
              <input
                type="text"
                required
                value={form.classe}
                onChange={(e) => handleChange("classe", e.target.value)}
                className="t20-input text-xs py-1"
              />
            ) : (
              <span className={styles.valorCampo}>{personagem.classe}</span>
            )}
          </div>

          {/* Nível */}
          <div className={styles.caixaAtributo}>
            <span className={`${styles.labelCampo} ${styles.labelCampoProtegido}`}>Nível</span>
            {modoEdicao ? (
              <input
                type="number"
                min={1}
                max={20}
                required
                value={form.nivel}
                onChange={(e) => handleChange("nivel", parseInt(e.target.value, 10) || 1)}
                className="t20-input text-xs py-1"
              />
            ) : (
              <span className={styles.valorCampo}>{personagem.nivel}</span>
            )}
          </div>

          {/* Defesa */}
          <div className={styles.caixaAtributo}>
            <span className={`${styles.labelCampo} ${styles.labelCampoProtegido}`}>Defesa</span>
            {modoEdicao ? (
              <input
                type="number"
                min={0}
                required
                value={form.defesa}
                onChange={(e) => handleChange("defesa", parseInt(e.target.value, 10) || 0)}
                className="t20-input text-xs py-1"
              />
            ) : (
              <span className={styles.valorCampo}>{personagem.defesa}</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {/* Origem */}
          <div className={styles.caixaAtributo}>
            <span className={`${styles.labelCampo} ${styles.labelCampoProtegido}`}>Origem</span>
            {modoEdicao ? (
              <input
                type="text"
                value={form.origem}
                onChange={(e) => handleChange("origem", e.target.value)}
                className="t20-input text-xs py-1"
              />
            ) : (
              <span className="font-serif font-bold text-sm text-stone-200">{personagem.origem}</span>
            )}
          </div>

          {/* Divindade */}
          <div className={styles.caixaAtributo}>
            <span className={`${styles.labelCampo} ${styles.labelCampoProtegido}`}>Divindade</span>
            {modoEdicao ? (
              <input
                type="text"
                value={form.divindade}
                onChange={(e) => handleChange("divindade", e.target.value)}
                className="t20-input text-xs py-1"
              />
            ) : (
              <span className="font-serif font-bold text-sm text-stone-200">{personagem.divindade}</span>
            )}
          </div>

          {/* PV Máximo */}
          <div className={styles.caixaAtributo}>
            <span className={`${styles.labelCampo} ${styles.labelCampoProtegido}`}>PV Máximo</span>
            {modoEdicao ? (
              <input
                type="number"
                min={1}
                required
                value={form.pvMaximo}
                onChange={(e) => handleChange("pvMaximo", parseInt(e.target.value, 10) || 1)}
                className="t20-input text-xs py-1 text-red-400"
              />
            ) : (
              <span className="font-serif font-bold text-base text-red-400">{personagem.pvMaximo}</span>
            )}
          </div>

          {/* PM Máximo */}
          <div className={styles.caixaAtributo}>
            <span className={`${styles.labelCampo} ${styles.labelCampoProtegido}`}>PM Máximo</span>
            {modoEdicao ? (
              <input
                type="number"
                min={0}
                required
                value={form.pmMaximo}
                onChange={(e) => handleChange("pmMaximo", parseInt(e.target.value, 10) || 0)}
                className="t20-input text-xs py-1 text-cyan-400"
              />
            ) : (
              <span className="font-serif font-bold text-base text-cyan-400">{personagem.pmMaximo}</span>
            )}
          </div>
        </div>
      </div>

      {/* Grid de Campos Livres (Salva Imediatamente) */}
      <div className="space-y-2 pt-4">
        <div className="flex items-center justify-between pb-1 border-b border-stone-800">
          <span className="font-serif text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Unlock className="w-3.5 h-3.5 text-emerald-400" />
            Recursos Livres (Edição Direta do Jogador)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* PV Atual */}
          <div className={styles.caixaAtributo}>
            <span className={styles.labelCampo}>PV Atual</span>
            {modoEdicao ? (
              <input
                type="number"
                value={form.pvAtual}
                onChange={(e) => handleChange("pvAtual", parseInt(e.target.value, 10) || 0)}
                className="t20-input text-xs py-1"
              />
            ) : (
              <span className="font-serif font-bold text-lg text-red-400">{personagem.pvAtual}</span>
            )}
          </div>

          {/* PM Atual */}
          <div className={styles.caixaAtributo}>
            <span className={styles.labelCampo}>PM Atual</span>
            {modoEdicao ? (
              <input
                type="number"
                value={form.pmAtual}
                onChange={(e) => handleChange("pmAtual", parseInt(e.target.value, 10) || 0)}
                className="t20-input text-xs py-1"
              />
            ) : (
              <span className="font-serif font-bold text-lg text-cyan-400">{personagem.pmAtual}</span>
            )}
          </div>

          {/* URL do Avatar */}
          <div className={styles.caixaAtributo}>
            <span className={styles.labelCampo}>URL do Avatar</span>
            {modoEdicao ? (
              <input
                type="url"
                value={form.avatarUrl}
                onChange={(e) => handleChange("avatarUrl", e.target.value)}
                placeholder="https://..."
                className="t20-input text-xs py-1"
              />
            ) : (
              <span className="text-xs text-stone-400 truncate font-mono">
                {personagem.avatarUrl ? "Link Cadastrado" : "Padrão"}
              </span>
            )}
          </div>
        </div>

        {/* Descrição / Lore */}
        <div className="pt-2">
          <label className={styles.labelCampo}>História & Traços de Arton</label>
          {modoEdicao ? (
            <textarea
              rows={4}
              value={form.descricao}
              onChange={(e) => handleChange("descricao", e.target.value)}
              className="t20-input text-xs resize-none"
              placeholder="Descreva a história, trejeitos e feitos memoráveis do seu herói..."
            />
          ) : (
            <div className="p-3.5 rounded-lg bg-stone-950/60 border border-stone-800 text-stone-300 text-xs sm:text-sm whitespace-pre-line leading-relaxed font-sans">
              {personagem.descricao || "Nenhuma crônica registrada para este aventureiro."}
            </div>
          )}
        </div>
      </div>

      {/* Botão de Gravação da Aba Principal */}
      {modoEdicao && (
        <div className="flex justify-end pt-4 border-t border-stone-800">
          <button
            type="submit"
            disabled={salvando}
            className="t20-btn-primary text-xs flex items-center gap-2"
          >
            {salvando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Gravando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar Alterações da Aba
              </>
            )}
          </button>
        </div>
      )}
    </form>
  );
}