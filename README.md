# CARRIERS · Mapa de impacto FCO

Prototipo React para navegar el relevamiento técnico de Oracle Forms:

`CARRIERS → FCO → opción de menú → pantalla .fmb → bloque/package → tabla → operación SQL`

## Funcionalidades

- Árbol expandible y seleccionable.
- Búsqueda por pantalla, tabla, package o evidencia.
- Filtros por `SELECT`, `INSERT`, `UPDATE` y `DELETE`.
- Distinción entre impactos directos desde el Form e indirectos mediante packages.
- Ficha de detalle con evidencia técnica.
- Diseño adaptable a escritorio, tablet y celular.

Los datos incluidos son ilustrativos. El relevamiento real se incorporará a partir de las capturas del menú, archivos `.fmb`, librerías `.pll` y fuentes de packages.

## Ejecutar localmente

Requiere Node.js 22 o superior y pnpm.

```bash
pnpm install
pnpm dev
```

Para generar la compilación de producción:

```bash
pnpm build
```

## Archivos principales

- `app/page.tsx`: estructura, datos de ejemplo e interacciones.
- `app/globals.css`: sistema visual y diseño adaptable.
- `app/layout.tsx`: metadatos generales.
