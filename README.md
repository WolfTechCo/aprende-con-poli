# Mundo de Formas y Números

App interactiva para 2° básico, en tres capítulos:
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

## Cómo usarla
- **En el computador:** abre `index.html` con doble clic (Chrome o Edge funcionan mejor; la voz en español depende del navegador).
- **Online / tablet:** publícala con GitHub Pages (ver abajo) y abre el link en la tablet.

## Publicar en GitHub Pages
1. Crea un repositorio nuevo en GitHub (público) y sube **todo el contenido de esta carpeta**.
2. En el repositorio: *Settings → Pages → Build and deployment → Deploy from a branch → `main` / `/ (root)`*.
3. Después de 1–2 minutos, la app queda en `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/`.

## Estructura
- `index.html`: página base
- `css/style.css`: diseño
- `js/app.js`: pantallas, juegos, sonidos y voz de los capítulos 1 y 2 (sin librerías externas)
- `js/numeros.js`: capítulo 3 (números)
- `PENDIENTES.md`: ideas anotadas para más adelante

Los ejercicios se generan al azar: cada vez que se entra a una sección son distintos y no se repiten en la misma sesión.

El progreso se guarda en el propio navegador (`localStorage`).
