function setupMenuMobile() {
  const btnMenu = document.getElementById("btn-menu-mobile-toggle")
  const dropdown = document.getElementById("menu-mobile-dropdown-nav")
  if (!btnMenu || !dropdown) return

  const toggleMenu = (e: Event) => {
    e.stopPropagation()
    const isHidden = dropdown.classList.toggle("hidden")
    btnMenu.textContent = isHidden ? "☰" : "✕"
  }

  btnMenu.addEventListener("click", toggleMenu)

  const closeOnClickOutside = (e: Event) => {
    if (!dropdown.contains(e.target as Node) && !btnMenu.contains(e.target as Node)) {
      dropdown.classList.add("hidden")
      btnMenu.textContent = "☰"
    }
  }

  document.addEventListener("click", closeOnClickOutside)

  // Gerenciamento de memória nativo do Quartz 5
  if (typeof window.addCleanup === "function") {
    window.addCleanup(() => {
      btnMenu.removeEventListener("click", toggleMenu)
      document.removeEventListener("click", closeOnClickOutside)
    })
  }
}

function checarStatusFoundry() {
  const dot = document.getElementById("foundry-status-dot")
  const textSpan = document.getElementById("foundry-status-text")
  const link = document.getElementById("btn-foundry-link") as HTMLAnchorElement | null
  if (!link) return

  const foundryUrl = link.getAttribute("href")
  if (!dot || !textSpan || !foundryUrl) return

  dot.className = "status-dot status-dot-checking"
  textSpan.textContent = "Checando..."

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 5000)

  fetch(foundryUrl, { mode: "no-cors", signal: controller.signal })
    .then(() => {
      clearTimeout(timeoutId)
      dot.className = "status-dot status-dot-online"
      textSpan.textContent = "Foundry Online"
      link.title = "Mesa do Foundry VTT Online! Clique para entrar."
    })
    .catch(() => {
      clearTimeout(timeoutId)
      dot.className = "status-dot status-dot-offline"
      textSpan.textContent = "Mesa Offline"
      link.title = "O servidor do Foundry VTT está offline no momento."
    })
}

const setupHeader = () => {
  setupMenuMobile()
  checarStatusFoundry()
}

// Escuta os eventos de rota e mutação do Quartz 5
document.addEventListener("nav", setupHeader)
document.addEventListener("render", setupHeader)