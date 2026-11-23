# Entrega 4A · Sistema de premios (diseño, fase 4A-2)

Borrador del 23-11-2026 para revisar con la dueña. Se basa en la investigación de las fases 1, 1b y 1c (repositorio privado `poli-referencias/recompensas/`) y en las decisiones anotadas en `PLAN.md` (sección 4.2).
Lo que dice **«por decidir»** espera la respuesta de la dueña.

---

## 1. Idea central
**Se aprende → se gana algo que se ve y se usa → Poli lo celebra en una pausa.**
- Cada **isla** guarda un **sobre** sorpresa. El niño sabe que está ahí, pero no qué trae.
- Cada **capítulo** (unidad) tiene su **mascota**: se ve como huevito desde el principio, nace al empezar el capítulo y crece con lo que aprende.
- Completar el capítulo regala una **caja**.
- La **racha** trae a la **Llamita** y sus **cofres dorados**, que son lo más especial.
- Los **logros** (antes medallas) quedan guardados para siempre y tienen niveles.
- Todo llega con el **aviso de Poli** y se marca en la **mochila** del mapa hasta que el niño lo mira.
- Nada se compra, nada se pierde y nada se repite.

---

## 2. Qué se gana, cuándo y cómo se ve

| Momento | Qué gana | Aviso |
|---|---|---|
| Termina la **lección de inicio** de un capítulo | **Nace la mascota** del capítulo (el huevito se abre) | Grande: Poli sostiene el huevo, que se agrieta y la mascota sale |
| Termina un **juego o una lección** | Estrellas (como hoy) y, si corresponde, un **logro** o un nivel nuevo | Chico: Poli asoma desde un costado (4–5 s) y se va solo. No lleva a ninguna parte |
| **Completa una isla** (todas sus actividades, al menos una vez) | Un **sobre** de esa isla | Grande: felicitaciones con el sobre para abrir ahí mismo (3 toques) o guardarlo |
| Vuelve a la isla o al mapa con **sobres sin abrir** | — | Mediano: «¡Tienes un sobre!», con botones para abrirlo o guardarlo |
| La mascota **sube de etapa** | — | Chico, con la mascota en vez del objeto |
| **Completa el capítulo** (todas las islas y el Gran Desafío) | Una **caja** del capítulo | Grande, más festivo |
| **Racha** de 3, 7, 14 y 30 días (después, cada 30) | **Cofre dorado** y crece la **Llamita** | Al entrar al mapa ese día |

**Reglas de los avisos:** nunca durante una pregunta; esperan a que Poli termine de hablar (`afterSay`); si se juntan varias cosas, salen en un solo aviso («¡3 cosas nuevas!»); y no tapan botones importantes.

---

## 3. Islas con el premio a la vista (idea de la dueña)
- En el mapa, cada isla muestra un **sobrecito** chico si su sobre está por ganar. Al ganarlo, el sobrecito se vuelve una **estrellita de «hecho»**. Si se ganó pero aún no se abre, el sobrecito **brinca**.
- La pestaña de cada capítulo muestra el **huevito** de su mascota hasta que nace, y después la mascota en su etapa.
- **Cada isla tiene su propio sobre** (color y dibujo del tema de la isla), así se sienten únicos.

---

## 4. Mascotas por unidad
- **Una por capítulo**, distinta y ojalá ligada al contenido. Ejemplos por pulir con la investigación de nombres:
  - Capítulo 1, Polígonos: Hexabeja o Pentagüino.
  - Capítulo 2, Figuras 2D y 3D: Cubúho.
  - Capítulo 3, Números: Cienpiecito.
  - Capítulo 4, Patrones: Pulpatrón.
  - Capítulo 5, Multiplicación: Conejiplicador.
- **Etapas (5):** huevo → cría (empieza el capítulo) → joven (mitad de las islas completas) → grande (todas las islas) → **brillante** (Gran Desafío con 3 estrellas y todos los temas del capítulo en «¡Lo dominas!»).
- **Dónde aparece:** en la pestaña del capítulo (mapa, Mi avance y álbum), en Mi avance como dibujo del avance del capítulo (con el porcentaje chico, como hoy) y en Mis premios.
- **Doble uso (decisión de la dueña):** el niño elige **una mascota que acompaña a Poli** en la barra de abajo y en el mapa. Salta cuando acierta y celebra con Poli. En la 4B también vive en el cuarto.
- **Por decidir:** ¿una mascota por capítulo (recomendado: 5 hoy, cada una especial y con tiempo para crecer) o una por isla (unas 25: más colección, pero más dibujo y menos especiales)?

---

## 5. La Llamita y la racha amable
- La racha cuenta los días seguidos con práctica, con **un día de descanso por semana** que no la corta (se usa solo).
- Si la racha se corta, **no se pierde nada**: la Llamita se queda dormida y despierta cuando el niño vuelve. Se guardan el **récord** y el **total de días**.
- La **Llamita** aparece con la primera racha de 3 días y crece con el récord. Es la mascota más especial: tiene una **llamita en la cabeza que brilla más** con cada cofre.
- **Cofres dorados** a los 3, 7, 14 y 30 días, y después cada 30. Traen lo más especial del catálogo (por ejemplo, celebraciones doradas o fondos que brillan).
- Textos de Poli siempre amables. Nunca «perdiste» ni «te extrañé, estoy triste».

---

## 6. Logros con niveles (antes medallas)
Quedan **guardados para siempre** (no se recalculan) y cada uno sube de nivel: **bronce → plata → oro → diamante**.

| Logro | Antes (id) | Niveles |
|---|---|---|
| Primer paso | `paso` | Uno solo |
| Constancia | `r3`, `r7` | Récord de racha de 3 · 7 · 14 · 30 días |
| Respuestas | `a50`, `a200` | 50 · 200 · 500 · 1.000 respuestas |
| Puntería | `punt` | 90 % a la primera en 1 · 3 · 5 · 8 temas (con 10 o más respuestas) |
| Estrellas | `e20`, `e50` | 20 · 50 · 100 · 200 estrellas |
| Exploradora o Explorador de islas | nuevo | 5 · 10 · 20 · 30 islas completas |
| Desafío perfecto | nuevo | 1 · 2 · 3 · 5 Grandes Desafíos con 3 estrellas |
| Mente brillante | `mente` | **Un nivel por capítulo** con todos sus temas aprendidos, y uno final con todos. Crece sola con cada capítulo nuevo |

- Los niveles se **guardan al ganarlos**: si llegan capítulos nuevos o cambian los temas, nada baja.
- Cada logro y cada nivel avisa con el aviso chico. Los logros están en **Mis premios → Logros**.
- La **ropa de Poli de hoy** (7 accesorios) sigue unida a los mismos logros hasta la 4B, cuando llega el catálogo grande.

---

## 7. Qué traen los sobres mientras no existe el cuarto (por decidir)
Sin el cuarto (que llega en la 4B), lo que salga de los sobres igual debe **usarse**. Opciones:
- **A · Solo cosas que se usan ya:**
  - **celebraciones** (lo que pasa al acertar: confeti de estrellas, burbujas, fuegos artificiales chicos);
  - **fondos del mapa** (mar de día, atardecer, noche estrellada, arcoíris…);
  - **stickers para la tarjeta del jugador** en la portada (el niño decora su tarjeta).
- **B · Guardar cosas para el cuarto** en la mochila, para usarlas cuando llegue. No sirven por un tiempo.
- **C (recomendada):** la A ahora, y desde la 4B los sobres también traen cosas del cuarto y ropa. Al llegar la 4B, cada niño recibe una **caja de mudanza** con muebles para empezar su cuarto según las islas que ya completó.

Cantidad para la 4A: hay unas **25 islas** (6 + 7 + 5 + 3 + 4) → unos 25 sobres, 5 cajas y los cofres. Con **1 cosa por sobre** hacen falta unas 35 cosas (por ejemplo, 10 celebraciones, 10 fondos y 15 stickers). Al terminarse lo de un tipo, salen de otro tipo. **Nunca repite.**

---

## 8. Botón del mapa: estrellas y mochila
- Arriba a la derecha, **un solo botón**: ⭐ 39 y una **mochila de Poli** (reemplaza al «+»). Al tocarlo se abre el menú: Repaso · Mi avance · Mis premios · 🔒 Adultos.
- **Con algo nuevo sin ver** (un sobre sin abrir, un logro, una mascota que creció), la mochila **se convierte en el sobre u objeto y da brincos suaves**. En el menú, la misma marca indica dónde está. Al mirarlo vuelve a ser mochila. **Sin números ni rojo.**

---

## 9. Mis premios en la 4A
Cuatro tarjetas animadas, como hoy, con contenido nuevo:
- **Mascotas:** las 5 en su etapa (las que no nacieron, como huevito) y la Llamita. Se elige cuál acompaña a Poli.
- **Logros:** los 8, con su nivel y la racha.
- **Mis cosas:** celebraciones, fondos y stickers ganados (se elige cuál usar) y los sobres sin abrir, más la ropa de Poli de hoy.
- **Mi diploma:** igual que hoy.

El inicio de Mis premios pasará a ser el **Cuarto de Poli** en la 4B. Las pantallas de detalle se mantienen.

---

## 10. Qué se guarda (`SAVEVER` 2 → 3)
Campos nuevos en el perfil (también en `NEWSAVE` y en `cleanProfile`, que limpia todo lo que viene de un respaldo):

| Campo | Qué guarda |
|---|---|
| `logros` | `{ id: nivel }` de cada logro ganado (0 a 4) y la fecha |
| `sobres` | Islas cuyo sobre se ganó, y cuáles ya se abrieron |
| `cajas` | Capítulos cuya caja se ganó y abrió |
| `cofres` | Días de racha cuyo cofre se ganó y abrió |
| `masc` | Etapa de cada mascota (`{ c1: 2, … }`), la Llamita y cuál acompaña a Poli |
| `cosas` | Lista de lo ganado: `{ id, de, fecha, visto }` (`de` = sobre, caja, cofre o logro) |
| `usa` | Qué celebración, fondo y stickers está usando |
| `racha` | Récord, total de días y semanas en que se usó el día de descanso |

- **Catálogo pre-armado para la tienda:** cada cosa del catálogo tiene `id`, tipo, tema, de dónde puede salir y un **precio vacío**. Cuando llegue la tienda, se agrega la pantalla y la regla de las monedas, sin rehacer nada.
- Las cosas del catálogo **no se renombran nunca** (como las ids de las medallas): quedan guardadas.

### Traspaso de lo ya ganado (nadie pierde nada)
- **Medallas → logros:** cada medalla ganada se vuelve el nivel equivalente. Por ejemplo, `r7` se vuelve Constancia plata. Después se calculan los niveles que ya merece con lo guardado.
- `mente` y `rey` se respetan. El rango no cambia en la 4A.
- **Islas ya completas:** **por decidir**:
  - **A (recomendada):** reciben sus sobres **guardados** en la mochila para abrirlos cuando quieran. Poli dice «¡Tienes 12 sobres por abrir!».
  - **B:** se juntan en una sola **caja de bienvenida**.
- **Capítulos empezados:** su mascota nace directo en la etapa que corresponde, con una sola celebración.
- **Racha:** si el récord ya es de 3 días o más, la Llamita llega con los cofres que le corresponden.
- **La ropa** que lleva Poli (`acc`) se mantiene.

---

## 11. Preguntas para la dueña
1. **Mascota por capítulo** (recomendado) o **por isla**.
2. **Contenido de los sobres en la 4A:** A, B o C (recomendada).
3. **Islas ya completas:** sobres guardados (recomendado) o caja de bienvenida.
4. **Cuándo se gana el sobre:** al completar todas las actividades de la isla (recomendado: premia terminar), o al lograr 3 estrellas (premia la perfección, pero puede frustrar).
