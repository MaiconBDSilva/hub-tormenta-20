"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Users, UserCheck, Shield, Loader2, AlertCircle, Save, CheckCircle2 } from "lucide-react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DadosUsuario } from "@/contextos/AuthContext";
import { PersonagemRPG } from "@/tipos/personagem";

export function GerenciadorUsuarios() {
  const [usuarios, setUsuarios] = useState<DadosUsuario[]>([]);
  const [personagens, setPersonagens] = useState<PersonagemRPG[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvandoUid, setSalvandoUid] = useState<string | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  // Mapa local para controle das seleções do select: { [uid]: personagemId }
  const [vinculos, setVinculos] = useState<Record<string, string>>({});

  const carregarDados = useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);

      // 1. Carrega todos os usuários
      const snapUsuarios = await getDocs(collection(db, "usuarios"));
      const listaUsuarios: DadosUsuario[] = [];
      const mapaVinculos: Record<string, string> = {};

      snapUsuarios.forEach((d) => {
        const u = d.data() as DadosUsuario;
        listaUsuarios.push(u);
        mapaVinculos[u.uid] = u.personagemId || "";
      });

      // 2. Carrega todos os personagens
      const snapPersonagens = await getDocs(collection(db, "personagens"));
      const listaPersonagens: PersonagemRPG[] = [];

      snapPersonagens.forEach((d) => {
        listaPersonagens.push({
          id: d.id,
          ...(d.data() as Omit<PersonagemRPG, "id">),
        });
      });

      setUsuarios(listaUsuarios);
      setPersonagens(listaPersonagens);
      setVinculos(mapaVinculos);
    } catch (err) {
      console.error("Erro ao carregar usuários e personagens:", err);
      setErro("Falha ao consultar jogadores no Firestore.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const handleSelectChange = (uid: string, novoPersonagemId: string) => {
    setVinculos((prev) => ({ ...prev, [uid]: novoPersonagemId }));
  };

  // Salva o vínculo bidirecional
  const handleSalvarVinculo = async (usuario: DadosUsuario) => {
    const novoPersonagemId = vinculos[usuario.uid] || "";
    const personagemIdAntigo = usuario.personagemId || "";

    // Se não houve alteração, evita requisição
    if (novoPersonagemId === personagemIdAntigo) return;

    setSalvandoUid(usuario.uid);
    setMensagemSucesso(null);
    setErro(null);

    try {
      // 1. Atualiza o documento do usuário
      const userRef = doc(db, "usuarios", usuario.uid);
      await updateDoc(userRef, {
        personagemId: novoPersonagemId ? novoPersonagemId : null,
      });

      // 2. Se tinha personagem antigo e mudou, desvincula a ficha antiga
      if (personagemIdAntigo && personagemIdAntigo !== novoPersonagemId) {
        const persAntigoRef = doc(db, "personagens", personagemIdAntigo);
        await updateDoc(persAntigoRef, {
          donoUid: null,
          donoNome: null,
          atualizadoEm: new Date().toISOString(),
        });
      }

      // 3. Se selecionou uma nova ficha, atribui este usuário como dono
      if (novoPersonagemId) {
        const persNovoRef = doc(db, "personagens", novoPersonagemId);
        await updateDoc(persNovoRef, {
          donoUid: usuario.uid,
          donoNome: usuario.nome,
          atualizadoEm: new Date().toISOString(),
        });
      }

      // Atualiza estado local do usuário
      setUsuarios((prev) =>
        prev.map((u) =>
          u.uid === usuario.uid
            ? { ...u, personagemId: novoPersonagemId || null }
            : u
        )
      );

      setMensagemSucesso(`Vínculo de "${usuario.nome}" atualizado com sucesso!`);
    } catch (err) {
      console.error("Erro ao vincular personagem ao jogador:", err);
      setErro("Falha ao salvar vínculo no Firestore.");
    } finally {
      setSalvandoUid(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Topo Explicativo */}
      <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800">
        <h2 className="font-serif font-bold text-lg text-amber-400 flex items-center gap-2">
          <Users className="w-5 h-5 text-amber-500" />
          Vínculo de Jogadores & Heróis
        </h2>
        <p className="text-xs text-stone-400 mt-1">
          Associe cada jogador cadastrado à sua respectiva ficha de personagem principal.
          Este vínculo definirá a identidade do usuário na Agenda, Diários e visualizações da campanha.
        </p>
      </div>

      {mensagemSucesso && (
        <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{mensagemSucesso}</span>
        </div>
      )}

      {erro && (
        <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{erro}</span>
        </div>
      )}

      {carregando ? (
        <div className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-2" />
          <p className="text-xs font-serif text-stone-400 uppercase tracking-wider">
            Consultando registros dos jogadores...
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {usuarios.length === 0 ? (
            <div className="p-8 text-center rounded-lg bg-stone-900/40 border border-dashed border-stone-800 text-stone-400 text-xs">
              Nenhum usuário cadastrado até o momento.
            </div>
          ) : (
            usuarios.map((usuario) => {
              const valorSelecionado = vinculos[usuario.uid] ?? "";
              const modificado = valorSelecionado !== (usuario.personagemId || "");
              const isSalvando = salvandoUid === usuario.uid;

              return (
                <div
                  key={usuario.uid}
                  className="t20-card p-4 border border-stone-800 bg-stone-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  {/* Info do Usuário */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-stone-950 border border-stone-800 overflow-hidden shrink-0">
                      {usuario.fotoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={usuario.fotoUrl}
                          alt={usuario.nome}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-serif text-stone-400 font-bold">
                          {usuario.nome.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-stone-200 text-sm">
                          {usuario.nome}
                        </span>
                        {usuario.role === "mestre" && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-600/20 text-red-400 border border-red-500/30 uppercase">
                            Mestre
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-400">{usuario.email}</p>
                    </div>
                  </div>

                  {/* Seleção do Personagem Principal */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                      <select
                        value={valorSelecionado}
                        onChange={(e) =>
                          handleSelectChange(usuario.uid, e.target.value)
                        }
                        className="t20-input text-xs py-2 pr-8 appearance-none cursor-pointer"
                      >
                        <option value="" className="bg-stone-950 text-stone-400">
                          -- Sem Personagem Atribuído --
                        </option>
                        {personagens.map((p) => (
                          <option
                            key={p.id}
                            value={p.id}
                            className="bg-stone-950 text-stone-200"
                          >
                            {p.nome} ({p.raca} • {p.classe})
                          </option>
                        ))}
                      </select>
                      <Shield className="w-4 h-4 text-stone-500 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
                    </div>

                    <button
                      onClick={() => handleSalvarVinculo(usuario)}
                      disabled={!modificado || isSalvando}
                      className={`text-xs px-3 py-2 rounded-lg font-serif font-bold flex items-center gap-1 transition-all ${
                        modificado
                          ? "t20-btn-primary"
                          : "bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed opacity-60"
                      }`}
                      title={modificado ? "Salvar Vínculo" : "Sem alterações"}
                    >
                      {isSalvando ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Salvar
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}