"use client";

import React, { useState, useEffect, useMemo } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  PersonagemRPG,
  ItemPoder,
  CategoriaPoder,
  TipoAcaoPoder,
} from "@/tipos/personagem";
import { converterItemFoundryParaPoder } from "@/utilitarios/FormatadorPoderesT20";
import {
  Sparkles,
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
} from "lucide-react";

// Importa o compêndio de poderes do Foundry
import compendioPoderesRaw from "@/dados/poderes.json";

interface AbaPoderesProps {
  personagem: PersonagemRPG;
  ehDono: boolean;
  ehMestre: boolean;
  onAtualizacao: () => void;
}

const CATEGORIAS_PODER: CategoriaPoder[] = [
  "Classe",
  "Raça",
  "Origem",
  "Geral",
  "Concedido",
  "Tormenta",
];

const CLASSES_T20: string[] = [
  "Arcanista",
  "Bárbaro",
  "Bardo",
  "Bucaneiro",
  "Caçador",
  "Cavaleiro",
  "Clérigo",
  "Druida",
  "Guerreiro",
  "Inventor",
  "Ladino",
  "Lutador",
  "Nobre",
  "Paladino",
];

const RACAS_T20: string[] = [
  "Anão",
  "Dahllan",
  "Elfo",
  "Goblin",
  "Golem",
  "Humano",
  "Hynne",
  "Kliren",
  "Lefou",
  "Medusa",
  "Minotauro",
  "Osteon",
  "Qareen",
  "Sereia/tritão",
  "Sílfide",
  "Suraggel",
  "Trog",
];

const TIPOS_ACAO: TipoAcaoPoder[] = [
  "Passiva",
  "Padrão",
  "Movimento",
  "Completa",
  "Livre",
  "Reação",
];

export function AbaPoderes({
  personagem,
  ehDono,
  ehMestre,
  onAtualizacao,
}: AbaPoderesProps) {
  const podeEditar = ehDono || ehMestre;
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  // Lista local de poderes do personagem
  const [poderes, setPoderes] = useState<ItemPoder[]>(personagem.poderes || []);

  // Filtro de categoria na aba
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("todas");

  // Poder inspecionado no card de detalhes
  const [poderSelecionadoId, setPoderSelecionadoId] = useState<string | null>(
    personagem.poderes && personagem.poderes.length > 0
      ? personagem.poderes[0].id
      : null
  );

  // Estados do Modal do Compêndio
  const [modalAberto, setModalAberto] = useState(false);
  const [buscaCompendio, setBuscaCompendio] = useState("");
  const [categoriaCompendio, setCategoriaCompendio] = useState<string>("todas");
  const [subcategoriaFiltro, setSubcategoriaFiltro] = useState<string>("todas");
  const [subcategoriaCompendio, setSubcategoriaCompendio] = useState<string>("todas");

  // Sincroniza se o personagem mudar externamente
  useEffect(() => {
    const lista = personagem.poderes || [];
    setPoderes(lista);
    if (!poderSelecionadoId && lista.length > 0) {
      setPoderSelecionadoId(lista[0].id);
    }
  }, [personagem.poderes]);

  // Carrega e normaliza os poderes do arquivo JSON na montagem
  const catalogoPoderes = useMemo<ItemPoder[]>(() => {
    try {
      const items = (compendioPoderesRaw as any)?.items || [];
      return items.map((rawItem: any) => converterItemFoundryParaPoder(rawItem));
    } catch (err) {
      console.error("Falha ao carregar compêndio de poderes:", err);
      return [];
    }
  }, []);

  // Poderes exibidos na lista principal da aba com filtro de categoria e ordenação alfabética
  const poderesExibidos = useMemo(() => {
    const filtrados = poderes.filter((p) => {
      if (categoriaFiltro !== "todas" && p.tipo !== categoriaFiltro) return false;
      if (categoriaFiltro === "Classe" && subcategoriaFiltro !== "todas") {
        return (p.subtipo || "").toLowerCase() === subcategoriaFiltro.toLowerCase();
      }
      if (categoriaFiltro === "Raça" && subcategoriaFiltro !== "todas") {
        return (p.subtipo || "").toLowerCase().includes(subcategoriaFiltro.toLowerCase());
      }
      return true;
    });

    return [...filtrados].sort((a, b) =>
      a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
    );
  }, [poderes, categoriaFiltro, subcategoriaFiltro]);

  const poderAtivo = poderes.find((p) => p.id === poderSelecionadoId) || null;

  // Filtra o catálogo dentro do modal com subcategoria e ordenação alfabética
  const catalogoFiltrado = useMemo(() => {
    const filtrados = catalogoPoderes.filter((p) => {
      const bateTexto =
        !buscaCompendio ||
        p.nome.toLowerCase().includes(buscaCompendio.toLowerCase()) ||
        p.descricao.toLowerCase().includes(buscaCompendio.toLowerCase()) ||
        Boolean(p.subtipo?.toLowerCase().includes(buscaCompendio.toLowerCase()));

      const bateCategoria =
        categoriaCompendio === "todas" || p.tipo === categoriaCompendio;

      if (!bateTexto || !bateCategoria) return false;

      if (categoriaCompendio === "Classe" && subcategoriaCompendio !== "todas") {
        return (p.subtipo || "").toLowerCase() === subcategoriaCompendio.toLowerCase();
      }
      if (categoriaCompendio === "Raça" && subcategoriaCompendio !== "todas") {
        return (p.subtipo || "").toLowerCase().includes(subcategoriaCompendio.toLowerCase());
      }

      return true;
    });

    return filtrados.sort((a, b) =>
      a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
    );
  }, [catalogoPoderes, buscaCompendio, categoriaCompendio, subcategoriaCompendio]);

  const handleCampoChange = (
    id: string,
    campo: keyof ItemPoder,
    valor: string
  ) => {
    setPoderes((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [campo]: valor } : item))
    );
  };

  // Adiciona poder a partir do Compêndio
  const handleAprenderDoCatalogo = (poderCatalogo: ItemPoder) => {
    const novoPoder: ItemPoder = {
      ...poderCatalogo,
      id: `poder_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };

    setPoderes((prev) => [...prev, novoPoder]);
    setPoderSelecionadoId(novoPoder.id);
    setModalAberto(false);
  };

  // Cria um poder caseiro (homebrew) do zero
  const handleCriarPoderCustomizado = () => {
    const novoPoder: ItemPoder = {
      id: `poder_custom_${Date.now()}`,
      nome: "Novo Poder",
      tipo: "Classe",
      tipoAcao: "Passiva",
      custoPm: "-",
      descricao: "Descreva os efeitos mecânicos e narrativos deste poder...",
      ehCustomizado: true,
    };

    setPoderes((prev) => [...prev, novoPoder]);
    setPoderSelecionadoId(novoPoder.id);
    setModalAberto(false);
  };

  const handleRemoverPoder = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPoderes((prev) => {
      const novaLista = prev.filter((item) => item.id !== id);
      if (poderSelecionadoId === id) {
        setPoderSelecionadoId(novaLista.length > 0 ? novaLista[0].id : null);
      }
      return novaLista;
    });
  };

  const handleCancelar = () => {
    const listaOriginal = personagem.poderes || [];
    setPoderes(listaOriginal);
    setPoderSelecionadoId(listaOriginal.length > 0 ? listaOriginal[0].id : null);
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
          poderes: poderes,
          atualizadoEm: new Date().toISOString(),
        })
      );
      await updateDoc(refDoc, payloadLimpo);

      setMensagemSucesso("Poderes e habilidades gravados no tomo!");
      setEditando(false);
      onAtualizacao();
    } catch (err) {
      console.error("Erro ao salvar poderes:", err);
      setErro("Falha ao salvar poderes no Firestore.");
    } finally {
      setSalvando(false);
    }
  };

  const getBadgeCategoria = (tipo: CategoriaPoder) => {
    switch (tipo) {
      case "Classe":
        return "bg-amber-950/60 text-amber-300 border-amber-600/50";
      case "Raça":
        return "bg-emerald-950/60 text-emerald-300 border-emerald-600/50";
      case "Origem":
        return "bg-stone-800 text-stone-300 border-stone-600";
      case "Geral":
        return "bg-blue-950/60 text-blue-300 border-blue-600/50";
      case "Concedido":
        return "bg-purple-950/60 text-purple-300 border-purple-600/50";
      case "Tormenta":
        return "bg-red-950/80 text-red-300 border-red-600 shadow-[0_0_8px_rgba(220,38,38,0.4)]";
      default:
        return "bg-stone-800 text-stone-300 border-stone-700";
    }
  };

  return (
    <div className="space-y-4">
      {/* Topo da Aba */}
      <div className="t20-section-header">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h2 className="t20-section-title">
            Poderes & Habilidades
          </h2>
          <span className="t20-badge-counter">
            Total: {poderes.length}
          </span>
        </div>

        {podeEditar && !editando && (
          <button
            type="button"
            onClick={() => setEditando(true)}
            className="t20-btn-secondary"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Editar Habilidades
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

      {/* Filtro Rápido por Categoria */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setCategoriaFiltro("todas")}
          className={`t20-filter-pill ${
            categoriaFiltro === "todas" ? "t20-filter-pill-active" : ""
          }`}
        >
          <span>Todos</span>
          <span className="text-[10px] font-mono text-stone-500 font-normal">
            ({poderes.length})
          </span>
        </button>

        {CATEGORIAS_PODER.map((cat) => {
          const selecionado = categoriaFiltro === cat;
          const qtd = poderes.filter((p) => p.tipo === cat).length;

          return (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setCategoriaFiltro(cat);
                setSubcategoriaFiltro("todas");
              }}
              className={`t20-filter-pill ${
                selecionado ? "t20-filter-pill-active" : ""
              }`}
            >
              <span>{cat}</span>
              <span className="text-[10px] font-mono text-stone-500 font-normal">
                ({qtd})
              </span>
            </button>
          );
        })}
      </div>

      {/* Seletor secundário para Classe ou Raça na aba */}
      {categoriaFiltro === "Classe" && (
        <div className="flex items-center gap-2 pt-1 animate-in fade-in">
          <label className="text-xs font-serif text-stone-400 font-semibold">
            Classe:
          </label>
          <select
            value={subcategoriaFiltro}
            onChange={(e) => setSubcategoriaFiltro(e.target.value)}
            className="bg-stone-900 border border-amber-500/40 text-amber-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-amber-400"
          >
            <option value="todas">Todas as Classes</option>
            {CLASSES_T20.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>
      )}

      {categoriaFiltro === "Raça" && (
        <div className="flex items-center gap-2 pt-1 animate-in fade-in">
          <label className="text-xs font-serif text-stone-400 font-semibold">
            Raça:
          </label>
          <select
            value={subcategoriaFiltro}
            onChange={(e) => setSubcategoriaFiltro(e.target.value)}
            className="bg-stone-900 border border-amber-500/40 text-amber-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-amber-400"
          >
            <option value="todas">Todas as Raças</option>
            {RACAS_T20.map((rc) => (
              <option key={rc} value={rc}>
                {rc}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Formulário / Grid Principal */}
      <form onSubmit={handleSalvar} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Coluna 1 & 2: Lista dos poderes em duas colunas (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-2">
            {poderesExibidos.length === 0 ? (
              <div className="p-8 text-center bg-stone-950/50 border border-dashed border-stone-800 rounded-lg">
                <Sparkles className="w-8 h-8 text-stone-600 mx-auto mb-2" />
                <p className="font-serif text-xs text-stone-400">
                  {categoriaFiltro === "todas"
                    ? "Nenhum poder ou habilidade cadastrado ainda."
                    : `Nenhum poder da categoria "${categoriaFiltro}" encontrado.`}
                </p>
                {editando && (
                  <button
                    type="button"
                    onClick={() => setModalAberto(true)}
                    className="mt-3 text-xs text-amber-400 underline font-semibold flex items-center gap-1 mx-auto"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Abrir Compêndio e Aprender Poder &rarr;
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {poderesExibidos.map((p) => {
                  const estaAtivo = p.id === poderSelecionadoId;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setPoderSelecionadoId(p.id)}
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
                          {p.nome || "Sem Nome"}
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
                        <span
                          className={`px-1.5 py-0.2 rounded border font-sans font-semibold ${getBadgeCategoria(
                            p.tipo
                          )}`}
                        >
                          {p.tipo}
                        </span>

                        {p.subtipo && (
                          <span className="text-stone-400 bg-stone-900/80 border border-stone-800 px-1 rounded truncate max-w-24">
                            {p.subtipo}
                          </span>
                        )}

                        {p.custoPm && p.custoPm !== "-" && (
                          <span className="flex items-center gap-0.5 font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-800/40 px-1 rounded">
                            <Zap className="w-2.5 h-2.5" />
                            {p.custoPm}
                          </span>
                        )}

                        <span className="text-stone-500 font-sans ml-auto">
                          {p.tipoAcao}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Coluna 3: Card Detalhado do Poder Selecionado (lg:col-span-5) */}
          <div className="lg:col-span-5">
            {poderAtivo ? (
              <div className="p-4 rounded-xl bg-stone-950/90 border border-amber-500/40 shadow-xl space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none" />

                {editando ? (
                  /* Modo Edição no Card de Detalhes */
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-serif uppercase tracking-widest text-amber-400 font-bold">
                        Editando Poder
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleRemoverPoder(poderAtivo.id, e)}
                        className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 transition-colors"
                        title="Excluir este poder"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remover
                      </button>
                    </div>

                    <div>
                      <label className="t20-field-label">
                        Nome do Poder
                      </label>
                      <input
                        type="text"
                        required
                        value={poderAtivo.nome}
                        onChange={(e) =>
                          handleCampoChange(poderAtivo.id, "nome", e.target.value)
                        }
                        className="t20-field-input !border-amber-500/40 !text-amber-200 font-serif font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="t20-field-label">
                          Categoria
                        </label>
                        <select
                          value={poderAtivo.tipo}
                          onChange={(e) =>
                            handleCampoChange(
                              poderAtivo.id,
                              "tipo",
                              e.target.value as CategoriaPoder
                            )
                          }
                          className="t20-field-select"
                        >
                          {CATEGORIAS_PODER.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="t20-field-label">
                          Subtipo (Opcional)
                        </label>
                        <input
                          type="text"
                          value={poderAtivo.subtipo || ""}
                          onChange={(e) =>
                            handleCampoChange(
                              poderAtivo.id,
                              "subtipo",
                              e.target.value
                            )
                          }
                          placeholder="Ex: Inventor, Combate..."
                          className="t20-field-input"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="t20-field-label">
                          Tipo de Ação
                        </label>
                        <select
                          value={poderAtivo.tipoAcao}
                          onChange={(e) =>
                            handleCampoChange(
                              poderAtivo.id,
                              "tipoAcao",
                              e.target.value as TipoAcaoPoder
                            )
                          }
                          className="t20-field-select"
                        >
                          {TIPOS_ACAO.map((acao) => (
                            <option key={acao} value={acao}>
                              {acao}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="t20-field-label">
                          Custo de Mana (PM)
                        </label>
                        <input
                          type="text"
                          value={poderAtivo.custoPm}
                          onChange={(e) =>
                            handleCampoChange(
                              poderAtivo.id,
                              "custoPm",
                              e.target.value
                            )
                          }
                          placeholder="Ex: 1 PM, 2 PM, ou -"
                          className="t20-field-input !text-cyan-300 font-mono focus:!border-cyan-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="t20-field-label">
                        Descrição do Efeito
                      </label>
                      <textarea
                        rows={5}
                        required
                        value={poderAtivo.descricao}
                        onChange={(e) =>
                          handleCampoChange(
                            poderAtivo.id,
                            "descricao",
                            e.target.value
                          )
                        }
                        className="t20-field-input leading-relaxed resize-y font-serif"
                      />
                    </div>
                  </div>
                ) : (
                  /* Modo Leitura no Card de Detalhes */
                  <div className="space-y-3">
                    <div className="border-b border-stone-800 pb-2">
                      <h3 className="font-serif font-black text-base text-amber-200 drop-shadow">
                        {poderAtivo.nome}
                      </h3>

                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getBadgeCategoria(
                            poderAtivo.tipo
                          )}`}
                        >
                          {poderAtivo.tipo}
                        </span>

                        {poderAtivo.subtipo && (
                          <span className="text-stone-300 text-[10px] px-2 py-0.5 rounded bg-stone-900 border border-stone-800">
                            {poderAtivo.subtipo}
                          </span>
                        )}

                        <span className="flex items-center gap-1 text-[11px] font-sans text-stone-300 bg-stone-900 px-2 py-0.5 rounded border border-stone-800">
                          <Clock className="w-3 h-3 text-amber-400" />
                          {poderAtivo.tipoAcao}
                        </span>

                        {poderAtivo.custoPm && poderAtivo.custoPm !== "-" && (
                          <span className="flex items-center gap-1 text-[11px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded ml-auto">
                            <Zap className="w-3 h-3" />
                            {poderAtivo.custoPm}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-xs font-serif text-stone-300 leading-relaxed whitespace-pre-line max-h-72 overflow-y-auto pr-1">
                      {poderAtivo.descricao}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="t20-empty-card">
                Selecione um poder ao lado para inspecionar seus segredos.
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
              className="t20-btn-dashed"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              Aprender Poder (Compêndio)
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
                className="t20-btn-primary !py-1.5 !px-4 !text-xs"
              >
                {salvando ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Gravando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Salvar Poderes
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>

      {/* ========================================================= */}
      {/* MODAL DO COMPÊNDIO DE PODERES (PESQUISA + FILTROS DO JSON) */}
      {/* ========================================================= */}
      {modalAberto && (
        <div className="t20-modal-overlay animate-in fade-in">
          <div className="t20-modal-container">
            {/* Topo do Modal */}
            <div className="t20-modal-header">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <h3 className="font-serif font-bold text-sm text-stone-100">
                  Compêndio de Poderes de Arton
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
                  placeholder="Pesquisar poder pelo nome, subtipo ou descrição..."
                  value={buscaCompendio}
                  onChange={(e) => setBuscaCompendio(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                {/* Filtro por Categoria */}
                <div className="flex items-center gap-1 overflow-x-auto text-[11px]">
                  <button
                    type="button"
                    onClick={() => setCategoriaCompendio("todas")}
                    className={`px-2 py-0.5 rounded border transition-colors ${
                      categoriaCompendio === "todas"
                        ? "bg-amber-950/80 text-amber-300 border-amber-500/70"
                        : "bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-200"
                    }`}
                  >
                    Todas as Categorias
                  </button>
                  {CATEGORIAS_PODER.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setCategoriaCompendio(cat);
                        setSubcategoriaCompendio("todas");
                      }}
                      className={`px-2 py-0.5 rounded border transition-colors ${
                        categoriaCompendio === cat
                          ? "bg-amber-950/80 text-amber-300 border-amber-500/70"
                          : "bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Subfiltro no Modal para Classe ou Raça */}
                {categoriaCompendio === "Classe" && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-serif text-stone-400">Classe:</span>
                    <select
                      value={subcategoriaCompendio}
                      onChange={(e) => setSubcategoriaCompendio(e.target.value)}
                      className="bg-stone-900 border border-stone-700 text-amber-300 text-xs rounded px-2 py-1 focus:outline-none focus:border-amber-400"
                    >
                      <option value="todas">Todas as Classes</option>
                      {CLASSES_T20.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {categoriaCompendio === "Raça" && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-serif text-stone-400">Raça:</span>
                    <select
                      value={subcategoriaCompendio}
                      onChange={(e) => setSubcategoriaCompendio(e.target.value)}
                      className="bg-stone-900 border border-stone-700 text-amber-300 text-xs rounded px-2 py-1 focus:outline-none focus:border-amber-400"
                    >
                      <option value="todas">Todas as Raças</option>
                      {RACAS_T20.map((rc) => (
                        <option key={rc} value={rc}>
                          {rc}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Lista dos Cards do Compêndio */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {catalogoFiltrado.length === 0 ? (
                <div className="p-8 text-center text-stone-500 font-serif text-xs">
                  Nenhum poder encontrado com esses termos.
                </div>
              ) : (
                catalogoFiltrado.map((item) => (
                  <div
                    key={item.id}
                    className="t20-compendio-card"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="font-serif text-xs text-amber-300">
                          {item.nome}
                        </strong>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded border font-semibold ${getBadgeCategoria(
                            item.tipo
                          )}`}
                        >
                          {item.tipo}
                        </span>
                        {item.subtipo && (
                          <span className="text-[10px] text-stone-400 bg-stone-950 px-1.5 py-0.5 rounded border border-stone-800">
                            {item.subtipo}
                          </span>
                        )}
                        <span className="text-[10px] text-stone-400 font-sans">
                          {item.tipoAcao}
                        </span>
                        {item.custoPm && item.custoPm !== "-" && (
                          <span className="text-[10px] text-cyan-300 font-mono">
                            {item.custoPm}
                          </span>
                        )}
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

            {/* Rodapé do Modal com Opção de Poder Customizado */}
            <div className="p-3 border-t border-stone-800 bg-stone-900/40 flex items-center justify-between">
              <button
                type="button"
                onClick={handleCriarPoderCustomizado}
                className="text-xs font-serif text-amber-400 hover:text-amber-300 underline font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Criar Poder Personalizado (Homebrew)
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