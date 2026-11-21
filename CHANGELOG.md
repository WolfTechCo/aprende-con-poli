# Registro de cambios

Historial técnico de **Aprende con Poli** (antes *Mundo de Formas* y *Mundo de Formas y Números*).
Lo que ven los apoderados dentro de la app está en `js/novedades.js` (*Novedades*), escrito para quien la usa.

Formato de versión **X.Y.Z**: X = cambio grande (nueva materia o rediseño) · Y = capítulo o función nueva · Z = ajustes y arreglos.
La versión de los archivos (`?v=` en `index.html` y `VERSION` en `sw.js`) es un número interno aparte.

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
