import { NextResponse } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DadosCampanha } from "@/tipos/campanha";

export const dynamic = "force-dynamic";

const URL_PADRAO_FALLBACK = "http://rpgtormenta.servegame.com:30000";

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
