"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Loader2 } from "lucide-react";
import { useAuth } from "../../contextos/AuthContext";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const { usuario, dadosPerfil, carregando, loginComGoogle } = useAuth();
  const [erroLogin, setErroLogin] = useState<string | null>(null);
  const [entrando, setEntrando] = useState<boolean>(false);

  // Redirecionamento condicional quando a autenticação e perfil estiverem carregados
  useEffect(() => {
    if (!carregando && usuario && dadosPerfil) {
      if (dadosPerfil.role === "mestre") {
        router.replace("/painel");
      } else {
        router.replace("/");
      }
    }
  }, [usuario, dadosPerfil, carregando, router]);

  const handleLoginGoogle = async () => {
    try {
      setErroLogin(null);
      setEntrando(true);
      await loginComGoogle();
      // O useEffect cuidará do redirecionamento assim que o estado do perfil for resolvido
    } catch (err: unknown) {
      console.error("Erro na autenticação:", err);
      setErroLogin("Falha ao entrar com o Google. Tente novamente.");
      setEntrando(false);
    }
  };

  // Se já estiver logado ou carregando sessão existente, exibe tela de carregamento suave
  if (carregando || (usuario && dadosPerfil)) {
    return (
      <main className={styles.loginContainer}>
        <div className={styles.ambientGlowRuby} />
        <div className={styles.ambientGlowAmber} />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
          <p className="text-xs text-stone-400 font-medium">
            Sintonizando energias de Arton...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.loginContainer}>
      {/* Luzes ambiente de fundo */}
      <div aria-hidden="true" className={styles.ambientGlowRuby} />
      <div aria-hidden="true" className={styles.ambientGlowAmber} />

      <section className={styles.loginCard}>
        <div className={styles.cardStripe} />

        <div className={styles.iconWrapper}>
          <Shield className="h-7 w-7 text-amber-400" />
        </div>

        <h1 className={styles.title}>Portal do Aventureiro</h1>
        <p className={styles.subtitle}>
          Identifique-se para acessar os recursos da campanha e seu registro de herói.
        </p>

        <button
          type="button"
          onClick={handleLoginGoogle}
          disabled={entrando}
          className={styles.btnGoogle}
        >
          {entrando ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
              <span>Conectando...</span>
            </>
          ) : (
            <>
              <svg
                className={styles.googleIcon}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2s.7 5.5 1.9 7.9l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
                />
              </svg>
              <span>Continuar com o Google</span>
            </>
          )}
        </button>

        {erroLogin && <div className={styles.errorMessage}>{erroLogin}</div>}

        <p className={styles.footerNote}>
          O acesso é restrito aos membros da mesa. Novos jogadores serão
          registrados automaticamente como aventureiros.
        </p>
      </section>
    </main>
  );
}