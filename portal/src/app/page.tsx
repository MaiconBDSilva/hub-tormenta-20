"use client"; // Necessário no Next.js para usar estado e efeitos do React

import React from "react";
import  HeroSection  from "../componentes/hero/HeroSection";
//import campaignData from "../data/campanha.json"
import MenuFixo from "../componentes/menu/MenuFixo";

export default function Home() {

  return (
    <div>
    <header>
      <MenuFixo/>
    </header>

      {/* ⚔️ HERO SECTION */}
      <main>
        <HeroSection/>
      </main>
    </div>
  );
}