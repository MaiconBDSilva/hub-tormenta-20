"use client";

import React, { useState } from "react";
import { X, ShieldPlus, Loader2 } from "lucide-react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface ModalCriarPersonagemProps {
  aberto: boolean;
  onFechar: () => void;
  onSucesso: () => void;
}

export function ModalCriarPersonagem({
  aberto,
  onFechar,
  onSucesso,
}: ModalCriarPersonagemProps) {
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Valores padrão pré-definidos com apenas o nome em branco
  const [form, setForm] = useState({
    nome: "",
    raca: "Humano",
    classe: "Guerreiro",
    origem: "Aventureiro Nato",
    nivel: 1,
    divindade: "Valkaria",
    pvMaximo: 20,
    pmMaximo: 10,
    defesa: 10,
    avatarUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300",
    descricao: "Um bravo aventureiro forjado nas terras de Arton pronto para trilhar sua jornada.",
    anotacoes: "",
  });

  if (!aberto) return null;

  const handleChange = (campo: string, valor: string | number) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim()) {
      setErro("O nome do herói é obrigatório.");
      return;
    }

    setSalvando(true);
    setErro(null);

    try {
      const agoraIso = new Date().toISOString();
      const pvMax = Number(form.pvMaximo) || 20;
      const pmMax = Number(form.pmMaximo) || 10;

      // Importante: Firestore rejeita campos com valor `undefined`.
      // Usamos `null` explicitamente para donoUid e donoNome quando não há jogador vinculado.
      const novoPersonagem = {
        nome: form.nome.trim(),
        raca: form.raca.trim(),
        classe: form.classe.trim(),
        origem: form.origem.trim(),
        nivel: Number(form.nivel) || 1,
        divindade: form.divindade.trim(),
        pvMaximo: pvMax,
        pvAtual: pvMax,
        pmMaximo: pmMax,
        pmAtual: pmMax,
        defesa: Number(form.defesa) || 10,
        avatarUrl: form.avatarUrl.trim(),
        descricao: form.descricao.trim(),
        anotacoes: form.anotacoes.trim(),
        donoUid: null,
        donoNome: null,
        criadoEm: agoraIso,
        atualizadoEm: agoraIso,
        solicitacaoPendente: null,
      };

      await addDoc(collection(db, "personagens"), novoPersonagem);
      onSucesso();
      onFechar();
    } catch (err) {
      console.error("Erro ao forjar novo herói:", err);
      setErro("Falha ao registrar a ficha no Firestore. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="t20-card w-full max-w-2xl max-h-[90vh] overflow-y-auto border-amber-600/30 p-6 relative">
        <div className="t20-stripe" />

        {/* Topo do Modal */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <ShieldPlus className="w-6 h-6 text-amber-500" />
            <h2 className="text-xl font-serif font-bold text-amber-400">
              Forjar Novo Personagem
            </h2>
          </div>
          <button
            onClick={onFechar}
            className="text-stone-400 hover:text-stone-200 transition-colors p-1"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {erro && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-800/80 text-red-300 text-sm">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome (Único campo obrigatório em branco) */}
          <div>
            <label className="block text-xs font-serif font-bold text-amber-400 uppercase tracking-wider mb-1">
              Nome do Herói <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Ex: Sir Loras de Valkaria"
              value={form.nome}
              onChange={(e) => handleChange("nome", e.target.value)}
              className="t20-input"
            />
          </div>

          {/* Dados Biográficos */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-serif font-bold text-stone-400 uppercase tracking-wider mb-1">
                Raça
              </label>
              <input
                type="text"
                value={form.raca}
                onChange={(e) => handleChange("raca", e.target.value)}
                className="t20-input"
              />
            </div>
            <div>
              <label className="block text-xs font-serif font-bold text-stone-400 uppercase tracking-wider mb-1">
                Classe
              </label>
              <input
                type="text"
                value={form.classe}
                onChange={(e) => handleChange("classe", e.target.value)}
                className="t20-input"
              />
            </div>
            <div>
              <label className="block text-xs font-serif font-bold text-stone-400 uppercase tracking-wider mb-1">
                Nível
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={form.nivel}
                onChange={(e) => handleChange("nivel", parseInt(e.target.value, 10) || 1)}
                className="t20-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-serif font-bold text-stone-400 uppercase tracking-wider mb-1">
                Origem
              </label>
              <input
                type="text"
                value={form.origem}
                onChange={(e) => handleChange("origem", e.target.value)}
                className="t20-input"
              />
            </div>
            <div>
              <label className="block text-xs font-serif font-bold text-stone-400 uppercase tracking-wider mb-1">
                Divindade
              </label>
              <input
                type="text"
                value={form.divindade}
                onChange={(e) => handleChange("divindade", e.target.value)}
                className="t20-input"
              />
            </div>
          </div>

          {/* Atributos Numéricos Iniciais */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-serif font-bold text-stone-400 uppercase tracking-wider mb-1">
                PV Máximo
              </label>
              <input
                type="number"
                min={1}
                value={form.pvMaximo}
                onChange={(e) => handleChange("pvMaximo", parseInt(e.target.value, 10) || 1)}
                className="t20-input"
              />
            </div>
            <div>
              <label className="block text-xs font-serif font-bold text-stone-400 uppercase tracking-wider mb-1">
                PM Máximo
              </label>
              <input
                type="number"
                min={0}
                value={form.pmMaximo}
                onChange={(e) => handleChange("pmMaximo", parseInt(e.target.value, 10) || 0)}
                className="t20-input"
              />
            </div>
            <div>
              <label className="block text-xs font-serif font-bold text-stone-400 uppercase tracking-wider mb-1">
                Defesa
              </label>
              <input
                type="number"
                min={0}
                value={form.defesa}
                onChange={(e) => handleChange("defesa", parseInt(e.target.value, 10) || 10)}
                className="t20-input"
              />
            </div>
          </div>

          {/* URL da Imagem */}
          <div>
            <label className="block text-xs font-serif font-bold text-stone-400 uppercase tracking-wider mb-1">
              URL do Avatar (Link externo)
            </label>
            <input
              type="url"
              value={form.avatarUrl}
              onChange={(e) => handleChange("avatarUrl", e.target.value)}
              placeholder="https://i.imgur.com/..."
              className="t20-input"
            />
          </div>

          {/* Descrição inicial */}
          <div>
            <label className="block text-xs font-serif font-bold text-stone-400 uppercase tracking-wider mb-1">
              Descrição / Lore Inicial
            </label>
            <textarea
              rows={2}
              value={form.descricao}
              onChange={(e) => handleChange("descricao", e.target.value)}
              className="t20-input resize-none"
            />
          </div>

          {/* Ações */}
          <div className="flex justify-end gap-3 pt-4 border-t border-stone-800">
            <button
              type="button"
              onClick={onFechar}
              disabled={salvando}
              className="t20-btn-ghost text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="t20-btn-primary text-xs"
            >
              {salvando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Forjando...
                </>
              ) : (
                "Cadastrar Ficha"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}