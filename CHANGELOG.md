# Registro de cambios

Historial técnico de **Aprende con Poli** (antes *Mundo de Formas* y *Mundo de Formas y Números*).
Lo que ven los apoderados dentro de la app está en `js/novedades.js` (*Novedades*), escrito para quien la usa.

Formato de versión **X.Y.Z**: X = cambio grande (nueva materia o rediseño) · Y = capítulo o función nueva · Z = ajustes y arreglos.
La versión de los archivos (`?v=` en `index.html` y `VERSION` en `sw.js`) es un número interno aparte.

## 2.5.0 — 2026-11-05 (archivos v25)
- **Racha y medallas** (`js/medallas.js`): racha de días seguidos (desde `save.days`) y 9 medallas calculadas con lo ya guardado (respuestas, estrellas, temas, puntería). Se muestran en **Mi avance**; Poli las anuncia en el mapa con confeti (una vez, `save.badges`) y menciona la racha. Agregar una medalla = una línea en `MEDALS`.

## 2.4.0 — 2026-11-05 (archivos v24)
- **Reporte de uso y opinión** (`js/opinion.js`, sección "Ayúdanos a mejorar" en Ajustes): estrellas de 0,5 a 5 (mitad izquierda = media estrella; también con teclado) y comentario opcional de hasta 300 caracteres. Arma un reporte anónimo ("Perfil 1", "Perfil 2"…, código al azar por dispositivo) con estrellas ganadas, temas, días de uso, respuestas y % a la primera. El adulto lo ve completo y lo comparte con "Copiar reporte" o "Guardar archivo". Nada sale solo: la CSP no cambia. Para recibirlo por correo, escribir el correo del proyecto en `FEEDBACK_MAIL` (`js/opinion.js`): aparece "Enviar por correo".
- `save.days`: días en que practicó (últimos 90), se guarda en `track()` y se limpia en `cleanProfile`.
- **Saludo según el momento** en el mapa (buenos días / tardes / noches, una vez por visita) y, si hace más de 3 días que no practica, invita al Repaso.
- **Mejor voz en español**: `pickVoice` puntúa acento y calidad (natural/neural/online/Google) y evita las voces básicas.
- Recorrido de Ajustes: paso nuevo para "Ayúdanos a mejorar" (`TOURVER_AJ` 2).

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
