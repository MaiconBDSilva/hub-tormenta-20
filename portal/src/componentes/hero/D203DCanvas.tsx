/* D20 3D Canvas - Three.js version
 *
 * API preserved:
 *   <D203DCanvas
 *     isRolling={isRolling}
 *     targetValue={targetValue}
 *     onRollComplete={onRollComplete}
 *   />
 *
 * Numbers are generated as CanvasTextures and mapped onto the 20
 * triangular faces of an actual IcosahedronGeometry.
 */

"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const PHI = (1 + Math.sqrt(5)) / 2;

const RAW_VERTICES: [number, number, number][] = [
  [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
  [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
  [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1]
];

const VERTICES = RAW_VERTICES.map(([x, y, z]) => {
  const d = Math.hypot(x, y, z);
  return [x / d, y / d, z / d] as [number, number, number];
});

const FACES = [
  [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
  [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
  [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
  [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
] as const;

// Mantém exatamente o mesmo mapeamento do componente original.
const FACE_NUMBERS = [
  1, 2, 3, 4, 5,
  6, 7, 8, 9, 10,
  11, 12, 13, 14, 20,
  16, 17, 18, 19, 15
];

// Normais das faces no espaço local.
const FACE_NORMALS = FACES.map((face) => {
  const v0 = VERTICES[face[0]];
  const v1 = VERTICES[face[1]];
  const v2 = VERTICES[face[2]];

  const cx = (v0[0] + v1[0] + v2[0]) / 3;
  const cy = (v0[1] + v1[1] + v2[1]) / 3;
  const cz = (v0[2] + v1[2] + v2[2]) / 3;

  const d = Math.hypot(cx, cy, cz);

  return [cx / d, cy / d, cz / d] as [number, number, number];
});

function getTargetRotationForNumber(
  num: number
): { rx: number; ry: number } {
  const faceIdx = FACE_NUMBERS.indexOf(num);
  const idx = faceIdx !== -1 ? faceIdx : 0;

  const [nx, ny, nz] = FACE_NORMALS[idx];

  const ry = -Math.atan2(nx, nz);
  const r_xz = Math.hypot(nx, nz);
  const rx = Math.atan2(ny, r_xz);

  return { rx, ry };
}

/**
 * Cria uma textura individual para cada número.
 *
 * O número é desenhado em um canvas transparente e depois aplicado
 * diretamente ao material de uma face triangular do icosaedro.
 */
function createNumberTexture(number: number): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");

  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Não foi possível criar o contexto 2D da textura.");
  }

  ctx.clearRect(0, 0, size, size);

  const is20 = number === 20;
  const is1 = number === 1;

  // Sombra/relevo do número.
  /*
   * A textura inteira é maior do que o número. Isso é importante:
   * a face triangular funciona como máscara, então precisamos deixar
   * bastante margem para que o glifo nunca encoste nas três bordas.
   *
   * O ponto (size/2, size/2) corresponde ao centróide geométrico da
   * face graças às UVs usadas em createFaceGeometry().
   */
  const fontSize = number >= 10 ? 145 : 175;

  ctx.font = `900 ${fontSize}px Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Sombra profunda, pequena e deslocada.
  ctx.fillStyle = "rgba(15, 2, 3, 0.90)";
  ctx.fillText(
    number.toString(),
    size / 2 + 7,
    size / 2 + 9
  );

  // Pequeno realce para sugerir a borda interna da gravação.
  ctx.fillStyle = "rgba(255, 190, 190, 0.30)";
  ctx.fillText(
    number.toString(),
    size / 2 - 4,
    size / 2 - 4
  );

  // Cor principal.
  ctx.fillStyle = is20
    ? "#fef08a"
    : is1
      ? "#fca5a5"
      : "#fef3c7";

  ctx.fillText(
    number.toString(),
    size / 2,
    size / 2
  );

  const texture = new THREE.CanvasTexture(canvas);

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  texture.anisotropy = 4;

  return texture;
}

/**
 * Cria uma geometria triangular para uma face.
 *
 * A geometria possui UVs deliberadamente simples: cada número ocupa
 * o centro da face e a textura transparente não cobre o restante.
 */
function createFaceGeometry(
  v0: [number, number, number],
  v1: [number, number, number],
  v2: [number, number, number]
): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();

  const positions = new Float32Array([
    ...v0,
    ...v1,
    ...v2
  ]);

  /*
   * UV triangular.
   *
   * O ponto crucial aqui é o centróide:
   *
   *   UV0 = (0.00, 0.25)
   *   UV1 = (1.00, 0.25)
   *   UV2 = (0.50, 1.00)
   *
   * O centróide dessas três coordenadas é exatamente:
   *
   *   ((0 + 1 + 0.5) / 3, (0.25 + 0.25 + 1) / 3)
   *   = (0.50, 0.50)
   *
   * Portanto, o centro da textura coincide com o centro geométrico
   * da face triangular. Isso corrige o deslocamento vertical que
   * existia quando o centro da textura estava em (0.5, 0.5), mas
   * o centróide das UVs estava em (0.5, 0.36).
   *
   * O número tem fundo transparente e bastante margem, então ele
   * permanece dentro da região útil da face.
   */
  const uvs = new Float32Array([
    0.00, 0.25,
    1.00, 0.25,
    0.50, 1.00
  ]);

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  geometry.setAttribute(
    "uv",
    new THREE.BufferAttribute(uvs, 2)
  );

  geometry.computeVertexNormals();

  return geometry;
}

export default function D203DCanvas({
  isRolling,
  targetValue,
  onRollComplete,
}: {
  isRolling: boolean;
  targetValue: number | null;
  onRollComplete: (val: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const rotRef = useRef({
    rx: 0.3,
    ry: 0.4,
  });

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

  /*
   * Mantemos uma ref para o callback para que a animação Three.js
   * não precise ser destruída/recriada quando o pai renderizar.
   */
  const onRollCompleteRef = useRef(onRollComplete);

  useEffect(() => {
    onRollCompleteRef.current = onRollComplete;
  }, [onRollComplete]);

  /*
   * Mantém exatamente a lógica de disparo da rolagem do componente
   * anterior.
   */
  useEffect(() => {
    if (
      isRolling &&
      animStateRef.current.phase !== "rolling"
    ) {
      const rolledVal =
        targetValue ??
        Math.floor(Math.random() * 20) + 1;

      const {
        rx: targetRx,
        ry: targetRy,
      } = getTargetRotationForNumber(rolledVal);

      const spinsX =
        (Math.floor(Math.random() * 3) + 3) *
        Math.PI *
        2;

      const spinsY =
        (Math.floor(Math.random() * 4) + 4) *
        Math.PI *
        2;

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

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    /*
     * Renderer.
     */
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, 2)
    );

    renderer.setSize(
      canvas.clientWidth || 240,
      canvas.clientHeight || 240,
      false
    );

    renderer.outputColorSpace = THREE.SRGBColorSpace;

    /*
     * Cena.
     */
    const scene = new THREE.Scene();

    /*
     * Câmera ortográfica para manter a aparência próxima ao Canvas
     * original e evitar que o D20 mude de tamanho com a profundidade.
     */
    const camera = new THREE.OrthographicCamera(
      -1.65,
      1.65,
      1.65,
      -1.65,
      0.1,
      100
    );

    camera.position.set(0, 0, 6);
    camera.lookAt(0, 0, 0);

    /*
     * Grupo principal do D20.
     */
    const d20Group = new THREE.Group();
    d20Group.rotation.x = rotRef.current.rx;
    d20Group.rotation.y = rotRef.current.ry;

    scene.add(d20Group);

    /*
     * Material base vermelho escuro.
     *
     * Cada face recebe um MeshStandardMaterial próprio com sua
     * textura de número.
     */
    const numberTextures = new Map<number, THREE.CanvasTexture>();

    for (let n = 1; n <= 20; n++) {
      numberTextures.set(n, createNumberTexture(n));
    }

    /*
     * Cria cada uma das 20 faces como uma pequena malha triangular.
     *
     * A vantagem desta abordagem é que a textura realmente pertence
     * à geometria 3D da face: ao girar o D20, o número gira junto.
     */
    const faceMeshes: THREE.Mesh[] = [];

    FACES.forEach((face, index) => {
      const v0 = VERTICES[face[0]];
      const v1 = VERTICES[face[1]];
      const v2 = VERTICES[face[2]];

      const geometry = createFaceGeometry(v0, v1, v2);

      const number = FACE_NUMBERS[index];
      const texture = numberTextures.get(number)!;

      const is20 = number === 20;
      const is1 = number === 1;

      const material = new THREE.MeshStandardMaterial({
        map: texture,
        color: is20
          ? 0xffce0d
          : is1
            ? 0xb51f25
            : 0xffffff,
        roughness: 0.78,
        metalness: 0.05,
        transparent: false,
        //alphaTest: 0.01,
        side: THREE.FrontSide,
      });

      const mesh = new THREE.Mesh(
        geometry,
        material
      );

      faceMeshes.push(mesh);
      d20Group.add(mesh);
    });

    /*
     * Arestas do D20.
     *
     * Isso reproduz a leitura visual das bordas que existia no Canvas
     * original, mas agora com profundidade 3D real.
     */
    const outlineGeometry =
      new THREE.BufferGeometry();

    const outlinePositions: number[] = [];

    const uniqueEdges = new Set<string>();

    FACES.forEach((face) => {
      const edges = [
        [face[0], face[1]],
        [face[1], face[2]],
        [face[2], face[0]],
      ];

      edges.forEach(([a, b]) => {
        const key =
          a < b
            ? `${a}-${b}`
            : `${b}-${a}`;

        if (uniqueEdges.has(key)) {
          return;
        }

        uniqueEdges.add(key);

        const va = VERTICES[a];
        const vb = VERTICES[b];

        outlinePositions.push(
          ...va,
          ...vb
        );
      });
    });

    outlineGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        outlinePositions,
        3
      )
    );

    const outlineMaterial =
      new THREE.LineBasicMaterial({
        color: 0xd97706,
        transparent: true,
        opacity: 0.72,
      });

    const outline =
      new THREE.LineSegments(
        outlineGeometry,
        outlineMaterial
      );

    d20Group.add(outline);

    /*
     * Luzes.
     */
    const ambientLight =
      new THREE.AmbientLight(
        0xffffff,
        1.8
      );

    scene.add(ambientLight);

    const keyLight =
      new THREE.DirectionalLight(
        0xffe6d5,
        3.2
      );

    keyLight.position.set(
      2.5,
      4.0,
      5.0
    );

    scene.add(keyLight);

    const fillLight =
      new THREE.DirectionalLight(
        0x7f8cff,
        0.75
      );

    fillLight.position.set(
      -3,
      -1,
      2
    );

    scene.add(fillLight);

    /*
     * Luz adicional frontal para garantir legibilidade dos números.
     */
    const frontLight =
      new THREE.PointLight(
        0xffffff,
        1.2,
        10
      );

    frontLight.position.set(
      0,
      0,
      4
    );

    scene.add(frontLight);

    /*
     * Animação.
     */
    let animFrameId = 0;

    const render = (now: number) => {
      const state = animStateRef.current;

      if (state.phase === "idle") {
        rotRef.current.rx += 0.006;
        rotRef.current.ry += 0.009;
      } else if (state.phase === "rolling") {
        const duration = 1400;
        const elapsed =
          now - state.startTime;

        const t = Math.min(
          1,
          elapsed / duration
        );

        const easeOut =
          1 - Math.pow(1 - t, 3);

        /*
         * Mesma lógica de interpolação da versão original.
         */
        rotRef.current.rx =
          state.startRx +
          (
            state.spinsX +
            (
              state.targetRx -
              (
                state.startRx %
                (Math.PI * 2)
              )
            )
          ) *
            easeOut;

        rotRef.current.ry =
          state.startRy +
          (
            state.spinsY +
            (
              state.targetRy -
              (
                state.startRy %
                (Math.PI * 2)
              )
            )
          ) *
            easeOut;

        if (t >= 1) {
          rotRef.current.rx =
            state.targetRx;

          rotRef.current.ry =
            state.targetRy;

          state.phase = "stopped";

          onRollCompleteRef.current(
            state.finalValue
          );
        }
      } else if (state.phase === "stopped") {
        rotRef.current.rx =
          state.targetRx;

        rotRef.current.ry =
          state.targetRy;
      }

      d20Group.rotation.x =
        rotRef.current.rx;

      d20Group.rotation.y =
        rotRef.current.ry;

      renderer.render(
        scene,
        camera
      );

      animFrameId =
        requestAnimationFrame(render);
    };

    animFrameId =
      requestAnimationFrame(render);

    /*
     * Resize.
     */
    const resizeObserver =
      new ResizeObserver(() => {
        const width =
          canvas.clientWidth || 240;

        const height =
          canvas.clientHeight || 240;

        const aspect =
          width / height;

        const frustum = 1.65;

        camera.left =
          -frustum * aspect;

        camera.right =
          frustum * aspect;

        camera.top =
          frustum;

        camera.bottom =
          -frustum;

        camera.updateProjectionMatrix();

        renderer.setSize(
          width,
          height,
          false
        );
      });

    resizeObserver.observe(canvas);

    /*
     * Limpeza.
     */
    return () => {
      cancelAnimationFrame(
        animFrameId
      );

      resizeObserver.disconnect();

      faceMeshes.forEach((mesh) => {
        mesh.geometry.dispose();

        const material =
          mesh.material as THREE.MeshStandardMaterial;

        material.dispose();
      });

      numberTextures.forEach(
        (texture) => texture.dispose()
      );

      outlineGeometry.dispose();
      outlineMaterial.dispose();

      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={240}
      height={240}
      className="cursor-pointer touch-none drop-shadow-[0_0_20px_rgba(217,119,6,0.4)] transition-transform hover:scale-105 active:scale-95"
    />
  );
}
