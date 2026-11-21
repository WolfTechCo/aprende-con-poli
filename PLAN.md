# Plan de trabajo de Aprende con Poli

Documento para retomar el proyecto en una conversación nueva. Léelo completo junto con `CLAUDE.md`.
Última actualización: 21-11-2026 (después de cerrar la entrega 1).

## 1. Cómo trabajamos (acordado con la dueña)
- **Dos repositorios que comparten historia:**
  - `WolfTechCo/aprende-con-poli`: la **app final** (la que usan las familias). Solo recibe lo aprobado, por rama + Pull Request; la dueña hace el Merge.
  - `WolfTechCo/aprende-con-poli-pruebas`: el **ambiente de pruebas**. Se puede subir directo a su `main`. Su `main` = la entrega que se está probando + las cosas "solo de pruebas".
- **Solo de pruebas (nunca pasar a la app final):** `js/pruebas.js` (etiqueta 🧪) y su línea en `index.html`/`sw.js`, íconos de `icons/` con franja "PRUEBAS", `manifest.webmanifest` ("Poli (pruebas)"), `apple-mobile-web-app-title`, el bloque de ambiente de pruebas del `CLAUDE.md` de ese repositorio.
- **Cada entrega se construye limpia en una rama `entrega-N`** (desde `main` de la app final), se prueba en el ambiente de pruebas y de ahí pasa por Pull Request. Ramas de respaldo en el repositorio de pruebas: `integrada-2.8.6` (todo lo hecho antes de reordenar, incluye diploma, medallas y guardarropa), `produccion` (copia de `main` final al sembrar) y `feature/*`.
- **Pruebas, siempre en este orden: tablet → celular → PC**, con Playwright y en varios tamaños (vertical y horizontal). Verificar que todo cabe sin deslizar (salvo álbum, Mi avance, Ajustes, novedades y el mapa en celular). La dueña prueba rápido en su celular y confía en los resultados de tablet y PC.
- **Novedades (`js/novedades.js`):** solo lo importante o valioso para las familias. Lo interno va solo en `CHANGELOG.md`.
- **Textos:** el nombre se dice al saludar y al celebrar; no repetirlo dentro de una frase ni en pantallas seguidas.
- **Reporte por correo:** `FEEDBACK_MAIL` (`js/opinion.js`) se llena **al final**, cuando todo esté en la app final.
- **Cuando la dueña pida "solo informa" o "modo plan":** no cambiar nada, solo explicar y mostrar capturas.

## 2. Modelos: cuándo usar Sonnet y cuándo Opus
Quien lleve la conversación **debe avisar a la dueña, al empezar cada etapa, qué modelo conviene y esperar su confirmación** (ella cambia el modelo; la IA no puede). Regla:
- **Sonnet:** investigación con búsquedas, armar y ordenar planes, pruebas con Playwright, arreglos chicos de pantalla, textos, ramas, Pull Requests, novedades y changelog.
- **Opus:** diseño y construcción de la **reestructura de secciones** (entrega 2), migraciones de datos del guardado, resolver conflictos grandes entre ramas, y la **voz neuronal** (inventario de textos y script).
- Volver a Sonnet al terminar cada etapa pesada (pruebas, correcciones, Pull Request).

## 3. Estado
| Entrega | Contenido | Estado |
|---|---|---|
| **1 · 2.4.0** (`entrega-1`) | Reporte con estrellas y comentario, capítulo 4 Patrones, saludo según la hora, mejor voz, campana en Novedades, "+" en el menú del mapa, volver a la portada, "Recorrido" en Ajustes, botones compactos, pestañas de capítulos en una fila, textos sin nombre repetido | **Mergeada en la app final** (Pull Request #11, 21-11-2026) |
| **1.1 · 2.4.1** | Ajustes visuales (ver sección 3.1) | Puntos 1 a 3 hechos y probados (rama `entrega-1-1`); falta el punto 4 |
| **2 · 3.0.0** | Estructura nueva (ver sección 4) | Por diseñar. Investigación hecha |
| **3** | Voz neuronal pregrabada | Después de la entrega 2 (ver `docs/plan-audio-tts.md`) |

## 3.1 Entrega 1.1 · 2.4.1: ajustes visuales (pedidos por la dueña tras probar la entrega 1)
Son retoques de diseño que no dependen de la reestructura; se hacen con **Sonnet**, en una rama aparte y un Pull Request propio, **antes** de la entrega 2. Aplican a los 3 aparatos (tablet, celular y PC) en vertical y horizontal. **Orden y por qué:**
1. ✅ *Hecho en 2.4.1.* **Presentación de la isla** (todas las islas). *Causa: la clase `.hero` de la portada (ancho fijo y proporción cuadrada) también se aplicaba a las islas.* Hoy en vertical la figura y su texto quedan alineados a la izquierda con un hueco en medio, y sobra espacio entre ese grupo y las tarjetas de actividades; en horizontal el hueco entre la figura con su texto y los botones se nota más. Cambio pedido: **centrar** el grupo en vertical; en horizontal, **poner el texto al lado de la figura** (figura a la izquierda, título y recuadros a su derecha) en la mayoría de los casos, para ganar altura y que no haya que deslizar. *Va primero porque afecta a todas las islas y además resuelve el desborde más grande de la revisión de las unidades 1 a 3 (isla de Unidad, decena y centena, 29-38 px).*
2. ✅ *Hecho en 2.4.1, opción B elegida por la dueña.* **Pantalla de felicitaciones** ("¡Juego completo!" y "¡Lección completa!"). Es un componente compartido por todas las unidades. En horizontal reparte el título, la estrella y el mensaje por todo el ancho y el ojo tiene que recorrerlo; en vertical se ve agrupado y centrado. Cambio pedido: igual que en vertical (grupo centrado), o un formato distinto, por ejemplo **estrella a la izquierda y, a su lado, el título y el mensaje en 2 líneas**. Proponer 2 o 3 opciones con capturas y que la dueña elija.
3. ✅ *Hecho en 2.4.1.* **"Patrones que crecen"** (juegos y lección). Las torres siguen viéndose chicas y queda un espacio largo entre ellas y el texto (el tamaño del texto está bien). Agrandar las torres y acercarlas al texto, usando el espacio que sobra.
4. **Ajustes menores de las unidades 1 a 3** (lista en la sección 6): vacíos arriba y abajo, textos chicos junto a dibujos grandes, títulos que repiten la pregunta y desbordes de pocos píxeles en celulares acostados bajos.

## 4. Entrega 2: estructura nueva (por decidir con la dueña)
**Problemas que resuelve (dichos por la dueña):**
- Perfiles repartidos: crear en la portada, pero cambiar nombre / eliminar / cambiar de perfil están en Ajustes y Mi avance. Debe haber **un solo lugar** para gestionarlos.
- El **contador de estrellas** del mapa no hace nada al tocarlo (un niño lo toca y "no pasa nada").
- Las **medallas no deben estar en Mi avance**. Definir su lugar.
- Definir bien qué va en Álbum, Mi avance y Ajustes. No basta con mover botones: hay que decidir cómo se reparten las zonas (pestañas, marcos, tarjetas) y cómo se adapta a tablet, celular y PC.
- El mapa de islas no tiene forma de volver a la portada con confirmación suave (hoy hay un botón de volver simple).
- **Recordar dónde estaba** al volver a la app: hoy siempre abre la portada; que recuerde el perfil y vaya al mapa.
- **Decidido por la dueña (21-11-2026): un solo menú «+» en todos los aparatos.** Hoy, en tablet acostada y computador, el mapa muestra **dos filas** (capítulos arriba y debajo Repaso · Álbum · Mi avance · Ajustes) y se ve mal; en celular y tablet vertical ya está todo dentro del botón «+». Debe quedar **como en celular**: una sola fila de capítulos y todos los accesos dentro del «+» (menú corto), en **todos** los tamaños. Los bocetos de la etapa 1 (`docs`/página de propuesta) aún muestran la fila de botones en tablet acostada y computador: **rehacerlos** con solo el «+» antes de la etapa 2. Al construir: quitar `.mbtns` del mapa (`viewMap`, `js/app.js`) y usar el mismo menú en todos los tamaños (`isVertical()` ya no decide esto); revisar que el «+» sea bien visible en pantalla ancha y que no quede un hueco donde estaba la segunda fila.

**Decisiones de la dueña en la etapa 1 (21-11-2026; propuesta con bocetos en la página «Estructura nueva de Poli»):**
1. **Premios:** esquema 2 (**tarjetas**: Mis stickers, Mis medallas, Ropa de Poli, más el diploma). Más adelante se pasa al esquema 3 (**Cuarto de Poli**); ahí hay que **pulir y animar** mucho más (debe ser más animado). Dejar las pantallas de detalle iguales para poder cambiar solo el inicio. **Las tarjetas deben ser animadas** (movimiento suave, que reaccionen al tocar) y con un **fondo con más contenido para el niño**, nada estático (por ejemplo, formas, estrellas o detalles de Poli que se muevan detrás).
2. **«Mi avance» (resuelto en la conversación del 21-11-2026):** es una **sección grande y siempre visible, sin candado**, para el niño y la familia (un niño de 8 años sí puede leer y entender su avance). El candado es **solo para modificar**: las casillas de qué temas entran al Repaso, y todo el Rincón de adultos (jugadores, ajustes, respaldo, novedades, instalar, opinión), que queda como configuración, más **pequeña**. Debe verse **animado y con poco texto**; en cada tema: **dibujo animado (barra o camino de colores y estrellas) + el porcentaje real en letra pequeña**, y bajo 70 % **sin rojo** (un «¡vamos a practicar!» amable); el resumen simple sirve para perfiles más pequeños. Arriba, un resumen rápido para la familia («Hoy: 12 respuestas, 83 % a la primera. Para reforzar: …»). **Mensajes de Poli según el avance, de las dos formas:** (a) uno general al entrar, y (b) al tocar un tema, Poli dice la frase de ese tema según cómo le va (empieza, avanza, le cuesta —tono amable, sin porcentaje en rojo—, lo domina, vuelve tras días). **Mejora posterior (valiosa):** pedir el **año de nacimiento** del niño o niña para que la app adapte lo que muestra a discreción. **Candado abierto unos minutos:** descartado por ahora, porque el avance ya es visible sin candado.
3. **Candado: opción C por ahora** (multiplicación con tablas altas, números distintos cada vez, sin pistas). Se descarta «mantener apretado + número en palabras» (molesto). **Después, cuando la app no dependa del navegador:** clave de 4 números (opción B) **con opciones de recuperación**.
4. **Entrada al Rincón de adultos:** botón «🔒 Adultos» en la **portada** y también como opción dentro del menú «+» del mapa.
5. **Crear jugadores:** solo en el **Rincón de adultos**. En la portada solo aparece el formulario la primera vez, cuando no hay ningún jugador.
6. **Al abrir la app:** con **2 o más jugadores** se ve la portada y cada niño toca su tarjeta (como hoy). Con **un solo jugador** entra directo al mapa con su saludo. La casita del mapa siempre permite cambiar de jugador (con aviso suave).

**Piezas ya hechas y aprobadas que esperan su lugar nuevo** (están en la rama `integrada-2.8.6` del repositorio de pruebas, v2.8.6; se pasan con `cherry-pick`):
- **Racha y medallas** (`js/medallas.js`, 9 medallas calculadas con lo guardado; `save.badges`, `save.days`).
- **Diploma** (`js/diploma.js`): documento aparte en un iframe `srcdoc`, medidas en `u`, imprime en A4 y carta en una página. Versión final aprobada: sin marco en el título, sin sección de capítulos, sin firma, con sello "¡BRAVO!", las 9 medallas y la próxima meta.
- **Guardarropa de Poli** (`js/guardarropa.js`, 7 accesorios por medalla; `save.acc`).

**Investigación de mercado:** `docs/investigacion-mercado.md` (con fuentes; marca HECHO / OPINIÓN / NO CONFIRMADO). Resumen:
- Un solo **rincón de adultos** con candado para la gestión de perfiles (crear, renombrar, borrar, respaldo), el progreso para adultos y los ajustes (Khan Academy Kids y Duolingo ABC lo hacen así).
- El contador de estrellas debería llevar a una pantalla de **premios**. Las medallas irían ahí (por ejemplo en el Álbum renombrado "Mis premios"), no en Ajustes.
- El **candado de multiplicación es débil**: es contenido de 2° básico. Cambiarlo por algo que un niño no resuelva solo.
- Esquemas de distribución propuestos: **A** pestañas arriba en Premios; **B** una pantalla de Premios con 3 tarjetas grandes (recomendado para el niño); **C** lista a la izquierda y detalle a la derecha solo para el progreso de la familia en pantalla ancha. Lo del niño colorido y con Poli; lo de adultos sobrio y con candado visible.
- Límites: poca evidencia directa con niños de 6-8 años; COPPA y tamaños táctiles sin confirmar.

**Etapas sugeridas para la entrega 2** (con el modelo que conviene):
1. Decidir la estructura con la dueña a partir de la investigación y 2-3 bocetos con capturas (**Sonnet**).
2. Diseñar el detalle: pantallas, navegación, migración del guardado si cambia algo (**Opus**).
3. Construir en una rama `entrega-2` y probar tablet → celular → PC (**Opus** construye; **Sonnet** prueba).
   Se construye **en bloques**, y al terminar cada uno se detiene y se avisa a la dueña para que revise su uso disponible (la IA no puede ver el uso):
   - **3a · Mapa y entrada:** menú «+» único en todos los tamaños (sin segunda fila), casita con aviso suave, contador de estrellas que se toca, portada con «🔒 Adultos», abrir según cantidad de jugadores.
   - **3b · Mis premios:** tarjetas animadas con fondo con contenido; pasar medallas, diploma y guardarropa desde `integrada-2.8.6` (`cherry-pick`).
   - **3c · Mi avance:** sección grande y siempre visible, tema con dibujo animado + porcentaje pequeño, mensajes de Poli (general y al tocar un tema).
   - **3d · Rincón de adultos:** candado (multiplicación con tablas altas), jugadores (crear, renombrar, borrar), ajustes, respaldo, novedades, instalar, opinión, casillas del Repaso; migración del guardado si cambia algo.
   - **Orden acordado con la dueña:** **Opus construye todos los bloques (3a a 3d) seguidos**, sin cambiar de modelo entre uno y otro; al terminar los 4, la IA le **pide el cambio a Sonnet** para probar tablet → celular → PC, corregir, novedades, recorrido, changelog y Pull Request. Entre bloques solo se avisa en una línea que terminó (para que ella mire su uso) y se sigue, salvo que ella pida detenerse.
4. Novedades curadas, recorrido (`TOURVER`) y changelog; Pull Request (**Sonnet**).

## 5. Entrega 3: voz neuronal
Plan de la dueña en `docs/plan-audio-tts.md`. Observaciones al revisarlo: los textos de la app **no son fijos** (muchos llevan nombre, números o ejercicios al azar, ver `poli.say(...)` y las preguntas generadas), no existe el marcador `{nombre}`, `afterSay` depende de `speechSynthesis.speaking`, y la cuenta de Azure y su llave las maneja la dueña en su máquina. Primer paso: inventariar y clasificar los textos.

## 6. Pendientes menores
- **Ajustes menores de las unidades 1 a 3 en celular acostado** (revisión del 21-11-2026 en 6 tamaños: 844×390, 667×375, 740×360, 915×412 y celulares verticales 390×844 y 360×640; en vertical no hay hallazgos ni errores). Dejar para una etapa posterior, junto con la reestructura:
  - *Se pasan unos píxeles y habría que deslizar* (solo en celulares acostados muy bajos, 667×375 y 740×360): lección del cubo (8-12 px), "Caza en la vida real" del capítulo 1 y 2 (7 px), juego "Suma por columnas" (10 px), Gran Desafío del capítulo 3 (10 px) y Repaso (19 px en 740×360).
  - *(La isla de Unidad, decena y centena, que se pasaba 29-38 px, ya quedó resuelta en 2.4.1 con la nueva presentación de la isla.)*
  - *Quedan vacíos arriba y abajo* (contenido pequeño y pegado arriba, como pasaba en el capítulo 4 antes del arreglo): juego "¿Cuál es?" del capítulo 3 (35-38 % de la altura), "¿Cuánto vale?" y el Gran Desafío del capítulo 3 en 915×412 (39 %). Agrandar números y opciones para llenar el espacio.
  - *Dibujo grande, textos chicos* (al revés del capítulo 4): lecciones de figuras 3D, por ejemplo "El cubo", con el título y los recuadros "6 caras · 12 aristas · 8 vértices" muy pequeños junto al dibujo.
  - *El título de la pantalla repite la pregunta* en algunos juegos del capítulo 3 ("¿Cuál es?" / "¿Cuál es el 532?"): usar el nombre de la actividad, como ya se hizo en el capítulo 4.
  - Un solo criterio para todas las unidades: el contenido debe ocupar bien el alto y los textos deben ser proporcionales al dibujo.
- Probar en aparatos reales: instalación, modo sin internet y voces.
- Revisar el diploma impreso en papel.
- El aviso de ✨ → campana ya está; si se agrega un numerito de "novedades sin leer", definir cuándo.
- Tamaños táctiles mínimos para niños (verificar 44 pt / 48 dp, Smashing sugiere 75 px).

## 7. Datos útiles
- La clave del progreso `poligonos-magicos-v1` no se cambia nunca. Cualquier cambio de forma del guardado necesita un paso en `MIGRATIONS` (`js/app.js`).
- Al publicar: subir `?v=` en `index.html` y `VERSION` en `sw.js`; archivo JS nuevo → `FILES` en `sw.js`; `CHANGELOG.md`; `APPVER` y `NEWS` solo si es valioso para familias; `TOURVER` si cambian secciones o botones.
- `.col` ya existe en el CSS y pone en columna: no usarlo como modificador.
