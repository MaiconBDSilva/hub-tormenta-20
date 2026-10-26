"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  ArrowLeft,
  Edit3,
  X,
  Shield,
  Sparkles,
  User,
  AlertCircle,
  Clock,
  Save,
  Loader2,
  CheckCircle2,
  Camera,
  Swords,
} from "lucide-react";
import {
  PersonagemRPG,
  BlocoProtegidoPersonagem,
  AtributosT20,
} from "@/tipos/personagem";
import styles from "./personagens.module.css";

interface CabecalhoFichaProps {
  personagem: PersonagemRPG;
  ehDono: boolean;
  ehMestre: boolean;
  onAtualizacao: () => void;
}

const LISTA_ATRIBUTOS: {
  chave: keyof AtributosT20;
  rotulo: string;
  nomeCompleto: string;
}[] = [
  { chave: "forca", rotulo: "FOR", nomeCompleto: "Força" },
  { chave: "destreza", rotulo: "DES", nomeCompleto: "Destreza" },
  { chave: "constituicao", rotulo: "CON", nomeCompleto: "Constituição" },
  { chave: "inteligencia", rotulo: "INT", nomeCompleto: "Inteligência" },
  { chave: "sabedoria", rotulo: "SAB", nomeCompleto: "Sabedoria" },
  { chave: "carisma", rotulo: "CAR", nomeCompleto: "Carisma" },
];

export function CabecalhoFicha({
  personagem,
  ehDono,
  ehMestre,
  onAtualizacao,
}: CabecalhoFichaProps) {
  const podeEditar = ehDono || ehMestre;
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const atributosAtuais: AtributosT20 = {
    forca: personagem.atributos?.forca ?? 0,
    destreza: personagem.atributos?.destreza ?? 0,
    constituicao: personagem.atributos?.constituicao ?? 0,
    inteligencia: personagem.atributos?.inteligencia ?? 0,
    sabedoria: personagem.atributos?.sabedoria ?? 0,
    carisma: personagem.atributos?.carisma ?? 0,
  };

  const [form, setForm] = useState({
    nome: personagem.nome,
    raca: personagem.raca,
    classe: personagem.classe,
    origem: personagem.origem,
    divindade: personagem.divindade,
    nivel: personagem.nivel,
    defesa: personagem.defesa,
    pvMaximo: personagem.pvMaximo,
    pmMaximo: personagem.pmMaximo,
    pvAtual: personagem.pvAtual,
    pmAtual: personagem.pmAtual,
    avatarUrl: personagem.avatarUrl || "",
    atributos: atributosAtuais,
  });

  useEffect(() => {
    setForm({
      nome: personagem.nome,
      raca: personagem.raca,
      classe: personagem.classe,
      origem: personagem.origem,
      divindade: personagem.divindade,
      nivel: personagem.nivel,
      defesa: personagem.defesa,
      pvMaximo: personagem.pvMaximo,
      pmMaximo: personagem.pmMaximo,
      pvAtual: personagem.pvAtual,
      pmAtual: personagem.pmAtual,
      avatarUrl: personagem.avatarUrl || "",
      atributos: {
        forca: personagem.atributos?.forca ?? 0,
        destreza: personagem.atributos?.destreza ?? 0,
        constituicao: personagem.atributos?.constituicao ?? 0,
        inteligencia: personagem.atributos?.inteligencia ?? 0,
        sabedoria: personagem.atributos?.sabedoria ?? 0,
        carisma: personagem.atributos?.carisma ?? 0,
      },
    });
  }, [personagem]);

  const handleChange = (campo: string, valor: string | number) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleAtributoChange = (chave: keyof AtributosT20, valor: number) => {
    setForm((prev) => ({
      ...prev,
      atributos: {
        ...prev.atributos,
        [chave]: valor,
      },
    }));
  };

  const handleCancelar = () => {
    setEditando(false);
    setErro(null);
    setMensagemSucesso(null);
    setForm({
      nome: personagem.nome,
      raca: personagem.raca,
      classe: personagem.classe,
      origem: personagem.origem,
      divindade: personagem.divindade,
      nivel: personagem.nivel,
      defesa: personagem.defesa,
      pvMaximo: personagem.pvMaximo,
      pmMaximo: personagem.pmMaximo,
      pvAtual: personagem.pvAtual,
      pmAtual: personagem.pmAtual,
      avatarUrl: personagem.avatarUrl || "",
      atributos: atributosAtuais,
    });
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

      // 1. Recursos Livres do Jogador
      updates.pvAtual = Number(form.pvAtual);
      updates.pmAtual = Number(form.pmAtual);
      updates.avatarUrl = form.avatarUrl.trim();

      // 2. Protegidos
      const protegidosModificados: Partial<BlocoProtegidoPersonagem> = {};

      if (form.nome !== personagem.nome)
        protegidosModificados.nome = form.nome.trim();
      if (form.raca !== personagem.raca)
        protegidosModificados.raca = form.raca.trim();
      if (form.classe !== personagem.classe)
        protegidosModificados.classe = form.classe.trim();
      if (form.origem !== personagem.origem)
        protegidosModificados.origem = form.origem.trim();
      if (form.divindade !== personagem.divindade)
        protegidosModificados.divindade = form.divindade.trim();
      if (Number(form.nivel) !== personagem.nivel)
        protegidosModificados.nivel = Number(form.nivel);
      if (Number(form.defesa) !== personagem.defesa)
        protegidosModificados.defesa = Number(form.defesa);
      if (Number(form.pvMaximo) !== personagem.pvMaximo)
        protegidosModificados.pvMaximo = Number(form.pvMaximo);
      if (Number(form.pmMaximo) !== personagem.pmMaximo)
        protegidosModificados.pmMaximo = Number(form.pmMaximo);

      const mudouAtributo = LISTA_ATRIBUTOS.some(
        (attr) => form.atributos[attr.chave] !== atributosAtuais[attr.chave],
      );
      if (mudouAtributo) {
        protegidosModificados.atributos = form.atributos;
      }

      const temAlteracaoProtegida =
        Object.keys(protegidosModificados).length > 0;

      if (ehMestre) {
        Object.assign(updates, protegidosModificados);
        updates.solicitacaoPendente = null;
      } else if (temAlteracaoProtegida) {
        updates.solicitacaoPendente = {
          status: "pendente",
          solicitadoEm: agoraIso,
          campos: protegidosModificados,
        };
      }

      const refDoc = doc(db, "personagens", personagem.id);
      await updateDoc(refDoc, updates);

      if (temAlteracaoProtegida && !ehMestre) {
        setMensagemSucesso(
          "Vitalidade salva! Modificações de estatísticas enviadas ao Mestre.",
        );
      } else {
        setMensagemSucesso("Herói de Arton atualizado com honra!");
      }

      setEditando(false);
      onAtualizacao();
    } catch (err) {
      console.error("Erro ao salvar cabeçalho:", err);
      setErro("Falha ao salvar as alterações do herói.");
    } finally {
      setSalvando(false);
    }
  };

  const formataModificador = (valor: number) => {
    return valor >= 0 ? `+${valor}` : `${valor}`;
  };

  const pvTotal = Math.max(1, form.pvMaximo || 1);
  const pvAtualNum = Math.max(0, form.pvAtual ?? pvTotal);
  const pctPv = Math.min(
    100,
    Math.max(0, Math.round((pvAtualNum / pvTotal) * 100)),
  );

  const pmTotal = Math.max(1, form.pmMaximo || 1);
  const pmAtualNum = Math.max(0, form.pmAtual ?? pmTotal);
  const pctPm = Math.min(
    100,
    Math.max(0, Math.round((pmAtualNum / pmTotal) * 100)),
  );

  const solicitacao = personagem.solicitacaoPendente;

  return (
    <div className="space-y-4">
      {/* Barra de Navegação e Ações de Topo */}
      <div className="flex items-center justify-between">
        <Link
          href="/personagens"
          className="t20-btn-ghost text-xs flex items-center gap-1.5 py-1.5 px-3"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>Voltar para a Vitrine</span>
        </Link>

        {podeEditar && !editando && (
          <button
            type="button"
            onClick={() => setEditando(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-amber-500/50 bg-stone-900/90 hover:bg-stone-800 text-amber-300 font-serif font-bold text-xs shadow-md transition-all hover:scale-[1.02]"
          >
            <Edit3 className="w-4 h-4 text-amber-400" />
            Editar Herói
          </button>
        )}
      </div>

      {/* Alertas */}
      {mensagemSucesso && (
        <div className="p-3 rounded-lg bg-emerald-950/70 border border-emerald-600/60 text-emerald-300 text-xs flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{mensagemSucesso}</span>
        </div>
      )}

      {erro && (
        <div className="p-3 rounded-lg bg-red-950/70 border border-red-600/60 text-red-300 text-xs flex items-center gap-2 shadow-lg">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{erro}</span>
        </div>
      )}

      {/* Banner de Moderação */}
      {solicitacao && !editando && (
        <>
          {solicitacao.status === "pendente" && (
            <div
              className={`${styles.bannerStatusAprovacao} ${styles.bannerPendente}`}
            >
              <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-serif text-amber-300">
                  Alterações sob Moderação do Mestre
                </strong>
                <p className="text-xs text-stone-300 mt-0.5">
                  Modificações enviadas em{" "}
                  {new Date(solicitacao.solicitadoEm).toLocaleDateString(
                    "pt-BR",
                  )}
                  . O Mestre revisará em breve.
                </p>
              </div>
            </div>
          )}

          {solicitacao.status === "recusada" && (
            <div
              className={`${styles.bannerStatusAprovacao} ${styles.bannerRecusado}`}
            >
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-serif text-red-200">
                  Pedido Recusado pelo Mestre
                </strong>
                <p className="text-xs text-red-300 mt-0.5">
                  Motivo: &quot;
                  {solicitacao.motivoRecusa ||
                    "Ajuste os valores e envie novamente."}
                  &quot;
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Moldura de Herói de Arton */}
      <div className={styles.fichaCabecalho}>
        {/* Cantoneiras Rúnicas */}
        <span className={styles.cantoneiraTopoEsq} />
        <span className={styles.cantoneiraTopoDir} />
        <span className={styles.cantoneiraBaseEsq} />
        <span className={styles.cantoneiraBaseDir} />

        <div className={ehDono ? "t20-stripe-gold" : "t20-stripe"} />

        <form onSubmit={handleSalvar}>
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Coluna 1: Avatar com Moldura de Retrato */}
            <div className="flex flex-col items-center gap-2 shrink-0 self-center md:self-stretch w-full md:w-56">
              <div
                className={`${styles.fichaAvatarBox} w-full flex-1 min-h-[16rem]`}
              >
                {(editando ? form.avatarUrl : personagem.avatarUrl) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={editando ? form.avatarUrl : personagem.avatarUrl}
                    alt={form.nome}
                    className={styles.avatarImagemFicha}
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-600 bg-stone-950">
                    <Shield className="w-12 h-12 stroke-[1.2] text-stone-700" />
                  </div>
                )}
              </div>

              {editando && (
                <div className="w-full mt-1">
                  <label className="text-[10px] uppercase font-serif text-amber-400 font-bold flex items-center gap-1 justify-center mb-1">
                    <Camera className="w-3 h-3" /> URL da Pintura
                  </label>
                  <input
                    type="url"
                    value={form.avatarUrl}
                    onChange={(e) => handleChange("avatarUrl", e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-stone-950 border border-stone-700 rounded px-2 py-1 text-[11px] text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}
            </div>

            {/* Coluna 2: Identidade, Atributos em Brasões e Medidores */}
            <div className="flex-1 min-w-0 w-full space-y-4">
              {/* Nome e Nível */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/20 pb-2.5">
                <div className="flex items-center gap-3 flex-1 min-w-[16rem]">
                  {editando ? (
                    <input
                      type="text"
                      required
                      value={form.nome}
                      onChange={(e) => handleChange("nome", e.target.value)}
                      placeholder="Nome do Herói"
                      className="font-serif font-bold text-2xl text-amber-200 bg-stone-950/70 border-b border-amber-500 px-2 py-0.5 rounded focus:outline-none w-full"
                    />
                  ) : (
                    <h1 className="font-serif font-black text-2xl sm:text-3xl text-stone-100 tracking-wide drop-shadow-md">
                      {personagem.nome}
                    </h1>
                  )}

                  {ehDono && !editando && (
                    <span className="t20-badge-dono shrink-0">
                      <Sparkles className="w-3 h-3" />
                      Seu Herói
                    </span>
                  )}
                </div>

                {/* Selo de Nível */}
                <div className="flex items-center gap-2 bg-linear-to-r from-stone-900 to-stone-950 px-3 py-1 rounded-md border border-amber-500/40 shadow-inner">
                  <span className="text-[11px] font-serif uppercase tracking-widest font-bold text-amber-400">
                    Nível
                  </span>
                  {editando ? (
                    <input
                      type="number"
                      min={1}
                      max={20}
                      required
                      value={form.nivel}
                      onChange={(e) =>
                        handleChange("nivel", parseInt(e.target.value, 10) || 1)
                      }
                      className="w-12 text-center font-serif font-bold text-amber-400 bg-stone-950 border border-amber-500/60 rounded px-1 py-0.5 text-sm focus:outline-none"
                    />
                  ) : (
                    <span className="font-serif font-black text-lg text-amber-300">
                      {personagem.nivel}
                    </span>
                  )}
                </div>
              </div>

              {/* Linhagem de Arton (Raça • Classe • Origem • Devoção) */}
              {editando ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="text-[10px] font-serif uppercase text-amber-300/80 font-bold block mb-0.5">
                      Raça
                    </label>
                    <input
                      type="text"
                      required
                      value={form.raca}
                      onChange={(e) => handleChange("raca", e.target.value)}
                      className="w-full bg-stone-950/80 border border-stone-800 rounded px-2 py-1 text-xs text-stone-200 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-serif uppercase text-amber-300/80 font-bold block mb-0.5">
                      Classe
                    </label>
                    <input
                      type="text"
                      required
                      value={form.classe}
                      onChange={(e) => handleChange("classe", e.target.value)}
                      className="w-full bg-stone-950/80 border border-stone-800 rounded px-2 py-1 text-xs text-stone-200 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-serif uppercase text-amber-300/80 font-bold block mb-0.5">
                      Origem
                    </label>
                    <input
                      type="text"
                      value={form.origem}
                      onChange={(e) => handleChange("origem", e.target.value)}
                      className="w-full bg-stone-950/80 border border-stone-800 rounded px-2 py-1 text-xs text-stone-200 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-serif uppercase text-amber-300/80 font-bold block mb-0.5">
                      Divindade
                    </label>
                    <input
                      type="text"
                      value={form.divindade}
                      onChange={(e) =>
                        handleChange("divindade", e.target.value)
                      }
                      className="w-full bg-stone-950/80 border border-stone-800 rounded px-2 py-1 text-xs text-stone-200 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-xs sm:text-sm font-serif text-stone-300 tracking-wide">
                  <span className="text-amber-400 font-semibold">
                    {personagem.raca}
                  </span>{" "}
                  •{" "}
                  <span className="text-amber-400 font-semibold">
                    {personagem.classe}
                  </span>{" "}
                  • {personagem.origem} •{" "}
                  <span className="italic text-stone-400">
                    Devoto de {personagem.divindade}
                  </span>
                </p>
              )}

              {/* Brasões dos 6 Atributos em Medalhões */}
              <div>
                <div className={styles.gradeAtributos}>
                  {LISTA_ATRIBUTOS.map(({ chave, rotulo, nomeCompleto }) => (
                    <div
                      key={chave}
                      title={nomeCompleto}
                      className={styles.brasaoAtributo}
                    >
                      <span className={styles.rotuloAtributo}>{rotulo}</span>
                      {editando ? (
                        <input
                          type="number"
                          value={form.atributos[chave]}
                          onChange={(e) =>
                            handleAtributoChange(
                              chave,
                              parseInt(e.target.value, 10) || 0,
                            )
                          }
                          className="w-full text-center font-serif font-black text-base text-stone-100 bg-stone-950 border border-amber-500/40 rounded py-0.5 focus:outline-none focus:border-amber-400"
                        />
                      ) : (
                        <span className={styles.valorModificador}>
                          {formataModificador(form.atributos[chave])}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Vitalidade (PV/PM) e Escudo de Defesa */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 pt-1 items-center">
                {/* Barras de Gema (PV e PM) */}
                <div className="sm:col-span-9 space-y-2.5">
                  {/* Pontos de Vida */}
                  <div>
                    <div className="flex justify-between items-center text-[11px] font-serif font-bold mb-1">
                      <span className="text-red-400 flex items-center gap-1 uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        Pontos de Vida (PV)
                      </span>
                      {editando ? (
                        <div className="flex items-center gap-1.5 text-xs font-mono">
                          <input
                            type="number"
                            value={form.pvAtual}
                            onChange={(e) =>
                              handleChange(
                                "pvAtual",
                                parseInt(e.target.value, 10) || 0,
                              )
                            }
                            className="w-12 text-center text-red-400 bg-stone-950 border border-stone-800 rounded px-1 py-0.5 focus:border-red-500 focus:outline-none"
                          />
                          <span className="text-stone-500">/</span>
                          <input
                            type="number"
                            min={1}
                            value={form.pvMaximo}
                            onChange={(e) =>
                              handleChange(
                                "pvMaximo",
                                parseInt(e.target.value, 10) || 1,
                              )
                            }
                            className="w-12 text-center text-stone-300 bg-stone-950 border border-stone-800 rounded px-1 py-0.5 focus:border-amber-500 focus:outline-none"
                          />
                        </div>
                      ) : (
                        <span className="text-stone-300 font-mono text-xs">
                          <strong className="text-red-400">
                            {form.pvAtual}
                          </strong>{" "}
                          / {form.pvMaximo}
                        </span>
                      )}
                    </div>
                    <div className={styles.trilhaVitalidade}>
                      <div
                        className={styles.barraPvGema}
                        style={{ width: `${pctPv}%` }}
                      />
                    </div>
                  </div>

                  {/* Pontos de Mana */}
                  <div>
                    <div className="flex justify-between items-center text-[11px] font-serif font-bold mb-1">
                      <span className="text-sky-400 flex items-center gap-1 uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                        Pontos de Mana (PM)
                      </span>
                      {editando ? (
                        <div className="flex items-center gap-1.5 text-xs font-mono">
                          <input
                            type="number"
                            value={form.pmAtual}
                            onChange={(e) =>
                              handleChange(
                                "pmAtual",
                                parseInt(e.target.value, 10) || 0,
                              )
                            }
                            className="w-12 text-center text-sky-400 bg-stone-950 border border-stone-800 rounded px-1 py-0.5 focus:border-sky-500 focus:outline-none"
                          />
                          <span className="text-stone-500">/</span>
                          <input
                            type="number"
                            min={0}
                            value={form.pmMaximo}
                            onChange={(e) =>
                              handleChange(
                                "pmMaximo",
                                parseInt(e.target.value, 10) || 0,
                              )
                            }
                            className="w-12 text-center text-stone-300 bg-stone-950 border border-stone-800 rounded px-1 py-0.5 focus:border-amber-500 focus:outline-none"
                          />
                        </div>
                      ) : (
                        <span className="text-stone-300 font-mono text-xs">
                          <strong className="text-sky-400">
                            {form.pmAtual}
                          </strong>{" "}
                          / {form.pmMaximo}
                        </span>
                      )}
                    </div>
                    <div className={styles.trilhaVitalidade}>
                      <div
                        className={styles.barraPmGema}
                        style={{ width: `${pctPm}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Brasão de Defesa */}
                <div className="sm:col-span-3 flex justify-center">
                  <div className={styles.escudoDefesa}>
                    <div className="flex items-center gap-1 text-amber-400 mb-0.5">
                      <Shield className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-serif uppercase tracking-widest font-black">
                        Defesa
                      </span>
                    </div>
                    {editando ? (
                      <input
                        type="number"
                        min={0}
                        value={form.defesa}
                        onChange={(e) =>
                          handleChange(
                            "defesa",
                            parseInt(e.target.value, 10) || 0,
                          )
                        }
                        className="w-16 text-center font-serif font-black text-xl text-amber-300 bg-stone-950 border border-amber-500/60 rounded px-1 py-0.5 focus:outline-none"
                      />
                    ) : (
                      <span className="font-serif font-black text-2xl text-amber-400">
                        {personagem.defesa}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Rodapé do Card */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500 border-t border-stone-800/80">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-500/80" />
                  Jogador:{" "}
                  <strong className="text-stone-300 font-serif">
                    {personagem.donoNome || "Sem Jogador Vinculado"}
                  </strong>
                </span>

                {editando && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCancelar}
                      disabled={salvando}
                      className="px-3 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 font-serif font-bold text-xs flex items-center gap-1 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      disabled={salvando}
                      className="t20-btn-primary px-3.5 py-1 text-xs flex items-center gap-1.5 font-serif font-bold"
                    >
                      {salvando ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Gravando...
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          Salvar Herói
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
