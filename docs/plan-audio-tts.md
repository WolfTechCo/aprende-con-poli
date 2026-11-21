# Plan: audios pregenerados con voz neuronal (TTS) para la app

> Documento para entregar a Claude dentro del proyecto. Claude debe leerlo completo, inspeccionar el repo y ejecutar la implementación descrita.

## 1. Contexto

- App propia publicada en **GitHub Pages** (sitio estático, sin backend).
- Hoy los textos se leen con una voz mecanizada (TTS nativo).
- Los textos son **fijos y cortos**; solo se agregan nuevos cuando se suman capítulos.
- Objetivo: voz natural, costo $0, sin exponer API keys en el cliente.

## 2. Solución elegida

**Pregenerar los audios** con un script local que llama a una API de voz neuronal, guarda los archivos en el repo y la app solo los reproduce.

- Proveedor principal: **Azure AI Speech** (capa gratuita F0, voz `es-CL-CatalinaNeural` o `es-CL-LorenzoNeural`).
- Proveedor alternativo: Google Cloud Text-to-Speech (solo si se prefiere; ver sección 4).
- Formato: **Opus en `.ogg` (mono, 24 kbps)** como principal y **AAC `.m4a` (mono, 40 kbps)** como respaldo para Safari antiguo.
- La API key vive solo en la máquina local (`.env`), nunca en el repo.

## 3. Pasos para obtener la API gratuita de Azure (sin cobros)

### 3.1 Crear cuenta
1. Ir a https://azure.microsoft.com/free y crear la cuenta (pide tarjeta solo para verificar identidad).
2. La cuenta gratuita incluye crédito inicial por 30 días. Al terminar, la suscripción se **desactiva** y no cobra, salvo que el usuario la convierta manualmente a "pago por uso". **No hacer ese upgrade.**

### 3.2 Crear el recurso Speech con nivel gratuito
1. En el portal (https://portal.azure.com) buscar **"Speech"** (Azure AI Speech) → **Crear**.
2. Suscripción: la gratuita. Grupo de recursos: crear uno nuevo (ej. `rg-tts-app`).
3. Región: una cercana, por ejemplo **Brazil South** o **East US**.
4. Nombre: único (ej. `tts-app-carlos`).
5. **Plan de tarifa: `Free F0`** (esto es lo crítico).
6. Revisar y crear.

### 3.3 Obtener credenciales
1. Abrir el recurso → **Claves y punto de conexión**.
2. Copiar **KEY 1** y la **Región** (ej. `brazilsouth`).
3. Guardarlas en `.env` local (ver sección 5).

### 3.4 Garantizar que no se cobre
- **El nivel F0 no tiene sobrecosto**: al agotar la cuota mensual gratuita (alrededor de 500.000 caracteres de voz neuronal al mes; verificar el valor vigente en la página de precios de Azure Speech) la API devuelve error 429 en vez de cobrar.
- Crear una **alerta de presupuesto** por seguridad: Portal → **Cost Management + Billing** → **Presupuestos** → crear presupuesto de **1 USD/mes** con alerta al 50 % y 100 % al correo del usuario.
- Revisar **Cost Management → Análisis de costos** después de la primera generación y confirmar que marca **$0**.
- No cambiar el recurso a nivel **S0** (ese sí cobra).
- Regenerar la key desde el mismo panel si alguna vez se filtra.

## 4. Alternativa: Google Cloud TTS (solo si se prefiere)

Nota: Google **sí puede cobrar** al pasar la cuota gratuita, por lo que requiere más controles.

1. Crear proyecto en https://console.cloud.google.com y activar facturación (pide tarjeta).
2. Habilitar **Cloud Text-to-Speech API**.
3. Crear credencial (API key o cuenta de servicio) y restringirla solo a esa API.
4. **IAM y administración → Cuotas**: poner un límite diario/mensual de caracteres igual o menor a la capa gratuita.
5. **Facturación → Presupuestos y alertas**: presupuesto de 1 USD con alertas.
6. Verificar los límites gratuitos vigentes por tipo de voz (Standard, WaveNet/Neural2, Chirp) en la página de precios antes de usar.

## 5. Instrucciones para Claude (implementación)

### 5.1 Reconocimiento previo
1. Revisar la estructura del repo e identificar: dónde están los textos de los capítulos, su formato (JSON/HTML/MD) y cómo la app los lee hoy en voz alta.
2. Si algo no es claro (formato de textos, estructura de carpetas), preguntar una sola vez antes de construir.

### 5.2 Script de generación (`scripts/generate-audio.mjs` o `.py`, según el stack del repo)
- Lee `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION` y `AZURE_VOICE` (por defecto `es-CL-CatalinaNeural`) desde `.env`.
- Recorre todos los textos y genera un audio por texto.
- Nombre del archivo: `{id-capitulo}-{id-texto}.{hash8}.ogg`, donde `hash8` son los 8 primeros caracteres del SHA-256 de `texto + voz`. Si el archivo existe, **se omite** (solo genera lo nuevo o modificado).
- Llamada a la API (REST):
  - `POST https://{region}.tts.speech.microsoft.com/cognitiveservices/v1`
  - Headers: `Ocp-Apim-Subscription-Key`, `Content-Type: application/ssml+xml`, `X-Microsoft-OutputFormat: ogg-24khz-16bit-mono-opus`, `User-Agent`.
  - Cuerpo SSML con `<voice name="...">` y el texto escapado (XML).
- Genera además la versión `.m4a` de respaldo con `ffmpeg` (`-ac 1 -c:a aac -b:a 40k`) a partir del audio generado; si `ffmpeg` no está instalado, avisar y continuar solo con Ogg.
- Maneja errores: reintentar 1 vez ante fallos de red; ante **429** detenerse y avisar que se llegó a la cuota gratuita (no reintentar en bucle).
- Antes de generar, **calcular e imprimir el total de caracteres a enviar** y pedir confirmación si supera 100.000 caracteres.
- Escribe un `audio/manifest.json` que mapea cada texto a sus archivos.

### 5.3 Integración en la app
- Reemplazar la lectura TTS nativa por un reproductor que use el manifiesto:
  ```html
  <audio>
    <source src="audio/xxx.ogg" type="audio/ogg; codecs=opus">
    <source src="audio/xxx.m4a" type="audio/mp4">
  </audio>
  ```
- **Fallback**: si no existe audio para un texto, usar `speechSynthesis` como antes, para que nada se rompa mientras se generan los nuevos.
- Mantener controles existentes (play, pausa, velocidad si ya los hay). No rediseñar la interfaz.
- Precargar solo el audio del texto actual para no gastar datos.

### 5.4 Seguridad y repo
- Crear `.env.example` (sin valores reales) y agregar `.env` al `.gitignore`.
- Verificar que ninguna key quede en el historial ni en archivos commiteados.
- Agregar al `README` una sección "Generar audios" con los comandos exactos.

### 5.5 Flujo cuando se agrega un capítulo
1. Agregar los textos.
2. Ejecutar `node scripts/generate-audio.mjs`.
3. Revisar el resumen (nuevos, omitidos, caracteres usados).
4. Commit y push; GitHub Pages publica los audios.

## 6. Criterios de aceptación

- [ ] Todos los textos actuales tienen su audio `.ogg` (y `.m4a` si hay ffmpeg).
- [ ] La app reproduce los audios en escritorio y móvil, incluyendo Safari.
- [ ] Si falta un audio, la app cae al TTS nativo sin errores.
- [ ] Re-ejecutar el script sin cambios no genera nada nuevo ni consume cuota.
- [ ] No hay keys en el repo.
- [ ] Peso total de la carpeta `audio/` informado al final.
- [ ] El README documenta el proceso.

## 6.1 Textos que incluyen el nombre del usuario (texto libre)

Algunos textos contienen el nombre del usuario, que **se escribe libremente** y por tanto no se puede pregenerar completo. Estrategia híbrida sin servidor y a costo $0:

### Marcado en los textos
- Los textos con nombre usan el marcador `{nombre}` (ej. `Hola {nombre}, comencemos con el capítulo 1`). Si hoy usan otro formato, respetarlo y adaptar el script.

### Generación (en el script)
Para cada texto con `{nombre}`:
1. **Clips fijos:** generar el audio de la parte *antes* del nombre y de la parte *después* (`...-pre.ogg`, `...-post.ogg`).
2. **Variante sin nombre:** generar el audio de la frase completa sin el nombre, redactada de forma natural (ej. `Hola, comencemos con el capítulo 1`). Definir esta variante en un campo opcional del texto (`sinNombre`); si no existe, usar pre + post unidos sin nombre.
3. **Biblioteca de nombres comunes:** archivo `scripts/nombres.txt` con unos 300-500 nombres frecuentes en Chile (uno por línea). Generar un clip por nombre en `audio/nombres/{nombre-normalizado}.{hash8}.ogg`. Voz y formato iguales a los demás clips. Costo estimado: pocos miles de caracteres, irrelevante para la cuota.
4. Registrar todo en `audio/manifest.json` (incluye el índice de nombres disponibles).
5. Los nombres se normalizan igual en el script y en la app: minúsculas, sin tildes, sin espacios extra, solo letras (la ñ se conserva).

### Reproducción (en la app)
1. Normalizar el nombre que escribió el usuario.
2. Si existe en el manifiesto: reproducir en cadena `pre` → `nombre` → `post` (usar el evento `ended`, precargando el siguiente clip para evitar pausas).
3. Si **no** existe: reproducir la **variante sin nombre**; el nombre sigue apareciendo escrito en pantalla.
4. Nombres compuestos ("María José"): si el nombre completo no está, probar solo el primer nombre.
5. Si falla la reproducción en cadena, caer a la variante sin nombre y luego al TTS nativo como último recurso.

### Calidad de la unión
- Recortar silencios al inicio y fin de cada clip con ffmpeg (`silenceremove`) para que la unión suene continua.
- Generar los nombres con la misma voz y velocidad que el resto.
- Si es posible, redactar los textos de modo que el nombre quede al inicio o al final de la frase, para minimizar saltos de entonación.

### Seguridad
- El nombre escrito por el usuario nunca se envía a ninguna API ni se inserta como HTML sin escapar.
- Limitar el largo del nombre (ej. 40 caracteres).

### Mejora opcional (no implementar salvo que se pida)
Para cubrir cualquier nombre con la voz neuronal, se puede agregar un proxy gratuito en Cloudflare Workers que llame a Azure Speech con la key guardada como secreto y cachee el resultado por nombre. Hoy se prioriza la opción sin servidor.

### Criterios de aceptación adicionales
- [ ] Un nombre incluido en la biblioteca se escucha con la voz neuronal, sin cortes notorios.
- [ ] Un nombre fuera de la biblioteca reproduce la variante sin nombre sin errores.
- [ ] Nombres con tildes, ñ, mayúsculas y espacios se normalizan correctamente.
- [ ] Agregar un nombre a `scripts/nombres.txt` y re-ejecutar el script genera solo ese clip.

## 7. Entrega esperada de Claude

Al terminar: resumen corto de lo implementado, cantidad de caracteres consumidos de la cuota, peso total de los audios y cualquier decisión que se haya tomado ante ambigüedades.
