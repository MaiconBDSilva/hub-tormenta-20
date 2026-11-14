"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Users, Shield, Loader2, AlertCircle, Save, CheckCircle2 } from "lucide-react";
import { DadosUsuario, PersonagemRPG } from "@/tipos/personagem";
import { listarUsuarios, vincularUsuarioPersonagem } from "@/servicos/usuariosService";
import { listarPersonagens } from "@/servicos/personagensService";
import styles from "./painel.module.css";

export function GerenciadorUsuarios() {
  const [usuarios, setUsuarios] = useState<DadosUsuario[]>([]);
  const [personagens, setPersonagens] = useState<PersonagemRPG[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvandoUid, setSalvandoUid] = useState<string | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  // Mapa local para controle das seleções do select: { [uid]: personagemId }
  const [vinculos, setVinculos] = useState<Record<string, string>>({});

  const carregarDados = useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);

      const [listaUsuarios, listaPersonagens] = await Promise.all([
        listarUsuarios(),
        listarPersonagens(),
      ]);

      const mapaVinculos: Record<string, string> = {};
      listaUsuarios.forEach((u) => {
        mapaVinculos[u.uid] = u.personagemId || "";
      });

      setUsuarios(listaUsuarios);
      setPersonagens(listaPersonagens);
      setVinculos(mapaVinculos);
    } catch (err) {
      console.error("Erro ao carregar usuários e personagens:", err);
      setErro("Falha ao consultar jogadores no Firestore.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const handleSelectChange = (uid: string, novoPersonagemId: string) => {
    setVinculos((prev) => ({ ...prev, [uid]: novoPersonagemId }));
  };

  // Salva o vínculo bidirecional
  const handleSalvarVinculo = async (usuario: DadosUsuario) => {
    const novoPersonagemId = vinculos[usuario.uid] || "";
    const personagemIdAntigo = usuario.personagemId || "";

    // Se não houve alteração, evita requisição
    if (novoPersonagemId === personagemIdAntigo) return;

    setSalvandoUid(usuario.uid);
    setMensagemSucesso(null);
    setErro(null);

    try {
      await vincularUsuarioPersonagem({ usuario, novoPersonagemId });

      // Atualiza estado local do usuário
      setUsuarios((prev) =>
        prev.map((u) =>
          u.uid === usuario.uid
            ? { ...u, personagemId: novoPersonagemId || null }
            : u
        )
      );

      setMensagemSucesso(`Vínculo de "${usuario.nome}" atualizado com sucesso!`);
    } catch (err) {
      console.error("Erro ao vincular personagem ao jogador:", err);
      setErro("Falha ao salvar vínculo no Firestore.");
    } finally {
      setSalvandoUid(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Topo Explicativo */}
      <div className={styles.toolbarPainel}>
        <div>
          <h2 className={styles.toolbarTitulo}>
            <Users className="w-5 h-5 text-amber-500" />
            Vínculo de Jogadores & Heróis
          </h2>
          <p className={styles.toolbarSubtitulo}>
            Associe cada jogador cadastrado à sua respectiva ficha de personagem principal.
            Este vínculo definirá a identidade do usuário na Agenda, Diários e visualizações da campanha.
          </p>
        </div>
      </div>

      {mensagemSucesso && (
        <div className="t20-alert-success">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{mensagemSucesso}</span>
        </div>
      )}

      {erro && (
        <div className="t20-alert-error">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{erro}</span>
        </div>
      )}

      {carregando ? (
        <div className="t20-loading-box">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-2" />
          <p className="text-xs font-serif uppercase tracking-wider">
            Consultando registros dos jogadores...
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {usuarios.length === 0 ? (
            <div className="t20-empty-state text-xs">
              Nenhum usuário cadastrado até o momento.
            </div>
          ) : (
            usuarios.map((usuario) => {
              const valorSelecionado = vinculos[usuario.uid] ?? "";
              const modificado = valorSelecionado !== (usuario.personagemId || "");
              const isSalvando = salvandoUid === usuario.uid;

              return (
                <div
                  key={usuario.uid}
                  className={`${styles.usuarioRow} t20-card`}
                >
                  {/* Info do Usuário */}
                  <div className="flex items-center gap-3">
                    <div className={styles.avatarUsuario}>
                      {usuario.fotoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={usuario.fotoUrl}
                          alt={usuario.nome}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={styles.avatarIniciais}>
                          {usuario.nome.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-stone-200 text-sm">
                          {usuario.nome}
                        </span>
                        {usuario.role === "mestre" && (
                          <span className="t20-badge t20-badge-red uppercase">
                            Mestre
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-400">{usuario.email}</p>
                    </div>
                  </div>

                  {/* Seleção do Personagem Principal */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                      <select
                        value={valorSelecionado}
                        onChange={(e) =>
                          handleSelectChange(usuario.uid, e.target.value)
                        }
                        className="t20-input text-xs py-2 pr-8 appearance-none cursor-pointer"
                      >
                        <option value="" className="bg-stone-950 text-stone-400">
                          -- Sem Personagem Atribuído --
                        </option>
                        {personagens.map((p) => (
                          <option
                            key={p.id}
                            value={p.id}
                            className="bg-stone-950 text-stone-200"
                          >
                            {p.nome} ({p.raca} • {p.classe})
                          </option>
                        ))}
                      </select>
                      <Shield className="w-4 h-4 text-stone-500 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSalvarVinculo(usuario)}
                      disabled={!modificado || isSalvando}
                      className="t20-btn-primary t20-btn-sm"
                      title={modificado ? "Salvar Vínculo" : "Sem alterações"}
                    >
                      {isSalvando ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Salvar
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}