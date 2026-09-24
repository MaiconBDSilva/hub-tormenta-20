"use client";

import React, { useState } from "react";
import Link from "next/link";
import FoundryStatusButton from "./FoundryStatusButton";
import styles from "./MenuFixo.module.css";

const LINKS_MENU = [
  { nome: "Personagens", href: "/personagens" },
  { nome: "Mapas", href: "/mapas" },
  { nome: "Livros", href: "/livros" },
  { nome: "Agenda", href: "/agenda" },
  {
    nome: "Wiki",
    href: "wiki/wiki.html",
  },
];

export default function MenuFixo() {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <header className={styles.headerFixo}>
      {/* Logos Responsivas: Quadrada no Celular / Retangular no PC */}
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
          <a key={item.nome} href={item.href} className={styles.navLink}>
            {item.nome}
          </a>
        ))}
      </nav>

      {/* Canto Direito: Botão Foundry + Hambúrguer Mobile */}
      <div className={styles.actionsRight}>
        <FoundryStatusButton />

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
          {LINKS_MENU.map((item) => (
            <a
              key={item.nome}
              href={item.href}
              className={styles.mobileNavLink}
              onClick={() => setMenuAberto(false)}
            >
              {item.nome}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}