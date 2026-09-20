import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
     return [
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
