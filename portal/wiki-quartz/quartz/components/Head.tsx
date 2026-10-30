import { i18n } from "../i18n"
import { FullSlug, getFileExtension, joinSegments, pathToRoot } from "../util/path"
import { CSSResourceToStyleElement, JSResourceToScriptElement } from "../util/resources"
import { googleFontHref, googleFontSubsetHref } from "../util/theme"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { unescapeHTML } from "../util/escape"

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

    // Script de montagem do cabeçalho estético Tormenta 20 (idêntico ao MenuFixo do Portal)
    const customHeaderScript = `
      (function() {
        document.addEventListener('click', function(e) {
          var link = e.target.closest('a');
          if (!link) return;

          var href = link.getAttribute('href');
          if (!href) return;

          var ehLinkDoPortal = 
            href === '/' ||
            href.startsWith('/personagens') ||
            href.startsWith('/mapas') ||
            href.startsWith('/livros') ||
            href.startsWith('/agenda') ||
            href.startsWith('/painel') ||
            link.hasAttribute('data-portal-link');

          if (ehLinkDoPortal) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            window.location.assign(link.href);
          }
        }, true);

        function injetarMenuFixo() {
          if (document.getElementById('header-fixo-portal')) return;

          var header = document.createElement('header');
          header.id = 'header-fixo-portal';
          header.className = 'header-fixo-portal';

          header.innerHTML = \`
            <div class="portal-brand-area">
              <a href="/" class="portal-brand-link" data-portal-link="true" title="Voltar ao Hub Principal">
                <img src="/logo-mobile.png" alt="Logo Invocação do Herói" class="portal-logo-mobile" onerror="this.style.display='none'" />
                <img src="/logo-rpg.png" alt="Logo Invocação do Herói" class="portal-logo-desktop" onerror="this.style.display='none'" />
              </a>
            </div>

            <nav class="portal-nav-links">
              <a href="/personagens" class="portal-link" data-portal-link="true">Personagens</a>
              <a href="/mapas" class="portal-link" data-portal-link="true">Mapas</a>
              <a href="/livros" class="portal-link" data-portal-link="true">Livros</a>
              <a href="/agenda" class="portal-link" data-portal-link="true">Agenda</a>
              <a href="/wikitormenta" class="portal-link portal-link-ativo" data-portal-link="true">Wiki</a>
            </nav>

            <div class="portal-right-spacer"></div>
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

    // Estilos que espelham exatamente o MenuFixo do Portal
    const customHeaderStyles = `
      /* Medidas idênticas ao MenuFixo do Portal (MenuFixo.module.css):
         Mobile: py-2.5 (20px) + logo h-8 (32px) + 1px borda = 53px
         Desktop: py-2.5 (20px) + logo h-10 (40px) + 1px borda = 61px */
      body {
        padding-top: 53px !important;
      }

      @media (min-width: 768px) {
        body {
          padding-top: 61px !important;
        }
      }

      .header-fixo-portal {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        height: 53px !important;
        z-index: 99999 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        padding: 0 0.75rem !important; /* px-3 */
        background-color: rgba(12, 10, 9, 0.9) !important; /* bg-stone-950/90 */
        border-bottom: 1px solid rgba(251, 191, 36, 0.8) !important; /* border-amber-400/80 */
        backdrop-filter: blur(12px) !important;
        -webkit-backdrop-filter: blur(12px) !important;
        box-shadow: 0 4px 25px rgba(0, 0, 0, 0.8) !important;
        font-family: Inter, sans-serif !important;
        box-sizing: border-box !important;
      }

      @media (min-width: 768px) {
        .header-fixo-portal {
          height: 61px !important;
          padding: 0 2rem !important; /* md:px-8 */
        }
      }

      .portal-brand-area {
        display: flex !important;
        align-items: center !important;
        z-index: 10 !important;
      }

      .portal-brand-link {
        display: flex !important;
        align-items: center !important;
        text-decoration: none !important;
        border-bottom: none !important;
      }

      .portal-logo-mobile {
        display: block !important;
        height: 2rem !important; /* h-8 = 32px */
        width: 2rem !important;
        object-fit: contain !important;
      }

      .portal-logo-desktop {
        display: none !important;
        height: 2.5rem !important; /* h-10 = 40px */
        width: auto !important;
        object-fit: contain !important;
      }

      /* Navegação Centralizada */
      .portal-nav-links {
        display: none !important;
        align-items: center !important;
        gap: 1.5rem !important; /* gap-6 = 24px */
        position: absolute !important;
        left: 50% !important;
        top: 50% !important;
        transform: translate(-50%, -50%) !important;
      }

      .portal-right-spacer {
        width: 2.5rem !important;
      }

      .portal-link {
        font-size: 0.875rem !important; /* text-sm = 14px */
        font-weight: 500 !important;
        color: #d6d3d1 !important; /* text-stone-300 */
        text-decoration: none !important;
        border-bottom: none !important;
        transition: color 0.2s ease !important;
        letter-spacing: 0.015em !important;
      }

      .portal-link:hover {
        color: #fbbf24 !important; /* hover:text-amber-400 */
      }

      .portal-link-ativo {
        color: #fbbf24 !important; /* text-amber-400 */
        font-weight: 700 !important;
      }

      @media (min-width: 768px) {
        .portal-logo-mobile {
          display: none !important;
        }
        .portal-logo-desktop {
          display: block !important;
        }
        .portal-nav-links {
          display: flex !important;
        }
      }

      /* Tema escuro Tormenta 20 estrito */
      html, body {
        background-color: #0c0a09 !important;
        color: #f5f5f4 !important;
      }

      :root, :root[saved-theme="dark"], :root[saved-theme="light"] {
        --light: #0c0a09 !important;
        --lightgray: #1c1917 !important;
        --gray: #78716c !important;
        --darkgray: #e7e5e4 !important;
        --dark: #f59e0b !important;
        --secondary: #fbbf24 !important;
        --tertiary: #dc2626 !important;
        --background-primary: #0c0a09 !important;
        --background-primary-alt: #1c1917 !important;
        --background-secondary: #141210 !important;
        --background-secondary-alt: #1c1917 !important;
        --text-normal: #f5f5f4 !important;
        --text-muted: #a8a29e !important;
        --interactive-accent: #f59e0b !important;
        --interactive-accent-hover: #fbbf24 !important;
      }

      /* Links idênticos ao portal (âmbar dourado) */
      a.internal, .internal-link, article a {
        color: #fbbf24 !important;
      }
      a.internal:hover, .internal-link:hover, article a:hover {
        color: #f59e0b !important;
      }

      /* Breadcrumbs */
      .breadcrumb-container, .breadcrumbs {
        color: #78716c !important;
      }
      .breadcrumb-container a, .breadcrumbs a {
        color: #a8a29e !important;
      }
      .breadcrumb-container a:hover, .breadcrumbs a:hover {
        color: #fbbf24 !important;
      }

      /* Ocultar visualização bruta de metadados / aliases */
      .note-properties,
      .metadata-container,
      .metadata-properties {
        display: none !important;
      }

      /* Grafo: manter somente local da página (ocultar botão de global) */
      .graph-outer > .global-graph-icon {
        display: none !important;
      }
      .graph > .graph-outer {
        border: 1px solid #292524 !important;
        background-color: #141210 !important;
      }
    `

    return (
      <head>
        <title>{title}</title>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.documentElement.setAttribute('saved-theme', 'dark');
              document.documentElement.setAttribute('data-theme', 'dark');
              try { localStorage.setItem('theme', 'dark'); } catch(e) {}
            `,
          }}
        />
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
