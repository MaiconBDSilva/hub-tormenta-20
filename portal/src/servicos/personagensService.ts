import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PersonagemRPG } from "@/tipos/personagem";
import { sanitizarPayload } from "./firestoreHelpers";

export async function listarPersonagens(): Promise<PersonagemRPG[]> {
  const snap = await getDocs(collection(db, "personagens"));
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<PersonagemRPG, "id">),
  }));
}

export async function buscarPersonagemPorId(id: string): Promise<PersonagemRPG | null> {
  const docSnap = await getDoc(doc(db, "personagens", id));
  if (!docSnap.exists()) return null;
  return {
    id: docSnap.id,
    ...(docSnap.data() as Omit<PersonagemRPG, "id">),
  };
}

export async function atualizarPersonagem(
  id: string,
  dados: Record<string, unknown>
): Promise<void> {
  const refDoc = doc(db, "personagens", id);
  await updateDoc(refDoc, sanitizarPayload(dados));
}

export function ehDonoDePersonagem(
  personagem: Pick<PersonagemRPG, "id" | "donoUid"> | null | undefined,
  usuarioUid?: string | null,
  perfilPersonagemId?: string | null
): boolean {
  if (!personagem) return false;
  return Boolean(
    (usuarioUid && personagem.donoUid === usuarioUid) ||
      (perfilPersonagemId && perfilPersonagemId === personagem.id)
  );
}

