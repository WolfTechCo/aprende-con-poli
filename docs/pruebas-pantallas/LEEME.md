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
- `figuras.js` + `boceto-kawaii.js` (estilo `K`, el elegido) y `boceto-figuras.js` (estilos A, B y C de la primera propuesta): capturas de la app con figuras nuevas del capítulo 5, antes de construir. Ejemplo: `node figuras.js tabV,celV,celH hoy,K ms_tot:fruti,m2_bike`. Guarda en `./propuesta-figuras`.
- `proponer.js` + `boceto-3-1.css`: capturas de la app contra un boceto de estilos (así se compararon las opciones A, B, B2 y B3 de la
  entrega 3.1). Sirve de molde para proponer cambios con capturas antes de construir. Guarda en `./propuesta`.
- Las carpetas `capturas` y `propuesta` no se suben (están en `.gitignore`).

## Mascotas con poses (entrega 4A, bocetos; no se cargan en la app todavía)
`boceto-poses.js` tiene el motor de poses y las cinco mascotas; `pagina-mascotas.js` arma la página de revisión («Mascotas de Poli»).
El método completo (pasos, paradas y reglas) está en el repositorio privado `poli-referencias`, `planes/entrega-4/metodo-mascotas.md`.
Antes de mostrar una mascota, siempre estas tres:
```
node lamina-poses.js MASCOTA [ETAPAS] [POSES_JSON] [SALIDA.png]   # poses fijas en una imagen (TITULOS="a|b|c" pone nombres a las columnas)
node analizar-gestos.js MASCOTA [ETAPAS]                          # toques y tiempos: debe dar 0 problemas
node analizar-gestos.js MASCOTA tira ETAPA ACCION [MS] [CUADROS] [TOQUE_MS]   # tira de cuadros de una acción
node revisar-forma.js MASCOTA [ETAPAS]                            # forma en movimiento: nada fuera del cuadro ni estirado de más
```
- `analizar-gestos.js`: con reloj falso prueba cada acción sola, tocada al 25, 50 y 75 % y con 5 toques seguidos; avisa lo **pegado**, las poses de mano que **parpadean** y los **saltos** bruscos. ≈ 45 s por etapa (correr las etapas en paralelo).
- `revisar-forma.js`: mide cada pieza cuadro a cuadro; avisa **LARGO** (se estira o encoge), **TAMAÑO**, **FUERA** (se sale del escenario) y **SUELTA**; arma una lámina con cada aviso marcado en rojo y da el punto más alto por etapa (debe quedar en −64 o más abajo). Además (27-11-2026) avisa **TAPA** (los ojos o el contenido —números, letras, «?», pintas— quedan cubiertos por otra pieza; lo importante se reconoce solo: ojos con relleno `km-ojo`, textos y grupos marcados con `data-imp="contenido"`) y **CONTRASTE** (una pieza casi del color de lo que tiene detrás, de otra parte del cuerpo, y que tampoco se distingue por su contorno; ΔE en Lab). Lo que pasa en reposo se avisa una sola vez como acción «reposo». Muchos avisos son propios del movimiento (la tortuga y el búho que se esconden, la nube de tinta del pulpo, el ojo lejano detrás del caparazón al mirar): mirar la lámina. Opciones: `FORMA_GRANDE=1` (fotos al doble), `FORMA_SOLO=TAPA,CONTRASTE` (lámina solo con esos tipos), `FORMA_PRUEBA=1` (autoprueba: tapa un ojo a propósito y comprueba que los dos avisos salten).
- Cada mascota declara en su `spec`: `prueba` (acciones por nombre), `selector` (perillas que eligen pose) y `reposo` (lo que se acomoda al instante al tocar); en `REPARTO`, qué sabe hacer en cada etapa.
