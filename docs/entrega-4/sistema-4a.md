# Entrega 4A · Sistema de premios (diseño, fase 4A-2)

Diseño del 23-11-2026, con las 4 respuestas de la dueña (eligió la recomendación en todas). Se basa en la investigación de las fases 1, 1b y 1c (repositorio privado `poli-referencias/recompensas/`) y en las decisiones anotadas en `PLAN.md` (sección 4.2).
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
- **Antes de ganarlo**, el premio de cada isla se ve **sombreado**, con un «?»: viene algo, pero no se sabe qué (pedido de la dueña).
- **Ganado sin abrir:** el sobre **brinca y brilla** para llamar la atención.
- **Abierto:** la isla **muestra el premio que salió**. Si fueron varios (por ejemplo, una caja), muestra uno al azar.
- **Gran Desafío:** guarda la **caja del capítulo** (sombreada hasta ganarla).
- **Pestaña del capítulo:** muestra la mascota del capítulo (huevo hasta que nace) y **cómo crece mientras se juega**.
- **Dos estilos (idea de la dueña):** el dibujo Gel, o un **sprite retro**: el mismo dibujo pasado a 16 × 16 cuadraditos, así que no se dibuja dos veces. **Aprendido en el boceto:** copiar la imagen en el navegador para sacar los pixeles no funciona igual en todos los aparatos (falló en la prueba de la dueña). Los cuadraditos se calculan **una vez, de antemano**, y se guardan como datos que se dibujan con rectángulos, así se ven igual en cualquier aparato. **Comparación con todo ganado (página, sección «Todo ganado»):** el retro automático a 16–22 cuadraditos pierde las caritas (los ojos quedan como manchas). Si se elige retro, las mascotas, la Llamita y Poli necesitan un **ajuste a mano** de su sprite (ojos y boca puestos pixel a pixel); los objetos sin cara (estrellas, fondos, medallas) quedan bien automáticos. Se pueden tener los dos. **Por confirmar:** cuál va en el mapa o si el niño elige.
- **Cada isla tiene su propio sobre** (color y dibujo del tema de la isla), así se sienten únicos.

---

## 4. Mascotas por unidad
- **Una por capítulo**, distinta y ligada al contenido. **El niño la ve evolucionar mientras juega:** nace apenas termina la lección de inicio, crece con cada isla completa y al terminar el capítulo es grande. El último paso, brillante, puede llegar después, practicando en el Repaso. Nombres elegidos por la dueña (`poli-referencias/recompensas/nombres.md`):
  - Capítulo 1, Polígonos: **Tortugono** (su caparazón suma lados).
  - Capítulo 2, Figuras 2D y 3D: **Cubúho**.
  - Capítulo 3, Números: **Cienpiecito** (de brillante, **Milpiés**).
  - Capítulo 4, Patrones: **Pulpatrón**.
  - Capítulo 5, Multiplicación: **Chinitabla**.
- **Mascotas extra (idea de la dueña):** las otras opciones de cada capítulo (Hexabeja, Pentagüino, Prismapache, Esferardilla, Decanguro, Cebrayita, Conejiplica) aparecen **después de terminar el capítulo**, **una a la vez (decidido)**. Se ganan **practicando de nuevo ese capítulo**, en el Repaso o al volver a jugar sus islas (los ejercicios siempre son distintos): aparece un **huevo extra** en la pestaña que se agrieta con cada respuesta correcta del capítulo. Al abrirse nace la mascota como cría y aparece el huevo siguiente. Cuántas respuestas hacen falta se define al construir (por ejemplo, 20).
- **Nombre de la sección:** «**Mascotas**» por ahora (ningún nombre de grupo convenció; se busca uno mejor más adelante).
- **Etapas (5):** huevo → cría (empieza el capítulo) → joven (mitad de las islas completas) → grande (todas las islas) → **brillante** (Gran Desafío con 3 estrellas y todos los temas del capítulo en «¡Lo dominas!»).
- **Dónde aparece:** en la pestaña del capítulo (mapa, Mi avance y álbum), en Mi avance como dibujo del avance del capítulo (con el porcentaje chico, como hoy) y en Mis premios.
- **Dónde se ve y cómo interactúa:**
  - Al nacer, en pantalla grande: el huevo se agrieta, el niño la toca y ella salta; Poli dice su nombre y ofrece llevarla.
  - En la **franja de abajo, junto a Poli**, en todas las pantallas. Durante una pregunta queda quieta para no distraer. Celebra cuando el niño acierta, da ánimo con un gesto cuando se equivoca (sin tristeza) y hace algo chistoso si la tocan.
  - En el mapa: en la pestaña de su capítulo y saltando junto a la isla actual.
  - En la isla: muestra cuánto le falta para crecer («¡Una isla más y crezco!»).
  - En Mi avance, en Mis premios → Mascotas (con sus próximas etapas sombreadas) y en el diploma. En la 4B, también en el cuarto.
- **Doble uso (decisión de la dueña):** el niño elige **una mascota que acompaña a Poli** en la barra de abajo y en el mapa. Salta cuando acierta y celebra con Poli. En la 4B también vive en el cuarto.
- **Decidido: una mascota por capítulo.** Nunca retrocede de etapa, aunque después baje un porcentaje. Cada cambio llega con el aviso chico y una animación de crecer.

---

## 5. La Llamita y la racha amable
- La racha cuenta los días seguidos con práctica, con **un día de descanso por semana** que no la corta (se usa solo).
- Si la racha se corta, **no se pierde nada**: la Llamita se queda dormida y despierta cuando el niño vuelve. Se guardan el **récord** y el **total de días**.
- **La Llamita es una llama de fuego kawaii** (propuesta tras la pregunta de la dueña; se prefiere al animal porque se entiende sola, evoluciona de forma natural y se distingue de las mascotas de los capítulos). Evoluciona con el récord: **chispa** (1–2 días) → **llamita** (3) → **fogata** (7) → **llama azul** (14) → **llama dorada con corona** (30 o más). Si la racha se corta, es una **brasa dormida** que brilla suave y se enciende al volver.
- **Cofres dorados** a los 3, 7, 14 y 30 días, y después cada 30. Traen lo más especial del catálogo (por ejemplo, celebraciones doradas o fondos que brillan).
- Textos de Poli siempre amables. Nunca «perdiste» ni «te extrañé, estoy triste».

---

### 5a. Cuánto pesa la racha (observación de la dueña)
Hoy la app tiene un solo ramo (matemáticas): un niño puede terminar el capítulo que necesita y no volver hasta el siguiente. Por eso, en la 4A **la racha pesa poco**:
- Casi todo se gana por contenido: unos 25 sobres, 5 cajas, 5 mascotas y la mayoría de los logros.
- La racha suma lo especial: cofres dorados, la Llamita y el logro Constancia. Ningún premio importante depende solo de ella.

El peso queda en **un solo ajuste** (qué días dan cofre y qué traen), para subirlo cuando la app tenga más ramos y se use a diario. Si un jugador pasa varias semanas sin entrar, el Rincón de adultos **sugiere** la «temporada de estudio».

### 5b. Constancia a la medida (Rincón de adultos, por jugador)
Para niños que usan la app solo cuando tienen prueba (caso de la dueña), con la racha diaria siempre se les corta. Referencias: la «posada» de Habitica (pausa sin castigo), los amuletos de fin de semana de Duolingo (quienes los tenían perdieron menos la racha y volvieron más, según la empresa) y las rachas semanales (Zwift).

| Forma | Cómo cuenta |
|---|---|
| **Diaria** (por defecto, decidido) | Días seguidos con 1 día de descanso por semana |
| **Días elegidos** | El adulto marca los días de estudio; solo esos cuentan y los demás no cortan |
| **Semanal** | Semanas seguidas con los días de práctica que el adulto pidió (1 a 5) |
| **Temporada de estudio** | El adulto la activa antes de una prueba, con la fecha de término. Dentro de la temporada cuenta como la diaria. Fuera, la Llamita está **de vacaciones** y nada se corta |
| **Pausa** | Congela la racha (vacaciones o enfermedad) hasta que el adulto la quite |

- Los cofres dorados y el logro Constancia se ganan igual en todas las formas, según los días que cuenta cada una.
- La temporada además ayuda a aprender: estudiar repartido en varios días rinde más que estudiar todo junto (Cepeda y otros; Rohrer y Taylor). Poli puede decir «¡Faltan 5 días para tu prueba!».
- Se guarda en `racha.modo` (y sus días o fechas), y se limpia en `cleanProfile`.

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

## 7. Qué traen los sobres mientras no existe el cuarto (decidido: C)
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
- **Islas ya completas (decidido: A):**
  - **A (recomendada):** reciben sus sobres **guardados** en la mochila para abrirlos cuando quieran. Poli dice «¡Tienes 12 sobres por abrir!».
  - **B:** se juntan en una sola **caja de bienvenida**.
- **Capítulos empezados:** su mascota nace directo en la etapa que corresponde, con una sola celebración.
- **Racha:** si el récord ya es de 3 días o más, la Llamita llega con los cofres que le corresponden.
- **La ropa** que lleva Poli (`acc`) se mantiene.

---

## 11. Decisiones de la dueña (23-11-2026)
1. Una mascota **por capítulo**.
2. Sobres de la 4A: **C** (celebraciones, fondos del mapa y stickers; caja de mudanza en la 4B).
3. Islas ya completas: **sobres guardados** para abrir.
4. El sobre se gana al **completar todas las actividades** de la isla.
5. Premios del mapa **ocultos y sombreados** hasta ganarlos, y después muestran lo que salió. **Solo estilo Gel** (el retro se probó y se descartó).
6. **Constancia a la medida** elegida por el adulto (sección 5b), **diaria por defecto**.
7. **Llamita de fuego** que evoluciona (sección 5).
