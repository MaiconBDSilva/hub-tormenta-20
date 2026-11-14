import { User } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DadosUsuario } from "@/tipos/personagem";
import { sanitizarPayload } from "./firestoreHelpers";

export async function buscarOuCriarPerfilUsuario(user: User): Promise<DadosUsuario> {
  const userDocRef = doc(db, "usuarios", user.uid);
  const docSnap = await getDoc(userDocRef);

  if (docSnap.exists()) {
    return docSnap.data() as DadosUsuario;
  }

  const novoPerfil: DadosUsuario = {
    uid: user.uid,
    nome: user.displayName || "Aventureiro sem Nome",
    email: user.email || "",
    fotoUrl: user.photoURL || null,
    role: "jogador",
    personagemId: null,
  };

  await setDoc(userDocRef, sanitizarPayload(novoPerfil));
  return novoPerfil;
}

export async function listarUsuarios(): Promise<DadosUsuario[]> {
  const snapUsuarios = await getDocs(collection(db, "usuarios"));
  return snapUsuarios.docs.map((d) => d.data() as DadosUsuario);
}

/**
 * Atualiza de forma atômica o vínculo bidirecional entre Usuário e Personagem.
 */
export async function vincularUsuarioPersonagem(params: {
  usuario: DadosUsuario;
  novoPersonagemId: string;
}): Promise<void> {
  const { usuario, novoPersonagemId } = params;
  const personagemIdAntigo = usuario.personagemId || "";
  if (novoPersonagemId === personagemIdAntigo) return;

  const batch = writeBatch(db);
  const agoraIso = new Date().toISOString();

  const userRef = doc(db, "usuarios", usuario.uid);
  batch.update(userRef, {
    personagemId: novoPersonagemId || null,
  });

  if (personagemIdAntigo) {
    const persAntigoRef = doc(db, "personagens", personagemIdAntigo);
    batch.update(persAntigoRef, {
      donoUid: null,
      donoNome: null,
      atualizadoEm: agoraIso,
    });
  }

  if (novoPersonagemId) {
    const persNovoRef = doc(db, "personagens", novoPersonagemId);
    batch.update(persNovoRef, {
      donoUid: usuario.uid,
      donoNome: usuario.nome,
      atualizadoEm: agoraIso,
    });
  }

  await batch.commit();
}

