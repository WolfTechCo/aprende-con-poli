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
| **1 · 2.4.0** (`entrega-1`) | Reporte con estrellas y comentario, capítulo 4 Patrones, saludo según la hora, mejor voz, campana en Novedades, "+" en el menú del mapa, volver a la portada, "Recorrido" en Ajustes, botones compactos, pestañas de capítulos en una fila, textos sin nombre repetido | Probada en tablet, celular y PC. Pull Request a la app final |
| **2 · 3.0.0** | Estructura nueva (ver sección 4) | Por diseñar. Investigación hecha |
| **3** | Voz neuronal pregrabada | Después de la entrega 2 (ver `docs/plan-audio-tts.md`) |

## 4. Entrega 2: estructura nueva (por decidir con la dueña)
**Problemas que resuelve (dichos por la dueña):**
- Perfiles repartidos: crear en la portada, pero cambiar nombre / eliminar / cambiar de perfil están en Ajustes y Mi avance. Debe haber **un solo lugar** para gestionarlos.
- El **contador de estrellas** del mapa no hace nada al tocarlo (un niño lo toca y "no pasa nada").
- Las **medallas no deben estar en Mi avance**. Definir su lugar.
- Definir bien qué va en Álbum, Mi avance y Ajustes. No basta con mover botones: hay que decidir cómo se reparten las zonas (pestañas, marcos, tarjetas) y cómo se adapta a tablet, celular y PC.
- El mapa de islas no tiene forma de volver a la portada con confirmación suave (hoy hay un botón de volver simple).
- **Recordar dónde estaba** al volver a la app: hoy siempre abre la portada; que recuerde el perfil y vaya al mapa.

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
4. Novedades curadas, recorrido (`TOURVER`) y changelog; Pull Request (**Sonnet**).

## 5. Entrega 3: voz neuronal
Plan de la dueña en `docs/plan-audio-tts.md`. Observaciones al revisarlo: los textos de la app **no son fijos** (muchos llevan nombre, números o ejercicios al azar, ver `poli.say(...)` y las preguntas generadas), no existe el marcador `{nombre}`, `afterSay` depende de `speechSynthesis.speaking`, y la cuenta de Azure y su llave las maneja la dueña en su máquina. Primer paso: inventariar y clasificar los textos.

## 6. Pendientes menores
- Probar en aparatos reales: instalación, modo sin internet y voces.
- Revisar el diploma impreso en papel.
- El aviso de ✨ → campana ya está; si se agrega un numerito de "novedades sin leer", definir cuándo.
- Tamaños táctiles mínimos para niños (verificar 44 pt / 48 dp, Smashing sugiere 75 px).

## 7. Datos útiles
- La clave del progreso `poligonos-magicos-v1` no se cambia nunca. Cualquier cambio de forma del guardado necesita un paso en `MIGRATIONS` (`js/app.js`).
- Al publicar: subir `?v=` en `index.html` y `VERSION` en `sw.js`; archivo JS nuevo → `FILES` en `sw.js`; `CHANGELOG.md`; `APPVER` y `NEWS` solo si es valioso para familias; `TOURVER` si cambian secciones o botones.
- `.col` ya existe en el CSS y pone en columna: no usarlo como modificador.
