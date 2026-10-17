import {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "./types"
import styles from "./HeaderFixo.scss"
// @ts-ignore
import script from "./HeaderFixo.inline"

export interface HeaderFixoOptions {
  urlFoundry?: string
}

const defaultOptions: HeaderFixoOptions = {
  urlFoundry: "http://rpgtormenta.servegame.com:30000",
}

const HeaderFixo: QuartzComponentConstructor<HeaderFixoOptions> = (userOpts?: HeaderFixoOptions) => {
  const opts = { ...defaultOptions, ...userOpts }

  const Component: QuartzComponent = ({ children, displayClass }: QuartzComponentProps) => {
    const linksMenu = [
      { nome: "Início", href: "/" },
      { nome: "Wiki", href: "/wiki" },
    ]

    return (
      <header class={`header-fixo ${displayClass ?? ""}`}>
        {/* Canto Esquerdo: Logos Responsivas + Nome do RPG */}
        <a href="/" class="header-logo-link">
          {/* Logo Quadrada (Visível apenas no Celular) */}
          <img
            src="/logo-mobile.png"
            alt="Logo Invocação do Herói"
            class="header-logo-mobile"
            onError={(e) => { (e.target as HTMLElement).style.display = 'none' }}
          />

          {/* Logo Retangular (Visível apenas no Desktop) */}
          <img
            src="/logo-rpg.png"
            alt="Logo Invocação do Herói"
            class="header-logo-desktop"
            onError={(e) => { (e.target as HTMLElement).style.display = 'none' }}
          />

          <span class="header-title-text">⚔️ Invocação do Herói</span>
        </a>

        {/* Links de Navegação Desktop */}
        <nav class="header-nav">
          {linksMenu.map((item) => (
            <a key={item.nome} href={item.href} class="header-link">
              {item.nome}
            </a>
          ))}
        </nav>

        {/* Canto Direito: Botão Foundry + Hambúrguer */}
        <div class="header-right-actions">
          <a
            href={opts.urlFoundry}
            target="_blank"
            rel="noopener noreferrer"
            title="Checando status do Foundry..."
            class="btn-foundry"
            id="btn-foundry-link"
          >
            <span id="foundry-status-dot" class="status-dot status-dot-checking"></span>
            <span id="foundry-status-text" class="btn-foundry-text">Checando...</span>
          </a>

          <button
            id="btn-menu-mobile-toggle"
            class="btn-menu-mobile"
            aria-label="Abrir Menu"
          >
            ☰
          </button>
        </div>

        {/* Dropdown Mobile */}
        <nav id="menu-mobile-dropdown-nav" class="menu-mobile-dropdown hidden">
          {linksMenu.map((item) => (
            <a key={item.nome} href={item.href} class="header-link py-1">
              {item.nome}
            </a>
          ))}
        </nav>

        {children}
      </header>
    )
  }

  // Atribuições para a especificação do Quartz 5
  Component.css = styles
  Component.afterDOMLoaded = script

  return Component
}

export default HeaderFixo