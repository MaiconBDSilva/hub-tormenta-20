"use client";

import React from "react";

export default function WikiTormentaPage() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-stone-950">
      <main className="flex-1 w-full bg-stone-950 flex flex-col">
        <iframe
          src="/wiki/wiki.html"
          title="Wiki - Hub Tormenta 20"
          className="w-full flex-1 border-0 bg-stone-950 min-h-[calc(100vh-73px)]"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      </main>
    </div>
  );
}
