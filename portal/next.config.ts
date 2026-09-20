import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  async redirects() { 
    return [ 
      // Força o navegador a redirecionar /wiki -&gt; /wiki/ (com a barra no final) 
      { source: "/wiki", destination: "/wiki/", permanent: true, }, ]; },


  async rewrites() { 
    return [ 
    // 1\. Escudo de segurança: se o navegador pedir /static/..., busca em /wiki/static/ 
    { source: "/static/:path*", destination: "/wiki/static/:path*", },

     // 1\. Mapeia a raiz da wiki para o index.html gerado pelo Quartz 
     { source: "/wiki", destination: "/wiki/index.html", }, 
     { source: "/wiki/", destination: "/wiki/index.html", },
      // 2\. Mapeia qualquer subrota da wiki (ex: /wiki/iniciopage) para o arquivo correspondente 
      { source: "/wiki/:path((?!.*\\.).*)", destination: "/wiki/:path*.html",

       }, 
      ]; 
    },
};

export default nextConfig;
