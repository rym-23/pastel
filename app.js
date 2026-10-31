/* =========================================================
   CONFIGURACIÓN POR DEFECTO
   Edita estos valores para personalizar la página antes de publicarla.
   ========================================================= */
const DEFAULTS = {
  name: 'Ameri',
  // Imagen que aparece al abrir la carta (ruta dentro del proyecto; vacío = sin imagen)
  letterImage: 'fotos/carta.png',
  letter: "Mi amor:\nPrimero que todo, feliz cumpleaños, preciosa. ❤️ Espero que hoy tengas un día muy bonito, porque de verdad te mereces lo mejor del mundo.\nQuiero aprovechar este día para decirte algo que quizás no te digo tantas veces como debería: te amo muchísimo. No importa la distancia que haya entre nosotros, quiero que sepas que siempre voy a estar para ti. En los días buenos, en los días difíciles, cuando necesites hablar, cuando estés triste o simplemente cuando quieras compañía. Quiero que tengas presente que puedes contar conmigo, porque no pienso dejar de apoyarte ni de estar a tu lado por más lejos que estemos.\nSé que a veces casi no hacemos planes juntos, como jugar o hacer otras cositas, y que no siempre podemos compartir tanto tiempo como nos gustaría. Pero eso no significa que no me guste estar contigo o que te quiera menos. Al contrario, valoro mucho que, incluso con esas cosas, sé que siempre vas a estar para mí cuando te necesite. Y créeme que eso es algo que amo de ti.\nGracias por hacerme sentir querido, por estar ahí y por ser esa personita tan especial en mi vida. No necesito que hagamos grandes cosas todo el tiempo para saber lo mucho que significas para mí. A veces, simplemente saber que estás ahí es suficiente para hacerme feliz.\nQuiero seguir compartiendo momentos contigo, creando recuerdos y acompañándote en todo lo que venga. Quiero verte cumplir tus sueños, verte feliz y recordarte siempre lo increíble que eres.\nTe amo, Ameri, y quiero que nunca dudes de eso. La distancia no va a cambiar lo que siento por ti, y mientras me lo permitas, siempre voy a estar para ti.\nFeliz cumpleaños, mi niña hermosa. Espero poder hacerte tan feliz como tú me haces a mí.",
  // Rutas de tus fotos dentro del proyecto. Se muestran en los marcos Polaroid.
  photos: ['fotos/1.jpg', 'fotos/2.jpg', 'fotos/3.jpg', 'fotos/4.jpg'],
  // Ruta de la canción de fondo. Déjalo vacío para la melodía generada.
  music: 'musica/cancion.mp3'
};

/* ---------- Utilidades ---------- */
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const rnd = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/* ---------- Configuración activa (se toma de DEFAULTS) ---------- */
const cfg = { ...DEFAULTS };

/* =========================================================
   1. PANTALLA INICIAL: terminal con escritura automática
   ========================================================= */
let skip = false, started = false;

const termLines = () => [
  { t: `> ${cfg.name}`, p: 500 },
  { t: '...', s: 220, p: 500 },
  { t: '> hoy es tu día especial', p: 500 },
  { t: '...', s: 220, p: 500 },
  { t: '> así que hice este programa para ti', p: 500 },
  { t: '...', s: 220, p: 400 }
];

async function typeTerminal() {
  const lines = termLines();
  let out = '';
  for (const l of lines) {
    for (const ch of l.t) {
      if (skip) return showAll(lines);
      out += ch;
      $('#txt').textContent = out;
      await sleep(l.s || 36);
    }
    out += '\n';
    $('#txt').textContent = out;
    if (skip) return showAll(lines);
    await sleep(l.p || 280);
  }
  showAll(lines);
}

function showAll(lines) {
  $('#txt').textContent = lines.map(l => l.t).join('\n') + '\n';
  startFaces();
}

// Caras animadas al final de la terminal: ʅ(@_@)ʃ ʅ(@_@)ʃ ʅ(@_@)ʃ
let faceTimer = null;
function startFaces() {
  let n = 1;
  faceTimer = setInterval(() => {
    $('#faces').textContent = Array(n).fill('ʅ(@_@)ʃ').join(' ');
    n = (n % 3) + 1;
  }, 700);
}

$('#intro').addEventListener('click', start);
addEventListener('keydown', e => { if (e.key === 'Enter' && !started) start(); });

/* =========================================================
   2. ESCENA 3D (Three.js)
   ========================================================= */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
$('#stage').appendChild(renderer.domElement);
const cvs = renderer.domElement;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x12071f);
scene.fog = new THREE.Fog(0x1a0b2e, 35, 75);

const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, .1, 300);
const loader = new THREE.TextureLoader();
const ray = new THREE.Raycaster();
const clickables = [];
const orbit = { theta: 0, phi: 1.08, r: 42, target: new THREE.Vector3(0, 1.4, 0) };

/* ---------- Helpers ---------- */
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  return new THREE.CanvasTexture(c);
}
const std = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: .6, ...extra });
const add = (geo, color, pos, parent, extra = {}) => {
  const m = new THREE.Mesh(geo, std(color, extra));
  m.position.set(...pos);
  (parent || cake).add(m);
  return m;
};
function wrap(g, text, x, y, maxW, lh) {
  let line = '', yy = y;
  for (const w of text.split(' ')) {
    const t = line + w + ' ';
    if (g.measureText(t).width > maxW && line) { g.fillText(line.trim(), x, yy); line = w + ' '; yy += lh; }
    else line = t;
  }
  g.fillText(line.trim(), x, yy);
}

/* ---------- Luces ---------- */
scene.add(new THREE.AmbientLight(0x7a5aa0, .8));
const key = new THREE.DirectionalLight(0xffe0c8, .7);
key.position.set(-8, 14, 10);
scene.add(key);
const candleLight = new THREE.PointLight(0xffa860, 1.6, 14, 1.6);
candleLight.position.set(0, 3.4, .6);
scene.add(candleLight);

/* ---------- Mesa: modelo mesa.glb (superficie en y = 0) ---------- */
const TABLE_WIDTH = 15;
new THREE.GLTFLoader().load('modelos/mesa.glb', gltf => {
  const t = gltf.scene;
  let box = new THREE.Box3().setFromObject(t);
  const size = box.getSize(new THREE.Vector3());
  t.scale.setScalar(TABLE_WIDTH / Math.max(size.x, size.z));
  box = new THREE.Box3().setFromObject(t);
  t.position.set(-(box.min.x + box.max.x) / 2, -box.max.y, -(box.min.z + box.max.z) / 2);
  scene.add(t);
}, undefined, err => console.warn('No se pudo cargar modelos/mesa.glb', err));

/* ---------- Fondo: panorámica como esfera envolvente ---------- */
const panoTex = loader.load('fondo/panoramica.png');
panoTex.encoding = THREE.sRGBEncoding;
const panoSphere = new THREE.Mesh(
  new THREE.SphereGeometry(90, 64, 40),
  new THREE.MeshBasicMaterial({ map: panoTex, side: THREE.BackSide, fog: false })
);
scene.add(panoSphere);

/* ---------- Torta: modelo 3D Cake.glb con sus texturas ---------- */
const CAKE_DIAMETER = 5.6;   // tamaño final de la torta en la escena
const CAKE_TINT = 0xffffff;  // multiplicador de color: 0xffffff = colores originales
const CAKE_TEX = 'modelos/texturas/';  // cambia a 'modelos/texturas/original-4k/' para 4K (más pesado)

const cake = new THREE.Group();
scene.add(cake);
const glows = [];
let resolveCake;
const cakeReady = new Promise(r => { resolveCake = r; });
const glowTex = canvasTex(128, 128, (g) => {
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,210,140,1)'); gr.addColorStop(1, 'rgba(255,120,60,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
});

/* Velas: modelo vela.glb (cuerpo) + llama encendida (procedural) */
const CANDLE_SCALE = .6;
const CANDLE_SINK = .4;    // cuánto se hunden las velas en la torta (positivo = más abajo)
const CANDLE_SPOTS = [[-.45, .25], [0, -.1], [.45, .2]];
const flames = [], flameLights = [];
const downRay = new THREE.Raycaster();

// Altura real de la superficie de la torta en (x, z), medida con un rayo que cae desde arriba
function surfaceY(obj, x, z) {
  obj.updateMatrixWorld(true);
  downRay.set(new THREE.Vector3(x, 50, z), new THREE.Vector3(0, -1, 0));
  const hit = downRay.intersectObject(obj, true)[0];
  return hit ? hit.point.y : new THREE.Box3().setFromObject(obj).max.y;
}

CANDLE_SPOTS.forEach(([x, z]) => {
  new THREE.GLTFLoader().load('modelos/vela.glb', gltf => {
    cakeReady.then(cakeObj => placeCandle(gltf.scene, x, z, cakeObj));
  }, undefined, err => console.warn('No se pudo cargar modelos/vela.glb', err));
});

function placeCandle(candle, x, z, cakeObj) {
  // Se quitan la malla de llama del modelo (deformada por huesos) y sus luces embebidas
  const remove = [];
  candle.traverse(o => { if (o.isSkinnedMesh || o.isLight) remove.push(o); });
  remove.forEach(o => o.parent && o.parent.remove(o));

  candle.scale.setScalar(CANDLE_SCALE);
  candle.position.set(x, 0, z);
  cake.add(candle);
  const wax = candle.getObjectByName('Cylinder') || candle;
  let box = new THREE.Box3().setFromObject(wax);
  candle.position.y = (surfaceY(cakeObj, x, z) - CANDLE_SINK) - box.min.y;
  box = new THREE.Box3().setFromObject(wax);

  // Llama: capa exterior naranja + núcleo claro
  const flame = new THREE.Mesh(new THREE.SphereGeometry(.08, 18, 18), new THREE.MeshBasicMaterial({ color: 0xffa640 }));
  flame.scale.set(.9, 2, .9);
  flame.position.set(x, box.max.y + .18, z);
  const core = new THREE.Mesh(new THREE.SphereGeometry(.4, 14, 14), new THREE.MeshBasicMaterial({ color: 0xfff1b8 }));
  core.scale.set(.45, .7, .45);
  core.position.set(0, -.1, 0);
  flame.add(core);
  cake.add(flame);
  flames.push(flame);

  // Luz cálida de la vela sobre la torta
  const fl = new THREE.PointLight(0xffa24d, .9, 5, 2);
  fl.position.set(x, flame.position.y + .1, z);
  cake.add(fl);
  flameLights.push(fl);

  const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  gl.scale.setScalar(1.2);
  gl.position.copy(flame.position);
  cake.add(gl);
  glows.push(gl);
}

function mapTex(file, srgb) {
  const t = loader.load(CAKE_TEX + file);
  t.flipY = false; // convención glTF: las UV no se voltean
  if (srgb) t.encoding = THREE.sRGBEncoding;
  return t;
}

function buildCake(gltf) {
  const model = gltf.scene;
  const mat = new THREE.MeshStandardMaterial({
    color: CAKE_TINT,
    map: mapTex('basecolor.png', true),
    normalMap: mapTex('normal.png', false),
    roughnessMap: mapTex('roughness.png', false),
    aoMap: mapTex('ao.png', false),
    roughness: 1,
    metalness: 0
  });
  model.traverse(o => {
    if (o.isMesh) {
      o.geometry.setAttribute('uv2', o.geometry.attributes.uv); // el AO usa el segundo canal UV
      o.material = mat;
    }
  });

  let box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  model.scale.setScalar(CAKE_DIAMETER / Math.max(size.x, size.z));

  box = new THREE.Box3().setFromObject(model);
  model.position.set(-(box.min.x + box.max.x) / 2, -box.min.y, -(box.min.z + box.max.z) / 2);
  cake.add(model);

  box = new THREE.Box3().setFromObject(model);
  candleLight.position.set(0, box.max.y + 1.8, .6);
  resolveCake(model);
}

function buildFallbackCake() {
  // Si el modelo no carga (por ejemplo, abriendo el archivo sin servidor), se muestra una torta simple
  const m = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 1.5, 64), std(0xffb0d6));
  m.position.y = .75;
  cake.add(m);
  candleLight.position.set(0, 3.3, .6);
  resolveCake(m);
}

new THREE.GLTFLoader().load(
  'modelos/Cake.glb',
  buildCake,
  undefined,
  err => { console.warn('No se pudo cargar modelos/Cake.glb; se usa una torta simple.', err); buildFallbackCake(); }
);

/* ---------- Marcos Polaroid sobre la mesa (4 fotos) ---------- */
const polaroids = [];
[[-4.6, -1.8, -.35], [-2.2, -4.3, -.12], [2.2, -4.3, .12], [4.6, -1.8, .35]].forEach(([x, z, ry], i) => {
  const grp = new THREE.Group();
  grp.position.set(x, 1.4, z);
  grp.rotation.set(-.1, ry, (Math.random() - .5) * .08);
  scene.add(grp);
  grp.add(new THREE.Mesh(new THREE.BoxGeometry(2.3, 2.8, .08), std(0xfff7fb)));  // marco blanco tipo Polaroid
  const mat = new THREE.MeshStandardMaterial({ roughness: .5, side: THREE.DoubleSide });
  const front = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.9), mat);
  front.position.set(0, .3, .05);
  const back = new THREE.Mesh(front.geometry, mat);
  back.position.set(0, .3, -.05);
  back.rotation.y = Math.PI;
  front.userData.onClick = back.userData.onClick = () => showPhoto(i);
  grp.add(front, back);
  clickables.push(front, back);
  polaroids.push(mat);
});

/* ---------- Sobre sobre la mesa: portada = imagen de la carta (clic = leer) ---------- */
const FONT = 'Seramonde, Georgia, serif';
const ENV_W = 3.2, ENV_H = 2.2, ENV_X = 3.2, ENV_Z = 3.4;
const envCanvas = document.createElement('canvas');
envCanvas.width = 1024; envCanvas.height = 704;
const envTex = new THREE.CanvasTexture(envCanvas);
envTex.encoding = THREE.sRGBEncoding;

function drawEnvelope() {
  const g = envCanvas.getContext('2d'), W = envCanvas.width, H = envCanvas.height;
  g.fillStyle = '#fff0f8'; g.fillRect(0, 0, W, H);
  g.strokeStyle = '#e7659f'; g.lineWidth = 14; g.strokeRect(20, 20, W - 40, H - 40);
  g.beginPath(); g.moveTo(20, 20); g.lineTo(W / 2, H * .5); g.lineTo(W - 20, 20); g.stroke();   // solapa del sobre
  g.textAlign = 'center'; g.fillStyle = '#d4357f'; g.font = `bold 70px ${FONT}`;
  g.fillText(`Para ${cfg.name}`, W / 2, H - 60);
  envTex.needsUpdate = true;
  if (cfg.letterImage) {
    const im = new Image();
    im.onload = () => { g.drawImage(im, W / 2 - 180, H * .5 - 170, 360, 360); envTex.needsUpdate = true; };
    im.src = cfg.letterImage;
  }
}

const envBase = new THREE.Mesh(new THREE.BoxGeometry(ENV_W, .06, ENV_H), std(0xffeaf4));
envBase.position.set(ENV_X, .03, ENV_Z);
const envTop = new THREE.Mesh(
  new THREE.PlaneGeometry(ENV_W, ENV_H),
  new THREE.MeshStandardMaterial({ map: envTex, roughness: .7 })
);
envTop.rotation.x = -Math.PI / 2;           // acostado sobre la mesa, con la portada hacia arriba
envTop.position.set(ENV_X, .062, ENV_Z);
envTop.userData.onClick = envBase.userData.onClick = () => openLetter();
scene.add(envBase, envTop);
clickables.push(envTop, envBase);

// Brillo que pulsa para indicar que el sobre se puede tocar
const envMat = envTop.material;
envMat.emissive = new THREE.Color(0xff6fae);
envMat.emissiveIntensity = .25;
const envGlow = new THREE.Sprite(new THREE.SpriteMaterial({
  map: glowTex, color: 0xff8fc7, transparent: true, opacity: .4, depthWrite: false, blending: THREE.AdditiveBlending
}));
envGlow.scale.set(ENV_W * 1.8, ENV_H * 1.8, 1);
envGlow.position.set(ENV_X, .15, ENV_Z);
scene.add(envGlow);

/* ---------- Corazones flotantes ---------- */
const heartTex = canvasTex(128, 128, (g) => {
  g.fillStyle = '#fff';
  g.beginPath();
  g.moveTo(64, 112);
  g.bezierCurveTo(20, 80, 4, 52, 4, 36);
  g.bezierCurveTo(4, 14, 22, 2, 40, 2);
  g.bezierCurveTo(52, 2, 60, 10, 64, 18);
  g.bezierCurveTo(68, 10, 76, 2, 88, 2);
  g.bezierCurveTo(106, 2, 124, 14, 124, 36);
  g.bezierCurveTo(124, 52, 108, 80, 64, 112);
  g.fill();
});
const hearts = [];
for (let i = 0; i < 26; i++) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({
    map: heartTex, color: [0xff8fc7, 0xc9a0ff, 0xffffff][i % 3],
    transparent: true, opacity: .85, depthWrite: false
  }));
  s.scale.setScalar(.5 + Math.random() * .5);
  s.position.set(rnd(-14, 14), rnd(0, 14), rnd(-8, 8));
  scene.add(s);
  hearts.push({ s, v: .6 + Math.random() * .8, o: Math.random() * 6 });
}

/* ---------- Cámara orbital ---------- */
function updateCam() {
  const { theta, phi, r, target } = orbit;
  const R = r * (camera.aspect < .9 ? 1.45 : 1); // en móviles (vertical) aleja la cámara
  camera.position.set(
    target.x + R * Math.sin(phi) * Math.sin(theta),
    target.y + R * Math.cos(phi),
    target.z + R * Math.sin(phi) * Math.cos(theta)
  );
  camera.lookAt(target);
}

const CAMS = {
  front: { theta: 0, phi: 1.08, r: 22 },
  top:   { theta: 0, phi: .32, r: 24 },
  side:  { theta: 1.2, phi: .95, r: 21 },
  close: { theta: .4, phi: .9, r: 12.5 }
};
$$('[data-cam]').forEach(b => b.addEventListener('click', () => {
  gsap.to(orbit, { ...CAMS[b.dataset.cam], duration: 1.6, ease: 'power2.inOut' });
  idle = 0;
}));

/* ---------- Arrastrar para girar, rueda para acercar, clic para interactuar ---------- */
let drag = null, moved = 0, idle = 0;
cvs.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY }; moved = 0; idle = 0; gsap.killTweensOf(orbit); });
function overClickable(e) {
  const m = new THREE.Vector2((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(m, camera);
  return ray.intersectObjects(clickables, false).length > 0;
}
addEventListener('pointermove', e => {
  if (!drag) { cvs.style.cursor = overClickable(e) ? 'pointer' : 'grab'; return; }
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
  drag = { x: e.clientX, y: e.clientY };
  moved += Math.abs(dx) + Math.abs(dy);
  orbit.theta -= dx * .006;
  orbit.phi = clamp(orbit.phi - dy * .005, .25, 1.5);
});
addEventListener('pointerup', e => {
  if (drag && moved < 8 && e.target === cvs) pick(e);
  drag = null;
});
cvs.addEventListener('wheel', e => {
  orbit.r = clamp(orbit.r + e.deltaY * .02, 9, 40);
  idle = 0;
}, { passive: true });

const pick = e => {
  const m = new THREE.Vector2((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(m, camera);
  const hit = ray.intersectObjects(clickables, false)[0];
  if (hit && hit.object.userData.onClick) hit.object.userData.onClick();
};

/* ---------- Texturas de fotos y tarjeta según configuración ---------- */
function placeholder(i) {
  return canvasTex(512, 512, (g, w) => {
    const gr = g.createLinearGradient(0, 0, w, w);
    gr.addColorStop(0, '#ffc2e0'); gr.addColorStop(1, '#c9a0ff');
    g.fillStyle = gr; g.fillRect(0, 0, w, w);
    g.fillStyle = '#fff'; g.textAlign = 'center';
    g.font = '120px serif'; g.fillText('💖', w / 2, w / 2 + 40);
    g.font = '40px Georgia, serif'; g.fillText(`Foto ${i + 1}`, w / 2, w - 40);
  });
}
function applyConfig() {
  drawEnvelope();
  polaroids.forEach((mat, i) => {
    const src = cfg.photos.length ? cfg.photos[i % cfg.photos.length] : null;
    mat.map = src ? loader.load(src) : placeholder(i);
    mat.needsUpdate = true;
  });
}
applyConfig();
document.fonts.load('40px Seramonde').then(applyConfig, applyConfig);

/* ---------- Render loop ---------- */
let last = performance.now();
function tick(now) {
  const dt = Math.min((now - last) / 1000, .05);
  last = now;
  const t = now / 1000;
  if (!drag) idle += dt;
  if (idle > 4 && !drag) orbit.theta += dt * .04; // giro lento cuando nadie interactúa
  updateCam();

  flames.forEach((f, i) => {
    f.scale.y = 2 + Math.sin(t * 11 + i) * .15;
    f.scale.x = .9 + Math.sin(t * 8 + i * 2) * .08;
  });
  flameLights.forEach((l, i) => { l.intensity = .8 + Math.sin(t * 13 + i * 1.7) * .2 + Math.sin(t * 5 + i) * .1; });
  glows.forEach((g, i) => { g.material.opacity = .75 + Math.sin(t * 9 + i) * .2; });
  candleLight.intensity = 1.5 + Math.sin(t * 10) * .15;
  hearts.forEach(h => {
    h.s.position.y += h.v * dt;
    h.s.position.x += Math.sin(t + h.o) * .3 * dt;
    if (h.s.position.y > 14) { h.s.position.y = -1; h.s.position.x = rnd(-14, 14); }
  });

  const pulse = Math.sin(t * 2.5);
  envMat.emissiveIntensity = .25 + pulse * .15;
  envGlow.material.opacity = .35 + pulse * .2;
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

function onResize() {
  camera.aspect = innerWidth / innerHeight;
  camera.fov = camera.aspect < .9 ? 62 : 45;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
}
addEventListener('resize', onResize);
onResize();

/* =========================================================
   3. MÚSICA: melodía generada con Web Audio o un mp3 propio
   ========================================================= */
let ac = null, master = null, customAudio = null, musicOn = false;
let seqTimer = null, nextT = 0, barN = 0;
const CH = [[261.63, 329.63, 392], [220, 261.63, 329.63], [174.61, 220, 261.63], [196, 246.94, 293.66]];

function ensureAC() {
  if (!ac) {
    ac = new (window.AudioContext || window.webkitAudioContext)();
    master = ac.createGain();
    master.gain.value = .14;
    master.connect(ac.destination);
  }
  return ac;
}
function note(f, t, d) {
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = 'sine'; o.frequency.value = f;
  g.gain.setValueAtTime(.0001, t);
  g.gain.exponentialRampToValueAtTime(.3, t + .04);
  g.gain.exponentialRampToValueAtTime(.0001, t + d);
  o.connect(g).connect(master);
  o.start(t); o.stop(t + d + .05);
}
function bar(t) {
  const ch = CH[barN++ % CH.length];
  for (let k = 0; k < 8; k++) note(ch[k % 3] * (k >= 5 ? 2 : 1), t + k * .3, 1.2);
}
function sched() {
  while (nextT < ac.currentTime + 2.5) { bar(nextT); nextT += 2.4; }
}
function startSynth() {
  ensureAC().resume();
  if (nextT < ac.currentTime) nextT = ac.currentTime + .1;
  sched();
  seqTimer = setInterval(sched, 400);
}
function stopSynth() { clearInterval(seqTimer); seqTimer = null; }

function setMusic(on) {
  musicOn = on;
  if (customAudio) {
    on ? customAudio.play().catch(() => {}) : customAudio.pause();
  } else if (on) {
    if (!seqTimer) startSynth();
  } else {
    stopSynth();
    if (ac) ac.suspend();
  }
}
if (cfg.music) { customAudio = new Audio(cfg.music); customAudio.loop = true; }

/* =========================================================
   4. CARTA, FOTOS Y MODALES
   ========================================================= */
function openModal(id) {
  const m = document.getElementById(id);
  m.classList.add('open');
  gsap.fromTo(m.querySelector('.sheet'), { y: 30, opacity: 0, scale: .96 },
    { y: 0, opacity: 1, scale: 1, duration: .5, ease: 'back.out(1.4)' });
}
function closeModal(m) { m.classList.remove('open'); }
$$('.modal').forEach(m => m.addEventListener('click', e => {
  if (e.target === m || e.target.hasAttribute('data-close')) closeModal(m);
}));
addEventListener('keydown', e => { if (e.key === 'Escape') $$('.modal.open').forEach(closeModal); });

let letterTimer = null;
function openLetter() {
  $('#letterTitle').textContent = `Para ${cfg.name}`;
  const img = $('#letterImg');
  img.src = cfg.letterImage || '';
  img.hidden = !cfg.letterImage;
  const body = $('#letterBody');
  const text = cfg.letter;
  let i = 0;
  body.textContent = '';
  clearInterval(letterTimer);
  letterTimer = setInterval(() => {
    body.textContent = text.slice(0, ++i);
    if (i >= text.length) clearInterval(letterTimer);
  }, 14);
  openModal('letter');
}

function showPhoto(i) {
  const src = cfg.photos.length ? cfg.photos[i % cfg.photos.length] : null;
  $('#photoImg').src = src || '';
  $('#photoImg').hidden = !src;
  $('#photoCap').textContent = src ? `Recuerdo ${i + 1}` : 'Agrega tus fotos en DEFAULTS.photos (app.js)';
  openModal('photo');
}

/* =========================================================
   TRANSICIÓN: terminal → escena principal
   ========================================================= */
function start() {
  if (started) return;
  started = true;
  skip = true;
  clearInterval(faceTimer);
  setMusic(true); // el clic del usuario permite iniciar el audio

  gsap.timeline()
    .to('#term', { scale: .4, opacity: 0, filter: 'blur(8px)', duration: .9, ease: 'power2.in' })
    .to('#intro', { opacity: 0, duration: 1, onComplete: () => { $('#intro').style.display = 'none'; } }, '-=.2')
    .to(orbit, { r: 22, phi: 1.08, duration: 3.2, ease: 'power3.out' }, '-=.9')
    ;
}

/* ---------- Arranque ---------- */
typeTerminal();
requestAnimationFrame(tick);
