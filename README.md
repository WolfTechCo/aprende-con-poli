# Aprende con Poli

App educativa gratuita para niños de educación básica, guiada por Poli: aprende jugando paso a paso, con ejercicios
distintos cada vez, repaso diario y panel para apoderados. Sin cuentas ni publicidad: el progreso se queda en el dispositivo.

**App:** https://wolftechco.github.io/aprende-con-poli/

## Matemáticas · Mundo de Formas y Números (2° básico)
1. **Polígonos:** qué es un polígono, lados y vértices; triángulo, cuadrado, rectángulo, pentágono, hexágono y octágono.
2. **Figuras 2D y 3D:** cubo, prisma rectangular, prisma triangular, pirámide de base cuadrada y triangular,
   esfera, cilindro y cono (en 3D, se pueden girar con el dedo y pintar sus caras).
3. **Números** (con el método Singapur: bloques → dibujos → dígitos):
   - **Agrupar:** contar agrupando de 10 en 10.
   - **Unidad, decena y centena:** 10 unidades forman 1 decena y 10 decenas forman 1 centena; armar números con bloques (con canje).
   - **Valor posicional:** tabla de centenas, decenas y unidades, y la suma por columnas (345 = 300 + 40 + 5).
   - **Sumas de C, D y U:** transformar la notación en un número (3C + 4D + 2U = 342), también desordenada, con un lugar vacío o con más de 9 unidades.
   - **Tabla del 1000:** de 10 en 10 y de 100 en 100 hasta 1000.
   - **Secuencias numéricas:** descubrir la regla (+2, +5, +10, +100, −10…) y completar el número que falta.

Los ejercicios se generan al azar: cada vez que se entra a una sección son distintos y no se repiten en la misma sesión.

## Perfiles
- Cada niño o niña tiene su propio perfil (hasta 6 por dispositivo): al abrir la app, Poli pregunta **¿Quién va a jugar?**
- En **Ajustes** se cambia el nombre, se indica niña o niño o se borra un perfil.
- El respaldo guarda a todos los perfiles juntos (y acepta respaldos antiguos de un solo perfil).

## Repaso, Mi avance y Ajustes
- **Repaso** (en el **Menú** del mapa): 5 preguntas mezcladas de los temas ya aprendidos, con más preguntas de los temas donde se equivoca.
- **📈 Mi avance** (en el **Menú** del mapa, sin clave): estrellas, temas aprendidos y, por tema, el % de aciertos a la primera
  (últimas 20 respuestas), cuántas respuestas lleva y cuándo practicó; los temas bajo 70 % aparecen como ⭐ para reforzar.
- **⚙️ Ajustes** (en el **Menú** del mapa, se entra resolviendo una multiplicación): perfiles, temas que entran al Repaso,
  **respaldo del progreso** e instrucciones para **instalar la app**.

## Cómo usarla
- **Desde el link:** se abre en cualquier navegador y se juega. El progreso queda guardado en ese navegador.
- **Instalada (opcional):** queda con su ícono y funciona **sin internet**.
  - Android (Chrome): menú ⋮ → *Instalar app*.
  - iPad o iPhone (Safari): Compartir → *Agregar a inicio*. En Apple la app instalada guarda su progreso aparte de Safari: usar el respaldo para pasarlo.
- **Abriendo `index.html` con doble clic:** también funciona, pero con una letra de reemplazo y sin modo sin internet.

## Seguridad y privacidad
- Sin servidor, cuentas, analítica ni publicidad. Nada sale del dispositivo; la letra (Baloo 2, licencia SIL OFL en `fonts/OFL.txt`) va incluida.
- Política de contenido (CSP): el navegador solo permite archivos de la propia app.
- El nombre y los respaldos se limpian antes de usarlos (solo se aceptan datos conocidos).

## Publicar una versión nueva
1. Subir el número `?v=` en `index.html` **y** `VERSION` en `sw.js` (deben coincidir). Así la app instalada se actualiza sola.
2. La clave del progreso (`poligonos-magicos-v1`) no se cambia nunca. Ahí se guardan todos los perfiles.
3. Si se renombra, une o elimina una isla, agregar un paso en `MIGRATIONS` (`js/app.js`) para traspasar el progreso antiguo.

GitHub Pages: *Settings → Pages → Deploy from a branch → `main` / `/ (root)`*.

## Estructura
- `index.html`: página base · `manifest.webmanifest` e `icons/`: instalación · `sw.js`: modo sin internet
- `css/style.css`: diseño · `fonts/`: letra de la app
- `js/app.js`: base de la app y capítulos 1 y 2 (sin librerías externas)
- `js/numeros.js`: capítulo 3 (números)
- `js/repaso.js`: repaso del día, panel de apoderado y respaldo
- `PENDIENTES.md`: ideas anotadas para más adelante
