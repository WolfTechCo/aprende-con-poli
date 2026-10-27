# Mundo de Formas

App interactiva para 2° básico, en dos capítulos:
1. **Polígonos:** qué es un polígono, lados y vértices; triángulo, cuadrado, rectángulo, pentágono, hexágono y octágono.
2. **Figuras 2D y 3D:** cubo, prisma rectangular, prisma triangular, pirámide de base cuadrada y triangular,
   esfera, cilindro y cono (en 3D, se pueden girar con el dedo y pintar sus caras).

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
- `js/app.js`: pantallas, juegos, sonidos y voz (sin librerías externas)

El progreso se guarda en el propio navegador (`localStorage`).
