# 💖 Página sorpresa interactiva

Una experiencia romántica en una sola página: una consola que escribe un mensaje, una transición y una escena 3D con torta, velas, marcos Polaroid, una carta sobre la mesa, corazones y una panorámica de fondo.

## Archivos

| Archivo | Qué contiene |
|---------|--------------|
| `index.html` | Estructura: pantalla inicial, carta y visor de fotos |
| `style.css` | Estilos, fuente Seramonde y adaptación a móviles |
| `app.js` | Configuración (`DEFAULTS`) y lógica: terminal, escena 3D, cámara, música y carta |
| `fondo/panoramica.png` | Panorámica que se usa como esfera de fondo |
| `fuentes/` | Fuentes: `Seramonde.otf` (textos) y `Courier_New.otf` (terminal inicial) |
| `fotos/carta.png` | Imagen de la portada del sobre y de la carta |
| `musica/cancion.mp3` | Canción de fondo |
| `fotos/1.jpg` a `fotos/4.jpg` | Las cuatro fotos de los marcos Polaroid |
| `modelos/Cake.glb` | Modelo 3D de la torta; sus texturas están en `modelos/texturas/` |
| `modelos/mesa.glb` | Modelo de la mesa (rosa) |
| `modelos/vela.glb` | Modelo de la vela; la llama es procedural |
| `modelos/texturas/` | Texturas de la torta a 2048 px |
| `modelos/texturas/original-4k/` | Tus texturas originales de 4096 px |
| `modelos/original/` | Tu `Cake.glb` sin modificar |

## Cómo ejecutarla

La página necesita internet la primera vez, porque carga Three.js, GSAP y el cargador GLTF desde CDN.

Los modelos, las texturas y la panorámica son archivos aparte, y los navegadores bloquean su carga con doble clic (protocolo `file://`). Usa un servidor local:
```bash
cd regalo
python -m http.server 8000
```
y abre `http://localhost:8000`.

Si abres el archivo con doble clic, la página funciona, pero sin torta 3D (se muestra una versión simple) y sin panorámica.

## Fuentes

- `fuentes/Seramonde.otf`: fuente de los textos de la carta y la tarjeta.
- `fuentes/Courier_New.otf`: fuente de la terminal inicial.

Si cambias un archivo, mantén su nombre o actualiza las reglas `@font-face` en `style.css`.

## Personalizarla

Todo se configura en el objeto `DEFAULTS` al inicio de `app.js`:

- `name`: el nombre de tu novia. Aparece en la terminal y en la carta.
- `letter`: el texto de la carta que se abre al tocarla.
- `letterImage`: imagen de la portada del sobre que está sobre la mesa y también aparece arriba de la carta (por defecto `fotos/carta.png`). Déjalo vacío para no mostrarla.
- `photos`: las rutas de las fotos. Se muestran en los 4 marcos Polaroid; al tocar una se ve en grande.
- `music`: ruta de una canción propia, por ejemplo `'musica/cancion.mp3'`. Déjalo vacío para la melodía generada.

Después de cambiar algo, recarga la página.

### Ajustes de escena

En `app.js`:

- `CAKE_DIAMETER`, `CAKE_TINT`, `CAKE_TEX`: tamaño, color y calidad de la torta.
- `TABLE_WIDTH`: ancho de la mesa.
- `CANDLE_SCALE`, `CANDLE_SPOTS`: tamaño y posición de las velas.
- `CANDLE_SINK`: cuánto se hunden las velas en la torta (por defecto `0.4`; sube el valor para bajarlas más).

## Controles

- **Arrastrar** sobre la escena: gira la cámara.
- **Rueda del ratón** o pellizco: acerca y aleja.
- **Tocar el sobre o el papel** (el sobre brilla y el cursor cambia al pasar sobre él): abre la carta.
- Las velas se encienden un segundo después de que termina la escritura de la terminal.
- **Tocar una foto**: la muestra en grande.
- **Enter** o tocar la pantalla inicial: continúa. **Esc** cierra las ventanas.

## Publicarla para que ella la abra desde su celular

Es una página estática, así que puedes subirla gratis:

- **Netlify Drop:** arrastra la carpeta `regalo` a https://app.netlify.com/drop para obtener un enlace.
- **GitHub Pages:** sube los archivos a un repositorio y activa Pages en *Settings → Pages*.
