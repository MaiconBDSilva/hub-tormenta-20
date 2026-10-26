"use client";

import React, { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PersonagemRPG } from "@/tipos/personagem";
import { BookOpen, Save, Loader2, CheckCircle2, AlertCircle, ShieldAlert } from "lucide-react";
import styles from "../personagens.module.css";

interface AbaNotasProps {
  personagem: PersonagemRPG;
  modoEdicao: boolean;
  onAtualizacao: () => void;
}

export function AbaNotas({ personagem, modoEdicao, onAtualizacao }: AbaNotasProps) {
  const [anotacoes, setAnotacoes] = useState(personagem.anotacoes || "");
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setSucesso(null);
    setErro(null);

    try {
      const refDoc = doc(db, "personagens", personagem.id);
      await updateDoc(refDoc, {
        anotacoes: anotacoes.trim(),
        atualizadoEm: new Date().toISOString(),
      });

      setSucesso("Anotações confidenciais salvas com sucesso!");
      onAtualizacao();
    } catch (err) {
      console.error("Erro ao salvar anotações:", err);
      setErro("Falha ao atualizar notas no Firestore.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <form onSubmit={handleSalvar} className="space-y-4">
      {/* Aviso de Confidencialidade */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-950/20 border border-amber-900/40 text-amber-300/90 text-xs">
        <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
        <span>
          <strong>Área Confidencial:</strong> Este diário é visível exclusivamente para você e para o Mestre da Campanha.
        </span>
      </div>

      {sucesso && (
        <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{sucesso}</span>
        </div>
      )}

      {erro && (
        <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{erro}</span>
        </div>
      )}

      <div>
        <label className={styles.labelCampo}>Diário & Anotações Secretas</label>
        {modoEdicao ? (
          <textarea
            rows={10}
            value={anotacoes}
            onChange={(e) => setAnotacoes(e.target.value)}
            placeholder="Escreva pistas, contatos, juramentos, objetivos pessoais ou conspirações..."
            className="t20-input text-xs resize-none font-mono"
          />
        ) : (
          <div className="p-4 rounded-lg bg-stone-950/60 border border-stone-800 text-stone-300 text-xs sm:text-sm whitespace-pre-line leading-relaxed min-h-[12rem] font-sans">
            {personagem.anotacoes ? (
              personagem.anotacoes
            ) : (
              <span className="text-stone-500 italic">
                Nenhuma anotação confidencial registrada até o momento. Ative o Modo Edição para escrever.
              </span>
            )}
          </div>
        )}
      </div>

      {modoEdicao && (
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={salvando}
            className="t20-btn-primary text-xs flex items-center gap-2"
          >
            {salvando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando Notas...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar Anotações
              </>
            )}
          </button>
        </div>
      )}
    </form>
  );
}