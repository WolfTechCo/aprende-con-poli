# Registro de cambios

Historial técnico de **Aprende con Poli** (antes *Mundo de Formas* y *Mundo de Formas y Números*).
Lo que ven los apoderados dentro de la app está en `js/novedades.js` (*Novedades*), escrito para quien la usa.

Formato de versión **X.Y.Z**: X = cambio grande (nueva materia o rediseño) · Y = capítulo o función nueva · Z = ajustes y arreglos.
La versión de los archivos (`?v=` en `index.html` y `VERSION` en `sw.js`) es un número interno aparte.

## 3.2.0 — 2026-11-22 (archivos v36)
Entrega 3.1, fase 2: figuras nuevas del capítulo 5 en estilo **Gel 3D** (kawaii, elegido por la dueña; regla de figuras en `CLAUDE.md`).
- **Dibujos Gel 3D** (`js/multiplicacion.js`, bloque `MG`; molde y capturas en `docs/pruebas-pantallas/boceto-gel.js` y `figuras.js`): degradado de volumen, contorno del mismo color más oscuro, brillos, ojos grandes con dos brillos, mejillas y sombra en el suelo. 19 cosas de todo el mundo que se sortean (frutilla, manzana, cereza, naranja, cupcake, dona, macarón, helado, dulce, sushi, autito, pelota, patito, osito, dinosaurio, pollito, pez, chinita, crayón), cada una con su recipiente gel y una tarjeta de color pastel que no se pierde en el cielo. Bicicletas, sobres de láminas, filas (ahora dulces con carita) y cuentos (dibujos propios en vez de emojis) con el mismo estilo.
- **Textos:** «en cada bandeja / caja / tina…» (campo `c1` del tema) en vez de «en cada uno»; la lección de inicio sortea la cosa (antes siempre sopaipillas); las filas hablan de dulces.
- **Movimiento suave** (`css/style.css`, bloque «figuras Gel 3D»): saltito al aparecer, rebote al tocar un grupo y cada cosa se ilumina al contar en la lección; respeta «reducir movimiento».
- **Medidas:** los dibujos informan `--vw/--vh` en la escala de los platos de antes (`K104`), así las pantallas ya probadas calzan. Revisión completa del capítulo 5 en 9 tamaños: sin desbordes (solo queda el «¡Nuevo!» cortado, ya conocido). Preguntas (una sola correcta) y partida completa: sin cambios.
- Sin cambios en el guardado (`SAVEVER` sigue en 2) ni en el recorrido.

## 3.1.1 — 2026-11-22 (archivos v35)
Entrega 3.1, fase 1: el capítulo 5 aprovecha mejor el espacio de la pantalla.
- **Escenario del capítulo 5** (`STAGE_CH = [5]` en `js/app.js`, bloque «Escenario» al final de `css/style.css`): la zona de juego mide su espacio (`container-type:size`) y dibujos y respuestas crecen con él. Preguntas con 86–96 % del alto útil (antes 36 % en celular de pie y 46 % acostado) y lecciones con 76–84 %, sin deslizar, medido en 8 tamaños.
- **Distribución:** de pie, pregunta arriba, dibujo al centro y respuestas grandes abajo; acostado (celular, tablet y PC), dibujo y respuestas forman un grupo centrado con separación fija (opción B3).
- **Dibujos:** bicicletas y platos quedan dentro de sus tarjetas en todos los tamaños; en Mi avance las pestañas de capítulos ya no se tapan.
- **Herramienta de revisión** (`docs/pruebas-pantallas/revisar.js`): paralela, todos los capítulos, pasa / no pasa y láminas de capturas; la medición avisa si algo se sale.
- Sin cambios en el guardado (`SAVEVER` sigue en 2). Sin novedades para familias ni cambio de recorrido.

## 3.1.0 — 2026-11-21 (archivos v34)
Entrega 3: capítulo 5 de Multiplicación y barra de capítulos que crece. Método de referencia: texto de 2° básico de una editorial (páginas no incluidas en el repositorio); ejercicios, textos y dibujos son propios.
- **Capítulo 5: Multiplicación** (`js/multiplicacion.js`): lección de inicio «¿Qué es multiplicar?» (contar de a grupos → suma de iguales → «veces» → signo «·», que Poli lee «por»), 4 islas con lección y 2 juegos (Sumas que se repiten · ¿Es multiplicación? · La tabla del 2 con «parte y suma» · Las tablas del 5 y del 10) y Gran Desafío (`challengeMul`). Se enchufa al motor del capítulo 3 (islas tipo `num`, `NQ`, `NUMLESSON`, `NUMGAME`, `quizGame`). Los 4 temas entran a `TOPICS` y `N_TOPIC` (Repaso y Mi avance). Reglas: en los dibujos el primer número son las veces y nunca se ofrece la multiplicación dada vuelta como respuesta incorrecta; en las tablas se pregunta por el resultado; números hasta 100. Probado con 54.000 preguntas: siempre una sola correcta y opciones distintas. Estrellas 82 → 98 y stickers 30 → 36.
- **Barra de capítulos (opción B + A):** ícono por capítulo (`CH[k].ico`, nombre en `CH[k].nm`); el elegido muestra su nombre; si no caben, los demás quedan como ícono (`.compact`) y, si aun así no caben, la fila se desliza con el siguiente asomándose (`.slide`, `fitChapRow`). Los íconos se mueven de vez en cuando, «¡Nuevo!» (`NEWCH`) hasta que entra a la lección de inicio y Poli dice el nombre del capítulo al tocarlo. Igual en el mapa, Mis stickers y Mi avance.
- **Lo ganado no se pierde:** `medalsEarned` suma las medallas ya anunciadas (`save.badges`); `keepEarned` (una vez por jugador, marca `c5`) conserva «Mente brillante» y el rango más alto a quien ya los tenía. Los niveles de medallas quedan para la entrega 4. `cleanProfile` acepta el desafío de todos los capítulos.
- **Recorrido:** `TOURVER` 4 (la fila de capítulos cambió).
- Sin cambios en el guardado (`SAVEVER` sigue en 2).

## 3.0.0 — 2026-11-21 (archivos v33)
Entrega 2: estructura nueva (decisiones y diseño en `PLAN.md`, sección 4). Respaldo de la app antes de este cambio: rama `respaldo-2.4.1`.
- **Mapa y entrada (3a):** un solo menú «+» en todos los tamaños (se quitó la segunda fila `.mbtns`); arriba a la izquierda la **casita** (`askHome`: ventana suave «¿Cambiamos de jugador?» o «¿Volvemos a la portada?») y el «+» (Repaso · Mis premios · Mi avance · Adultos, este último aparte y gris). El contador de estrellas es un botón con «›» que se mueve cada tanto y lleva a Mis premios. En celular de pie el título dice «Mapa». Portada sin la tarjeta «Agregar» y con «🔒 Adultos» junto a «Recorrido». Al abrir: con un solo jugador va directo a su mapa (`boot`).
- **Mis premios (3b, `js/premios.js`):** 4 tarjetas que flotan cada una a su ritmo y rebotan al tocarlas, sobre un fondo de formas en movimiento (`prizeBg`); el dibujo se ajusta al alto con `container-type:size`. Detalles: **Mis stickers** con pestañas de capítulos y su resumen (`chapTabs`), **Mis medallas** (racha arriba; al tocar, Poli dice cómo se gana) y **Ropa de Poli**. `js/medallas.js`, `js/guardarropa.js` y `js/diploma.js` vienen de `integrada-2.8.6` (se quitaron sus secciones viejas de Mi avance). Poli celebra en el mapa, una sola vez y con confeti, las medallas nuevas (al actualizar: todas las que ya tenía).
- **Mi avance (3c):** sin candado y solo del jugador actual. Camino de 5 piedras por tema con una estrella que camina; estados 🔒 🌱 💪 🚀 🏆 👋 (`levelOf`), bajo 70 % en naranjo («¡Vamos a practicar!»), nunca rojo. Pestañas de capítulos con mini camino y 💪. Línea para la familia con las respuestas de hoy (`save.today`). Frases de Poli al entrar y al tocar un tema (`TOPIC_SAYS`). «🔒 Elegir temas del Repaso» abre el Rincón en el jugador.
- **Rincón de adultos (3d, `js/adultos.js`, reemplaza `viewParent`):** candado con tablas del 6 al 9, distinta cada vez y sin repetir la anterior, 3 intentos. Sobrio y sin Poli (avisos escritos). Tablet y PC: secciones a la izquierda; celular: lista → sección. Secciones: Jugadores (crear hasta 6, nombre, niña/niño, temas del Repaso, borrar con confirmación dentro de la app, sin `confirm()`), Avance de todos, Novedades, Respaldo (confirmación dentro de la app), Instalar, Ayúdanos a mejorar y Recorridos. Crear jugadores solo aquí (en la portada solo la primera vez).
- **Guardado:** `SAVEVER` 2. Paso 1 → 2 en `MIGRATIONS`: agrega `badges: []` y `acc: ''`; no se renombra nada. `today` ({ d, n, ok }) se guarda en `track()`. Los tres pasan por `cleanProfile`. La clave `poligonos-magicos-v1` no cambia.
- **Recorrido:** `TOURVER` 3, con pasos nuevos para la casita y las estrellas; el «+» se abre en todos los tamaños. Se quitó el recorrido de Ajustes (el Rincón es sin Poli).
- **App final y ambiente de pruebas separados:** viven en la misma dirección base (wolftechco.github.io), así que compartían el progreso y cada una borraba los archivos sin internet de la otra. Ahora `KEY` acepta `self.POLI_KEY` (solo lo define pruebas, en un archivo que no pasa a la final) y el service worker solo borra sus propias versiones (`/^poli-v\d+$/`).
- **Unidades 1 a 3 en celular acostado (pendiente 4 de la entrega 1.1):** las preguntas de números («Valor del dígito», «Elige la suma», Gran Desafío) ocupaban ~40 % del alto; ahora el número y las opciones crecen con el alto. En 667 × 375 y 740 × 360 la lección de cuerpos 3D, la caza y la suma por columnas ya no se pasan (antes 7-12 px). Los títulos ya no repiten la pregunta: «Valor del dígito», «Elige la suma», «Forma el número» y «Cuenta los bloques».

## 2.4.1 — 2026-11-21 (archivos v25)
Ajustes visuales pedidos por la dueña al probar la entrega 1 (ver `PLAN.md`, sección 3.1). Sin novedades para familias.
- **Presentación de la isla:** la clase `.hero` es de la portada (ancho fijo y `aspect-ratio:1`) y también se aplicaba a `.hub .hero`: la figura y su texto quedaban angostos, pegados a la izquierda (43 px fuera del centro en celular vertical) y con un hueco en medio. Ahora `.hub .hero{width:auto;aspect-ratio:auto}`. En vertical (≤820 px) la figura queda centrada y ocupa el alto sobrante (`grid-template-rows:1fr auto`); en tablet vertical es más grande; en **celular acostado** la figura va a la izquierda y su texto (título y recuadros) a su lado, con lo que no hay que deslizar (la isla de Unidad, decena y centena ya no se pasa 29-38 px). Vale para las islas de figuras 2D, 3D, números y patrones.
- **Pantalla de felicitaciones** (juego, lección, Repaso y desafío; en celular acostado): formato **B** elegido por la dueña, con la estrella a la izquierda y el título y el mensaje a su lado en dos líneas (antes se repartían por todo el ancho). En el desafío, las 3 estrellas quedan juntas a la izquierda.
- **Patrones que crecen:** las filas de la torre se ajustan a la torre más alta (`towerSvg`, mínimo 5; antes siempre 11), así los cubos salen más grandes; en celular acostado la torre y las opciones van juntas en el centro (no en extremos opuestos) y en la lección la torre comparte el alto con el título.

## 2.4.0 — 2026-11-21 (archivos v24)
- **Reporte de uso y opinión** (`js/opinion.js`, sección "Ayúdanos a mejorar" en Ajustes): estrellas de 0,5 a 5 (mitad izquierda = media estrella; también con teclado) y comentario opcional de hasta 300 caracteres. Arma un reporte anónimo ("Perfil 1", "Perfil 2"…, código al azar por dispositivo) con estrellas ganadas, temas, días de uso, respuestas y % a la primera. El adulto lo ve completo y lo comparte con "Copiar reporte" o "Guardar archivo". Nada sale solo: la CSP no cambia. Para recibirlo por correo, escribir el correo del proyecto en `FEEDBACK_MAIL` (`js/opinion.js`): aparece "Enviar por correo".
- `save.days`: días en que practicó (últimos 90), se guarda en `track()` y se limpia en `cleanProfile`.
- **Saludo según el momento** en el mapa (buenos días / tardes / noches, una vez por visita) y, si hace más de 3 días que no practica, invita al Repaso.
- **Mejor voz en español**: `pickVoice` puntúa acento y calidad (natural/neural/online/Google) y evita las voces básicas.
- Recorrido de Ajustes: paso nuevo para "Ayúdanos a mejorar" (`TOURVER_AJ` 2). `TOURVER` 2: cambian botones del mapa y la portada.
- **Capítulo 4: Patrones** (`js/patrones.js`): lección de inicio ("¿Qué es un patrón?"), 3 islas (colores, figuras, patrones que crecen con torres de cubos), cada una con lección y 2 juegos, y Gran Desafío (`challengePat`). Se enchufa al motor del capítulo 3 (islas tipo `num`, `NQ`, `NUMLESSON`, `NUMGAME`, `quizGame`); preguntas al azar con `freshQ` y siempre con una sola respuesta correcta (probado con 24.000 preguntas). Los 3 temas entran al Repaso del día y a Mi avance (`TOPICS`, `N_TOPIC`). `islandNum` usa `F.ch` para recordar el capítulo.
- **Botones más claros:** la portada muestra una **campana** 🔔 para Novedades (antes una estrella ✨); el menú del mapa en celular es un **"+"** dorado (antes 4 puntitos de colores); el mapa tiene **botón de volver a la portada** (`backTarget`); Ajustes dice solo "Recorrido".
- **Ajustes y secciones de adultos:** botones más chicos y formato "texto + botón" cuando cabe (Novedades, Respaldo, Instalar); nombre, "Cambiar" y "🗑️ Borrar" en una sola fila; "Desbloquear" más chico y en la misma fila que su texto. Clases `.split` / `.splitrow` / `.stack` (no usar `.col`: ya existe y pone en columna).
- **Pantallas:** en celular las pestañas de capítulos caben en una fila (el número va en `<span class="cn">` y se oculta); en celulares bajos (360×640) la isla se compacta para que la última tarjeta no quede bajo Poli. En celular horizontal bajo (667×375, 740×360, 844×390) las preguntas de patrones llevan la fila de fichas arriba y las opciones abajo en una sola fila, y el Repaso compacta su etiqueta y barra de avance, para que todo quepa sin deslizar.
- **Capítulo 4 en celular acostado:** fichas, opciones y torres de cubos más grandes para llenar el espacio (antes quedaban chicas y con vacío arriba y abajo); las lecciones de patrones van centradas (fichas arriba, título abajo); los títulos de los juegos ya no repiten la pregunta ("Sigue el patrón", "Las torres crecen", "Completa las torres"); los íconos de las islas llenan su cuadro como los de las otras unidades y la tarjeta del juego 1 tiene su propio ícono (`F.ico` en `islandNum`). Las torres toman su ancho de `--n`.
- **Botón "+" del mapa:** del mismo tamaño que los otros botones, dorado con relieve, borde blanco y brillo, con el signo más chico (antes era plano y su signo más grande que el resto).
- **Textos:** el saludo del mapa dice el nombre una sola vez ("¡Buenos días, Ana! Sigamos con la isla…") y las lecciones de cada isla ya no repiten "¡Hola, nombre!" al empezar; el nombre se usa al saludar y al celebrar.

## 2.3.1 — 2026-10-30 (archivos v23)
- Recorrido en celular: en los pasos de Repaso, Álbum, Mi avance y Ajustes se abre el menú de los 4 puntitos y se ilumina la opción de la que habla Poli; se cierra al pasar al paso del sonido.

## 2.3.0 — 2026-10-30 (archivos v22)
- **Novedades:** ventana que aparece una vez por dispositivo al actualizarse, con lo nuevo de la versión; historial en la portada (botón ✨ junto al volumen) y en Ajustes. Quien instala por primera vez no la ve. `js/novedades.js`.
- **Recorrido con Poli** (`js/recorrido.js`): 10 pasos sobre un mapa de muestra que no se guarda (`demoMode`); se avanza tocando la varita; "Saltar". Aparece la primera vez que se entra al mapa y se repite desde la portada ("🧭 Recorrido con Poli"), también sin perfiles. `TOURVER` permite volver a mostrarlo cuando cambie la estructura.
- **Recorrido de Ajustes** (para adultos), con su botón y versión propia (`TOURVER_AJ`).
- **Portada:** tarjetas de niños en una fila con flechas ‹ › cuando no caben (hasta 6), sin deslizar la portada.
- **Botones de símbolo:** al pasar el mouse se levantan y muestran su nombre; en pantallas táctiles, mantener presionado muestra el nombre y Poli lo dice, sin activar el botón. El volumen indica "Silenciar" / "Activar sonido".
- **Ajustes:** la multiplicación permite 3 intentos (con otra multiplicación) antes de volver al mapa.
- **Mi avance:** texto del pie más grande.

## 2.2.1 — 2026-10-30 (v21)
- Mi avance: casilla "entra al Repaso" en cada tema, bloqueada hasta resolver una multiplicación; sale de Ajustes.

## 2.2.0 — 2026-10-29 (v20)
- Tren de números: colores al azar y Poli nombra el color real del vagón que toca.
- Todo cabe en pantalla sin deslizar (12 tamaños medidos); celular horizontal reorganizado.
- Al acertar se espera a que Poli termine de hablar (`afterSay`); tocar la pantalla salta la espera.
- Mapa: Repaso, Álbum, Mi avance y Ajustes como botones (tablet/notebook) o botón de 4 puntitos (celular). Taller libre como isla del capítulo 1.
- Panel de apoderado dividido en **Mi avance** (sin clave) y **Ajustes** (con clave).

## 2.1.0 — 2026-10-29 (v18–v19)
- Perfiles por niño o niña (hasta 6), pregunta niña/niño y textos adaptados; el progreso anterior pasa al primer perfil.
- "Volver" en las lecciones lleva al paso anterior.

## 2.0.0 — 2026-10-29 (v16–v17)
- Nuevo nombre **Aprende con Poli** (repositorio `aprende-con-poli`) y portada con Poli grande.
- App instalable (manifest, íconos) y sin internet (service worker); letra incluida (sin Google Fonts); CSP.
- Respaldo del progreso (guardar/cargar, con validación) y guardado versionado (`MIGRATIONS`).

## 1.4.0 — 2026-10-29 (v15)
- Repaso del día y panel de apoderado (aciertos por tema, temas del repaso); limpieza del nombre.

## 1.3.0 — 2026-10-29 (v13–v14)
- Isla "Sumas de C, D y U" con botón de Ayuda; ejercicios al azar en todas las secciones sin repetir en la sesión.

## 1.2.0 — 2026-10-29 (v12)
- Capítulo 3: Números (unidad, decena y centena, valor posicional, tabla del 1000, secuencias), método Singapur. Nombre "Mundo de Formas y Números".

## 1.1.0 — 2026-10-28
- Capítulo 2: Figuras 2D y 3D (cuerpos en 3D que se giran y se pintan), versión para celular y publicación en GitHub Pages.

## 1.0.0 — 2026-10-28
- *Mundo de Formas*: Capítulo 1, Polígonos.
