import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import styles from "./HeaderFixo.scss"

export interface HeaderFixoOptions {}

const HeaderFixo: QuartzComponentConstructor<HeaderFixoOptions> = () => {
  const Component: QuartzComponent = ({ children, displayClass }: QuartzComponentProps) => {
    const linksMenu = [
      { nome: "Início", href: "/" },
      { nome: "Personagens", href: "/personagens" },
      { nome: "Mapas", href: "/mapas" },
      { nome: "Livros", href: "/livros" },
      { nome: "Agenda", href: "/agenda" },
      { nome: "Wiki", href: "/wiki" },
    ]

    return (
      <header class={`header-fixo ${displayClass ?? ""}`}>
        {/* Canto Esquerdo: Logos com link para a Home do Portal */}
        <a href="/" class="header-logo-link" title="Voltar ao Hub Principal">
          {/* Logo Mobile */}
          <img
            src="/logo-mobile.png"
            alt="Logo Invocação do Herói"
            class="header-logo-mobile"
          />

          {/* Logo Desktop */}
          <img
            src="/logo-rpg.png"
            alt="Logo Invocação do Herói"
            class="header-logo-desktop"
          />
        </a>

        {/* Links de Navegação Desktop */}
        <nav class="header-nav">
          {linksMenu.map((item) => (
            <a key={item.nome} href={item.href} class="header-link">
              {item.nome}
            </a>
          ))}
        </nav>

        {children}
      </header>
    )
  }

  Component.css = styles

  return Component
}

export default HeaderFixo