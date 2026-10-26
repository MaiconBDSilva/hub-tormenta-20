"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Shield,
  Plus,
  Loader2,
  AlertCircle,
  FileText,
  UserCheck,
  UserX,
} from "lucide-react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PersonagemRPG } from "@/tipos/personagem";
import { ModalCriarPersonagem } from "./ModalCriarPersonagem";
import { CardModeracaoEdicao } from "./CardModeracaoEdicao";

export function GerenciadorPersonagens() {
  const [personagens, setPersonagens] = useState<PersonagemRPG[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [modalCriacaoAberto, setModalCriacaoAberto] = useState(false);

  const carregarPersonagens = useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);
      const q = query(collection(db, "personagens"), orderBy("nome", "asc"));
      const snap = await getDocs(q);

      const lista: PersonagemRPG[] = [];
      snap.forEach((docSnap) => {
        lista.push({
          id: docSnap.id,
          ...(docSnap.data() as Omit<PersonagemRPG, "id">),
        });
      });

      setPersonagens(lista);
    } catch (err) {
      console.error("Erro ao carregar fichas:", err);
      setErro("Não foi possível carregar os personagens dos Tomos.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarPersonagens();
  }, [carregarPersonagens]);

  // Fichas com solicitações pendentes para moderação
  const solicitacoesPendentes = personagens.filter(
    (p) => p.solicitacaoPendente !== null && p.solicitacaoPendente !== undefined
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Barra de Ações Superior */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-stone-900/60 border border-stone-800">
        <div>
          <h2 className="font-serif font-bold text-lg text-amber-400 flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500" />
            Fichas & Moderação de Arton
          </h2>
          <p className="text-xs text-stone-400">
            Cadastre novos heróis e modere solicitações de evolução enviadas pelos aventureiros.
          </p>
        </div>

        <button
          onClick={() => setModalCriacaoAberto(true)}
          className="t20-btn-primary text-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Novo Personagem
        </button>
      </div>

      {erro && (
        <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          <span>{erro}</span>
        </div>
      )}

      {carregando ? (
        <div className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-2" />
          <p className="text-xs font-serif text-stone-400 uppercase tracking-wider">
            Consultando registros das fichas...
          </p>
        </div>
      ) : (
        <>
          {/* Seção 1: Fila de Moderação */}
          <section className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <h3 className="font-serif font-bold text-sm text-stone-300 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                Fila de Moderação ({solicitacoesPendentes.length})
              </h3>
              <span className="text-xs text-stone-500">
                Mudanças em atributos protegidos
              </span>
            </div>

            {solicitacoesPendentes.length === 0 ? (
              <div className="p-6 rounded-lg bg-stone-900/40 border border-dashed border-stone-800 text-center">
                <p className="text-xs text-stone-400">
                  Nenhuma alteração aguardando moderação no momento.
                </p>
              </div>
            ) : (
              <div>
                {solicitacoesPendentes.map((p) => (
                  <CardModeracaoEdicao
                    key={p.id}
                    personagem={p}
                    onAtualizacao={carregarPersonagens}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Seção 2: Todas as Fichas Cadastradas */}
          <section className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <h3 className="font-serif font-bold text-sm text-stone-300 flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                Fichas Existentes ({personagens.length})
              </h3>
            </div>

            {personagens.length === 0 ? (
              <div className="p-6 rounded-lg bg-stone-900/40 border border-dashed border-stone-800 text-center">
                <p className="text-xs text-stone-400">
                  Nenhum herói forjado ainda. Clique em &quot;Novo Personagem&quot; acima para começar.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {personagens.map((p) => (
                  <div
                    key={p.id}
                    className="t20-card p-4 border border-stone-800 bg-stone-900/50 flex gap-3 items-center"
                  >
                    <div className="w-12 h-12 rounded-lg bg-stone-950 border border-stone-800 overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.avatarUrl}
                        alt={p.nome}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="font-serif font-bold text-sm text-stone-200 truncate">
                        {p.nome}
                      </h4>
                      <p className="text-xs text-stone-400 truncate">
                        {p.raca} • {p.classe} (Nv. {p.nivel})
                      </p>

                      <div className="flex items-center gap-1.5 mt-1 text-[11px]">
                        {p.donoUid ? (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <UserCheck className="w-3 h-3" />
                            {p.donoNome || "Vinculado"}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-stone-500">
                            <UserX className="w-3 h-3" />
                            Sem Dono
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* Modal de Criação de Ficha */}
      <ModalCriarPersonagem
        aberto={modalCriacaoAberto}
        onFechar={() => setModalCriacaoAberto(false)}
        onSucesso={carregarPersonagens}
      />
    </div>
  );
}