import { NextResponse } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DadosCampanha } from "@/tipos/campanha";

export const dynamic = "force-dynamic";

const URL_PADRAO_FALLBACK = "http://rpgtormenta.servegame.com:30000";

function ehHostPrivadoOuLocal(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (
    host === "localhost" ||
    host === "::1" ||
    host === "0.0.0.0" ||
    host.endsWith(".local") ||
    host.endsWith(".internal")
  ) {
    return true;
  }

  const ipv4Match = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  if (ipv4Match) {
    const [, a, b] = ipv4Match.map(Number);
    if (
      a === 10 ||
      a === 127 ||
      a === 0 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168)
    ) {
      return true;
    }
  }

  return false;
}

function ehUrlFoundrySegura(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }
    return !ehHostPrivadoOuLocal(parsed.hostname);
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    let urlFoundry = URL_PADRAO_FALLBACK;

    try {
      const docRef = doc(db, "configuracoes", "campanha");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const dados = docSnap.data() as DadosCampanha;
        if (dados?.servidor?.foundryUrl?.trim()) {
          urlFoundry = dados.servidor.foundryUrl.trim();
        }
      }
    } catch (dbErr) {
      console.warn("Falha ao consultar URL do Foundry no Firestore, usando fallback:", dbErr);
    }

    const urlLimpa = urlFoundry.replace(/\/+$/, "");

    if (!ehUrlFoundrySegura(urlLimpa)) {
      return NextResponse.json({ online: false });
    }

    const response = await fetch(`${urlLimpa}/api/status`, {
      method: "GET",
      signal: AbortSignal.timeout(3000),
    });

    if (response.ok) {
      return NextResponse.json({ online: true, url: urlLimpa });
    }

    return NextResponse.json({ online: false, url: urlLimpa });
  } catch {
    return NextResponse.json({ online: false });
  }
}
