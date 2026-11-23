# Aprende con Poli — guía para trabajar en el proyecto

App web estática (HTML + CSS + JS puro, sin build) para niñas y niños de **toda la educación básica** (desde 1° básico; hoy con contenido de 2°), guiada por la mascota Poli.
**Dependencias (dueña, 23-11-2026):** la regla de «sin dependencias» se va dejando por la evolución de la app: si el contenido lo necesita, se agregan de forma equilibrada (guardadas dentro de la app, para mantener la CSP `'self'` y el uso sin internet). El rendimiento del aparato no debe frenar el diseño.
Publicada con GitHub Pages desde `main`: https://wolftechco.github.io/aprende-con-poli/
Contexto general en `README.md`, historial técnico en `CHANGELOG.md`, ideas en `PENDIENTES.md`.

## Al empezar cada chat (siempre, en este orden)
El proyecto vive en **tres repositorios**: dos públicos de la app y uno **privado** con el plan.
| Repositorio | Qué guarda | Ambiente |
|---|---|---|
| `WolfTechCo/aprende-con-poli` (público) | Código de la app final y reglas técnicas (este archivo) | **Producción**: su `main`, publicado para las familias |
| `WolfTechCo/aprende-con-poli-pruebas` (público) | La misma app con lo «solo de pruebas» | **Pruebas**: su `main`, publicado con la etiqueta 🧪 |
| `WolfTechCo/poli-referencias` (**privado**) | **El plan** (`planes/PLAN.md`), el diseño de cada entrega (`planes/entrega-N/`) y las investigaciones | — |

1. **Conectar `poli-referencias`** (`add_repo`) y leer su `CLAUDE.md` y **`planes/PLAN.md`**: estado de versiones, reglas acordadas con la dueña, decisiones y lo que sigue. El plan ya no está en los repositorios públicos (desde el 23-11-2026), para no publicar la estrategia ni notas personales.
2. **Encontrar la última versión de cada ambiente** sin depender de nombres de rama dados. En **cada uno de los tres repositorios**: `git fetch origin` y luego `git for-each-ref --sort=-committerdate --format='%(committerdate:short) %(refname:short)' refs/remotes/origin`. Ver cuántos commits lleva cada rama por delante de `main` (`git rev-list --count origin/main..RAMA`).
   - **Producción** = `main` de `aprende-con-poli`. **Pruebas** = `main` de `aprende-con-poli-pruebas`. La versión se ve en `VERSION` de `sw.js` y en la primera entrada de `CHANGELOG.md`.
   - **Desarrollo** = la rama **más reciente que va por delante de `main`** (normalmente `claude/…` o `ccr-…`). Si hay dudas entre dos, preguntar a la dueña.
   - Comparar con la tabla «Estado de versiones» de `PLAN.md`. **Lo real manda:** si no coincide, corregir la tabla.
3. **Crear la rama de la sesión desde la rama de desarrollo encontrada** (no desde `main`). La sesión suele tener otra rama asignada.
4. **Durante la sesión, no solo al final** (una sesión puede cortarse sin aviso por cuota o uso, y el contenedor se borra): hacer commit y push **seguido**, y actualizar en `poli-referencias` la tabla «Estado de versiones», «Última actualización» y «Para retomar» de `planes/PLAN.md` **al terminar cada fase o cambio importante**.
5. **Si el plan quedó atrasado** (la rama de desarrollo o `poli-referencias` tienen commits más nuevos que su «Última actualización»), reconstruir lo hecho con `git log` de esas ramas (los mensajes de commit describen cada paso), actualizar el plan y avisar a la dueña antes de seguir.
Nunca dar por hecho que «lo último» está en `main`.

**Investigaciones y referencias de diseño** (por ejemplo, el análisis de Tuts+ que dio origen al estilo Gel 3D, o las recompensas de la entrega 4): en `poli-referencias`. Si la tarea es de **diseño, investigación o mercado**, leer su `LEEME.md` y los análisis antes de proponer, y guardar ahí lo nuevo. Sus imágenes son de terceros: solo estudio interno, **nunca copiarlas a los repositorios públicos** ni a la app. Si un sitio no se puede abrir desde la nube, se hace con una sesión local en el computador de la dueña (Chrome y `gh`), que sube el resultado a ese repositorio.

## Forma de trabajo
- Todo en **español de Chile**, pensado para **el niño o la niña en sí**, no para un rango de edad fijo (la app va de 1° básico en adelante; los niños aprenden rápido a usar apps): textos cortos, entretenidos y que inviten a descubrir.
  Lo que es para adultos va aparte y solo explica el uso.
- Trabajar en una rama y dejar un **Pull Request hacia `main`**; la dueña del proyecto revisa y hace Merge.
- Si pide "modo plan" o "muéstrame primero": diseñar y mostrar capturas, sin subir nada hasta que apruebe.
- Explicar en simple, sin jerga técnica.
- **Probar siempre en este orden: tablet → celular → PC** (Playwright, vertical y horizontal). La dueña prueba rápido en su celular.
  Herramienta: `node docs/pruebas-pantallas/revisar.js` (rápida) o `revisar.js completo todos` (ver su `LEEME.md`). Además de las pruebas, **mirar las láminas de capturas**; cada error que se escape se agrega como regla nueva.
- **Novedades** (`js/novedades.js`): solo lo importante o valioso para las familias; lo interno va solo en `CHANGELOG.md`.
- **Textos de Poli:** el nombre se usa al saludar y al celebrar; no repetirlo dentro de una frase ni en pantallas seguidas.
- **Modelos:** al empezar cada etapa, avisar a la dueña si conviene Sonnet u Opus y esperar su confirmación (reglas en `planes/PLAN.md` de `poli-referencias`, sección 2).

## Reglas de la app
- **Todo debe caber en pantalla sin deslizar** (notebook, tablet y celular, vertical y horizontal). Solo se desliza el mapa
  en celular, el Rincón de adultos (Ajustes) y el historial de novedades. Probar con Playwright en varios tamaños.
- **Aprovechar el espacio** (regla de la dueña): la app va a crecer y siempre faltará espacio. Antes de dejar que algo se
  deslice, **crear y proponer ideas** para que quepa (con capturas, 2 o 3 opciones y una recomendada) y decidirlas junto
  con la dueña. Sus ideas son punto de partida, no la única forma: si hay una mejor, proponerla. Ejemplo ya usado:
  pestañas por capítulo con un resumen en cada una (Mis stickers y Mi avance). Otras posibles: agrupar en tarjetas que
  abren su detalle, columnas según el tamaño, mostrar menos y ampliar al tocar. El contenido debe llenar bien el alto,
  sin vacíos grandes, y los textos deben ser proporcionales a los dibujos.
- **Figuras y dibujos pensados para el niño** (regla de la dueña, 22-11-2026; se cumple siempre): **lindas, cute, kawaii**: caricaturescas,
  no realistas, redondeadas, con **relieve y profundidad**. **Estilo elegido: Gel 3D** («gomita»: degradado de volumen, contorno del mismo
  color más oscuro, brillos blancos curvos, ojos grandes con dos brillos, mejillas y sombra en el suelo; molde en
  `docs/pruebas-pantallas/boceto-gel.js`, referencia en el repositorio privado `poli-referencias`), con colores vivos. Lo mismo para **los recipientes** (platos, cajas, canastos) y **los stickers**. **Mucha variedad** para que no se repita lo mismo
  cada vez: frutas, dulces, juguetes, autos, dinosaurios, animalitos y comidas **de todo el mundo** (no solo de Chile), sorteadas al azar. Las **tarjetas** cambian de color
  según lo que llevan y el fondo, para que todo se vea y nada se pierda. Movimiento suave (saltito al aparecer, reacción al tocar, se
  iluminan al contar). Dibujos propios en vez de emojis. Antes de construir figuras nuevas, proponer estilos dibujados con capturas.
  **Es la base, no una camisa de fuerza** (dueña, 22-11-2026): el estilo puede variar a favor del contenido y del objetivo de cada
  actividad, sea cual sea el rango de edad (por ejemplo, una figura geométrica que debe verse exacta, un gráfico o un mapa). Si se varía,
  explicar por qué y mostrarlo con capturas antes de construir.
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
- `js/numeros.js`: capítulo 3 · `js/patrones.js`: capítulo 4 · `js/multiplicacion.js`: capítulo 5 · `js/premios.js`: Mis premios y stickers · `js/medallas.js`: racha y medallas · `js/guardarropa.js`: ropa de Poli · `js/diploma.js`
- `js/repaso.js`: Repaso, Mi avance, respaldo y `cleanProfile` · `js/adultos.js`: Rincón de adultos · `js/opinion.js`: reporte de uso y opinión · `js/novedades.js` · `js/recorrido.js`.
- `css/style.css`: estilos; las reglas por tamaño de pantalla están al final.
