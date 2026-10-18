/// <reference types="astro/client" />

declare module "astro" {
  interface AstroClientDirectives {
    /** Hidrata ya pintado el primer cuadro y con la isla a la vista (src/directives/afterpaint.js). */
    "client:afterpaint"?: boolean;
  }
}

export {};
