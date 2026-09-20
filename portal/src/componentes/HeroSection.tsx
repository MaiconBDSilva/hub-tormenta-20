"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import campaingData from "../data/campanha.json"


// ============================================================================
// Geometria 3D do Icosaedro (D20)
// ============================================================================
const PHI = (1 + Math.sqrt(5)) / 2;

const RAW_VERTICES = [
  [-1,  PHI, 0], [ 1,  PHI, 0], [-1, -PHI, 0], [ 1, -PHI, 0],
  [0, -1,  PHI], [0,  1,  PHI], [0, -1, -PHI], [0,  1, -PHI],
  [ PHI, 0, -1], [ PHI, 0,  1], [-PHI, 0, -1], [-PHI, 0,  1]
];

// Normaliza os vértices para raio 1.0
const VERTICES = RAW_VERTICES.map(([x, y, z]) => {
  const d = Math.hypot(x, y, z);
  return [x / d, y / d, z / d];
});

// 20 Faces triangulares
const FACES = [
  [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
  [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
  [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
  [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
];

// Mapeamento dos números de 1 a 20 nas 20 faces
const FACE_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 20, 16, 17, 18, 19, 15];

// Calcula a normal 3D de cada face no espaço local
const FACE_NORMALS = FACES.map((face) => {
  const v0 = VERTICES[face[0]];
  const v1 = VERTICES[face[1]];
  const v2 = VERTICES[face[2]];
  const cx = (v0[0] + v1[0] + v2[0]) / 3;
  const cy = (v0[1] + v1[1] + v2[1]) / 3;
  const cz = (v0[2] + v1[2] + v2[2]) / 3;
  const d = Math.hypot(cx, cy, cz);
  return [cx / d, cy / d, cz / d];
});

// Calcula os ângulos Euler (rx, ry) necessários para deixar a face virada diretamente para a câmera
function getTargetRotationForNumber(num: number): { rx: number; ry: number } {
  const faceIdx = FACE_NUMBERS.indexOf(num);
  const idx = faceIdx !== -1 ? faceIdx : 0;
  const [nx, ny, nz] = FACE_NORMALS[idx];

  const ry = -Math.atan2(nx, nz);
  const r_xz = Math.hypot(nx, nz);
  const rx = Math.atan2(ny, r_xz);

  return { rx, ry };
}

// Rotação 3D de um ponto no espaço pelos ângulos rx (Eixo X) e ry (Eixo Y)
function rotate3D(x: number, y: number, z: number, rx: number, ry: number): [number, number, number] {
  // 1. Roda em Y
  const cy = Math.cos(ry);
  const sy = Math.sin(ry);
  const x1 = x * cy + z * sy;
  const z1 = -x * sy + z * cy;

  // 2. Roda em X
  const cx = Math.cos(rx);
  const sx = Math.sin(rx);
  const y2 = y * cx - z1 * sx;
  const z2 = y * sx + z1 * cx;

  return [x1, y2, z2];
}

// Componente do Dado D20 em Canvas 3D
function D203DCanvas({
  isRolling,
  targetValue,
  onRollComplete,
}: {
  isRolling: boolean;
  targetValue: number | null;
  onRollComplete: (val: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Estados de rotação e animação mantidos via Ref para evitar re-renderizações desnecessárias
  const rotRef = useRef({ rx: 0.3, ry: 0.4 });
  const animStateRef = useRef({
    phase: "idle" as "idle" | "rolling" | "stopped",
    startTime: 0,
    startRx: 0,
    startRy: 0,
    targetRx: 0,
    targetRy: 0,
    spinsX: 0,
    spinsY: 0,
    finalValue: 20,
  });

  // Dispara a animação ao iniciar a rolagem
  useEffect(() => {
    if (isRolling && animStateRef.current.phase !== "rolling") {
      const rolledVal = targetValue ?? Math.floor(Math.random() * 20) + 1;
      const { rx: targetRx, ry: targetRy } = getTargetRotationForNumber(rolledVal);

      // Quantidade de voltas completas em 3D durante o giro
      const spinsX = (Math.floor(Math.random() * 3) + 3) * Math.PI * 2;
      const spinsY = (Math.floor(Math.random() * 4) + 4) * Math.PI * 2;

      animStateRef.current = {
        phase: "rolling",
        startTime: performance.now(),
        startRx: rotRef.current.rx,
        startRy: rotRef.current.ry,
        targetRx,
        targetRy,
        spinsX,
        spinsY,
        finalValue: rolledVal,
      };
    }
  }, [isRolling, targetValue]);

  // Loop de renderização no Canvas 60FPS
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrameId: number;

    const render = (now: number) => {
      const state = animStateRef.current;

      // ----------------------------------------------------------------------
      // 1. Atualiza Física de Rotação
      // ----------------------------------------------------------------------
      if (state.phase === "idle") {
        // Rotação suave contínua quando o dado está em espera
        rotRef.current.rx += 0.006;
        rotRef.current.ry += 0.009;
      } else if (state.phase === "rolling") {
        const duration = 1400; // Tempo total da rolagem (1.4 segundos)
        const elapsed = now - state.startTime;
        const t = Math.min(1, elapsed / duration);

        // Curva de desaceleração suave (Cubic Ease-Out)
        const easeOut = 1 - Math.pow(1 - t, 3);

        // Interpolação de rotação com desaceleração e alinhamento no resultado final
        rotRef.current.rx = state.startRx + (state.spinsX + (state.targetRx - (state.startRx % (Math.PI * 2)))) * easeOut;
        rotRef.current.ry = state.startRy + (state.spinsY + (state.targetRy - (state.startRy % (Math.PI * 2)))) * easeOut;

        // Ao finalizar, trava o dado PARADO na posição do número sorteado
        if (t >= 1) {
          rotRef.current.rx = state.targetRx;
          rotRef.current.ry = state.targetRy;
          state.phase = "stopped";
          onRollComplete(state.finalValue);
        }
      } else if (state.phase === "stopped") {
        // Dado 100% estático sem rotação residual
        rotRef.current.rx = state.targetRx;
        rotRef.current.ry = state.targetRy;
      }

      // ----------------------------------------------------------------------
      // 2. Limpa o Canvas
      // ----------------------------------------------------------------------
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;
      const scale = Math.min(width, height) * 0.38;

      ctx.clearRect(0, 0, width, height);

      // ----------------------------------------------------------------------
      // 3. Projeta Vértices e Transforma no Espaço 3D
      // ----------------------------------------------------------------------
      const { rx, ry } = rotRef.current;
      const transformedVerts = VERTICES.map(([vx, vy, vz]) => rotate3D(vx, vy, vz, rx, ry));

      // ----------------------------------------------------------------------
      // 4. Backface Culling & Z-Sorting (Elimina Arestas Sobresalientes)
      // ----------------------------------------------------------------------
      const visibleFaces: {
        faceIdx: number;
        number: number;
        avgZ: number;
        pts: [number, number][];
        normal: [number, number, number];
      }[] = [];

      FACES.forEach((faceIndices, i) => {
        const v0 = transformedVerts[faceIndices[0]];
        const v1 = transformedVerts[faceIndices[1]];
        const v2 = transformedVerts[faceIndices[2]];

        // Pontos 2D na tela
        const p0: [number, number] = [cx + v0[0] * scale, cy - v0[1] * scale];
        const p1: [number, number] = [cx + v1[0] * scale, cy - v1[1] * scale];
        const p2: [number, number] = [cx + v2[0] * scale, cy - v2[1] * scale];

        // Produto Vetorial 2D (Cross Product) para Culling de Faces Traseiras
        const crossZ = (p1[0] - p0[0]) * (p2[1] - p0[1]) - (p1[1] - p0[1]) * (p2[0] - p0[0]);

        // Se crossZ >= 0, a face está virada para trás. Descarta completamente!
        if (crossZ < 0) {
          const avgZ = (v0[2] + v1[2] + v2[2]) / 3;

          // Normal da face rotacionada para cálculo de iluminação
          const fn = FACE_NORMALS[i];
          const rotatedNormal = rotate3D(fn[0], fn[1], fn[2], rx, ry);

          visibleFaces.push({
            faceIdx: i,
            number: FACE_NUMBERS[i],
            avgZ,
            pts: [p0, p1, p2],
            normal: rotatedNormal,
          });
        }
      });

      // Ordena as faces visíveis da mais distante para a mais próxima (Z-Buffer)
      visibleFaces.sort((a, b) => a.avgZ - b.avgZ);

      // ----------------------------------------------------------------------
      // 5. Renderização das Faces e Números Chapados
      // ----------------------------------------------------------------------
      const lightDir = [0.3, 0.6, 0.74]; // Direção da luz vinda do topo/frente

      visibleFaces.forEach((face) => {
        const [p0, p1, p2] = face.pts;
        const [nx, ny, nz] = face.normal;

        // Cálculo de iluminação Direcional (Dot Product)
        const dot = Math.max(0, nx * lightDir[0] + ny * lightDir[1] + nz * lightDir[2]);
        const brightness = 0.25 + dot * 0.75;

        // Cores base do tema (Rubi / Dourado em Sucesso / Falha)
        const is20 = face.number === 20;
        const is1 = face.number === 1;

        let baseR = Math.round(120 * brightness + (is20 ? 60 : 0));
        let baseG = Math.round(20 * brightness + (is20 ? 40 : 0));
        let baseB = Math.round(25 * brightness);

        if (is1) {
          baseR = Math.round(180 * brightness);
          baseG = Math.round(15 * brightness);
          baseB = Math.round(15 * brightness);
        }

        // Desenha a Face Poligonal (Preenchimento)
        ctx.beginPath();
        ctx.moveTo(p0[0], p0[1]);
        ctx.lineTo(p1[0], p1[1]);
        ctx.lineTo(p2[0], p2[1]);
        ctx.closePath();

        ctx.fillStyle = `rgb(${baseR}, ${baseG}, ${baseB})`;
        ctx.fill();

        // Desenha as Arestas com Brilho Dourado (Apenas nas faces visíveis!)
        ctx.strokeStyle = is20 ? "#fbbf24" : "rgba(217, 119, 6, 0.65)";
        ctx.lineWidth = is20 ? 2.5 : 1.5;
        ctx.lineJoin = "round";
        ctx.stroke();

        // --------------------------------------------------------------------
        // 6. Número Chapado na Face (Alinhamento & Perspectiva no Plano da Face)
        // --------------------------------------------------------------------
        const faceCx = (p0[0] + p1[0] + p2[0]) / 3;
        const faceCy = (p0[1] + p1[1] + p2[1]) / 3;

        // Ângulo de orientação da face em 2D para girar o número junto com o polígono
        const angle = Math.atan2(p0[1] - faceCy, p0[0] - faceCx) + Math.PI / 2;

        // Escala proporcional ao tamanho do triângulo na tela
        const triWidth = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
        const fontSize = Math.max(10, Math.min(22, triWidth * 0.32));

        ctx.save();
        ctx.translate(faceCx, faceCy);
        ctx.rotate(angle);

        // Achata ligeiramente a fonte de acordo com a inclinação em Z para dar efeito chapado
        const flatScaleY = Math.max(0.4, Math.min(1.0, nz));
        ctx.scale(1.0, flatScaleY);

        ctx.fillStyle = is20 ? "#fef08a" : is1 ? "#fca5a5" : "#fef3c7";
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Desenha o número fixo e colado na superfície
        ctx.fillText(face.number.toString(), 0, 0);
        ctx.restore();
      });

      animFrameId = requestAnimationFrame(render);
    };

    animFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [onRollComplete]);

  return (
    <canvas
      ref={canvasRef}
      width={240}
      height={240}
      className="cursor-pointer touch-none drop-shadow-[0_0_20px_rgba(217,119,6,0.4)] transition-transform hover:scale-105 active:scale-95"
    />
  );
}

// ============================================================================
// Componente Principal da Hero Section
// ============================================================================
export function HeroSection({
  foundryUrl = campaingData.servidor,
  dataProximaSessao = campaingData.proximaSessao.data,
  tituloSessao = campaingData.proximaSessao.titulo,
}) {
  const [d20Value, setD20Value] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [statusRoll, setStatusRoll] = useState<"idle" | "success" | "fail">("idle");
  const CD = campaingData.proximaSessao.dtTesteFoundry

  const handleStartRoll = () => {
    if (isRolling) return;
    setIsRolling(true);
    setStatusRoll("idle");
    setD20Value(null);
  };

  const handleRollComplete = (finalValue: number) => {
    setD20Value(finalValue);
    setIsRolling(false);

    if (finalValue > CD -1) {
      setStatusRoll("success");
    } else {
      setStatusRoll("fail");
    }
  };

  return (
    <section className="relative w-full py-12 px-4 flex flex-col items-center justify-center bg-stone-950 text-stone-100 overflow-hidden">
      {/* Luzes de Fundo em tons de Rubi (#dc2626) e Dourado (#d97706) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-900/20 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-600/15 blur-2xl rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-4xl w-full flex flex-col items-center text-center space-y-8">
        
        {/* 1. Logo Principal da Campanha */}
        <div className="relative group transition-transform hover:scale-105 duration-300">
          <Image
            src="/logo-rpg.png"
            alt="Invocação do Herói — Tormenta 20"
            width={380}
            height={160}
            priority
            className="drop-shadow-[0_10px_25px_rgba(220,38,38,0.35)] object-contain"
          />
        </div>

        {/* 2. Informações da Próxima Sessão */}
        <div className="w-full max-w-lg bg-stone-900/90 border border-stone-800 rounded-xl p-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-red-600 via-amber-500 to-red-600" />
          
          <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            Próxima Sessão Agendada
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-stone-100 font-serif mb-1">
            {tituloSessao}
          </h2>

          <p className="text-sm text-stone-400 flex items-center justify-center gap-2 mt-2">
            <span>📅 {dataProximaSessao}</span>
          </p>

          <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
            <span><strong className="text-stone-200">Tormenta 20:</strong> Arco 2</span>
            <span>Status: <strong className="text-emerald-400"> Confirmada</strong></span>
          </div>
        </div>

        {/* 3. Desafio Interativo com o D20 3D em Canvas */}
        <div id="acessofoundry" className="w-full max-w-md bg-stone-900/50 border border-amber-900/40 rounded-2xl p-6 flex flex-col items-center space-y-4 shadow-xl">
          <div className="text-center">
            <h3 className="text-lg font-bold text-amber-300 font-serif">
              🛡️ O JOGO É PARA QUEM TEM SORTE 🛡️
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              <strong className="text-amber-400">CD {CD}</strong> para o guardião liberar a passagem para o Foundry VTT!
            </p>
          </div>

          {/* D20 3D Renderizado em Canvas com Interação */}
          <div onClick={handleStartRoll} className="flex justify-center items-center">
            <D203DCanvas
              isRolling={isRolling}
              targetValue={null}
              onRollComplete={handleRollComplete}
            />
          </div>

          {/* Mensagens de Feedback */}
          {statusRoll === "idle" && !isRolling && d20Value === null && (
            <p className="text-xs text-stone-400 animate-pulse">
              Clique no d20 para rolar! 🎲
            </p>
          )}

          {isRolling && (
            <p className="text-xs text-amber-400 font-semibold tracking-wide animate-pulse">
              🎲 Rolando d20 no grid de Arton...
            </p>
          )}

          {statusRoll === "success" && (
            <div className="text-center space-y-1 animate-bounce">
              <p className="text-sm font-bold text-emerald-400">
                ⚔️ SUCESSO! Você tirou {d20Value === 20 ? "20 (DECISIVO!)" : d20Value}!
              </p>
              <p className="text-xs text-stone-300">
                O guardião liberou a passagem! Entrando no Foundry VTT...
              </p>
              <a 
              href="http://rpgtormenta.servegame.com:30000" 
              target="\_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 bg-linear-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-stone-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-900/40 transition-all transform hover:scale-105 active:scale-95 border border-amber-300/40">
              <span>🔥 Entrar na Mesa </span> </a>
            </div>
          )}

          {statusRoll === "fail" && (
            <div className="text-center space-y-1">
              <p className="text-sm font-bold text-red-500">
                💀 FALHA NO TESTE! Você tirou {d20Value === 1 ? "1! Que Piada 🤣" : d20Value}.
              </p>
              <p className="text-xs text-stone-400">
                O guardião bloqueou sua entrada. Gaste seu azar antes do jogo!
              </p>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
