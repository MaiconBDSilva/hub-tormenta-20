"use client";

import React, { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import styles from "../personagens.module.css";
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

function construirListaPericias(periciasSalvas: ItemPericia[] = []): ItemPericia[] {
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

  // 2. Ofícios customizados salvos
  periciasSalvas.forEach((p) => {
    if (p.ehOficioPersonalizado) {
      lista.push({
        id: p.id,
        nome: p.nome,
        atributoChave: p.atributoChave || "INT",
        treinada: Boolean(p.treinada),
        total: p.total ?? 0,
        ehOficioPersonalizado: true,
      });
    }
  });

  return lista;
}

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

  const [listaPericias, setListaPericias] = useState<ItemPericia[]>(() =>
    construirListaPericias(personagem.pericias)
  );

  useEffect(() => {
    setListaPericias(construirListaPericias(personagem.pericias));
  }, [personagem.pericias]);

  const handleTreinadaToggle = (id: string) => {
    setListaPericias((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, treinada: !item.treinada } : item
      )
    );
  };

  const handleAtributoChange = (id: string, atributoChave: AtributoChaveSigla) => {
    setListaPericias((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, atributoChave } : item
      )
    );
  };

  const handleTotalChange = (id: string, total: number) => {
    setListaPericias((prev) =>
      prev.map((item) => (item.id === id ? { ...item, total } : item))
    );
  };

  const handleNomeOficioChange = (id: string, nome: string) => {
    setListaPericias((prev) =>
      prev.map((item) => (item.id === id ? { ...item, nome } : item))
    );
  };

  const handleAdicionarOficio = () => {
    const novoId = `oficio_${Date.now()}`;
    const novoOficio: ItemPericia = {
      id: novoId,
      nome: "Novo Ofício",
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
    setListaPericias(construirListaPericias(personagem.pericias));
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
      const payloadLimpo = JSON.parse(
        JSON.stringify({
          pericias: listaPericias,
          atualizadoEm: new Date().toISOString(),
        })
      );
      await updateDoc(refDoc, payloadLimpo);

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
      <div className="t20-section-header">
        <h2 className="t20-section-title">
          <Compass className="w-5 h-5 text-amber-400" />
          Perícias de Arton
        </h2>

        {podeEditar && !editando && (
          <button
            type="button"
            onClick={() => setEditando(true)}
            className="t20-btn-secondary"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Editar Perícias
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

      {/* Formulário / Grade de Perícias */}
      <form onSubmit={handleSalvar} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {listaPericias.map((pericia) => (
            <div
              key={pericia.id}
              className={`${styles.periciaCard} ${
                pericia.treinada ? styles.periciaCardTreinada : ""
              }`}
            >
              {/* Esquerda: Treino + Nome */}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {editando ? (
                  <button
                    type="button"
                    onClick={() => handleTreinadaToggle(pericia.id)}
                    className={`${styles.btnCheckTreino} ${
                      pericia.treinada ? styles.btnCheckTreinoAtivo : ""
                    }`}
                    title={
                      pericia.treinada ? "Perícia Treinada" : "Não Treinada"
                    }
                  >
                    <Check className="w-3.5 h-3.5 stroke-3" />
                  </button>
                ) : (
                  <span
                    className={`${styles.dotTreino} ${
                      pericia.treinada ? styles.dotTreinoAtivo : ""
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
                    className={styles.inputOficio}
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
                    className={styles.selectAtributoPericia}
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
                    className={styles.inputTotalPericia}
                  />
                ) : (
                  <span
                    className={`${styles.badgeTotalPericia} ${
                      pericia.treinada ? styles.badgeTotalPericiaTreinada : ""
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
                    className={styles.btnRemoverIcone}
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
              className="t20-btn-dashed"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              Adicionar Novo Ofício
            </button>

            <div className="flex items-center gap-2">
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
                className="t20-btn-primary t20-btn-sm"
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
