"use client";

import React, { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PersonagemRPG } from "@/tipos/personagem";
import {
  BookOpen,
  Edit3,
  Save,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Scroll,
} from "lucide-react";
import {
  EditorTextoRicoT20,
  VisualizadorMarkdownT20,
} from "@/componentes/comuns/EditorTextoRicoT20";

interface AbaPrincipalProps {
  personagem: PersonagemRPG;
  ehDono: boolean;
  ehMestre: boolean;
  onAtualizacao: () => void;
}

export function AbaPrincipal({
  personagem,
  ehDono,
  ehMestre,
  onAtualizacao,
}: AbaPrincipalProps) {
  const podeEditar = ehDono || ehMestre;
  const [editando, setEditando] = useState(false);
  const [descricao, setDescricao] = useState(personagem.descricao || "");
  const [salvando, setSalvando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    setDescricao(personagem.descricao || "");
  }, [personagem.descricao]);

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setMensagemSucesso(null);
    setErro(null);

    try {
      const refDoc = doc(db, "personagens", personagem.id);
      await updateDoc(refDoc, {
        descricao: descricao.trim(),
        atualizadoEm: new Date().toISOString(),
      });

      setMensagemSucesso("Crônica gravada nos anais da história!");
      setEditando(false);
      onAtualizacao();
    } catch (err) {
      console.error("Erro ao salvar crônica:", err);
      setErro("Falha ao salvar a biografia do herói.");
    } finally {
      setSalvando(false);
    }
  };

  const handleCancelar = () => {
    setDescricao(personagem.descricao || "");
    setEditando(false);
    setErro(null);
    setMensagemSucesso(null);
  };

  return (
    <div className="space-y-4">
      {/* Topo da Aba */}
      <div className="t20-section-header">
        <h2 className="t20-section-title">
          <BookOpen className="w-5 h-5 text-amber-400" />
          Crônica & Feitos Memoráveis
        </h2>

        {podeEditar && !editando && (
          <button
            type="button"
            onClick={() => setEditando(true)}
            className="t20-btn-secondary"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Redigir Crônica
          </button>
        )}
      </div>

      {/* Alertas */}
      {mensagemSucesso && (
        <div className="t20-alert-success">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{mensagemSucesso}</span>
        </div>
      )}

      {erro && (
        <div className="t20-alert-error">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{erro}</span>
        </div>
      )}

      {/* Conteúdo: Leitura vs Edição com Editor Rico */}
      {editando ? (
        <form onSubmit={handleSalvar} className="space-y-4">
          <EditorTextoRicoT20
            valor={descricao}
            onChange={setDescricao}
            placeholder="Narre a origem do herói, suas motivações, trejeitos, cicatrizes e feitos marcantes nas terras de Arton..."
            linhas={12}
          />

          <div className="t20-form-actions">
            <button
              type="button"
              onClick={handleCancelar}
              disabled={salvando}
              className="t20-btn-cancel"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>

            <button
              type="submit"
              disabled={salvando}
              className="t20-btn-primary !py-1.5 !px-4 !text-xs"
            >
              {salvando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Inscrevendo no Tomo...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar Crônica
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          {descricao ? (
            <div className="p-5 rounded-lg bg-stone-950/60 border border-stone-800/80 shadow-inner">
              <VisualizadorMarkdownT20 conteudo={descricao} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 rounded-lg bg-stone-950/40 border border-dashed border-stone-800 text-center">
              <Scroll className="w-10 h-10 text-stone-600 mb-2 stroke-[1.2]" />
              <p className="font-serif text-sm text-stone-400">
                Nenhum relato ou crônica foi inscrito para este aventureiro ainda.
              </p>
              {podeEditar && (
                <button
                  type="button"
                  onClick={() => setEditando(true)}
                  className="mt-3 text-xs font-serif text-amber-400 hover:text-amber-300 underline font-semibold"
                >
                  Inscrever as primeiras linhas da história &rarr;
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
