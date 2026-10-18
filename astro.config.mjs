import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://gomflo.dev',
  // GitHub Pages sirve /ruta/ y redirige /ruta con un 301: los enlaces van con barra.
  trailingSlash: 'always',
  integrations: [
    react(),
    // client:afterpaint: islas que esperan al primer cuadro y a estar a la vista (src/directives/afterpaint.js).
    {
      name: 'afterpaint',
      hooks: {
        'astro:config:setup': ({ addClientDirective }) => {
          addClientDirective({ name: 'afterpaint', entrypoint: './src/directives/afterpaint.js' });
        },
      },
    },
    // /susurro/, /destello/ y /brinco/ se publican desde otros repos; sin esto no aparecen en el sitemap.
    sitemap({
      customPages: ['https://gomflo.dev/susurro/', 'https://gomflo.dev/destello/', 'https://gomflo.dev/brinco/'],
    }),
  ],

  // URLs de la versión anterior que Google aún tiene registradas.
  redirects: {
    '/ordenar-alfabeticamente': '/ordenar-lista/',
    '/quitar-tildes': '/remover-acentos/',
    // Atajo corto para compartir la guía de partidos.
    '/partidos': '/partidos-de-hoy/',
  },

  vite: {
    plugins: [tailwindcss()],
  },
});