"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contextos/AuthContext";
import { PersonagemRPG, AbaFicha } from "@/tipos/personagem";
import { CabecalhoFicha } from "@/componentes/personagens/CabecalhoFicha";
import { AbaPrincipal } from "@/componentes/personagens/abas/AbaPrincipal";
import { AbaNotas } from "@/componentes/personagens/abas/AbaNotas";
import { AbaPericias } from "@/componentes/personagens/abas/AbaPericias";
import { AbaPlaceholder } from "@/componentes/personagens/abas/AbaPlaceholder";
import styles from "@/componentes/personagens/personagens.module.css";
import { AbaPoderes } from "@/componentes/personagens/abas/AbaPoderes";
import { AbaMagias } from "@/componentes/personagens/abas/AbaMagias";
import { AbaEquipamentos } from "@/componentes/personagens/abas/AbaEquipamentos";
import {
  Shield,
  Sparkles,
  Compass,
  Scroll,
  Sword,
  BookOpen,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function FichaPersonagemPage() {
  const { id } = useParams<{ id: string }>();
  const {
    usuario,
    dadosPerfil,
    ehMestre,
    carregando: carregandoAuth,
  } = useAuth();

  const [personagem, setPersonagem] = useState<PersonagemRPG | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Controle de Abas e Modo Edição
  const [abaAtiva, setAbaAtiva] = useState<AbaFicha>("principal");
  const [modoEdicao, setModoEdicao] = useState(false);

  const carregarFicha = useCallback(async () => {
    if (!id) return;
    try {
      setCarregando(true);
      setErro(null);

      const docRef = doc(db, "personagens", id);
      const snap = await getDoc(docRef);

      if (!snap.exists()) {
        setErro("Aventureiro não encontrado nos Tomos de Arton.");
        return;
      }

      setPersonagem({
        id: snap.id,
        ...(snap.data() as Omit<PersonagemRPG, "id">),
      });
    } catch (err) {
      console.error("Erro ao consultar ficha:", err);
      setErro("Falha ao resgatar registros do herói no Firestore.");
    } finally {
      setCarregando(false);
    }
  }, [id]);

  useEffect(() => {
    carregarFicha();
  }, [carregarFicha]);

  if (carregando || carregandoAuth) {
    return (
      <main className={styles.personagensMain}>
        <div className="p-20 text-center flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-amber-500 mb-3" />
          <p className="text-sm font-serif text-stone-400 uppercase tracking-wider">
            Consultando registros heroicos...
          </p>
        </div>
      </main>
    );
  }

  if (erro || !personagem) {
    return (
      <main className={styles.personagensMain}>
        <div
          className={`${styles.personagensContainer} max-w-lg mx-auto pt-12`}
        >
          <div className="p-6 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-sm flex items-center gap-3">
            <AlertCircle className="w-6 h-6 shrink-0 text-red-400" />
            <span>{erro || "Personagem inexistente."}</span>
          </div>
        </div>
      </main>
    );
  }

  // Checagem de permissão de posse
  const ehDono = Boolean(
    usuario &&
    (personagem.id === dadosPerfil?.personagemId ||
      personagem.donoUid === usuario.uid),
  );

  const podeVerNotas = ehDono || ehMestre;

  return (
    <main className={styles.personagensMain}>
      <div aria-hidden="true" className="t20-glow-ruby" />
      <div aria-hidden="true" className="t20-glow-amber" />

      <div className={styles.personagensContainer}>
        {/* Topo / Cabeçalho do Herói */}
        <CabecalhoFicha
          personagem={personagem}
          ehDono={ehDono}
          ehMestre={ehMestre}
          onAtualizacao={carregarFicha}
        />

        {/* Barra de Navegação em Abas */}
        <nav aria-label="Abas da Ficha" className={styles.fichaNavAbas}>
          <button
            type="button"
            onClick={() => setAbaAtiva("principal")}
            className={`${styles.abaBotao} ${abaAtiva === "principal" ? styles.abaBotaoAtiva : ""}`}
          >
            <Shield className="w-4 h-4" />
            Principal
          </button>

          <button
            type="button"
            onClick={() => setAbaAtiva("poderes")}
            className={`${styles.abaBotao} ${abaAtiva === "poderes" ? styles.abaBotaoAtiva : ""}`}
          >
            <Sparkles className="w-4 h-4" />
            Poderes
          </button>

          <button
            type="button"
            onClick={() => setAbaAtiva("pericias")}
            className={`${styles.abaBotao} ${abaAtiva === "pericias" ? styles.abaBotaoAtiva : ""}`}
          >
            <Compass className="w-4 h-4" />
            Perícias
          </button>

          <button
            type="button"
            onClick={() => setAbaAtiva("magias")}
            className={`${styles.abaBotao} ${abaAtiva === "magias" ? styles.abaBotaoAtiva : ""}`}
          >
            <Scroll className="w-4 h-4" />
            Magias
          </button>

          <button
            type="button"
            onClick={() => setAbaAtiva("equipamentos")}
            className={`${styles.abaBotao} ${abaAtiva === "equipamentos" ? styles.abaBotaoAtiva : ""}`}
          >
            <Sword className="w-4 h-4" />
            Equipamentos
          </button>

          {/* Aba "Notas" confidencial: exibida apenas para Dono e Mestre */}
          {podeVerNotas && (
            <button
              type="button"
              onClick={() => setAbaAtiva("notas")}
              className={`${styles.abaBotao} ${abaAtiva === "notas" ? styles.abaBotaoAtiva : ""}`}
            >
              <BookOpen className="w-4 h-4" />
              Notas
            </button>
          )}
        </nav>

        {/* Caixa de Conteúdo da Aba Ativa */}
        <section className={styles.fichaConteudo}>
          {abaAtiva === "principal" && (
            <AbaPrincipal
              personagem={personagem}
              ehDono={ehDono}
              ehMestre={ehMestre}
              onAtualizacao={carregarFicha}
            />
          )}
          {abaAtiva === "poderes" && (
            <AbaPoderes
              personagem={personagem}
              ehDono={ehDono}
              ehMestre={ehMestre}
              onAtualizacao={carregarFicha}
            />
          )}

          {abaAtiva === "pericias" && (
            <AbaPericias
              personagem={personagem}
              ehDono={ehDono}
              ehMestre={ehMestre}
              onAtualizacao={carregarFicha}
            />
          )}

          {abaAtiva === "notas" && podeVerNotas && (
            <AbaNotas
              personagem={personagem}
              modoEdicao={modoEdicao}
              onAtualizacao={carregarFicha}
            />
          )}

          {abaAtiva === "magias" && (
            <AbaMagias
              personagem={personagem}
              ehDono={ehDono}
              ehMestre={ehMestre}
              onAtualizacao={carregarFicha}
            />
          )}

          {abaAtiva === "equipamentos" && (
            <AbaEquipamentos
              personagem={personagem}
              ehDono={ehDono}
              ehMestre={ehMestre}
              onAtualizacao={carregarFicha}
            />
          )}
        </section>
      </div>
    </main>
  );
}
