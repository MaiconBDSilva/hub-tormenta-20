"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { LogIn, LogOut, Settings, User as UserIcon } from "lucide-react";
import FoundryStatusButton from "./FoundryStatusButton";
import { useAuth } from "../../contextos/AuthContext";
import styles from "./MenuFixo.module.css";

const LINKS_MENU = [
  { nome: "Personagens", href: "/personagens" },
  { nome: "Mapas", href: "/mapas" },
  { nome: "Livros", href: "/livros" },
  { nome: "Agenda", href: "/agenda" },
  { nome: "Wiki", href: "/wikitormenta" },
];

export default function MenuFixo() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [userDropdownAberto, setUserDropdownAberto] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { usuario, dadosPerfil, carregando, logout, ehMestre } = useAuth();

  // Fecha o dropdown se clicar fora dele
  useEffect(() => {
    function handleClickFora(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  const getIniciais = (nome: string) => {
    return nome
      .split(" ")
      .slice(0, 2)
      .map((parte) => parte[0]?.toUpperCase())
      .join("");
  };

  return (
    <header className={styles.headerFixo}>
      {/* Logos Responsivas */}
      <Link href="/" className={styles.brandLink}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-mobile.png"
          alt="Logo Invocação do Herói Mobile"
          className={styles.logoMobile}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-rpg.png"
          alt="Logo Invocação do Herói Desktop"
          className={styles.logoDesktop}
        />
      </Link>

      {/* Navegação Desktop */}
      <nav className={styles.navDesktop}>
        {LINKS_MENU.map((item) => (
          <Link key={item.nome} href={item.href} className={styles.navLink}>
            {item.nome}
          </Link>
        ))}
      </nav>

      {/* Canto Direito */}
      <div className={styles.actionsRight}>
        <FoundryStatusButton />

        {/* Bloco de Autenticação */}
        {!carregando && (
          <>
            {usuario && dadosPerfil ? (
              <div className={styles.userProfileContainer} ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownAberto(!userDropdownAberto)}
                  className={styles.userButton}
                  aria-label="Opções do usuário"
                >
                  {dadosPerfil.fotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={dadosPerfil.fotoUrl}
                      alt={dadosPerfil.nome}
                      className={styles.userAvatar}
                    />
                  ) : (
                    <div className={styles.avatarFallback}>
                      {getIniciais(dadosPerfil.nome) || <UserIcon className="h-3.5 w-3.5" />}
                    </div>
                  )}

                  <span className={styles.userNameText}>
                    {dadosPerfil.nome.split(" ")[0]}
                  </span>

                  {ehMestre && <span className={styles.badgeMestre}>Mestre</span>}
                </button>

                {/* Dropdown do Usuário */}
                {userDropdownAberto && (
                  <div className={styles.userDropdown}>
                    <div className="px-3 py-1.5 text-[11px] text-stone-400 border-b border-stone-800">
                      Conectado como <strong className="text-stone-200 block truncate">{dadosPerfil.nome}</strong>
                    </div>

                    {ehMestre && (
                      <Link
                        href="/painel"
                        className={styles.dropdownItem}
                        onClick={() => setUserDropdownAberto(false)}
                      >
                        <Settings className="h-3.5 w-3.5 text-amber-400" />
                        <span>Painel do Mestre</span>
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownAberto(false);
                        logout();
                      }}
                      className={styles.dropdownItemLogout}
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Desconectar</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className={styles.btnLogin}>
                <LogIn className="h-3.5 w-3.5" />
                <span>Entrar</span>
              </Link>
            )}
          </>
        )}

        {/* Hambúrguer Mobile */}
        <button
          type="button"
          onClick={() => setMenuAberto(!menuAberto)}
          className={styles.btnMenuMobile}
          aria-label={menuAberto ? "Fechar Menu" : "Abrir Menu"}
        >
          {menuAberto ? "✕" : "☰"}
        </button>
      </div>

      {/* Dropdown do Menu Mobile */}
      {menuAberto && (
        <nav className={styles.menuMobileDropdown}>
          {usuario && dadosPerfil && (
            <div className={styles.mobileUserHeader}>
              <UserIcon className="h-4 w-4 text-amber-400" />
              <span className="truncate">{dadosPerfil.nome}</span>
            </div>
          )}

          {LINKS_MENU.map((item) => (
            <Link
              key={item.nome}
              href={item.href}
              className={styles.mobileNavLink}
              onClick={() => setMenuAberto(false)}
            >
              {item.nome}
            </Link>
          ))}

          {ehMestre && (
            <Link
              href="/painel"
              className={`${styles.mobileNavLink} text-amber-400 font-semibold`}
              onClick={() => setMenuAberto(false)}
            >
              ⚙️ Painel do Mestre
            </Link>
          )}

          <div className={styles.dropdownDivider} />

          {usuario ? (
            <button
              type="button"
              onClick={() => {
                setMenuAberto(false);
                logout();
              }}
              className="flex items-center gap-2 py-1 text-xs text-red-400 font-medium cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sair da Conta</span>
            </button>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 py-1 text-xs text-amber-400 font-semibold"
              onClick={() => setMenuAberto(false)}
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Entrar</span>
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}