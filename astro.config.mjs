import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://gomflo.dev',
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