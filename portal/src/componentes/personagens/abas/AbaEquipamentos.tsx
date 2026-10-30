"use client";

import React, { useState, useEffect, useMemo } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  PersonagemRPG,
  ItemEquipamento,
  CategoriaEquipamento,
  MoedasT20,
} from "@/tipos/personagem";
import { converterItemFoundryParaEquipamento } from "@/utilitarios/FormatadorEquipamentosT20";
import {
  Coins,
  Package,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Search,
  BookOpen,
  Shield,
  Sword,
  FlaskConical,
  Shirt,
  Check,
} from "lucide-react";

// Compêndio de Equipamentos (Foundry VTT)
import compendioEquipamentosRaw from "@/dados/equipamentos.json";

interface AbaEquipamentosProps {
  personagem: PersonagemRPG;
  ehDono: boolean;
  ehMestre: boolean;
  onAtualizacao: () => void;
}

const CATEGORIAS_EQUIPAMENTO: CategoriaEquipamento[] = [
  "Arma",
  "Armadura",
  "Escudo",
  "Acessório",
  "Consumível",
  "Geral",
];

export function AbaEquipamentos({
  personagem,
  ehDono,
  ehMestre,
  onAtualizacao,
}: AbaEquipamentosProps) {
  const podeEditar = ehDono || ehMestre;
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  // Inventário do Herói
  const [itens, setItens] = useState<ItemEquipamento[]>(
    personagem.equipamentos || []
  );

  // Cofre de Moedas (TL, TO, TP, TC)
  const [moedas, setMoedas] = useState<MoedasT20>({
    tl: personagem.moedas?.tl ?? 0,
    to: personagem.moedas?.to ?? 0,
    tp: personagem.moedas?.tp ?? 0,
    tc: personagem.moedas?.tc ?? 0,
  });

  // Filtro de categoria na aba
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("todas");

  // Item selecionado para inspeção
  const [itemSelecionadoId, setItemSelecionadoId] = useState<string | null>(
    personagem.equipamentos && personagem.equipamentos.length > 0
      ? personagem.equipamentos[0].id
      : null
  );

  // Estados do Modal do Compêndio
  const [modalAberto, setModalAberto] = useState(false);
  const [buscaCompendio, setBuscaCompendio] = useState("");
  const [categoriaCompendio, setCategoriaCompendio] = useState<string>("todas");

  useEffect(() => {
    const lista = personagem.equipamentos || [];
    setItens(lista);
    if (!itemSelecionadoId && lista.length > 0) {
      setItemSelecionadoId(lista[0].id);
    }
    setMoedas({
      tl: personagem.moedas?.tl ?? 0,
      to: personagem.moedas?.to ?? 0,
      tp: personagem.moedas?.tp ?? 0,
      tc: personagem.moedas?.tc ?? 0,
    });
  }, [personagem.equipamentos, personagem.moedas]);

  // Carrega compêndio estático
  const catalogoEquipamentos = useMemo<ItemEquipamento[]>(() => {
    try {
      const items = (compendioEquipamentosRaw as any)?.items || [];
      return items.map((raw: any) => converterItemFoundryParaEquipamento(raw));
    } catch (err) {
      console.error("Falha ao carregar compêndio de equipamentos:", err);
      return [];
    }
  }, []);

  const itensExibidos = useMemo(() => {
    const filtrados =
      categoriaFiltro === "todas"
        ? itens
        : itens.filter((i) => i.categoria === categoriaFiltro);

    return [...filtrados].sort((a, b) =>
      a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
    );
  }, [itens, categoriaFiltro]);

  const itemAtivo = itens.find((i) => i.id === itemSelecionadoId) || null;

  const catalogoFiltrado = useMemo(() => {
    const filtrados = catalogoEquipamentos.filter((i) => {
      const bateTexto =
        !buscaCompendio ||
        i.nome.toLowerCase().includes(buscaCompendio.toLowerCase()) ||
        i.descricao.toLowerCase().includes(buscaCompendio.toLowerCase());

      const bateCat =
        categoriaCompendio === "todas" || i.categoria === categoriaCompendio;

      return bateTexto && bateCat;
    });

    return filtrados.sort((a, b) =>
      a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
    );
  }, [catalogoEquipamentos, buscaCompendio, categoriaCompendio]);

  const handleItemChange = (
    id: string,
    campo: keyof ItemEquipamento,
    valor: any
  ) => {
    setItens((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [campo]: valor } : item))
    );
  };

  const handleMoedaChange = (tipo: keyof MoedasT20, valor: number) => {
    setMoedas((prev) => ({
      ...prev,
      [tipo]: Math.max(0, valor),
    }));
  };

  const handleAdicionarDoCatalogo = (itemCatalogo: ItemEquipamento) => {
    const novoItem: ItemEquipamento = {
      ...itemCatalogo,
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      quantidade: 1,
      equipado: false,
    };

    setItens((prev) => [...prev, novoItem]);
    setItemSelecionadoId(novoItem.id);
    setModalAberto(false);
  };

  const handleCriarItemCustomizado = () => {
    const novoItem: ItemEquipamento = {
      id: `custom_item_${Date.now()}`,
      nome: "Novo Equipamento",
      categoria: "Geral",
      quantidade: 1,
      precoTexto: "-",
      equipado: false,
      descricao: "Descreva os efeitos, materiais, melhorias e regras deste item...",
      ehCustomizado: true,
    };

    setItens((prev) => [...prev, novoItem]);
    setItemSelecionadoId(novoItem.id);
    setModalAberto(false);
  };

  const handleRemoverItem = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setItens((prev) => {
      const novaLista = prev.filter((i) => i.id !== id);
      if (itemSelecionadoId === id) {
        setItemSelecionadoId(novaLista.length > 0 ? novaLista[0].id : null);
      }
      return novaLista;
    });
  };

  const handleToggleEquipado = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setItens((prev) =>
      prev.map((i) => (i.id === id ? { ...i, equipado: !i.equipado } : i))
    );
  };

  const handleAlterarQuantidade = (id: string, delta: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setItens((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          const novaQtd = Math.max(1, (i.quantidade || 1) + delta);
          return { ...i, quantidade: novaQtd };
        }
        return i;
      })
    );
  };

  const handleCancelar = () => {
    const originalItens = personagem.equipamentos || [];
    setItens(originalItens);
    setItemSelecionadoId(originalItens.length > 0 ? originalItens[0].id : null);
    setMoedas({
      tl: personagem.moedas?.tl ?? 0,
      to: personagem.moedas?.to ?? 0,
      tp: personagem.moedas?.tp ?? 0,
      tc: personagem.moedas?.tc ?? 0,
    });
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
          equipamentos: itens,
          moedas,
          atualizadoEm: new Date().toISOString(),
        })
      );
      await updateDoc(refDoc, payloadLimpo);

      setMensagemSucesso("Inventário e riquezas guardados na mochila!");
      setEditando(false);
      onAtualizacao();
    } catch (err) {
      console.error("Erro ao salvar equipamentos:", err);
      setErro("Falha ao salvar inventário no Firestore.");
    } finally {
      setSalvando(false);
    }
  };

  const getIconeCategoria = (cat: CategoriaEquipamento) => {
    switch (cat) {
      case "Arma":
        return <Sword className="w-3.5 h-3.5 text-amber-400" />;
      case "Armadura":
        return <Shield className="w-3.5 h-3.5 text-blue-400" />;
      case "Escudo":
        return <Shield className="w-3.5 h-3.5 text-emerald-400" />;
      case "Acessório":
        return <Shirt className="w-3.5 h-3.5 text-purple-400" />;
      case "Consumível":
        return <FlaskConical className="w-3.5 h-3.5 text-red-400" />;
      default:
        return <Package className="w-3.5 h-3.5 text-stone-400" />;
    }
  };

  const getBadgeCategoria = (cat: CategoriaEquipamento) => {
    switch (cat) {
      case "Arma":
        return "bg-amber-950/60 text-amber-300 border-amber-600/50";
      case "Armadura":
        return "bg-blue-950/60 text-blue-300 border-blue-600/50";
      case "Escudo":
        return "bg-emerald-950/60 text-emerald-300 border-emerald-600/50";
      case "Acessório":
        return "bg-purple-950/60 text-purple-300 border-purple-600/50";
      case "Consumível":
        return "bg-red-950/60 text-red-300 border-red-600/50";
      default:
        return "bg-stone-800 text-stone-300 border-stone-700";
    }
  };

  return (
    <div className="space-y-4">
      {/* Topo da Aba */}
      <div className="t20-section-header">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-amber-400" />
          <h2 className="t20-section-title">
            Inventário & Equipamentos
          </h2>
          <span className="t20-badge-counter">
            Itens: {itens.length}
          </span>
        </div>

        {podeEditar && !editando && (
          <button
            type="button"
            onClick={() => setEditando(true)}
            className="t20-btn-secondary"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Editar Inventário
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

      {/* Painel Diegético de Riquezas (Cofre das 4 Moedas em Destaque) */}
      <div className="p-3.5 rounded-xl bg-linear-to-b from-stone-900/90 to-stone-950/95 border border-amber-500/30 shadow-xl space-y-2.5">
        <div className="flex items-center gap-2 text-amber-400/90 font-serif text-[11px] font-bold uppercase tracking-widest">
          <Coins className="w-4 h-4 text-amber-400" />
          <span>Cofre de Arton</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Platina (TL) - Azul Claro / Cyan Místico */}
          <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-stone-950/80 border border-cyan-500/30 hover:border-cyan-400/50 shadow-inner transition-colors">
            {editando ? (
              <input
                type="number"
                min={0}
                value={moedas.tl}
                onChange={(e) =>
                  handleMoedaChange("tl", parseInt(e.target.value, 10) || 0)
                }
                className="w-24 text-center font-mono font-black text-2xl bg-stone-900/90 border border-cyan-400/50 rounded py-0.5 text-cyan-200 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
            ) : (
              <span className="font-mono font-black text-2xl sm:text-3xl text-cyan-200 tracking-tight drop-shadow-[0_0_12px_rgba(34,211,238,0.25)]">
                {moedas.tl.toLocaleString("pt-BR")}
              </span>
            )}
            <span className="mt-1 font-serif text-[11px] uppercase tracking-widest font-bold text-cyan-300/80">
              Platina
            </span>
          </div>

          {/* Ouro (TO / T$) - Dourado Solar / Âmbar */}
          <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-stone-950/80 border border-amber-500/40 hover:border-amber-400/60 shadow-inner transition-colors">
            {editando ? (
              <input
                type="number"
                min={0}
                value={moedas.to}
                onChange={(e) =>
                  handleMoedaChange("to", parseInt(e.target.value, 10) || 0)
                }
                className="w-24 text-center font-mono font-black text-2xl bg-stone-900/90 border border-amber-400/50 rounded py-0.5 text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            ) : (
              <span className="font-mono font-black text-2xl sm:text-3xl text-amber-300 tracking-tight drop-shadow-[0_0_12px_rgba(251,191,36,0.3)]">
                {moedas.to.toLocaleString("pt-BR")}
              </span>
            )}
            <span className="mt-1 font-serif text-[11px] uppercase tracking-widest font-bold text-amber-400/80">
              Ouro
            </span>
          </div>

          {/* Prata (TP) - Prata Radiante / Ardósia Suave */}
          <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-stone-950/80 border border-slate-400/30 hover:border-slate-300/50 shadow-inner transition-colors">
            {editando ? (
              <input
                type="number"
                min={0}
                value={moedas.tp}
                onChange={(e) =>
                  handleMoedaChange("tp", parseInt(e.target.value, 10) || 0)
                }
                className="w-24 text-center font-mono font-black text-2xl bg-stone-900/90 border border-slate-300/40 rounded py-0.5 text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-300"
              />
            ) : (
              <span className="font-mono font-black text-2xl sm:text-3xl text-slate-100 tracking-tight drop-shadow-[0_0_10px_rgba(241,245,249,0.2)]">
                {moedas.tp.toLocaleString("pt-BR")}
              </span>
            )}
            <span className="mt-1 font-serif text-[11px] uppercase tracking-widest font-bold text-slate-300/80">
              Prata
            </span>
          </div>

          {/* Cobre (TC) - Cobre Forjado / Bronze Terroso */}
          <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-stone-950/80 border border-amber-700/40 hover:border-amber-600/60 shadow-inner transition-colors">
            {editando ? (
              <input
                type="number"
                min={0}
                value={moedas.tc}
                onChange={(e) =>
                  handleMoedaChange("tc", parseInt(e.target.value, 10) || 0)
                }
                className="w-24 text-center font-mono font-black text-2xl bg-stone-900/90 border border-orange-500/40 rounded py-0.5 text-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
            ) : (
              <span className="font-mono font-black text-2xl sm:text-3xl text-amber-600 tracking-tight drop-shadow-[0_0_10px_rgba(217,119,6,0.2)]">
                {moedas.tc.toLocaleString("pt-BR")}
              </span>
            )}
            <span className="mt-1 font-serif text-[11px] uppercase tracking-widest font-bold text-amber-600/90">
              Cobre
            </span>
          </div>
        </div>
      </div>

      {/* Filtro por Categoria */}
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
            ({itens.length})
          </span>
        </button>

        {CATEGORIAS_EQUIPAMENTO.map((cat) => {
          const selecionado = categoriaFiltro === cat;
          const qtd = itens.filter((i) => i.categoria === cat).length;

          return (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoriaFiltro(cat)}
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

      {/* Grid Principal (Itens + Card Detalhado) */}
      <form onSubmit={handleSalvar} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Coluna 1 & 2: Lista dos Itens em 2 colunas */}
          <div className="lg:col-span-7 space-y-2">
            {itensExibidos.length === 0 ? (
              <div className="p-8 text-center bg-stone-950/50 border border-dashed border-stone-800 rounded-lg">
                <Package className="w-8 h-8 text-stone-600 mx-auto mb-2" />
                <p className="font-serif text-xs text-stone-400">
                  {categoriaFiltro === "todas"
                    ? "Mochila vazia. Nenhum item guardado ainda."
                    : `Nenhum item na categoria "${categoriaFiltro}".`}
                </p>
                {editando && (
                  <button
                    type="button"
                    onClick={() => setModalAberto(true)}
                    className="mt-3 text-xs text-amber-400 underline font-semibold flex items-center gap-1 mx-auto"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Abrir Compêndio e Adicionar Equipamento &rarr;
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {itensExibidos.map((item) => {
                  const estaAtivo = item.id === itemSelecionadoId;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setItemSelecionadoId(item.id)}
                      className={`cursor-pointer group relative p-2.5 rounded-lg border transition-all text-left flex flex-col justify-between gap-1.5 ${
                        estaAtivo
                          ? "bg-amber-950/30 border-amber-500/70 shadow-md ring-1 ring-amber-500/30"
                          : "bg-stone-950/70 border-stone-800/80 hover:border-stone-700 hover:bg-stone-900/60"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          {getIconeCategoria(item.categoria)}
                          <span
                            className={`font-serif text-xs font-bold truncate ${
                              estaAtivo ? "text-amber-300" : "text-stone-200"
                            }`}
                          >
                            {item.nome}
                          </span>
                        </div>

                        <ChevronRight
                          className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                            estaAtivo
                              ? "text-amber-400 translate-x-0.5"
                              : "text-stone-600 group-hover:text-stone-400"
                          }`}
                        />
                      </div>

                      {/* Estatísticas Rápidas de Combate */}
                      {(item.dano || item.bonusDefesa !== undefined) && (
                        <div className="flex items-center gap-2 text-[10px] font-mono">
                          {item.dano && (
                            <span className="text-red-300 font-bold">
                              ⚔️ {item.dano} <span className="text-stone-500 font-normal">({item.critico || "x2"})</span>
                            </span>
                          )}
                          {item.bonusDefesa !== undefined && (
                            <span className="text-cyan-300 font-bold">
                              🛡️ +{item.bonusDefesa} {item.penalidadeArmadura !== undefined && item.penalidadeArmadura !== 0 && (
                                <span className="text-stone-500 font-normal">(Pen. {item.penalidadeArmadura})</span>
                              )}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Badges de Categoria, Equipado e Quantidade */}
                      <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                        <span
                          className={`px-1.5 py-0.2 rounded border font-semibold ${getBadgeCategoria(
                            item.categoria
                          )}`}
                        >
                          {item.categoria}
                        </span>

                        {/* Botão de Equipado (Toggle rápido) */}
                        <button
                          type="button"
                          onClick={(e) => handleToggleEquipado(item.id, e)}
                          className={`px-1.5 py-0.2 rounded border font-mono transition-colors flex items-center gap-0.5 ${
                            item.equipado
                              ? "bg-emerald-950/80 border-emerald-500/60 text-emerald-300 font-bold"
                              : "bg-stone-900 border-stone-800 text-stone-500 hover:text-stone-300"
                          }`}
                          title={item.equipado ? "Item empunhado/vestido" : "Item na mochila"}
                        >
                          <Check
                            className={`w-2.5 h-2.5 ${
                              item.equipado ? "stroke-3" : "opacity-0"
                            }`}
                          />
                          <span>{item.equipado ? "Equipado" : "Mochila"}</span>
                        </button>

                        {/* Quantidade */}
                        <div className="ml-auto flex items-center gap-1 font-mono text-stone-300 bg-stone-900 border border-stone-800 px-1.5 py-0.2 rounded">
                          {editando && (
                            <button
                              type="button"
                              onClick={(e) => handleAlterarQuantidade(item.id, -1, e)}
                              className="text-stone-400 hover:text-amber-400 px-0.5"
                            >
                              -
                            </button>
                          )}
                          <span>x{item.quantidade || 1}</span>
                          {editando && (
                            <button
                              type="button"
                              onClick={(e) => handleAlterarQuantidade(item.id, 1, e)}
                              className="text-stone-400 hover:text-amber-400 px-0.5"
                            >
                              +
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Coluna 3: Card Detalhado do Item Selecionado */}
          <div className="lg:col-span-5">
            {itemAtivo ? (
              <div className="p-4 rounded-xl bg-stone-950/90 border border-amber-500/40 shadow-xl space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none" />

                {editando ? (
                  /* Modo Edição no Card de Detalhes */
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-serif uppercase tracking-widest text-amber-400 font-bold">
                        Editando Equipamento
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleRemoverItem(itemAtivo.id, e)}
                        className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 transition-colors"
                        title="Descartar este item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remover
                      </button>
                    </div>

                    <div>
                      <label className="t20-field-label">
                        Nome do Item
                      </label>
                      <input
                        type="text"
                        required
                        value={itemAtivo.nome}
                        onChange={(e) =>
                          handleItemChange(itemAtivo.id, "nome", e.target.value)
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
                          value={itemAtivo.categoria}
                          onChange={(e) =>
                            handleItemChange(
                              itemAtivo.id,
                              "categoria",
                              e.target.value as CategoriaEquipamento
                            )
                          }
                          className="t20-field-select"
                        >
                          {CATEGORIAS_EQUIPAMENTO.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="t20-field-label">
                          Quantidade
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={itemAtivo.quantidade}
                          onChange={(e) =>
                            handleItemChange(
                              itemAtivo.id,
                              "quantidade",
                              parseInt(e.target.value, 10) || 1
                            )
                          }
                          className="t20-field-input font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="t20-field-label">
                          Preço Médio
                        </label>
                        <input
                          type="text"
                          value={itemAtivo.precoTexto || ""}
                          onChange={(e) =>
                            handleItemChange(
                              itemAtivo.id,
                              "precoTexto",
                              e.target.value
                            )
                          }
                          placeholder="Ex: T$ 100"
                          className="t20-field-input !text-amber-300 font-mono"
                        />
                      </div>

                      <div>
                        <label className="t20-field-label">
                          Empunhado / Vestido
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            handleItemChange(
                              itemAtivo.id,
                              "equipado",
                              !itemAtivo.equipado
                            )
                          }
                          className={`w-full py-1 px-2 rounded text-xs font-serif font-bold border transition-colors ${
                            itemAtivo.equipado
                              ? "bg-emerald-950/80 border-emerald-500/60 text-emerald-300"
                              : "bg-stone-900 border-stone-700 text-stone-400"
                          }`}
                        >
                          {itemAtivo.equipado ? "✓ Equipado" : "Na Mochila"}
                        </button>
                      </div>
                    </div>

                    {itemAtivo.categoria === "Arma" && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="t20-field-label">
                            Dano (Ex: 1d8)
                          </label>
                          <input
                            type="text"
                            value={itemAtivo.dano || ""}
                            onChange={(e) =>
                              handleItemChange(itemAtivo.id, "dano", e.target.value)
                            }
                            placeholder="Ex: 1d8"
                            className="t20-field-input !text-red-300 font-mono"
                          />
                        </div>
                        <div>
                          <label className="t20-field-label">
                            Crítico (Ex: 19/x2)
                          </label>
                          <input
                            type="text"
                            value={itemAtivo.critico || ""}
                            onChange={(e) =>
                              handleItemChange(itemAtivo.id, "critico", e.target.value)
                            }
                            placeholder="Ex: 19/x2"
                            className="t20-field-input !text-amber-300 font-mono"
                          />
                        </div>
                      </div>
                    )}

                    {(itemAtivo.categoria === "Armadura" || itemAtivo.categoria === "Escudo") && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="t20-field-label">
                            Bônus Defesa
                          </label>
                          <input
                            type="number"
                            value={itemAtivo.bonusDefesa ?? 0}
                            onChange={(e) =>
                              handleItemChange(
                                itemAtivo.id,
                                "bonusDefesa",
                                parseInt(e.target.value, 10) || 0
                              )
                            }
                            className="t20-field-input !text-cyan-300 font-mono"
                          />
                        </div>
                        <div>
                          <label className="t20-field-label">
                            Penalidade
                          </label>
                          <input
                            type="number"
                            value={itemAtivo.penalidadeArmadura ?? 0}
                            onChange={(e) =>
                              handleItemChange(
                                itemAtivo.id,
                                "penalidadeArmadura",
                                parseInt(e.target.value, 10) || 0
                              )
                            }
                            className="t20-field-input font-mono"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="t20-field-label">
                        Propriedades & Regras
                      </label>
                      <textarea
                        rows={5}
                        value={itemAtivo.descricao}
                        onChange={(e) =>
                          handleItemChange(
                            itemAtivo.id,
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
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-serif font-black text-base text-amber-200 drop-shadow">
                          {itemAtivo.nome}
                        </h3>
                        <span className="font-mono text-xs font-bold text-stone-300 bg-stone-900 border border-stone-800 px-2 py-0.5 rounded">
                          Qtd: {itemAtivo.quantidade}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getBadgeCategoria(
                            itemAtivo.categoria
                          )}`}
                        >
                          {itemAtivo.categoria}
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border font-mono ${
                            itemAtivo.equipado
                              ? "bg-emerald-950/80 border-emerald-500/60 text-emerald-300"
                              : "bg-stone-900 border-stone-800 text-stone-400"
                          }`}
                        >
                          {itemAtivo.equipado ? "Equipado no Corpo" : "Guardado na Mochila"}
                        </span>

                        {itemAtivo.precoTexto && itemAtivo.precoTexto !== "-" && (
                          <span className="font-mono text-[11px] text-amber-300 bg-amber-950/60 border border-amber-600/50 px-2 py-0.5 rounded ml-auto">
                            {itemAtivo.precoTexto}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bloco de Atributos de Combate / Proteção (T20) */}
                    {itemAtivo.categoria === "Arma" && (itemAtivo.dano || itemAtivo.critico || itemAtivo.alcance) && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2 bg-stone-900/80 border border-stone-800 rounded-lg text-center font-serif">
                        {itemAtivo.dano && (
                          <div>
                            <span className="text-[10px] uppercase text-stone-500 font-bold block">Dano</span>
                            <span className="text-xs font-mono font-bold text-red-300">
                              {itemAtivo.dano} {itemAtivo.tipoDano && <span className="text-[10px] text-stone-400 font-normal">({itemAtivo.tipoDano})</span>}
                            </span>
                          </div>
                        )}
                        {itemAtivo.critico && (
                          <div>
                            <span className="text-[10px] uppercase text-stone-500 font-bold block">Crítico</span>
                            <span className="text-xs font-mono font-bold text-amber-300">{itemAtivo.critico}</span>
                          </div>
                        )}
                        {itemAtivo.alcance && (
                          <div>
                            <span className="text-[10px] uppercase text-stone-500 font-bold block">Alcance</span>
                            <span className="text-xs text-stone-300">{itemAtivo.alcance}</span>
                          </div>
                        )}
                        {itemAtivo.empunhadura && (
                          <div>
                            <span className="text-[10px] uppercase text-stone-500 font-bold block">Uso</span>
                            <span className="text-xs text-stone-300">{itemAtivo.empunhadura}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {(itemAtivo.categoria === "Armadura" || itemAtivo.categoria === "Escudo") &&
                      (itemAtivo.bonusDefesa !== undefined || itemAtivo.penalidadeArmadura !== undefined || itemAtivo.espacos !== undefined) && (
                        <div className="grid grid-cols-3 gap-2 p-2 bg-stone-900/80 border border-stone-800 rounded-lg text-center font-serif">
                          {itemAtivo.bonusDefesa !== undefined && (
                            <div>
                              <span className="text-[10px] uppercase text-stone-500 font-bold block">Bônus Defesa</span>
                              <span className="text-xs font-mono font-bold text-cyan-300">+{itemAtivo.bonusDefesa}</span>
                            </div>
                          )}
                          {itemAtivo.penalidadeArmadura !== undefined && (
                            <div>
                              <span className="text-[10px] uppercase text-stone-500 font-bold block">Penalidade</span>
                              <span className={`text-xs font-mono font-bold ${itemAtivo.penalidadeArmadura < 0 ? "text-red-400" : "text-stone-300"}`}>
                                {itemAtivo.penalidadeArmadura}
                              </span>
                            </div>
                          )}
                          {itemAtivo.espacos !== undefined && (
                            <div>
                              <span className="text-[10px] uppercase text-stone-500 font-bold block">Espaços</span>
                              <span className="text-xs font-mono font-bold text-stone-300">{itemAtivo.espacos} esp.</span>
                            </div>
                          )}
                        </div>
                      )}

                    {itemAtivo.categoria !== "Arma" && itemAtivo.categoria !== "Armadura" && itemAtivo.categoria !== "Escudo" && itemAtivo.espacos !== undefined && (
                      <div className="flex items-center gap-2 p-1.5 bg-stone-900/60 border border-stone-800 rounded font-serif text-[11px] text-stone-400">
                        <span>Espaço ocupado:</span>
                        <strong className="font-mono text-stone-200">{itemAtivo.espacos} espaço(s)</strong>
                      </div>
                    )}

                    <div className="text-xs font-serif text-stone-300 leading-relaxed whitespace-pre-line max-h-72 overflow-y-auto pr-1">
                      {itemAtivo.descricao || (
                        <span className="italic text-stone-500">
                          Nenhuma descrição ou efeito adicional registrado.
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="t20-empty-card">
                Selecione um item da mochila para examinar suas propriedades.
              </div>
            )}
          </div>
        </div>

        {/* Rodapé da Edição */}
        {editando && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-800">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setModalAberto(true)}
                className="t20-btn-dashed"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                Adicionar do Compêndio
              </button>

              <button
                type="button"
                onClick={handleCriarItemCustomizado}
                className="t20-btn-secondary"
              >
                <Plus className="w-3.5 h-3.5" />
                Criar Item Personalizado
              </button>
            </div>

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
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Salvar Inventário
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>

      {/* ========================================================= */}
      {/* MODAL DO COMPÊNDIO DE EQUIPAMENTOS (FOUNDRY JSON)          */}
      {/* ========================================================= */}
      {modalAberto && (
        <div className="t20-modal-overlay animate-in fade-in">
          <div className="t20-modal-container">
            {/* Topo do Modal */}
            <div className="t20-modal-header">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <h3 className="font-serif font-bold text-sm text-stone-100">
                  Compêndio de Equipamentos de Arton
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
                  placeholder="Pesquisar arma, armadura, poção ou item geral..."
                  value={buscaCompendio}
                  onChange={(e) => setBuscaCompendio(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1 overflow-x-auto text-[11px]">
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
                {CATEGORIAS_EQUIPAMENTO.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoriaCompendio(cat)}
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
            </div>

            {/* Lista dos Cards do Compêndio */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {catalogoFiltrado.length === 0 ? (
                <div className="p-8 text-center text-stone-500 font-serif text-xs">
                  Nenhum equipamento encontrado com esses filtros.
                </div>
              ) : (
                catalogoFiltrado.map((item) => (
                  <div
                    key={item.id}
                    className="t20-compendio-card"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getIconeCategoria(item.categoria)}
                        <strong className="font-serif text-xs text-amber-300">
                          {item.nome}
                        </strong>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded border font-semibold ${getBadgeCategoria(
                            item.categoria
                          )}`}
                        >
                          {item.categoria}
                        </span>
                        {item.precoTexto && item.precoTexto !== "-" && (
                          <span className="text-[10px] font-mono text-amber-400">
                            {item.precoTexto}
                          </span>
                        )}
                      </div>

                      {/* Estatísticas resumidas de dano / armadura no Compêndio */}
                      {(item.dano || item.bonusDefesa !== undefined) && (
                        <div className="flex items-center gap-2.5 text-[10px] font-mono">
                          {item.dano && (
                            <span className="text-red-300 font-bold">
                              ⚔️ Dano: {item.dano} {item.tipoDano && `(${item.tipoDano})`} | Crítico: {item.critico || "x2"}
                            </span>
                          )}
                          {item.bonusDefesa !== undefined && (
                            <span className="text-cyan-300 font-bold">
                              🛡️ Defesa: +{item.bonusDefesa} {item.penalidadeArmadura !== undefined && `| Pen: ${item.penalidadeArmadura}`}
                            </span>
                          )}
                        </div>
                      )}

                      <p className="text-[11px] font-serif text-stone-400 line-clamp-2">
                        {item.descricao || "Item sem descrição detalhada."}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAdicionarDoCatalogo(item)}
                      className="shrink-0 flex items-center justify-center gap-1 px-3 py-1.5 rounded bg-amber-950/60 hover:bg-amber-900/80 border border-amber-600/50 text-amber-300 font-serif text-xs font-bold transition-all hover:scale-105"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-400" />
                      Adicionar
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Rodapé do Modal */}
            <div className="p-3 border-t border-stone-800 bg-stone-900/40 flex items-center justify-between">
              <button
                type="button"
                onClick={handleCriarItemCustomizado}
                className="text-xs font-serif text-amber-400 hover:text-amber-300 underline font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Criar Item Personalizado (Homebrew)
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