"use client"; // Necessário no Next.js para usar estado e efeitos do React

import { useState, useEffect } from "react";
import { HeroSection } from "../componentes/HeroSection";
import campaignData from "../data/campanha.json"
import MenuFixo from "../componentes/MenuFixo";

export default function Home() {

  return (
    <div>
    <header>
      <MenuFixo/>
    </header>

      {/* ⚔️ HERO SECTION */}
      <main className="hero-container">
        <HeroSection/>
      </main>
    </div>
  );
}