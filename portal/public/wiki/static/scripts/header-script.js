/**
 * header-script.js
 * Script em JavaScript Puro (Client-Side) para o Header Fixo no Quartz 5
 *
 * Recursos:
 * 1. Controle do Menu Hambúrguer (Mobile)
 * 2. Monitoramento de Status em Tempo Real do Foundry VTT
 * 3. Compatibilidade com a Navegação SPA do Quartz 5 (Eventos 'nav' e 'render')
 */

(function () {
  'use strict';

  /**
   * 1. Lógica do Menu Hambúrguer (Mobile)
   */
  function setupMenuMobile() {
    var btnMenu = document.getElementById("btn-menu-mobile-toggle");
    var dropdown = document.getElementById("menu-mobile-dropdown-nav");

    if (!btnMenu || !dropdown) return;

    var menuAberto = false;

    // Substitui o botão por um clone limpo para remover escutadores antigos das navegações SPA
    var novoBtn = btnMenu.cloneNode(true);
    if (btnMenu.parentNode) {
      btnMenu.parentNode.replaceChild(novoBtn, btnMenu);
    }

    novoBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      menuAberto = !menuAberto;

      if (menuAberto) {
        dropdown.classList.remove("hidden");
        novoBtn.textContent = "✕";
      } else {
        dropdown.classList.add("hidden");
        novoBtn.textContent = "☰";
      }
    });

    // Fecha o menu ao clicar em qualquer ponto fora dele
    document.addEventListener("click", function (e) {
      if (
        menuAberto &&
        !dropdown.contains(e.target) &&
        !novoBtn.contains(e.target)
      ) {
        dropdown.classList.add("hidden");
        novoBtn.textContent = "☰";
        menuAberto = false;
      }
    });

    // Fecha ao clicar em qualquer link dentro do menu
    var links = dropdown.querySelectorAll("a");
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener("click", function () {
        dropdown.classList.add("hidden");
        novoBtn.textContent = "☰";
        menuAberto = false;
      });
    }
  }

  /**
   * 2. Lógica de Checagem do Servidor Foundry VTT
   */
  function checarStatusFoundry() {
    var dot = document.getElementById("foundry-status-dot");
    var textSpan = document.getElementById("foundry-status-text");
    var link = document.getElementById("btn-foundry-link");

    if (!link) return;

    var foundryUrl = link.getAttribute("href");
    if (!dot || !textSpan || !foundryUrl) return;

    // Define estado inicial de checagem
    dot.className = "status-dot status-dot-checking";
    textSpan.textContent = "Checando...";

    var controller = new AbortController();
    var timeoutId = setTimeout(function () {
      controller.abort();
    }, 5000);

    fetch(foundryUrl, { mode: "no-cors", signal: controller.signal })
      .then(function () {
        clearTimeout(timeoutId);
        dot.className = "status-dot status-dot-online";
        textSpan.textContent = "Foundry Online";
        link.title = "Mesa do Foundry VTT Online! Clique para entrar.";
      })
      .catch(function () {
        clearTimeout(timeoutId);
        dot.className = "status-dot status-dot-offline";
        textSpan.textContent = "Mesa Offline";
        link.title = "O servidor do Foundry VTT está offline no momento.";
      });
  }

  /**
   * Função Principal de Inicialização
   */
  function initHeader() {
    setupMenuMobile();
    checarStatusFoundry();
  }

  // Execução nativa imediata / DOMContentLoaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHeader);
  } else {
    initHeader();
  }

  // Eventos de ciclo de vida do Quartz 5 para navegação SPA sem refresh (F5)
  document.addEventListener("nav", initHeader);
  document.addEventListener("render", initHeader);
})();
