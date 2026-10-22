"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "../lib/firebase";

export type RoleUsuario = "mestre" | "jogador";

export interface DadosUsuario {
  uid: string;
  nome: string;
  email: string;
  fotoUrl?: string;
  role: RoleUsuario;
  personagemId?: string | null;
}

export interface AuthContextType {
  usuario: User | null;
  dadosPerfil: DadosUsuario | null;
  carregando: boolean;
  loginComGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  ehMestre: boolean;
}

const AuthContext = createContext<AuthContextType>({
  usuario: null,
  dadosPerfil: null,
  carregando: true,
  loginComGoogle: async () => {},
  logout: async () => {},
  ehMestre: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [dadosPerfil, setDadosPerfil] = useState<DadosUsuario | null>(null);
  const [carregando, setCarregando] = useState<boolean>(true);

  useEffect(() => {
    // Escuta ativamente mudanças de autenticação do Firebase
    const cancelarInscricao = onAuthStateChanged(auth, async (user) => {
      setUsuario(user);

      if (user) {
        try {
          const userDocRef = doc(db, "usuarios", user.uid);
          const docSnap = await getDoc(userDocRef);

          if (docSnap.exists()) {
            // Perfil existente recuperado do Firestore
            setDadosPerfil(docSnap.data() as DadosUsuario);
          } else {
            // Primeiro login: cria o perfil inicial com a role "jogador"
            const novoPerfil: DadosUsuario = {
              uid: user.uid,
              nome: user.displayName || "Aventureiro sem Nome",
              email: user.email || "",
              fotoUrl: user.photoURL || undefined,
              role: "jogador",
              personagemId: null,
            };
            await setDoc(userDocRef, novoPerfil);
            setDadosPerfil(novoPerfil);
          }
        } catch (erro) {
          console.error("Erro ao sincronizar perfil no Firestore:", erro);
        }
      } else {
        // Usuário deslogado
        setDadosPerfil(null);
      }

      setCarregando(false);
    });

    return () => cancelarInscricao();
  }, []);

  const loginComGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (erro) {
      console.error("Falha ao autenticar com Google:", erro);
      throw erro;
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setDadosPerfil(null);
    } catch (erro) {
      console.error("Falha ao deslogar:", erro);
    }
  };

  const ehMestre = dadosPerfil?.role === "mestre";

  return (
    <AuthContext.Provider
      value={{
        usuario,
        dadosPerfil,
        carregando,
        loginComGoogle,
        logout,
        ehMestre,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}