"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { DadosUsuario, RoleUsuario } from "@/tipos/personagem";
import { buscarOuCriarPerfilUsuario } from "@/servicos/usuariosService";

export type { DadosUsuario, RoleUsuario };

export interface AuthContextType {
  usuario: User | null;
  dadosPerfil: DadosUsuario | null;
  carregando: boolean;
  erroPerfil: string | null;
  loginComGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  ehMestre: boolean;
}

const AuthContext = createContext<AuthContextType>({
  usuario: null,
  dadosPerfil: null,
  carregando: true,
  erroPerfil: null,
  loginComGoogle: async () => {},
  logout: async () => {},
  ehMestre: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [dadosPerfil, setDadosPerfil] = useState<DadosUsuario | null>(null);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erroPerfil, setErroPerfil] = useState<string | null>(null);

  useEffect(() => {
    // Escuta ativamente mudanças de autenticação do Firebase
    const cancelarInscricao = onAuthStateChanged(auth, async (user) => {
      setUsuario(user);
      setErroPerfil(null);

      if (user) {
        try {
          const perfil = await buscarOuCriarPerfilUsuario(user);
          setDadosPerfil(perfil);
        } catch (erro) {
          console.error("Erro ao sincronizar perfil no Firestore:", erro);
          setErroPerfil("Falha ao carregar seu perfil de aventureiro.");
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
        erroPerfil,
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