import { i18n } from "../i18n"
import { FullSlug, getFileExtension, joinSegments, pathToRoot } from "../util/path"
import { CSSResourceToStyleElement, JSResourceToScriptElement } from "../util/resources"
import { googleFontHref, googleFontSubsetHref } from "../util/theme"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { unescapeHTML } from "../util/escape"

/* STREAMING_CHUNK:Defining Head component factory and metadata variables */
export default (() => {
  const Head: QuartzComponent = ({
    cfg,
    fileData,
    externalResources,
    ctx,
  }: QuartzComponentProps) => {
    const titleSuffix = cfg.pageTitleSuffix ?? ""
    const title =
      (fileData.frontmatter?.title ?? i18n(cfg.locale).propertyDefaults.title) + titleSuffix
    const description =
      fileData.frontmatter?.socialDescription ??
      fileData.frontmatter?.description ??
      unescapeHTML(fileData.description?.trim() ?? i18n(cfg.locale).propertyDefaults.description)

    const { css, js, additionalHead } = externalResources

    const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)
    const path = url.pathname as FullSlug
    const baseDir = fileData.slug === "404" ? path : pathToRoot(fileData.slug!)
    const iconPath = joinSegments(baseDir, "static/icon.png")

    const socialUrl =
      fileData.slug === "404" ? url.toString() : joinSegments(url.toString(), fileData.slug!)

    const usesCustomOgImage = ctx.cfg.plugins.emitters.some((e) => e.name === "CustomOgImages")
    const ogImageDefaultPath = `https://${cfg.baseUrl}/static/og-image.png`

    const coreStylesheet = css[0]?.content
    const coreScript = js.find(
      (r) => r.loadTime === "beforeDOMReady" && r.contentType === "external",
    )

    /* STREAMING_CHUNK:Configuring anti-SPA-hijack interception and custom header injection */
    const customHeaderScript = `
      (function() {
        // Intercepta qualquer clique em links do Portal ANTES que o SPA do Quartz (micromorph) capture
        document.addEventListener('click', function(e) {
          var link = e.target.closest('a');
          if (!link) return;

          var href = link.getAttribute('href');
          if (!href) return;

          // Se o link é uma rota do Portal (fora da raiz da wiki)
          var ehLinkDoPortal = 
            href === '/' ||
            href.startsWith('/personagens') ||
            href.startsWith('/mapas') ||
            href.startsWith('/livros') ||
            href.startsWith('/agenda') ||
            link.hasAttribute('data-portal-link');

          if (ehLinkDoPortal) {
            // Trava imediatamente a propagação para os scripts internos do Quartz
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            // Faz a navegação real e limpa do navegador, destruindo o estado do Quartz
            window.location.assign(link.href);
          }
        }, true); // 'true' = Fase de Captura (prioridade máxima antes de qualquer outro script)

        // Função de montagem do cabeçalho
        function injetarMenuFixo() {
          if (document.getElementById('header-fixo-portal')) return;

          var header = document.createElement('header');
          header.id = 'header-fixo-portal';
          header.className = 'header-fixo-portal';

          header.innerHTML = \`
            <a href="/" class="portal-brand-link" data-portal-link="true" rel="external" title="Voltar ao Hub Principal">
              <img src="/logo-mobile.png" alt="Logo Invocação do Herói" class="portal-logo-mobile" onerror="this.style.display='none'" />
              <img src="/logo-rpg.png" alt="Logo Invocação do Herói" class="portal-logo-desktop" onerror="this.style.display='none'" />
            </a>

            <nav class="portal-nav-links">
              <a href="/personagens" class="portal-link" data-portal-link="true" rel="external">Personagens</a>
              <a href="/mapas" class="portal-link" data-portal-link="true" rel="external">Mapas</a>
              <a href="/livros" class="portal-link" data-portal-link="true" rel="external">Livros</a>
              <a href="/agenda" class="portal-link" data-portal-link="true" rel="external">Agenda</a>
            </nav>
          \`;

          if (document.body) {
            document.body.prepend(header);
          }
        }

        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', injetarMenuFixo);
        } else {
          injetarMenuFixo();
        }

        document.addEventListener('nav', injetarMenuFixo);
      })();
    `

    /* STREAMING_CHUNK:Defining responsive styling tokens for the injected fixed header */
    const customHeaderStyles = `
      body {
        padding-top: 3.6rem !important;
      }

      .header-fixo-portal {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        height: 3.6rem !important;
        z-index: 99999 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        padding: 0 1.5rem !important;
        background-color: rgba(12, 10, 9, 0.95) !important;
        border-bottom: 1px solid rgba(251, 191, 36, 0.7) !important;
        backdrop-filter: blur(12px) !important;
        -webkit-backdrop-filter: blur(12px) !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.7) !important;
        font-family: inherit !important;
        box-sizing: border-box !important;
      }

      .portal-brand-link {
        display: flex !important;
        align-items: center !important;
        text-decoration: none !important;
        border-bottom: none !important;
      }

      .portal-logo-mobile {
        display: block !important;
        height: 2rem !important;
        width: 2rem !important;
        object-fit: contain !important;
      }

      .portal-logo-desktop {
        display: none !important;
        height: 2.25rem !important;
        width: auto !important;
        object-fit: contain !important;
      }

      .portal-nav-links {
        display: flex !important;
        align-items: center !important;
        gap: 1.25rem !important;
      }

      .portal-link {
        font-size: 0.875rem !important;
        font-weight: 600 !important;
        color: #d6d3d1 !important;
        text-decoration: none !important;
        border-bottom: none !important;
        transition: color 0.15s ease !important;
      }

      .portal-link:hover {
        color: #fbbf24 !important;
      }

      .portal-link-ativo {
        color: #fbbf24 !important;
      }

      @media (min-width: 768px) {
        .portal-logo-mobile {
          display: none !important;
        }
        .portal-logo-desktop {
          display: block !important;
        }
        .portal-nav-links {
          gap: 1.75rem !important;
        }
      }
    `

    /* STREAMING_CHUNK:Rendering full HTML head structure */
    return (
      <head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        {coreStylesheet && <link rel="preload" href={coreStylesheet} as="style" />}
        {coreScript && coreScript.contentType === "external" && (
          <link rel="preload" href={coreScript.src} as="script" />
        )}
        {cfg.theme.cdnCaching && cfg.theme.fontOrigin === "googleFonts" && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" />
            <link rel="stylesheet" href={googleFontHref(cfg.theme)} />
            {cfg.theme.typography.title && (
              <link rel="stylesheet" href={googleFontSubsetHref(cfg.theme, cfg.pageTitle)} />
            )}
          </>
        )}
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <meta name="og:site_name" content={cfg.pageTitle}></meta>
        <meta property="og:title" content={title} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta property="og:description" content={description} />
        <meta property="og:image:alt" content={description} />

        {!usesCustomOgImage && (
          <>
            <meta property="og:image" content={ogImageDefaultPath} />
            <meta property="og:image:url" content={ogImageDefaultPath} />
            <meta name="twitter:image" content={ogImageDefaultPath} />
            <meta
              property="og:image:type"
              content={`image/${getFileExtension(ogImageDefaultPath) ?? "png"}`}
            />
          </>
        )}

        {cfg.baseUrl && (
          <>
            <meta property="twitter:domain" content={cfg.baseUrl}></meta>
            <meta property="og:url" content={socialUrl}></meta>
            <meta property="twitter:url" content={socialUrl}></meta>
          </>
        )}

        <link rel="icon" href={iconPath} />
        <meta name="description" content={description} />
        <meta name="generator" content="Quartz" />

        <style dangerouslySetInnerHTML={{ __html: customHeaderStyles }} />
        <script dangerouslySetInnerHTML={{ __html: customHeaderScript }} />

        {css.map((resource) => CSSResourceToStyleElement(resource, true))}
        {js
          .filter((resource) => resource.loadTime === "beforeDOMReady")
          .map((res) => JSResourceToScriptElement(res, true))}
        {additionalHead.map((resource) => {
          if (typeof resource === "function") {
            return resource(fileData)
          } else {
            return resource
          }
        })}
      </head>
    )
  }

  return Head
}) satisfies QuartzComponentConstructor