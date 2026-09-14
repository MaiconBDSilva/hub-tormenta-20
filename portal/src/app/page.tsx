"use client"; // Necessário no Next.js para usar estado e efeitos do React

import { useState, useEffect } from "react";

export default function Home() {

  // Estado para armazenar o status: true = Online | false = Offline | null = Carregando
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  // Coloque aqui a URL REAL da sua mesa do Foundry VTT 
  //const URL_FOUNDRY = "http://localhost:30000";
  const URL_FOUNDRY = "http://rpgtormenta.servegame.com:30000";


  // Função que chama nossa API interna de checagem 
  const checarStatusFoundry = async () => {
    try {
      const res = await fetch("/api/foundry");
      const data = await res.json();
      setIsOnline(data.online);
    }
    catch {
      setIsOnline(false);
    }
  };

  useEffect(() => {
    // Checa o status assim que a página carrega 
    checarStatusFoundry();
    // Recheca o status automaticamente a cada 30 segundos 
    const intervalo = setInterval(checarStatusFoundry, 60000);
    // Limpa o intervalo ao fechar a página 
    return () => clearInterval(intervalo);
  }, []);

  const [menuAberto, setMenuAberto] = useState(false);


  // Array configurável com os 5 links do menu
  const linksMenu = [
    { nome: "Personagens", href: "#personagens" },
    { nome: "Diários", href: "#diarios" },
    { nome: "Mapas", href: "#mapas" },
    { nome: "Livros", href: "#livros" },
    { nome: "Agenda", href: "#agenda" },
  ];

  return (
    <div className="min-h-screen">
      /* 🛡️ CABEÇALHO FIXO */
      <header className="header-fixo">
        {/* Logo Dinâmica: Quadrada no Celular / Retangular no PC */}
        <a href="/" className="shrink-0">
          <img
            src="/logo-mobile.png"
            alt="Logo Invocação do Herói"
            className="header-logo-mobile"
          />
          <img
            src="/logo-rpg.png"
            alt="Logo Invocação do Herói"
            className="header-logo-desktop"
          />
        </a>

        {/* Centro: Links de Navegação desktop */}
        <nav className="header-nav-desktop">
          {linksMenu.map((item) => (
            <a key={item.nome} href={item.href} className="header-link">
              {item.nome}
            </a>
          ))}
        </nav>

        {/* Canto Direito: Botão do Foundry VTT */}
        <div className="flex items-center gap-2">
          <a
            href={URL_FOUNDRY}
            target="_blank"
            rel="noopener noreferrer"
            title={isOnline ? "Foundry Online" : "Mesa Offline"}
            className="btn-foundry"
          >
            {/* Indicador Luminoso */}
            <span
              className={`status-dot ${isOnline === null
                ? "status-dot-checking"
                : isOnline
                  ? "status-dot-online"
                  : "status-dot-offline"
                }`}
            ></span>

            {/* Texto do Status */}
            <span className="btn-foundry-text">
              {isOnline === null
                ? "Checando..."
                : isOnline
                  ? "Foundry Online"
                  : "Mesa Offline"}
            </span>
          </a>

          {/* Botão Hambúrguer (Visível apenas no celular) */}
          <button
            onClick={() => setMenuAberto(!menuAberto)}
            className="btn-menu-mobile"
            aria-label="Abrir Menu"
          >
            {menuAberto ? "✕" : "☰"}
          </button>
        </div>

        {/* Dropdown do Menu Mobile */}
        {menuAberto && (
          <nav className="menu-mobile-dropdown">
            {linksMenu.map((item) => (
              <a
                key={item.nome}
                href={item.href}
                className="header-link py-1 text-base"
                onClick={() => setMenuAberto(false)}
              >
                {item.nome}
              </a>
            ))}
          </nav>
        )}

      </header>

      {/* ⚔️ HERO SECTION */}
      <main className="hero-container">
        <h1 className="titulo-principal">
          Coração de Rubi
        </h1>
        <p className="subtitulo-campanha">
          Portal de Campanha de Tormenta 20 — Registros de sessão, lore do mundo e acesso à mesa do Foundry VTT.
        </p>
      </main>
    </div>
  );
}