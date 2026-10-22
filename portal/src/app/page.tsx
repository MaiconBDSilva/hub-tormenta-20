"use client"; // Necessário no Next.js para usar estado e efeitos do React

import React from "react";
import  HeroSection  from "../componentes/hero/HeroSection";

export default function Home() {

  return (
    <div>
      {/* ⚔️ HERO SECTION */}
      <main>
        <HeroSection/>
      </main>
    </div>
  );
}