"use client";

import React, { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Bold,
  Italic,
  Underline,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Code,
  Eye,
  PenLine,
} from "lucide-react";
import styles from "./EditorTextoRicoT20.module.css";

interface EditorTextoRicoT20Props {
  valor: string;
  onChange: (novoValor: string) => void;
  placeholder?: string;
  linhas?: number;
}

export function EditorTextoRicoT20({
  valor,
  onChange,
  placeholder = "Inscreva suas anotações ou crônicas nos anais de Arton...",
  linhas = 10,
}: EditorTextoRicoT20Props) {
  const [abaVisualizacao, setAbaVisualizacao] = useState<"escrever" | "visualizar">("escrever");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /**
   * Envolve ou insere marcações de Markdown na posição atual do cursor/seleção.
   */
  const aplicarFormatacao = (prefixo: string, sufixo: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const inicio = textarea.selectionStart;
    const fim = textarea.selectionEnd;
    const textoOriginal = valor;

    const textoSelecionado = textoOriginal.substring(inicio, fim);
    const novoTexto =
      textoOriginal.substring(0, inicio) +
      prefixo +
      textoSelecionado +
      sufixo +
      textoOriginal.substring(fim);

    onChange(novoTexto);

    // Reposiciona o cursor após a alteração
    setTimeout(() => {
      textarea.focus();
      if (inicio === fim) {
        textarea.setSelectionRange(
          inicio + prefixo.length,
          inicio + prefixo.length
        );
      } else {
        textarea.setSelectionRange(
          inicio + prefixo.length,
          fim + prefixo.length
        );
      }
    }, 0);
  };

  const aplicarPrefixoLinha = (prefixoLinha: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const inicio = textarea.selectionStart;
    const textoOriginal = valor;

    // Encontra o início da linha atual
    const inicioLinha = textoOriginal.lastIndexOf("\n", inicio - 1) + 1;
    const novoTexto =
      textoOriginal.substring(0, inicioLinha) +
      prefixoLinha +
      textoOriginal.substring(inicioLinha);

    onChange(novoTexto);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        inicio + prefixoLinha.length,
        inicio + prefixoLinha.length
      );
    }, 0);
  };

  return (
    <div className={styles.editorContainer}>
      {/* Barra de Ferramentas / Toolbar Diegética */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarGroup}>
          {/* Negrito */}
          <button
            type="button"
            onClick={() => aplicarFormatacao("**", "**")}
            className={styles.toolbarBtn}
            title="Negrito (**texto**)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          {/* Itálico */}
          <button
            type="button"
            onClick={() => aplicarFormatacao("*", "*")}
            className={styles.toolbarBtn}
            title="Itálico (*texto*)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          {/* Sublinhado */}
          <button
            type="button"
            onClick={() => aplicarFormatacao("<u>", "</u>")}
            className={styles.toolbarBtn}
            title="Sublinhado (<u>texto</u>)"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>

          <span className={styles.toolbarDivider} />

          {/* Título H2 */}
          <button
            type="button"
            onClick={() => aplicarPrefixoLinha("## ")}
            className={styles.toolbarBtn}
            title="Título de Seção (## Título)"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>

          {/* Título H3 */}
          <button
            type="button"
            onClick={() => aplicarPrefixoLinha("### ")}
            className={styles.toolbarBtn}
            title="Subtítulo (### Subtítulo)"
          >
            <Heading3 className="w-3.5 h-3.5" />
          </button>

          <span className={styles.toolbarDivider} />

          {/* Lista com Marcadores */}
          <button
            type="button"
            onClick={() => aplicarPrefixoLinha("- ")}
            className={styles.toolbarBtn}
            title="Lista com Marcadores (- Item)"
          >
            <List className="w-3.5 h-3.5" />
          </button>

          {/* Lista Numerada */}
          <button
            type="button"
            onClick={() => aplicarPrefixoLinha("1. ")}
            className={styles.toolbarBtn}
            title="Lista Numerada (1. Item)"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>

          {/* Citação / Lore */}
          <button
            type="button"
            onClick={() => aplicarPrefixoLinha("> ")}
            className={styles.toolbarBtn}
            title="Citação / Lore (> Citação)"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>

          {/* Linha Divisória */}
          <button
            type="button"
            onClick={() => aplicarFormatacao("\n\n---\n\n")}
            className={styles.toolbarBtn}
            title="Linha Divisória Rúnica (---)"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {/* Código / Regra Inline */}
          <button
            type="button"
            onClick={() => aplicarFormatacao("`", "`")}
            className={styles.toolbarBtn}
            title="Código / Regra mecânica (`termo`)"
          >
            <Code className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Alternância: Escrever vs. Pré-visualizar */}
        <div className={styles.modeSwitch}>
          <button
            type="button"
            onClick={() => setAbaVisualizacao("escrever")}
            className={`${styles.modeBtn} ${
              abaVisualizacao === "escrever" ? styles.modeBtnActive : ""
            }`}
          >
            <PenLine className="w-3 h-3" />
            <span>Escrever</span>
          </button>

          <button
            type="button"
            onClick={() => setAbaVisualizacao("visualizar")}
            className={`${styles.modeBtn} ${
              abaVisualizacao === "visualizar" ? styles.modeBtnActive : ""
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Visualizar</span>
          </button>
        </div>
      </div>

      {/* Área de Entrada vs. Pré-visualização */}
      {abaVisualizacao === "escrever" ? (
        <textarea
          ref={textareaRef}
          rows={linhas}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={styles.textarea}
        />
      ) : (
        <div className={styles.previewArea}>
          {valor.trim() ? (
            <VisualizadorMarkdownT20 conteudo={valor} />
          ) : (
            <p className={styles.previewEmpty}>
              Nada para pré-visualizar ainda. Escreva algo na aba ao lado!
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Componente exportado para renderizar o Markdown estilizado no visual diegético de Tormenta 20
 */
export function VisualizadorMarkdownT20({ conteudo }: { conteudo: string }) {
  return (
    <div className={styles.markdownProse}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className={styles.mdH1}>{children}</h1>,
          h2: ({ children }) => <h2 className={styles.mdH2}>{children}</h2>,
          h3: ({ children }) => <h3 className={styles.mdH3}>{children}</h3>,
          strong: ({ children }) => <strong className={styles.mdStrong}>{children}</strong>,
          em: ({ children }) => <em className={styles.mdEm}>{children}</em>,
          blockquote: ({ children }) => (
            <blockquote className={styles.mdBlockquote}>{children}</blockquote>
          ),
          ul: ({ children }) => <ul className={styles.mdUl}>{children}</ul>,
          ol: ({ children }) => <ol className={styles.mdOl}>{children}</ol>,
          li: ({ children }) => <li className={styles.mdLi}>{children}</li>,
          hr: () => <hr className={styles.mdHr} />,
          code: ({ children }) => <code className={styles.mdCode}>{children}</code>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.mdLink}
            >
              {children}
            </a>
          ),
          p: ({ children }) => <p className={styles.mdP}>{children}</p>,
        }}
      >
        {conteudo}
      </ReactMarkdown>
    </div>
  );
}