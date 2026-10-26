"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contextos/AuthContext";
import { DadosCampanha } from "@/tipos/campanha";
import { AbaPainelMestre } from "@/tipos/personagem";
import { TelaAcessoNegado } from "@/componentes/painel/TelaAcessoNegado";
import { FormCampanha } from "@/componentes/painel/FormCampanha";
import { GerenciadorPersonagens } from "@/componentes/painel/GerenciadorPersonagens";
import { GerenciadorUsuarios } from "@/componentes/painel/GerenciadorUsuarios";
import styles from "@/componentes/painel/painel.module.css";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Scroll,
  Shield,
  Users,
  Compass,
} from "lucide-react";

export default function PainelMestrePage() {
  const { ehMestre, carregando: carregandoAuth } = useAuth();

  // Navegação entre as abas do Painel
  const [abaAtiva, setAbaAtiva] = useState<AbaPainelMestre>("campanha");

  // Estados da Aba Campanha
  const [carregandoDados, setCarregandoDados] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  const [form, setForm] = useState<DadosCampanha>({
    proximaSessao: {
      titulo: "",
      data: "",
      status: "Em Votação",
      dtTesteFoundry: 13,
    },
    ultimaSessao: {
      numero: 0,
      titulo: "",
      resumo: "",
      linkWiki: "",
    },
    servidor: {
      foundryUrl: "",
    },
  });

  useEffect(() => {
    async function carregarDadosCampanha() {
      if (!ehMestre) return;

      try {
        setCarregandoDados(true);
        const docRef = doc(db, "configuracoes", "campanha");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const dados = docSnap.data() as DadosCampanha;
          setForm({
            proximaSessao: {
              titulo: dados.proximaSessao?.titulo || "",
              data: dados.proximaSessao?.data || "",
              status: dados.proximaSessao?.status || "Em Votação",
              dtTesteFoundry: Number(dados.proximaSessao?.dtTesteFoundry) || 13,
            },
            ultimaSessao: {
              numero: Number(dados.ultimaSessao?.numero) || 0,
              titulo: dados.ultimaSessao?.titulo || "",
              resumo: dados.ultimaSessao?.resumo || "",
              linkWiki: dados.ultimaSessao?.linkWiki || "",
            },
            servidor: {
              foundryUrl: dados.servidor?.foundryUrl || "",
            },
          });
        }
      } catch (erro) {
        console.error("Erro ao carregar dados da campanha:", erro);
        setMensagemErro("Não foi possível carregar os dados da campanha.");
      } finally {
        setCarregandoDados(false);
      }
    }

    if (!carregandoAuth && ehMestre) {
      carregarDadosCampanha();
    }
  }, [ehMestre, carregandoAuth]);

  const handleProximaSessaoChange = (
    campo: keyof DadosCampanha["proximaSessao"],
    valor: string | number
  ) => {
    setForm((prev) => ({
      ...prev,
      proximaSessao: { ...prev.proximaSessao, [campo]: valor },
    }));
  };

  const handleUltimaSessaoChange = (
    campo: keyof DadosCampanha["ultimaSessao"],
    valor: string | number
  ) => {
    setForm((prev) => ({
      ...prev,
      ultimaSessao: { ...prev.ultimaSessao, [campo]: valor },
    }));
  };

  const handleServidorChange = (
    campo: keyof DadosCampanha["servidor"],
    valor: string
  ) => {
    setForm((prev) => ({
      ...prev,
      servidor: { ...prev.servidor, [campo]: valor },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setMensagemSucesso(null);
    setMensagemErro(null);

    try {
      const docRef = doc(db, "configuracoes", "campanha");
      await updateDoc(docRef, {
        "proximaSessao.titulo": form.proximaSessao.titulo,
        "proximaSessao.data": form.proximaSessao.data,
        "proximaSessao.status": form.proximaSessao.status,
        "proximaSessao.dtTesteFoundry": Number(form.proximaSessao.dtTesteFoundry),
        "ultimaSessao.numero": Number(form.ultimaSessao.numero),
        "ultimaSessao.titulo": form.ultimaSessao.titulo,
        "ultimaSessao.resumo": form.ultimaSessao.resumo,
        "ultimaSessao.linkWiki": form.ultimaSessao.linkWiki,
        "servidor.foundryUrl": form.servidor.foundryUrl,
      });

      setMensagemSucesso("Registros da campanha atualizados nos Tomos com sucesso!");
    } catch (erro) {
      console.error("Erro ao salvar dados da campanha:", erro);
      setMensagemErro(
        "Erro ao atualizar o documento. Verifique as permissões de Mestre no Firestore."
      );
    } finally {
      setSalvando(false);
    }
  };

  if (carregandoAuth) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 pt-28 bg-stone-950 text-stone-100">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500 mb-4" />
        <p className="text-sm font-medium tracking-wider text-stone-400 uppercase font-serif">
          Consultando os Tomos do Mestre...
        </p>
      </main>
    );
  }

  if (!ehMestre) {
    return <TelaAcessoNegado />;
  }

  return (
    <main className={styles.painelMain}>
      <div aria-hidden="true" className="t20-glow-ruby" />
      <div aria-hidden="true" className="t20-glow-amber" />

      <div className={styles.painelContainer}>
        {/* Cabeçalho do Painel */}
        <div className={styles.painelHeader}>
          <div>
            <h1 className={styles.painelTitulo}>
              <Scroll className="w-8 h-8 text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]" />
              Painel do Mestre
            </h1>
            <p className={styles.painelSubtitulo}>
              Gerencie a campanha, modere fichas de personagens e vincule os aventureiros aos heróis de Arton.
            </p>
          </div>

          <Link href="/" className="t20-btn-ghost self-start sm:self-auto">
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            Voltar ao Hub
          </Link>
        </div>

        {/* Barra de Navegação em Abas do Mestre */}
        <nav
          aria-label="Abas do Painel"
          className="flex border-b border-stone-800 gap-2 mb-8 overflow-x-auto pb-1"
        >
          <button
            type="button"
            onClick={() => setAbaAtiva("campanha")}
            className={`flex items-center gap-2 px-5 py-3 font-serif font-semibold text-sm transition-all duration-200 border-b-2 whitespace-nowrap ${
              abaAtiva === "campanha"
                ? "border-amber-500 text-amber-400 bg-stone-900/60"
                : "border-transparent text-stone-400 hover:text-stone-200 hover:border-stone-700"
            }`}
          >
            <Compass className="w-4 h-4" />
            Campanha & Sessões
          </button>

          <button
            type="button"
            onClick={() => setAbaAtiva("personagens")}
            className={`flex items-center gap-2 px-5 py-3 font-serif font-semibold text-sm transition-all duration-200 border-b-2 whitespace-nowrap ${
              abaAtiva === "personagens"
                ? "border-amber-500 text-amber-400 bg-stone-900/60"
                : "border-transparent text-stone-400 hover:text-stone-200 hover:border-stone-700"
            }`}
          >
            <Shield className="w-4 h-4" />
            Gestão de Personagens
          </button>

          <button
            type="button"
            onClick={() => setAbaAtiva("usuarios")}
            className={`flex items-center gap-2 px-5 py-3 font-serif font-semibold text-sm transition-all duration-200 border-b-2 whitespace-nowrap ${
              abaAtiva === "usuarios"
                ? "border-amber-500 text-amber-400 bg-stone-900/60"
                : "border-transparent text-stone-400 hover:text-stone-200 hover:border-stone-700"
            }`}
          >
            <Users className="w-4 h-4" />
            Vínculo de Usuários
          </button>
        </nav>

        {/* Renderização Condicional por Aba */}
        {abaAtiva === "campanha" && (
          <div>
            {mensagemSucesso && (
              <div className={styles.alertaSucesso}>
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                <span className="font-medium">{mensagemSucesso}</span>
              </div>
            )}

            {mensagemErro && (
              <div className={styles.alertaErro}>
                <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
                <span className="font-medium">{mensagemErro}</span>
              </div>
            )}

            {carregandoDados ? (
              <div className={styles.loadingBox}>
                <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-3" />
                <p className="text-sm font-serif">Carregando registros vigentes do Firestore...</p>
              </div>
            ) : (
              <FormCampanha
                dados={form}
                salvando={salvando}
                onCampoProximaSessaoChange={handleProximaSessaoChange}
                onCampoUltimaSessaoChange={handleUltimaSessaoChange}
                onCampoServidorChange={handleServidorChange}
                onSubmit={handleSubmit}
              />
            )}
          </div>
        )}

        {abaAtiva === "personagens" && <GerenciadorPersonagens />}

        {abaAtiva === "usuarios" && <GerenciadorUsuarios />}
      </div>
    </main>
  );
}