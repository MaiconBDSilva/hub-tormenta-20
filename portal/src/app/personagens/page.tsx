"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Shield, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/contextos/AuthContext";
import { PersonagemRPG } from "@/tipos/personagem";
import { CardPersonagemVitrine } from "@/componentes/personagens/CardPersonagemVitrine";
import styles from "@/componentes/personagens/personagens.module.css";

export default function PersonagensVitrinePage() {
  const { usuario, dadosPerfil, ehMestre, carregando: carregandoAuth } = useAuth();
  const [personagens, setPersonagens] = useState<PersonagemRPG[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregarPersonagens() {
      try {
        setCarregando(true);
        setErro(null);

        const q = query(collection(db, "personagens"), orderBy("nome", "asc"));
        const snap = await getDocs(q);

        const lista: PersonagemRPG[] = [];
        snap.forEach((d) => {
          lista.push({
            id: d.id,
            ...(d.data() as Omit<PersonagemRPG, "id">),
          });
        });

        // Ordenação preferencial: coloca o personagem do usuário autenticado no primeiro card
        if (dadosPerfil?.personagemId) {
          lista.sort((a, b) => {
            if (a.id === dadosPerfil.personagemId) return -1;
            if (b.id === dadosPerfil.personagemId) return 1;
            return a.nome.localeCompare(b.nome);
          });
        }

        setPersonagens(lista);
      } catch (err) {
        console.error("Erro ao carregar vitrine de personagens:", err);
        setErro("Não foi possível consultar os heróis da mesa no momento.");
      } finally {
        setCarregando(false);
      }
    }

    if (!carregandoAuth) {
      carregarPersonagens();
    }
  }, [carregandoAuth, dadosPerfil?.personagemId]);

  return (
    <main className={styles.personagensMain}>
      {/* Brilhos atmosféricos místico-Tormenta */}
      <div aria-hidden="true" className="t20-glow-ruby" />
      <div aria-hidden="true" className="t20-glow-amber" />

      <div className={`${styles.personagensContainer} space-y-8`}>
        {/* Topo da Vitrine */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-amber-500/20">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Shield className="w-8 h-8 text-amber-500 drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]" />
              <h1 className="text-3xl font-serif font-black text-amber-100 tracking-wide">
                Os Campeões de Arton
              </h1>
            </div>
            <p className="text-sm text-stone-400 font-serif">
              Conheça os aventureiros que desafiam os perigos e a corrupção do mundo.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/" className="t20-btn-ghost text-xs flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4 text-amber-400" />
              Voltar ao Hub
            </Link>
          </div>
        </div>

        {/* Mensagem de Erro */}
        {erro && (
          <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
            <span>{erro}</span>
          </div>
        )}

        {/* Loading ou Grade de Cartas de Tarô */}
        {carregando || carregandoAuth ? (
          <div className="p-20 text-center flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-amber-500 mb-3" />
            <p className="text-sm font-serif text-stone-400 uppercase tracking-wider">
              Invocando registros dos campeões nos Tomos de Arton...
            </p>
          </div>
        ) : personagens.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-stone-900/40 border border-dashed border-stone-800 max-w-lg mx-auto">
            <Shield className="w-12 h-12 text-stone-600 mx-auto mb-3" />
            <h3 className="font-serif font-bold text-stone-300 mb-1">Nenhum herói forjado ainda</h3>
            <p className="text-xs text-stone-500 mb-4">
              O Mestre ainda não cadastrou personagens nesta campanha.
            </p>
            {ehMestre && (
              <Link href="/painel" className="t20-btn-primary text-xs inline-flex items-center gap-2">
                Ir ao Painel do Mestre
              </Link>
            )}
          </div>
        ) : (
          /* Grade responsiva em 5 colunas perfeitamente simétricas */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 sm:gap-6 justify-center items-start animate-fade-in">
            {personagens.map((p) => {
              const ehDono = Boolean(
                usuario &&
                  (p.id === dadosPerfil?.personagemId || p.donoUid === usuario.uid)
              );

              return (
                <CardPersonagemVitrine
                  key={p.id}
                  personagem={p}
                  ehDono={ehDono}
                />
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}