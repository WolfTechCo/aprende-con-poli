# Aprende con Poli — guía para trabajar en el proyecto

App web estática (HTML + CSS + JS puro, sin dependencias ni build) para niños de 2° básico, guiada por la mascota Poli.
Publicada con GitHub Pages desde `main`: https://wolftechco.github.io/aprende-con-poli/
Contexto general en `README.md`, historial técnico en `CHANGELOG.md`, ideas en `PENDIENTES.md`.
**Antes de empezar, leer `PLAN.md`**: estado actual, reglas acordadas con la dueña y plan de las próximas entregas.

## Forma de trabajo
- Todo en **español de Chile**, pensado para una niña o niño de 7–8 años: textos cortos, entretenidos y que inviten a descubrir.
  Lo que es para adultos va aparte y solo explica el uso.
- Trabajar en una rama y dejar un **Pull Request hacia `main`**; la dueña del proyecto revisa y hace Merge.
- Si pide "modo plan" o "muéstrame primero": diseñar y mostrar capturas, sin subir nada hasta que apruebe.
- Explicar en simple, sin jerga técnica.
- **Probar siempre en este orden: tablet → celular → PC** (Playwright, vertical y horizontal). La dueña prueba rápido en su celular.
- **Novedades** (`js/novedades.js`): solo lo importante o valioso para las familias; lo interno va solo en `CHANGELOG.md`.
- **Textos de Poli:** el nombre se usa al saludar y al celebrar; no repetirlo dentro de una frase ni en pantallas seguidas.
- **Modelos:** al empezar cada etapa, avisar a la dueña si conviene Sonnet u Opus y esperar su confirmación (reglas en `PLAN.md`, sección 2).

## Reglas de la app
- **Todo debe caber en pantalla sin deslizar** (notebook, tablet y celular, vertical y horizontal). Solo se desliza el mapa
  en celular, el Rincón de adultos (Ajustes) y el historial de novedades. Probar con Playwright en varios tamaños.
- **Aprovechar el espacio** (regla de la dueña): la app va a crecer y siempre faltará espacio. Antes de dejar que algo se
  deslice, **crear y proponer ideas** para que quepa (con capturas, 2 o 3 opciones y una recomendada) y decidirlas junto
  con la dueña. Sus ideas son punto de partida, no la única forma: si hay una mejor, proponerla. Ejemplo ya usado:
  pestañas por capítulo con un resumen en cada una (Mis stickers y Mi avance). Otras posibles: agrupar en tarjetas que
  abren su detalle, columnas según el tamaño, mostrar menos y ampliar al tocar. El contenido debe llenar bien el alto,
  sin vacíos grandes, y los textos deben ser proporcionales a los dibujos.
- Los ejercicios son **al azar** y no se repiten en la sesión (`freshQ`).
- Al acertar, **no cortar a Poli**: avanzar con `afterSay`.
- Conteos de caras/aristas/vértices salen de `stats(id)` (mallas 3D en `MESH`), para que todas las pantallas digan lo mismo.
- Textos de niña/niño con `gx('campeona', 'campeón')`.
- Seguridad: CSP solo `'self'`, nada sale del dispositivo, sin analítica ni servicios externos; datos externos (nombres,
  respaldos) se limpian (`cleanName`, `cleanProfile`).

## Publicar una versión
1. Subir `?v=` en `index.html` **y** `VERSION` en `sw.js` (deben coincidir); si hay un archivo JS nuevo, agregarlo a `FILES` en `sw.js`.
2. La clave del progreso `poligonos-magicos-v1` **no se cambia nunca** (guarda todos los perfiles).
3. Si se renombra, une o elimina una isla: agregar un paso en `MIGRATIONS` (`js/app.js`).
4. Anotar la versión en `CHANGELOG.md` (X.Y.Z). Si hay algo nuevo para apoderados: subir `APPVER` y agregar la entrada en `NEWS` (`js/novedades.js`).
5. Si cambia la estructura (secciones o botones): subir `TOURVER` (`js/recorrido.js`) para que el recorrido aparezca de nuevo.

## Archivos
- `js/app.js`: base (guardado y perfiles, navegación, Poli, voz, mapa, portada) y capítulos 1–2.
- `js/numeros.js`: capítulo 3 · `js/patrones.js`: capítulo 4 · `js/repaso.js`: Repaso, Mi avance, Ajustes, respaldo · `js/opinion.js`: reporte de uso y opinión · `js/novedades.js` · `js/recorrido.js`.
- `css/style.css`: estilos; las reglas por tamaño de pantalla están al final.
