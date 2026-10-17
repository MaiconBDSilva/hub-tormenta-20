import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import styles from "./HeaderFixo.scss"
// @ts-ignore

export interface HeaderFixoOptions {
  urlFoundry?: string
}


const defaultOptions: HeaderFixoOptions = {
  urlFoundry: "http://rpgtormenta.servegame.com:30000",
}

const HeaderFixo: QuartzComponentConstructor<HeaderFixoOptions> = (
  userOpts?: HeaderFixoOptions,
) => {
  const opts = { ...defaultOptions, ...userOpts }

  const Component: QuartzComponent = ({ children, displayClass }: QuartzComponentProps) => {
    const linksMenu = [
      { nome: "Personagens", href: "/personagens" },
      { nome: "Mapas", href: "/mapas" },
      { nome: "Livros", href: "/livros" },
      { nome: "Agenda", href: "/agenda" },
      { nome: "Wiki", href: "https://invocacaodoheroi.vercel.app/wiki/wiki.html" },
    ]

    return (
      <header class={`header-fixo ${displayClass ?? ""}`}>
        {/* Canto Esquerdo: Logos Responsivas + Nome do RPG */}
        <a href="https://invocacaodoheroi.vercel.app/" target="_top" rel="external" 
  download=""  >
          {/* Logo Quadrada (Visível apenas no Celular) */}
          <img
            src="/logo-mobile.png"
            alt="Logo Invocação do Herói"
            class="header-logo-mobile"
            onError={(e) => {
              ;(e.target as HTMLElement).style.display = "none"
            }}
          />

          {/* Logo Retangular (Visível apenas no Desktop) */}
          <img
            src="/logo-rpg.png"
            alt="Logo Invocação do Herói"
            class="header-logo-desktop"
            onError={(e) => {
              ;(e.target as HTMLElement).style.display = "none"
            }}
          />
        </a>

        {/* Links de Navegação Desktop */}
        <nav style="display: flex; align-items: center; gap: 1.5rem;">
          {linksMenu.map((item) => (
            <a key={item.nome} href={item.href} 
            style="font-size: 0.875rem; font-weight: 700; color: #d6d3d1; text-decoration: none; transition: color 150ms ease;" onMouseEnter={(e) => (e.currentTarget.style.color = "#fbbf24")} onMouseLeave={(e) => (e.currentTarget.style.color = "#d6d3d1")}>
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
            title="Servidor de Jogo"
            class="btn-foundry"
            id="btn-foundry-link"
          >
            
            <span id="foundry-status-text" class="btn-foundry-text">
              FoundryVTT
            </span>
          </a>

          
        </div>

        {/*script do erro home local
        
        <script dangerouslySetInnerHTML={{__html: `
  // 1. Armazena globalmente o último link que o usuário tentou clicar
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    if (link && link.href) {
      window.ultimoLinkClicado = link.href;
    }
  }, true);

  // 2. Catch geral: se o Quartz quebrar, força a ida para o link guardado
  window.addEventListener('error', function(e) {
    if (e.message.includes("push") || e.message.includes("undefined")) {
      if (window.ultimoLinkClicado) {
        window.location.href = window.ultimoLinkClicado;
      } else {
        window.location.href = "http://localhost:3000"; // Fallback para a Home
      }
    }
  });
`}} />*/}

<script dangerouslySetInnerHTML={{__html: `
  // 1. Armazena o link clicado e força o redirecionamento bruto se sair da wiki
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    if (link && link.href) {
      const url = link.href;

      // Se o link vai para o Portal (Home ou qualquer página fora de /wiki/)
      if (url === 'http://localhost:3000' || !url.includes('/wiki/')) {
        // Bloqueia o Quartz e a Vercel de tentarem segurar a página em segundo plano
        e.preventDefault();
        e.stopPropagation();

        // Força a substituição física da página do navegador (destrói o menu do Quartz)
        window.location.replace(url);
      }
    }
  }, true); // O 'true' garante prioridade máxima antes de qualquer script da Vercel/Quartz
`}} />

        {children}

      
      </header>
    )
  }

  // Atribuições para a especificação do Quartz 5
  Component.css = styles

  return Component
}

export default HeaderFixo
