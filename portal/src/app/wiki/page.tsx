"use client"; // Necessário no Next.js para usar estado e efeitos do React

import React from "react";
import MenuFixo from "../../componentes/menu/MenuFixo";

export default function Home() {

  return (
    <div className="min-h-screen w-full flex flex-col bg-stone-950">
    <header>
      <MenuFixo/>
    </header>

      {/* ⚔️ HERO SECTION */}
      <main className="flex-1 w-full bg-stone-950 flex flex-col">
        <iframe
          src="/wiki/index.html"
          title="Wiki - Hub Tormenta 20"
          className="w-full flex-1 border-0 bg-stone-950 min-h-[calc(100vh-73px)]"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      </main>
    </div>
  );
}

