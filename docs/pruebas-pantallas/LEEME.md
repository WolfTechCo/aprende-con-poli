# Pruebas de pantallas y preguntas (Playwright)

Scripts para revisar la app en muchos tamaños de pantalla. No se cargan en la app. Se usan con un servidor local en el
puerto 8766 (desde la carpeta de la app: `python3 -m http.server 8766`) y `require('playwright')` (ya instalado en el ambiente de Claude Code).

## `revisar.js`: la revisión principal (rápida, en paralelo, dice «pasa / no pasa»)
```
node revisar.js [modo] [capítulos] [tamaños]
node revisar.js                     # rápido: tablet de pie, celular de pie y acostado · capítulo 5 (≈ 30 s)
node revisar.js completo todos      # 9 tamaños · portada, mapa, premios, adultos y los 5 capítulos (≈ 6 min)
node revisar.js tabV,celH 3,4       # solo esos tamaños y capítulos
```
- **Modos:** `rapido` (tabV, celV, celH) para ir probando; `completo` (9 tamaños) para cerrar cada fase. Tamaños: tabV, tabH, celV, celH,
  bajoV, bajoH1, bajoH2, pc, celV2 (además tabV2, tabV3, pcL).
- **Capítulos:** `5`, `3,4,5`, `todos`, `general` (portada, mapa, premios, medallas, ropa, álbum, Repaso, adultos).
- **Recorre** por capítulo: mapa, Mis stickers, Mi avance, islas, cada paso de cada lección, la primera pantalla de cada juego,
  cada tipo de pregunta (capítulos 3 a 5) y el Gran Desafío.
- **FALLA** (hay que arreglar): error de la app; algo se pasa de la pantalla (salvo donde se permite deslizar: mapa en celular,
  adultos, novedades); un dibujo o texto se sale de su tarjeta o botón; algo queda **cortado** por su caja o **tapado** por otra
  cosa (por ejemplo el «¡Nuevo!» bajo la cabecera).
- **Aviso** (mirar): preguntas que usan menos del 70 % del alto; respuestas que no se ven parejas con el contenido (regla de la dueña:
  casi iguales, o el contenido un poco más grande); lecciones bajo 55 %; pantallas que **empeoraron** 15 puntos o más respecto
  de la pasada anterior (`capturas/ultima.json`; las preguntas salen al azar, por eso solo se avisan bajas grandes).
- **Deja** capturas en `capturas/<tamaño>/`, una **lámina por tamaño** (`capturas/lamina-<tamaño>.jpg`) para mirar todo de una vez,
  y el informe en `capturas/informe.txt`. Revisa varios tamaños a la vez (uno por procesador, hasta 4 en el ambiente de Claude Code).
- **Para mejorarla:** las reglas están en `juzgar()` y `recortes()` (revisar.js) y la medida de ocupación en `metrica.js`. Cuando
  aparezca un error que la revisión no vio (como las bicicletas fuera de su tarjeta), agregar la regla que lo detecta.

## Otros
- `preguntas.js`: genera miles de preguntas al azar por tipo y comprueba que haya una sola respuesta correcta, opciones distintas,
  números de 1 a 100 y que no aparezca la multiplicación dada vuelta como respuesta incorrecta (capítulo 5).
- `partida.js`: juega el capítulo 5 de punta a punta (lección de inicio, 8 juegos y Gran Desafío) y comprueba que lo ganado no se pierda.
- `proponer.js` + `boceto-3-1.css`: capturas de la app contra un boceto de estilos (así se compararon las opciones A, B, B2 y B3 de la
  entrega 3.1). Sirve de molde para proponer cambios con capturas antes de construir. Guarda en `./propuesta`.
- Las carpetas `capturas` y `propuesta` no se suben (están en `.gitignore`).
