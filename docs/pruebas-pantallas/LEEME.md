# Pruebas de pantallas y preguntas (Playwright)

Scripts que se usaron en la entrega 3 para probar el capítulo 5. No se cargan en la app. Sirven de punto de partida para la
**entrega 3.1 (ajuste de espacios)**: ahí hay que sumarles la **medida de cuánto del espacio útil usa el contenido**, porque
hasta ahora solo miden si algo se pasa de la pantalla (ver la regla «Cómo planear y probar los espacios» en `PLAN.md`).

Uso (desde la carpeta de la app, con un servidor local en el puerto 8766: `python3 -m http.server 8766`):
- `tamanos.js`: recorre mapa, Mis stickers, Mi avance, las 4 islas, las 5 lecciones paso a paso y todos los tipos de pregunta del
  capítulo 5 en 12 tamaños y anota el desborde (alto/lado). Guarda capturas en `./capturas` (crear la carpeta antes).
  `node tamanos.js tabV,celV,bajoV` prueba solo esos tamaños (tabV, tabH, celV, celH, bajoV, bajoH1, bajoH2, pc, celV2, tabV2, tabV3, pcL).
  **Una pasada completa tarda 8 a 15 minutos: repetir solo los tamaños que fallan.**
- `preguntas.js`: genera miles de preguntas al azar por tipo y comprueba que haya una sola respuesta correcta, opciones distintas,
  números de 1 a 100 y que no aparezca la multiplicación dada vuelta como respuesta incorrecta.
- `partida.js`: juega el capítulo 5 de punta a punta (lección de inicio, 8 juegos y Gran Desafío) y comprueba que lo ganado no se pierda.
Los scripts usan `require('playwright')` (ya instalado en el ambiente de Claude Code).
