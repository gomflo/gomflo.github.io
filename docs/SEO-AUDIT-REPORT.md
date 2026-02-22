# Auditoría SEO — gomflo.dev

**Fecha:** 22 de febrero de 2025  
**Sitio:** https://gomflo.dev  
**Tipo:** Sitio personal / herramientas (Astro, estático)

---

## Resumen ejecutivo

El sitio es un conjunto de herramientas (formatear JSON, JWT, Base64, contar caracteres, etc.) con buena base técnica (HTML semántico, `lang="es"`, meta description por página, un H1 por página, enlaces internos desde la home). Las prioridades son: **rastreabilidad e indexación** (falta `robots.txt` y sitemap), **canonicalización** (sin canonical) y **on-page** (meta descriptions muy cortas y sin Open Graph/Twitter para compartir).

**Estado general:** Medio — funcional para buscadores pero con margen claro de mejora.

**Top 5 prioridades:**
1. Añadir `robots.txt` y sitemap XML (y referenciarlo en robots).
2. Añadir URL canónica en todas las páginas.
3. Alargar meta descriptions hacia 150–160 caracteres con valor y CTA.
4. Añadir Open Graph y Twitter Card para mejor preview al compartir.
5. (Opcional) Considerar datos estructurados (WebSite / ItemList) para rich results.

---

## 1. Rastreabilidad e indexación

### 1.1 Robots.txt

| Aspecto        | Estado | Detalle |
|----------------|--------|---------|
| Existencia     | ❌     | No existe `robots.txt` (404 en producción). |
| Bloqueos       | —      | N/A. |
| Referencia sitemap | ❌ | No hay sitemap que referenciar. |

**Impacto:** Medio. Sin robots.txt, los bots usan comportamiento por defecto (todo permitido). No bloqueas nada, pero pierdes la opción de indicar sitemap y de restringir rutas si en el futuro añades algo que no quieras indexar.

**Recomendación:** Crear `public/robots.txt` con al menos:
- `User-agent: *` y `Allow: /`
- `Sitemap: https://gomflo.dev/sitemap-index.xml` (o la URL del sitemap que genere Astro).

---

### 1.2 Sitemap XML

| Aspecto        | Estado | Detalle |
|----------------|--------|---------|
| Existencia     | ❌     | No hay sitemap (404 en `/sitemap-index.xml` y `/sitemap-0.xml`). |
| Envío a GSC     | —      | No aplicable sin sitemap. |

**Impacto:** Medio. Sitio pequeño (8 páginas); Google puede descubrirlo por enlaces. Un sitemap acelera el descubrimiento y da una lista clara de URLs canónicas.

**Recomendación:** Usar la integración oficial `@astrojs/sitemap` en `astro.config.mjs` (el proyecto ya tiene `site: 'https://gomflo.dev'`). Tras el build se generará el sitemap. Añadir su URL en `robots.txt` y, cuando tengas acceso, en Google Search Console.

---

### 1.3 Arquitectura y enlaces internos

| Aspecto        | Estado | Detalle |
|----------------|--------|---------|
| Profundidad    | ✅     | Todas las herramientas a 1 clic desde la home. |
| Enlaces internos | ✅   | La home enlaza a todas las páginas con anclas descriptivas. |
| Páginas huérfanas | ✅ | No; todas enlazadas desde index. |

**Impacto:** Positivo. Nada que cambiar aquí.

---

## 2. Fundamentos técnicos

### 2.1 Canonicalización

| Aspecto        | Estado | Detalle |
|----------------|--------|---------|
| Etiqueta canonical | ❌ | No hay `<link rel="canonical">` en el layout. |
| site en Astro  | ✅     | `astro.config.mjs` tiene `site: 'https://gomflo.dev'`. |

**Impacto:** Medio. Con una sola URL por contenido el riesgo de duplicados es bajo, pero la canonical explícita evita que variantes (con/sin trailing slash, parámetros, etc.) compitan entre sí.

**Recomendación:** En `Layout.astro`, generar la canonical con la URL canónica de la página (por ejemplo `new URL(Astro.url.pathname, Astro.site)` o equivalente) y añadir `<link rel="canonical" href={canonicalURL} />`.

---

### 2.2 HTTPS y seguridad

| Aspecto        | Estado |
|----------------|--------|
| HTTPS         | ✅ (asumido en GitHub Pages) |
| Redirección HTTP→HTTPS | ✅ (habitual en GitHub Pages) |

No se detectan problemas en el código.

---

### 2.3 Velocidad y Core Web Vitals

No se ha ejecutado PageSpeed Insights en esta auditoría. Recomendación: revisar LCP, INP y CLS en [PageSpeed Insights](https://pagespeed.web.dev/) y en el informe de Core Web Vitals de Search Console cuando esté disponible.

---

### 2.4 Mobile y viewport

| Aspecto        | Estado |
|----------------|--------|
| Viewport      | ✅ `width=device-width, initial-scale=1.0` |
| Skip link     | ✅ "Ir al contenido principal" |
| Tap targets   | ✅ Enlaces con `min-height: 44px` donde aplica |

Correcto para un sitio de herramientas.

---

## 3. On-page SEO

### 3.1 Títulos (title)

| Aspecto        | Estado | Detalle |
|----------------|--------|---------|
| Unicidad      | ✅     | Título distinto por página. |
| Longitud      | ⚠️     | Todos por debajo de 60 caracteres; algunos muy cortos (ej. "Inicio \| gomflo.dev" ~25 caracteres). |
| Marca         | ✅     | "gomflo.dev" al final. |
| Keyword       | ✅     | Título coherente con el contenido de cada herramienta. |

**Recomendación:** Opcional alargar un poco el título de la home para incluir palabras clave (ej. "Herramientas de desarrollo y texto") sin pasarse de ~60 caracteres.

---

### 3.2 Meta description

| Aspecto        | Estado | Detalle |
|----------------|--------|---------|
| Unicidad      | ✅     | Descripción distinta por página. |
| Longitud      | ❌     | Todas muy cortas (aprox. 25–60 caracteres). Objetivo recomendado: 150–160. |
| Valor/CTA     | ⚠️     | Describen la función pero no invitan a hacer clic. |

**Impacto:** Alto para CTR en resultados de búsqueda. Descripciones cortas no aprovechan el espacio en la SERP y suelen dar menos sensación de valor.

**Recomendación:** Reescribir cada meta description hacia 150–160 caracteres: qué hace la herramienta, beneficio concreto y una mini-CTA (ej. "Pega tu JSON, formatea o minifica al instante. Sin registro. Gratis.").

---

### 3.3 Estructura de encabezados

| Aspecto        | Estado | Detalle |
|----------------|--------|---------|
| Un H1 por página | ✅  | Cada página tiene un único H1 (título de la herramienta). |
| Jerarquía     | ✅     | H1 → H2 (por ejemplo "Formateador", secciones con aria-labelledby). |
| H1 y contenido | ✅    | H1 alineado con el propósito de la página. |

Correcto.

---

### 3.4 Imágenes

No se encontraron `<img>` en el código revisado. Si en el futuro añades imágenes (iconos, ilustraciones), usar nombres descriptivos, `alt` significativo y formatos/optimización adecuados.

---

### 3.5 Open Graph y Twitter Card

| Aspecto        | Estado |
|----------------|--------|
| og:title       | ❌     |
| og:description| ❌     |
| og:url         | ❌     |
| og:type        | ❌     |
| twitter:card  | ❌     |

**Impacto:** Medio. Al compartir enlaces en redes sociales o mensajería, el preview será genérico (título y descripción del sitio o de la pestaña). Añadir OG y Twitter mejora el CTR y la imagen de marca al compartir.

**Recomendación:** En el layout, añadir meta tags usando el mismo `title`, `description` y la URL canónica de la página. Opcional: `og:image` con una imagen por defecto (ej. 1200×630).

---

## 4. Contenido y E-E-A-T

- **Tipo de sitio:** Herramientas utilitarias, no blog ni e-commerce.
- **Experiencia/Expertise:** Implícita en la calidad de las herramientas; no hay sección "Sobre" ni autor. Para un sitio personal de herramientas es aceptable.
- **Confianza:** HTTPS, enlaces claros, sin contenido engañoso. Opcional: página "Sobre" o contacto si quieres reforzar confianza.

No se detectan problemas graves; mejoras posibles son de profundidad de contenido o transparencia, no bloqueantes para indexación.

---

## 5. Plan de acción priorizado

### Crítico (hacer ya)

1. **Robots.txt**  
   Crear `public/robots.txt` con `User-agent: *`, `Allow: /` y `Sitemap: https://gomflo.dev/sitemap-index.xml` (o la URL real del sitemap generado).

2. **Sitemap XML**  
   Instalar y configurar `@astrojs/sitemap` en `astro.config.mjs`. Verificar que tras `npm run build` se genere el sitemap y que su URL coincida con la indicada en `robots.txt`.

3. **Canonical**  
   Añadir `<link rel="canonical" href={...} />` en `Layout.astro` usando la URL absoluta de la página actual.

### Alto impacto

4. **Meta descriptions**  
   Alargar todas hacia 150–160 caracteres, con valor y CTA. Mantener una por página y única.

5. **Open Graph y Twitter Card**  
   Añadir en el layout `og:title`, `og:description`, `og:url`, `og:type` y `twitter:card` (y opcionalmente `og:image`).

### Mejoras opcionales

6. **Título de la home**  
   Incluir alguna palabra clave adicional sin superar ~60 caracteres.

7. **Search Console**  
   Verificar el sitio, enviar el sitemap y revisar cobertura e indexación.

8. **Datos estructurados**  
   Valorar JSON-LD tipo `WebSite` y/o `ItemList` para la home (rich results en Google). Comprobar con [Rich Results Test](https://search.google.com/test/rich-results); no basar la conclusión solo en el HTML estático si el schema se inyecta por JS.

---

## Nota sobre schema markup

Según la metodología de esta auditoría: **no se debe afirmar "no hay schema" solo por inspección del HTML estático o por herramientas que no ejecutan JavaScript.** Si en el futuro añades schema (por Astro, plugin o script), validar con Google Rich Results Test o con el navegador (`document.querySelectorAll('script[type="application/ld+json"]')`).

---

*Informe generado siguiendo el skill seo-audit. Para dudas sobre tráfico actual, competencia o prioridad de keywords, conviene tener acceso a Search Console y/o datos de analítica.*
