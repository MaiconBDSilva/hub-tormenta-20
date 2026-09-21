import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  //trailingSlash: true, 

  async rewrites() { 
    return {
      beforeFiles: [
    
      //1 Escudo de segurança: se o navegador pedir /static/..., busca em /wiki/static/ 
      { source: "/static/:path*", destination: "/wiki/static/:path*", },

      //2 Mapeia a raiz da wiki para o index.html gerado pelo Quartz 
      { source: "/wiki", destination: "/wiki/wiki.html", }, 
      { source: "/wiki/", destination: "/wiki/wiki.html", },
      ],
        afterFiles: [
      // 3. Mapeia qualquer subrota da wiki (ex: /wiki/iniciopage) para o arquivo correspondente 
      { source: "/wiki/:path((?!.*\\.).*)", destination: "/wiki/:path*.html",}, 
        ],
               
  }
  },
};

 

export default nextConfig;
