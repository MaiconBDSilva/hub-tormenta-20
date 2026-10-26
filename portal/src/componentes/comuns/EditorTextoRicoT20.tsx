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
    <div className="rounded-xl border border-amber-500/40 bg-stone-950/90 shadow-xl overflow-hidden focus-within:border-amber-400/80 transition-colors">
      {/* Barra de Ferramentas / Toolbar Diegética */}
      <div className="flex flex-wrap items-center justify-between gap-1 p-2 bg-stone-900/80 border-b border-stone-800">
        <div className="flex flex-wrap items-center gap-0.5">
          {/* Negrito */}
          <button
            type="button"
            onClick={() => aplicarFormatacao("**", "**")}
            className="p-1.5 rounded hover:bg-stone-800 text-stone-300 hover:text-amber-300 transition-colors"
            title="Negrito (**texto**)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          {/* Itálico */}
          <button
            type="button"
            onClick={() => aplicarFormatacao("*", "*")}
            className="p-1.5 rounded hover:bg-stone-800 text-stone-300 hover:text-amber-300 transition-colors"
            title="Itálico (*texto*)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          {/* Sublinhado */}
          <button
            type="button"
            onClick={() => aplicarFormatacao("<u>", "</u>")}
            className="p-1.5 rounded hover:bg-stone-800 text-stone-300 hover:text-amber-300 transition-colors"
            title="Sublinhado (<u>texto</u>)"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-4 bg-stone-800 mx-1" />

          {/* Título H2 */}
          <button
            type="button"
            onClick={() => aplicarPrefixoLinha("## ")}
            className="p-1.5 rounded hover:bg-stone-800 text-stone-300 hover:text-amber-300 transition-colors"
            title="Título de Seção (## Título)"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>

          {/* Título H3 */}
          <button
            type="button"
            onClick={() => aplicarPrefixoLinha("### ")}
            className="p-1.5 rounded hover:bg-stone-800 text-stone-300 hover:text-amber-300 transition-colors"
            title="Subtítulo (### Subtítulo)"
          >
            <Heading3 className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-4 bg-stone-800 mx-1" />

          {/* Lista com Marcadores */}
          <button
            type="button"
            onClick={() => aplicarPrefixoLinha("- ")}
            className="p-1.5 rounded hover:bg-stone-800 text-stone-300 hover:text-amber-300 transition-colors"
            title="Lista com Marcadores (- Item)"
          >
            <List className="w-3.5 h-3.5" />
          </button>

          {/* Lista Numerada */}
          <button
            type="button"
            onClick={() => aplicarPrefixoLinha("1. ")}
            className="p-1.5 rounded hover:bg-stone-800 text-stone-300 hover:text-amber-300 transition-colors"
            title="Lista Numerada (1. Item)"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>

          {/* Citação / Lore */}
          <button
            type="button"
            onClick={() => aplicarPrefixoLinha("> ")}
            className="p-1.5 rounded hover:bg-stone-800 text-stone-300 hover:text-amber-300 transition-colors"
            title="Citação / Lore (> Citação)"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>

          {/* Linha Divisória */}
          <button
            type="button"
            onClick={() => aplicarFormatacao("\n\n---\n\n")}
            className="p-1.5 rounded hover:bg-stone-800 text-stone-300 hover:text-amber-300 transition-colors"
            title="Linha Divisória Rúnica (---)"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {/* Código / Regra Inline */}
          <button
            type="button"
            onClick={() => aplicarFormatacao("`", "`")}
            className="p-1.5 rounded hover:bg-stone-800 text-stone-300 hover:text-amber-300 transition-colors"
            title="Código / Regra mecânica (`termo`)"
          >
            <Code className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Alternância: Escrever vs. Pré-visualizar */}
        <div className="flex items-center gap-1 bg-stone-950 p-0.5 rounded-lg border border-stone-800 text-[11px] font-serif">
          <button
            type="button"
            onClick={() => setAbaVisualizacao("escrever")}
            className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${
              abaVisualizacao === "escrever"
                ? "bg-amber-950/80 text-amber-300 font-bold border border-amber-500/50"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            <PenLine className="w-3 h-3" />
            <span>Escrever</span>
          </button>

          <button
            type="button"
            onClick={() => setAbaVisualizacao("visualizar")}
            className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${
              abaVisualizacao === "visualizar"
                ? "bg-amber-950/80 text-amber-300 font-bold border border-amber-500/50"
                : "text-stone-400 hover:text-stone-200"
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
          className="w-full bg-stone-950/90 p-3.5 font-serif text-stone-200 text-sm leading-relaxed placeholder:text-stone-600 focus:outline-none resize-y selection:bg-amber-500/30 selection:text-amber-200"
        />
      ) : (
        <div className="p-4 bg-stone-950/90 min-h-[14rem] max-h-[28rem] overflow-y-auto">
          {valor.trim() ? (
            <VisualizadorMarkdownT20 conteudo={valor} />
          ) : (
            <p className="text-stone-600 italic font-serif text-xs">
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
    <div className="prose prose-invert max-w-none font-serif text-sm leading-relaxed space-y-2 text-stone-200">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-lg font-black text-amber-300 border-b border-amber-500/30 pb-1 mt-3 mb-1">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-black text-amber-300/90 mt-2.5 mb-1">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-bold text-amber-400 mt-2 mb-0.5">
              {children}
            </h3>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-stone-100">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-stone-300">{children}</em>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-amber-500/60 pl-3 py-1 my-2 bg-amber-950/20 text-stone-300 italic rounded-r">
              {children}
            </blockquote>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 my-1.5 text-stone-300">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 my-1.5 text-stone-300">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-snug">{children}</li>,
          hr: () => <hr className="border-t border-amber-500/30 my-3" />,
          code: ({ children }) => (
            <code className="bg-stone-900 border border-stone-800 text-amber-300 font-mono text-xs px-1.5 py-0.5 rounded">
              {children}
            </code>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 underline hover:text-amber-300 transition-colors"
            >
              {children}
            </a>
          ),
          p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
        }}
      >
        {conteudo}
      </ReactMarkdown>
    </div>
  );
}