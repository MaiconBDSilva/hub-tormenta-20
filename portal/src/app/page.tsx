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
      {/* 🛡️ CABEÇALHO FIXO */}
      <header className="header-fixo">
        {/* Canto Esquerdo: Logo / Nome (Volta para o início) */}
        <a href="/" className="header-logo">
          <img
            src="/logo-rpg.png"
            alt="Logo Invocação do Herói"
            className="header-logo-img"
          />
        </a>

        {/* Centro: Links de Navegação */}
        <nav className="header-nav">
          {linksMenu.map((item) => (
            <a key={item.nome} href={item.href} className="header-link">
              {item.nome}
            </a>
          ))}
        </nav>

        {/* Canto Direito: Status & Acesso ao Foundry */}
        {/* 🟢 BOTÃO INTELIGENTE DO FOUNDRY VTT */}
        <a
          href={URL_FOUNDRY}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-foundry"
        >
          {/* Luz Indicadora Dinâmica \*/}
          <span
            className={`w-2.5 h-2.5 rounded-full ${isOnline === null
              ? "bg-yellow-500 animate-pulse" // Amarelo: Verificando 
              : isOnline
                ? "bg-green-500 animate-pulse" // Verde: Online 
                : "bg-red-500" // Vermelho: Offline 
              }`}
          >
          </span>
          <span>
            {isOnline === null
              ? "Checando..."
              : isOnline
                ? "Foundry Online"
                : "Mesa Offline"}
          </span>
        </a>

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