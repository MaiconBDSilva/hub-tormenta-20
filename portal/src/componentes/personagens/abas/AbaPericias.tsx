"use client";

import React, { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  PersonagemRPG,
  ItemPericia,
  AtributoChaveSigla,
} from "@/tipos/personagem";
import {
  Compass,
  Edit3,
  Save,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Check,
} from "lucide-react";

interface AbaPericiasProps {
  personagem: PersonagemRPG;
  ehDono: boolean;
  ehMestre: boolean;
  onAtualizacao: () => void;
}

const OPCOES_ATRIBUTOS: AtributoChaveSigla[] = [
  "FOR",
  "DES",
  "CON",
  "INT",
  "SAB",
  "CAR",
];

// Lista canônica das 28 perícias padrão de Tormenta 20
const PERICIAS_PADRAO_T20: Omit<ItemPericia, "treinada" | "total">[] = [
  { id: "acrobacia", nome: "Acrobacia", atributoChave: "DES" },
  { id: "adestramento", nome: "Adestramento", atributoChave: "CAR" },
  { id: "atletismo", nome: "Atletismo", atributoChave: "FOR" },
  { id: "atuacao", nome: "Atuação", atributoChave: "CAR" },
  { id: "cavalgar", nome: "Cavalgar", atributoChave: "DES" },
  { id: "conhecimento", nome: "Conhecimento", atributoChave: "INT" },
  { id: "cura", nome: "Cura", atributoChave: "SAB" },
  { id: "diplomacia", nome: "Diplomacia", atributoChave: "CAR" },
  { id: "enganacao", nome: "Enganação", atributoChave: "CAR" },
  { id: "fortitude", nome: "Fortitude", atributoChave: "CON" },
  { id: "furtividade", nome: "Furtividade", atributoChave: "DES" },
  { id: "guerra", nome: "Guerra", atributoChave: "INT" },
  { id: "iniciativa", nome: "Iniciativa", atributoChave: "DES" },
  { id: "intimidacao", nome: "Intimidação", atributoChave: "CAR" },
  { id: "intuicao", nome: "Intuição", atributoChave: "SAB" },
  { id: "investigacao", nome: "Investigação", atributoChave: "INT" },
  { id: "jogatina", nome: "Jogatina", atributoChave: "CAR" },
  { id: "ladinagem", nome: "Ladinagem", atributoChave: "DES" },
  { id: "luta", nome: "Luta", atributoChave: "FOR" },
  { id: "misticismo", nome: "Misticismo", atributoChave: "INT" },
  { id: "nobreza", nome: "Nobreza", atributoChave: "INT" },
  { id: "oficio_principal", nome: "Ofício (Geral)", atributoChave: "INT" },
  { id: "percepcao", nome: "Percepção", atributoChave: "SAB" },
  { id: "pilotagem", nome: "Pilotagem", atributoChave: "DES" },
  { id: "pontaria", nome: "Pontaria", atributoChave: "DES" },
  { id: "reflexos", nome: "Reflexos", atributoChave: "DES" },
  { id: "religiao", nome: "Religião", atributoChave: "SAB" },
  { id: "sobrevivencia", nome: "Sobrevivência", atributoChave: "SAB" },
  { id: "vontade", nome: "Vontade", atributoChave: "SAB" },
];

export function AbaPericias({
  personagem,
  ehDono,
  ehMestre,
  onAtualizacao,
}: AbaPericiasProps) {
  const podeEditar = ehDono || ehMestre;
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  // Inicializa mesclando as perícias já salvas com a base padrão
  const inicializarPericias = (): ItemPericia[] => {
    const periciasSalvas = personagem.pericias || [];
    const mapaSalvas = new Map(periciasSalvas.map((p) => [p.id, p]));

    // 1. Perícias canônicas
    const lista = PERICIAS_PADRAO_T20.map((padrao) => {
      const existente = mapaSalvas.get(padrao.id);
      return {
        id: padrao.id,
        nome: padrao.nome,
        atributoChave: existente?.atributoChave || padrao.atributoChave,
        treinada: Boolean(existente?.treinada),
        total: existente?.total ?? 0,
        ehOficioPersonalizado: false,
      };
    });

    // 2. Ofícios adicionais customizados
    periciasSalvas
      .filter((p) => p.ehOficioPersonalizado)
      .forEach((oficio) =>
        lista.push({
          ...oficio,
          ehOficioPersonalizado: Boolean(oficio.ehOficioPersonalizado),
        }),
      );
    return lista;
  };

  const [listaPericias, setListaPericias] =
    useState<ItemPericia[]>(inicializarPericias);

  useEffect(() => {
    setListaPericias(inicializarPericias());
  }, [personagem.pericias]);

  const handleTotalChange = (id: string, novoTotal: number) => {
    setListaPericias((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, total: novoTotal } : item,
      ),
    );
  };

  const handleTreinadaToggle = (id: string) => {
    setListaPericias((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, treinada: !item.treinada } : item,
      ),
    );
  };

  const handleAtributoChange = (id: string, novoAttr: AtributoChaveSigla) => {
    setListaPericias((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, atributoChave: novoAttr } : item,
      ),
    );
  };

  const handleNomeOficioChange = (id: string, novoNome: string) => {
    setListaPericias((prev) =>
      prev.map((item) => (item.id === id ? { ...item, nome: novoNome } : item)),
    );
  };

  const handleAdicionarOficio = () => {
    const novoId = `oficio_${Date.now()}`;
    const novoOficio: ItemPericia = {
      id: novoId,
      nome: "Ofício (Novo)",
      atributoChave: "INT",
      treinada: false,
      total: 0,
      ehOficioPersonalizado: true,
    };
    setListaPericias((prev) => [...prev, novoOficio]);
  };

  const handleRemoverOficio = (id: string) => {
    setListaPericias((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCancelar = () => {
    setListaPericias(inicializarPericias());
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
      const refDoc = doc(db, "personagens", personagem.id);
      await updateDoc(refDoc, {
        pericias: listaPericias,
        atualizadoEm: new Date().toISOString(),
      });

      setMensagemSucesso("Perícias gravadas com sucesso!");
      setEditando(false);
      onAtualizacao();
    } catch (err) {
      console.error("Erro ao salvar perícias:", err);
      setErro("Falha ao salvar a lista de perícias.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Topo da Aba */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-amber-500/20">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-amber-400" />
          <h2 className="font-serif font-bold text-lg text-stone-100">
            Perícias de Arton
          </h2>
        </div>

        {podeEditar && !editando && (
          <button
            type="button"
            onClick={() => setEditando(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded border border-amber-500/40 bg-stone-900/80 hover:bg-stone-800 text-amber-300 font-serif font-semibold text-xs transition-all hover:scale-105"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
            Editar Perícias
          </button>
        )}
      </div>

      {/* Alertas */}
      {mensagemSucesso && (
        <div className="p-3 rounded-lg bg-emerald-950/70 border border-emerald-700 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{mensagemSucesso}</span>
        </div>
      )}

      {erro && (
        <div className="p-3 rounded-lg bg-red-950/70 border border-red-700 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{erro}</span>
        </div>
      )}

      {/* Formulário / Grade de Perícias */}
      <form onSubmit={handleSalvar} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {listaPericias.map((pericia) => (
            <div
              key={pericia.id}
              className={`flex items-center justify-between gap-2 p-2.5 rounded-lg border transition-all ${
                pericia.treinada
                  ? "bg-amber-950/20 border-amber-500/40 shadow-sm"
                  : "bg-stone-950/60 border-stone-800/80"
              }`}
            >
              {/* Esquerda: Treino + Nome */}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {editando ? (
                  <button
                    type="button"
                    onClick={() => handleTreinadaToggle(pericia.id)}
                    className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-all ${
                      pericia.treinada
                        ? "bg-amber-500 border-amber-400 text-stone-950"
                        : "bg-stone-900 border-stone-700 hover:border-amber-400 text-transparent"
                    }`}
                    title={
                      pericia.treinada ? "Perícia Treinada" : "Não Treinada"
                    }
                  >
                    <Check className="w-3.5 h-3.5 stroke-3" />
                  </button>
                ) : (
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      pericia.treinada
                        ? "bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                        : "bg-stone-800 border border-stone-700"
                    }`}
                    title={pericia.treinada ? "Treinada" : "Não Treinada"}
                  />
                )}

                {/* Nome da Perícia */}
                {editando && pericia.ehOficioPersonalizado ? (
                  <input
                    type="text"
                    value={pericia.nome}
                    onChange={(e) =>
                      handleNomeOficioChange(pericia.id, e.target.value)
                    }
                    placeholder="Nome do Ofício"
                    className="w-full bg-stone-900 border border-amber-500/50 rounded px-1.5 py-0.5 font-serif text-xs text-amber-200 focus:outline-none"
                  />
                ) : (
                  <span
                    className={`font-serif text-xs truncate ${
                      pericia.treinada
                        ? "font-bold text-stone-100"
                        : "text-stone-400"
                    }`}
                  >
                    {pericia.nome}
                  </span>
                )}
              </div>

              {/* Direita: Atributo + Valor Total + Botão de Excluir */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Seletor ou Sigla do Atributo */}
                {editando ? (
                  <select
                    value={pericia.atributoChave}
                    onChange={(e) =>
                      handleAtributoChange(
                        pericia.id,
                        e.target.value as AtributoChaveSigla,
                      )
                    }
                    className="bg-stone-900 border border-stone-700 rounded px-1 py-0.5 text-[10px] font-mono text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                  >
                    {OPCOES_ATRIBUTOS.map((attr) => (
                      <option key={attr} value={attr}>
                        {attr}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-stone-900/80 border border-stone-800 text-stone-400">
                    {pericia.atributoChave}
                  </span>
                )}

                {/* Valor Total */}
                {editando ? (
                  <input
                    type="number"
                    value={pericia.total}
                    onChange={(e) =>
                      handleTotalChange(
                        pericia.id,
                        parseInt(e.target.value, 10) || 0,
                      )
                    }
                    className="w-12 text-center bg-stone-900 border border-amber-500/40 rounded px-1 py-0.5 font-serif font-black text-xs text-amber-300 focus:outline-none focus:border-amber-400"
                  />
                ) : (
                  <span
                    className={`min-w-8 text-center font-serif font-black text-sm px-1.5 py-0.5 rounded ${
                      pericia.treinada
                        ? "text-amber-300 bg-amber-950/40 border border-amber-500/30"
                        : "text-stone-300 bg-stone-900/80 border border-stone-800"
                    }`}
                  >
                    {pericia.total >= 0 ? `+${pericia.total}` : pericia.total}
                  </span>
                )}

                {/* Lixeira (Apenas em ofícios customizados durante a edição) */}
                {editando && pericia.ehOficioPersonalizado && (
                  <button
                    type="button"
                    onClick={() => handleRemoverOficio(pericia.id)}
                    className="p-1 rounded text-red-400 hover:bg-red-950/50 transition-colors"
                    title="Remover Ofício"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Rodapé da Edição: Adicionar Ofício & Botões de Salvar */}
        {editando && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-800">
            <button
              type="button"
              onClick={handleAdicionarOficio}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-dashed border-amber-500/50 bg-stone-900/50 hover:bg-stone-800 text-amber-300 font-serif text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              Adicionar Novo Ofício
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancelar}
                disabled={salvando}
                className="px-3.5 py-1.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 font-serif font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>

              <button
                type="submit"
                disabled={salvando}
                className="t20-btn-primary px-4 py-1.5 text-xs flex items-center gap-1.5 font-serif font-bold"
              >
                {salvando ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Gravando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Salvar Perícias
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
