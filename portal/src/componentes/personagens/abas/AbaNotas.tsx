"use client";

import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
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
  ShieldAlert,
  Scroll,
} from "lucide-react";
import {
  EditorTextoRicoT20,
  VisualizadorMarkdownT20,
} from "@/componentes/comuns/EditorTextoRicoT20";

interface AbaNotasProps {
  personagem: PersonagemRPG;
  modoEdicao?: boolean;
  onAtualizacao: () => void;
}

export function AbaNotas({ personagem, onAtualizacao }: AbaNotasProps) {
  const [editando, setEditando] = useState(false);
  const [anotacoes, setAnotacoes] = useState(personagem.anotacoes || "");
  const [notasPersistidas, setNotasPersistidas] = useState(personagem.anotacoes || "");
  const [carregandoNotas, setCarregandoNotas] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;

    async function carregarNotasPrivadas() {
      setCarregandoNotas(true);
      try {
        const refNotas = doc(db, "personagens", personagem.id, "privado", "notas");
        const snap = await getDoc(refNotas);
        if (!ativo) return;

        if (snap.exists()) {
          const conteudo = typeof snap.data().conteudo === "string" ? snap.data().conteudo : "";
          setAnotacoes(conteudo);
          setNotasPersistidas(conteudo);
        } else {
          const legado = personagem.anotacoes || "";
          setAnotacoes(legado);
          setNotasPersistidas(legado);
        }
      } catch (err) {
        if (!ativo) return;
        console.error("Erro ao carregar anotações privadas:", err);
        setErro("Não foi possível carregar as anotações confidenciais.");
      } finally {
        if (ativo) setCarregandoNotas(false);
      }
    }

    carregarNotasPrivadas();
    return () => {
      ativo = false;
    };
  }, [personagem.id, personagem.anotacoes]);

  const handleCancelar = () => {
    setAnotacoes(notasPersistidas);
    setEditando(false);
    setErro(null);
    setMensagemSucesso(null);
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setMensagemSucesso(null);
    setErro(null);

    try {
      const conteudoLimpo = anotacoes.trim();
      const refNotas = doc(db, "personagens", personagem.id, "privado", "notas");
      const payloadLimpo = JSON.parse(
        JSON.stringify({
          conteudo: conteudoLimpo,
          atualizadoEm: new Date().toISOString(),
        })
      );
      await setDoc(refNotas, payloadLimpo, { merge: true });

      setNotasPersistidas(conteudoLimpo);
      setMensagemSucesso("Anotações confidenciais seladas no diário!");
      setEditando(false);
      onAtualizacao();
    } catch (err) {
      console.error("Erro ao salvar anotações:", err);
      setErro("Falha ao atualizar diário no Firestore.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Topo da Aba */}
      <div className="t20-section-header">
        <h2 className="t20-section-title">
          <BookOpen className="w-5 h-5 text-amber-400" />
          Diário & Anotações Secretas
        </h2>

        {!editando && (
          <button
            type="button"
            onClick={() => setEditando(true)}
            className="t20-btn-secondary"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Editar Diário
          </button>
        )}
      </div>

      {/* Aviso de Confidencialidade Diegético */}
      <div className="t20-alert-warning">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          <strong>Área Confidencial:</strong> Este diário é visível exclusivamente para você e para o Mestre da Campanha.
        </span>
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

      {/* Formulário com Editor de Texto Rico vs. Modo Leitura */}
      {editando ? (
        <form onSubmit={handleSalvar} className="space-y-4">
          <EditorTextoRicoT20
            valor={anotacoes}
            onChange={setAnotacoes}
            placeholder="Escreva pistas, contatos, conspirações, juramentos, dívidas ou objetivos pessoais em Arton..."
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
                  Selando Diário...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar Anotações
                </>
              )}
            </button>
          </div>
        </form>
      ) : carregandoNotas ? (
        <div className="flex items-center justify-center gap-2 p-8 rounded-lg bg-stone-950/40 border border-stone-800 text-stone-400 text-sm font-serif">
          <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
          <span>Consultando diário confidencial...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {anotacoes ? (
            <div className="p-5 rounded-lg bg-stone-950/60 border border-stone-800/80 shadow-inner">
              <VisualizadorMarkdownT20 conteudo={anotacoes} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 rounded-lg bg-stone-950/40 border border-dashed border-stone-800 text-center">
              <Scroll className="w-10 h-10 text-stone-600 mb-2 stroke-[1.2]" />
              <p className="font-serif text-sm text-stone-400">
                Nenhuma anotação confidencial registrada no diário até o momento.
              </p>
              <button
                type="button"
                onClick={() => setEditando(true)}
                className="mt-3 text-xs font-serif text-amber-400 hover:text-amber-300 underline font-semibold"
              >
                Escrever primeiras anotações &rarr;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
