import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://gomflo.dev',
  // GitHub Pages sirve /ruta/ y redirige /ruta con un 301: los enlaces van con barra.
  trailingSlash: 'always',
  integrations: [react(), sitemap()],

  // URLs de la versión anterior que Google aún tiene registradas.
  redirects: {
    '/ordenar-alfabeticamente': '/ordenar-lista/',
    '/quitar-tildes': '/remover-acentos/',
  },

  vite: {
    plugins: [tailwindcss()],
  },
});