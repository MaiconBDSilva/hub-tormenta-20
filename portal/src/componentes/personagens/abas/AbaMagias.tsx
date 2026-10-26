"use client";

import React, { useState, useEffect, useMemo } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  PersonagemRPG,
  ItemMagiaPersonagem,
  EscolaMagiaT20,
  TipoMagiaT20,
} from "@/tipos/personagem";
import {
  converterItemFoundryParaMagia,
  MAPA_ESCOLAS,
  MAPA_TIPOS,
} from "@/utilitarios/FormatadorMagiasT20";
import {
  Scroll,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Zap,
  Clock,
  ChevronRight,
  Search,
  BookOpen,
  Target,
  Hourglass,
  Shield,
  Layers,
} from "lucide-react";

// Importa o compêndio do Foundry
import compendioMagiasRaw from "@/dados/magias.json";

interface AbaMagiasProps {
  personagem: PersonagemRPG;
  ehDono: boolean;
  ehMestre: boolean;
  onAtualizacao: () => void;
}

const CIRCULOS = [
  { label: "Todos", valor: 0 },
  { label: "1º Círculo", valor: 1 },
  { label: "2º Círculo", valor: 2 },
  { label: "3º Círculo", valor: 3 },
  { label: "4º Círculo", valor: 4 },
  { label: "5º Círculo", valor: 5 },
];

const ESCOLAS_LISTA: EscolaMagiaT20[] = [
  "Abjuração",
  "Adivinhação",
  "Convocação",
  "Encantamento",
  "Evocação",
  "Ilusão",
  "Necromancia",
  "Transmutação",
];

export function AbaMagias({
  personagem,
  ehDono,
  ehMestre,
  onAtualizacao,
}: AbaMagiasProps) {
  const podeEditar = ehDono || ehMestre;
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  // Lista local de magias da ficha
  const [magias, setMagias] = useState<ItemMagiaPersonagem[]>(
    personagem.magias || []
  );

  // Filtro de círculo ativo na aba
  const [circuloFiltro, setCirculoFiltro] = useState<number>(0);

  // Magia selecionada para visualização detalhada no Card
  const [magiaSelecionadaId, setMagiaSelecionadaId] = useState<string | null>(
    personagem.magias && personagem.magias.length > 0
      ? personagem.magias[0].id
      : null
  );

  // Estado do Modal de Compêndio
  const [modalAberto, setModalAberto] = useState(false);
  const [buscaCompendio, setBuscaCompendio] = useState("");
  const [circuloCompendio, setCirculoCompendio] = useState<number>(0);
  const [escolaCompendio, setEscolaCompendio] = useState<string>("todas");

  // Sincroniza quando os dados do personagem mudarem no Firestore
  useEffect(() => {
    const lista = personagem.magias || [];
    setMagias(lista);
    if (!magiaSelecionadaId && lista.length > 0) {
      setMagiaSelecionadaId(lista[0].id);
    }
  }, [personagem.magias]);

  // Carrega e normaliza todas as magias do arquivo JSON na primeira montagem
  const catalogoMagias = useMemo<ItemMagiaPersonagem[]>(() => {
    try {
      const items = (compendioMagiasRaw as any)?.items || [];
      return items.map((rawItem: any) => converterItemFoundryParaMagia(rawItem));
    } catch (err) {
      console.error("Falha ao carregar compêndio de magias:", err);
      return [];
    }
  }, []);

  // Filtra as magias da ficha pelo círculo ativo
  const magiasExibidas = useMemo(() => {
    if (circuloFiltro === 0) return magias;
    return magias.filter((m) => m.circulo === circuloFiltro);
  }, [magias, circuloFiltro]);

  // Magia atualmente inspecionada no Card de Detalhes
  const magiaAtiva = magias.find((m) => m.id === magiaSelecionadaId) || null;

  // Filtra o catálogo do modal com base nos critérios de pesquisa
  const catalogoFiltrado = useMemo(() => {
    return catalogoMagias.filter((m) => {
      const bateTexto =
        !buscaCompendio ||
        m.nome.toLowerCase().includes(buscaCompendio.toLowerCase()) ||
        m.descricao.toLowerCase().includes(buscaCompendio.toLowerCase());

      const bateCirculo =
        circuloCompendio === 0 || m.circulo === circuloCompendio;

      const bateEscola =
        escolaCompendio === "todas" || m.escola === escolaCompendio;

      return bateTexto && bateCirculo && bateEscola;
    });
  }, [catalogoMagias, buscaCompendio, circuloCompendio, escolaCompendio]);

  const handleCampoChange = (
    id: string,
    campo: keyof ItemMagiaPersonagem,
    valor: any
  ) => {
    setMagias((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [campo]: valor } : item))
    );
  };

  // Adiciona uma magia a partir do Compêndio
  const handleAprenderDoCatalogo = (magiaCatalogo: ItemMagiaPersonagem) => {
    const novaMagia: ItemMagiaPersonagem = {
      ...magiaCatalogo,
      id: `magia_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };

    setMagias((prev) => [...prev, novaMagia]);
    setMagiaSelecionadaId(novaMagia.id);
    setModalAberto(false);
  };

  // Cria uma magia customizada / caseira do zero
  const handleCriarMagiaCustomizada = () => {
    const novaMagia: ItemMagiaPersonagem = {
      id: `magia_custom_${Date.now()}`,
      nome: "Nova Magia",
      circulo: circuloFiltro === 0 ? 1 : circuloFiltro,
      tipo: "Arcana",
      escola: "Evocação",
      execucao: "Padrão",
      alcance: "Curto",
      alvoOuArea: "",
      duracao: "Instantânea",
      resistencia: "Nenhuma",
      custoPm: "1 PM",
      descricao: "Descreva os efeitos e parâmetros mágicos...",
      aprimoramentos: [],
      ehCustomizada: true,
    };

    setMagias((prev) => [...prev, novaMagia]);
    setMagiaSelecionadaId(novaMagia.id);
    setModalAberto(false);
  };

  const handleRemoverMagia = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setMagias((prev) => {
      const novaLista = prev.filter((item) => item.id !== id);
      if (magiaSelecionadaId === id) {
        setMagiaSelecionadaId(novaLista.length > 0 ? novaLista[0].id : null);
      }
      return novaLista;
    });
  };

  const handleCancelar = () => {
    const listaOriginal = personagem.magias || [];
    setMagias(listaOriginal);
    setMagiaSelecionadaId(listaOriginal.length > 0 ? listaOriginal[0].id : null);
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
        magias: magias,
        atualizadoEm: new Date().toISOString(),
      });

      setMensagemSucesso("Grimório selado e atualizado no tomo!");
      setEditando(false);
      onAtualizacao();
    } catch (err) {
      console.error("Erro ao salvar grimório:", err);
      setErro("Falha ao salvar magias no Firestore.");
    } finally {
      setSalvando(false);
    }
  };

  // Cores semânticas das Escolas de Magia de Arton
  const getBadgeEscola = (escola: EscolaMagiaT20) => {
    switch (escola) {
      case "Evocação":
        return "bg-red-950/60 text-red-300 border-red-600/50";
      case "Abjuração":
        return "bg-sky-950/60 text-sky-300 border-sky-600/50";
      case "Adivinhação":
        return "bg-amber-950/60 text-amber-300 border-amber-600/50";
      case "Convocação":
        return "bg-emerald-950/60 text-emerald-300 border-emerald-600/50";
      case "Encantamento":
        return "bg-pink-950/60 text-pink-300 border-pink-600/50";
      case "Ilusão":
        return "bg-purple-950/60 text-purple-300 border-purple-600/50";
      case "Necromancia":
        return "bg-stone-900 text-stone-300 border-stone-600";
      case "Transmutação":
        return "bg-orange-950/60 text-orange-300 border-orange-600/50";
      default:
        return "bg-stone-800 text-stone-300 border-stone-700";
    }
  };

  return (
    <div className="space-y-4">
      {/* Topo da Aba */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/20 pb-3">
        <div className="flex items-center gap-2">
          <Scroll className="w-5 h-5 text-amber-400" />
          <h2 className="font-serif font-bold text-lg text-stone-100">
            Grimório & Magias de Arton
          </h2>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-stone-900 border border-stone-800 text-stone-400">
            Total: {magias.length}
          </span>
        </div>

        {podeEditar && !editando && (
          <button
            type="button"
            onClick={() => setEditando(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded border border-amber-500/40 bg-stone-900/80 hover:bg-stone-800 text-amber-300 font-serif font-semibold text-xs transition-all hover:scale-105"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
            Editar Grimório
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

      {/* Filtro Rápido por Círculo */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CIRCULOS.map((c) => {
          const selecionado = circuloFiltro === c.valor;
          const qtd =
            c.valor === 0
              ? magias.length
              : magias.filter((m) => m.circulo === c.valor).length;

          return (
            <button
              key={c.valor}
              type="button"
              onClick={() => setCirculoFiltro(c.valor)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-serif font-bold transition-all whitespace-nowrap border ${
                selecionado
                  ? "bg-amber-950/70 text-amber-300 border-amber-500/70 shadow-sm"
                  : "bg-stone-950/60 text-stone-400 border-stone-800 hover:text-stone-200 hover:border-stone-700"
              }`}
            >
              <span>{c.label}</span>
              <span className="text-[10px] font-mono text-stone-500 font-normal">
                ({qtd})
              </span>
            </button>
          );
        })}
      </div>

      {/* Formulário / Grid Principal */}
      <form onSubmit={handleSalvar} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Coluna 1 & 2: Lista das Magias em 2 colunas (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-2">
            {magiasExibidas.length === 0 ? (
              <div className="p-8 text-center bg-stone-950/50 border border-dashed border-stone-800 rounded-lg">
                <Scroll className="w-8 h-8 text-stone-600 mx-auto mb-2" />
                <p className="font-serif text-xs text-stone-400">
                  {circuloFiltro === 0
                    ? "Nenhuma magia conjurada ou inscrita neste grimório."
                    : `Nenhuma magia de ${circuloFiltro}º Círculo cadastrada.`}
                </p>
                {editando && (
                  <button
                    type="button"
                    onClick={() => setModalAberto(true)}
                    className="mt-3 text-xs text-amber-400 underline font-semibold flex items-center gap-1 mx-auto"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Abrir Compêndio e Aprender Magia &rarr;
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {magiasExibidas.map((m) => {
                  const estaAtivo = m.id === magiaSelecionadaId;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setMagiaSelecionadaId(m.id)}
                      className={`cursor-pointer group relative p-2.5 rounded-lg border transition-all text-left flex flex-col justify-between gap-1.5 ${
                        estaAtivo
                          ? "bg-amber-950/30 border-amber-500/70 shadow-md ring-1 ring-amber-500/30"
                          : "bg-stone-950/70 border-stone-800/80 hover:border-stone-700 hover:bg-stone-900/60"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span
                          className={`font-serif text-xs font-bold truncate flex-1 ${
                            estaAtivo ? "text-amber-300" : "text-stone-200"
                          }`}
                        >
                          {m.nome || "Sem Nome"}
                        </span>

                        <ChevronRight
                          className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                            estaAtivo
                              ? "text-amber-400 translate-x-0.5"
                              : "text-stone-600 group-hover:text-stone-400"
                          }`}
                        />
                      </div>

                      {/* Badges Rápidas */}
                      <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                        <span className="font-mono text-amber-400 bg-amber-950/40 border border-amber-800/40 px-1 rounded">
                          {m.circulo}º Círculo
                        </span>

                        <span
                          className={`px-1.5 py-0.2 rounded border font-sans font-semibold ${getBadgeEscola(
                            m.escola
                          )}`}
                        >
                          {m.escola}
                        </span>

                        {m.custoPm && (
                          <span className="flex items-center gap-0.5 font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-800/40 px-1 rounded">
                            <Zap className="w-2.5 h-2.5" />
                            {m.custoPm}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Coluna 3: Card Detalhado do Grimório (lg:col-span-5) */}
          <div className="lg:col-span-5">
            {magiaAtiva ? (
              <div className="p-4 rounded-xl bg-stone-950/90 border border-amber-500/40 shadow-xl space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none" />

                {editando ? (
                  /* Modo Edição no Card de Detalhes */
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-serif uppercase tracking-widest text-amber-400 font-bold">
                        Editando Magia
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleRemoverMagia(magiaAtiva.id, e)}
                        className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 transition-colors"
                        title="Esquecer esta magia"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remover do Grimório
                      </button>
                    </div>

                    <div>
                      <label className="text-[10px] font-serif uppercase text-stone-400 font-bold block mb-1">
                        Nome da Magia
                      </label>
                      <input
                        type="text"
                        required
                        value={magiaAtiva.nome}
                        onChange={(e) =>
                          handleCampoChange(magiaAtiva.id, "nome", e.target.value)
                        }
                        className="w-full bg-stone-900 border border-amber-500/40 rounded px-2 py-1 text-xs text-amber-200 font-serif font-bold focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] font-serif uppercase text-stone-400 font-bold block mb-1">
                          Círculo
                        </label>
                        <select
                          value={magiaAtiva.circulo}
                          onChange={(e) =>
                            handleCampoChange(
                              magiaAtiva.id,
                              "circulo",
                              Number(e.target.value)
                            )
                          }
                          className="w-full bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs text-stone-200 focus:outline-none focus:border-amber-400"
                        >
                          {[1, 2, 3, 4, 5].map((c) => (
                            <option key={c} value={c}>
                              {c}º Círculo
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-serif uppercase text-stone-400 font-bold block mb-1">
                          Escola
                        </label>
                        <select
                          value={magiaAtiva.escola}
                          onChange={(e) =>
                            handleCampoChange(
                              magiaAtiva.id,
                              "escola",
                              e.target.value as EscolaMagiaT20
                            )
                          }
                          className="w-full bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs text-stone-200 focus:outline-none focus:border-amber-400"
                        >
                          {ESCOLAS_LISTA.map((esc) => (
                            <option key={esc} value={esc}>
                              {esc}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-serif uppercase text-stone-400 font-bold block mb-1">
                          Tipo
                        </label>
                        <select
                          value={magiaAtiva.tipo}
                          onChange={(e) =>
                            handleCampoChange(
                              magiaAtiva.id,
                              "tipo",
                              e.target.value as TipoMagiaT20
                            )
                          }
                          className="w-full bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs text-stone-200 focus:outline-none focus:border-amber-400"
                        >
                          <option value="Arcana">Arcana</option>
                          <option value="Divina">Divina</option>
                          <option value="Universal">Universal</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-serif uppercase text-stone-400 font-bold block mb-1">
                          Execução
                        </label>
                        <input
                          type="text"
                          value={magiaAtiva.execucao}
                          onChange={(e) =>
                            handleCampoChange(magiaAtiva.id, "execucao", e.target.value)
                          }
                          className="w-full bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs text-stone-200 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-serif uppercase text-stone-400 font-bold block mb-1">
                          Custo (PM)
                        </label>
                        <input
                          type="text"
                          value={magiaAtiva.custoPm}
                          onChange={(e) =>
                            handleCampoChange(magiaAtiva.id, "custoPm", e.target.value)
                          }
                          className="w-full bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-serif uppercase text-stone-400 font-bold block mb-1">
                          Alcance
                        </label>
                        <input
                          type="text"
                          value={magiaAtiva.alcance}
                          onChange={(e) =>
                            handleCampoChange(magiaAtiva.id, "alcance", e.target.value)
                          }
                          className="w-full bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs text-stone-200 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-serif uppercase text-stone-400 font-bold block mb-1">
                          Duração
                        </label>
                        <input
                          type="text"
                          value={magiaAtiva.duracao}
                          onChange={(e) =>
                            handleCampoChange(magiaAtiva.id, "duracao", e.target.value)
                          }
                          className="w-full bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs text-stone-200 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-serif uppercase text-stone-400 font-bold block mb-1">
                        Resistência
                      </label>
                      <input
                        type="text"
                        value={magiaAtiva.resistencia}
                        onChange={(e) =>
                          handleCampoChange(magiaAtiva.id, "resistencia", e.target.value)
                        }
                        className="w-full bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs text-stone-200 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-serif uppercase text-stone-400 font-bold block mb-1">
                        Descrição do Efeito
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={magiaAtiva.descricao}
                        onChange={(e) =>
                          handleCampoChange(magiaAtiva.id, "descricao", e.target.value)
                        }
                        className="w-full bg-stone-900 border border-stone-700 rounded p-2 text-xs font-serif text-stone-200 leading-relaxed resize-y focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                ) : (
                  /* Modo Leitura no Card de Detalhes */
                  <div className="space-y-3">
                    <div className="border-b border-stone-800 pb-2.5">
                      <h3 className="font-serif font-black text-base text-amber-200 drop-shadow">
                        {magiaAtiva.nome}
                      </h3>

                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span className="font-mono text-xs text-amber-300 bg-amber-950/60 border border-amber-600/50 px-2 py-0.5 rounded font-bold">
                          {magiaAtiva.circulo}º Círculo
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded text-xs font-bold border ${getBadgeEscola(
                            magiaAtiva.escola
                          )}`}
                        >
                          {magiaAtiva.escola}
                        </span>

                        <span className="text-stone-300 text-xs px-2 py-0.5 rounded bg-stone-900 border border-stone-800">
                          {magiaAtiva.tipo}
                        </span>

                        {magiaAtiva.custoPm && (
                          <span className="flex items-center gap-1 text-xs font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded ml-auto">
                            <Zap className="w-3 h-3" />
                            {magiaAtiva.custoPm}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Fita de Parâmetros de Lançamento */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-stone-900/60 p-2.5 rounded-lg border border-stone-800/80">
                      <div className="flex items-center gap-1.5 text-stone-300">
                        <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span><strong>Execução:</strong> {magiaAtiva.execucao}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-stone-300">
                        <Target className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span><strong>Alcance:</strong> {magiaAtiva.alcance}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-stone-300">
                        <Hourglass className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span><strong>Duração:</strong> {magiaAtiva.duracao}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-stone-300">
                        <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span><strong>Resistência:</strong> {magiaAtiva.resistencia}</span>
                      </div>
                    </div>

                    {/* Descrição Base */}
                    <div className="text-xs font-serif text-stone-300 leading-relaxed whitespace-pre-line max-h-48 overflow-y-auto pr-1">
                      {magiaAtiva.descricao}
                    </div>

                    {/* Aprimoramentos do Foundry */}
                    {magiaAtiva.aprimoramentos && magiaAtiva.aprimoramentos.length > 0 && (
                      <div className="border-t border-stone-800 pt-2.5 space-y-2">
                        <span className="text-[10px] font-serif uppercase tracking-wider text-amber-400 font-bold block">
                          Aprimoramentos de Mana
                        </span>
                        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                          {magiaAtiva.aprimoramentos.map((apr, idx) => (
                            <div
                              key={apr.id || idx}
                              className="text-xs bg-stone-900/40 border border-stone-800/80 p-2 rounded flex items-start gap-2"
                            >
                              {apr.custoPm && (
                                <span className="font-mono text-[10px] text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-1.5 py-0.5 rounded shrink-0">
                                  {apr.custoPm}
                                </span>
                              )}
                              <span className="font-serif text-stone-300 leading-snug">
                                {apr.descricao}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center bg-stone-950/40 border border-stone-800 rounded-xl text-stone-500 font-serif text-xs">
                Selecione uma magia na lista ao lado para ler os arcanos do grimório.
              </div>
            )}
          </div>
        </div>

        {/* Rodapé da Edição */}
        {editando && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-800">
            <button
              type="button"
              onClick={() => setModalAberto(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-dashed border-amber-500/50 bg-stone-900/50 hover:bg-stone-800 text-amber-300 font-serif text-xs font-semibold transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              Aprender Magia (Compêndio)
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
                    Inscrevendo Arcanos...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Salvar Grimório
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>

      {/* ========================================================= */}
      {/* MODAL DO COMPÊNDIO DE MAGIAS (PESQUISA + FILTROS DO JSON) */}
      {/* ========================================================= */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-3xl max-h-[90vh] bg-stone-950 border border-amber-500/50 rounded-xl shadow-2xl flex flex-col overflow-hidden">
            {/* Topo do Modal */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-amber-500/20 bg-stone-900/60">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <h3 className="font-serif font-bold text-sm text-stone-100">
                  Compêndio Arcano de Arton
                </h3>
                <span className="text-[10px] font-mono text-stone-400 bg-stone-900 border border-stone-800 px-1.5 py-0.5 rounded">
                  {catalogoFiltrado.length} disponíveis
                </span>
              </div>
              <button
                type="button"
                onClick={() => setModalAberto(false)}
                className="p-1 text-stone-400 hover:text-stone-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filtros de Busca */}
            <div className="p-3 border-b border-stone-800/80 bg-stone-900/30 space-y-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Pesquisar magia pelo nome ou descrição..."
                  value={buscaCompendio}
                  onChange={(e) => setBuscaCompendio(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                {/* Filtro de Círculo */}
                <div className="flex items-center gap-1 overflow-x-auto text-[11px]">
                  {CIRCULOS.map((c) => (
                    <button
                      key={c.valor}
                      type="button"
                      onClick={() => setCirculoCompendio(c.valor)}
                      className={`px-2 py-0.5 rounded border transition-colors ${
                        circuloCompendio === c.valor
                          ? "bg-amber-950/80 text-amber-300 border-amber-500/70"
                          : "bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-200"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                {/* Filtro de Escola */}
                <select
                  value={escolaCompendio}
                  onChange={(e) => setEscolaCompendio(e.target.value)}
                  className="bg-stone-900 border border-stone-700 text-stone-300 text-xs rounded px-2 py-1 focus:outline-none focus:border-amber-400"
                >
                  <option value="todas">Todas as Escolas</option>
                  {ESCOLAS_LISTA.map((esc) => (
                    <option key={esc} value={esc}>
                      {esc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Lista dos Cards do Compêndio */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {catalogoFiltrado.length === 0 ? (
                <div className="p-8 text-center text-stone-500 font-serif text-xs">
                  Nenhuma magia encontrada com esses termos.
                </div>
              ) : (
                catalogoFiltrado.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg bg-stone-900/60 border border-stone-800 hover:border-amber-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="font-serif text-xs text-amber-300">
                          {item.nome}
                        </strong>
                        <span className="font-mono text-[10px] text-stone-400 bg-stone-950 px-1.5 py-0.5 rounded border border-stone-800">
                          {item.circulo}º Círculo
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded border font-semibold ${getBadgeEscola(
                            item.escola
                          )}`}
                        >
                          {item.escola}
                        </span>
                        <span className="text-[10px] text-cyan-300 font-mono">
                          {item.custoPm}
                        </span>
                      </div>
                      <p className="text-[11px] font-serif text-stone-400 line-clamp-2">
                        {item.descricao}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAprenderDoCatalogo(item)}
                      className="shrink-0 flex items-center justify-center gap-1 px-3 py-1.5 rounded bg-amber-950/60 hover:bg-amber-900/80 border border-amber-600/50 text-amber-300 font-serif text-xs font-bold transition-all hover:scale-105"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-400" />
                      Aprender
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Rodapé do Modal com Opção de Magia Customizada */}
            <div className="p-3 border-t border-stone-800 bg-stone-900/40 flex items-center justify-between">
              <button
                type="button"
                onClick={handleCriarMagiaCustomizada}
                className="text-xs font-serif text-amber-400 hover:text-amber-300 underline font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Criar Magia Personalizada (Homebrew)
              </button>

              <button
                type="button"
                onClick={() => setModalAberto(false)}
                className="px-3 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 font-serif text-xs font-bold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}