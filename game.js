<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Tepic Resurgimiento Ultra Final</title>
<style>
html,body{
  margin:0;
  padding:0;
  overflow:hidden;
  background:#000;
  font-family:Arial,Helvetica,sans-serif;
}

#gameCanvas{
  width:100vw;
  height:100vh;
  display:block;
}

#hud{
  position:absolute;
  top:10px;
  left:10px;
  color:white;
  z-index:10;
  font-size:16px;
}

#hud div{
  margin-bottom:5px;
}

#minimap{
  position:absolute;
  right:10px;
  top:10px;
  width:150px;
  height:150px;
  border:2px solid #fff;
  background:rgba(0,0,0,0.6);
}

#controls{
  position:absolute;
  bottom:20px;
  left:50%;
  transform:translateX(-50%);
  display:flex;
  gap:10px;
}

#controls button{
  padding:12px 16px;
  font-size:16px;
  border:none;
  border-radius:8px;
  background:linear-gradient(45deg,#1e90ff,#00bfff);
  color:white;
  cursor:pointer;
}

#controls button:active{
  transform:scale(0.95);
  box-shadow:0 0 8px #00bfff;
}

#loadingScreen{
  position:absolute;
  inset:0;
  background:#000;
  color:white;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:24px;
  z-index:100;
  flex-direction:column;
  gap:10px;
}
</style>
</head>
<body>

<canvas id="gameCanvas"></canvas>

<div id="loadingScreen">
  <div>Cargando Tepic Ultra...</div>
  <div id="loadingStatus" style="font-size:14px;opacity:0.7;"></div>
</div>

<div id="hud">
  <div id="health">Vida: 100</div>
  <div id="ammo">Ammo: 30/90</div>
  <div id="coins">Monedas: 0</div>
  <div id="contract">Sin contrato</div>
</div>

<div id="minimap"></div>

<div id="controls">
  <button onclick="shoot()">🔫</button>
  <button onclick="reload()">🔄</button>
  <button onclick="throwGrenade()">💣</button>
  <button onclick="switchWeapon('rifle')">Rifle</button>
  <button onclick="switchWeapon('shotgun')">Escopeta</button>
  <button onclick="switchWeapon('pistol')">Pistola</button>
</div>

<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/"
  }
}
</script>

<script type="module">
import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

console.log('Script iniciado');

// Actualizar estado de carga
function updateLoadingStatus(msg) {
  const status = document.getElementById('loadingStatus');
  if (status) status.innerText = msg;
  console.log('Loading:', msg);
}

updateLoadingStatus('Inicializando variables...');

// Configuración del juego
const weapons = {
  rifle: { damage: 10, rate: 0.3, mag: 30 },
  shotgun: { damage: 25, rate: 1, mag: 8 },
  pistol: { damage: 5, rate: 0.5, mag: 15 }
};

const player = {
  health: 100,
  weapon: 'rifle',
  ammo: 30,
  reserve: 90,
  coins: 0,
  position: new THREE.Vector3(0, 2, 0),
  onGround: false
};

let scene, camera, renderer, clock, controls, lastShot = 0;
let velocity = new THREE.Vector3();
const gravity = -30;
let weaponModel = null;
const keys = {};
let bots = [];
let lootList = [];

// Audio simulado
const sounds = {
  shoot: { play: () => console.log('🔫') },
  reload: { play: () => console.log('🔄') },
  grenade: { play: () => console.log('💣') }
};

function playSound(name) {
  if (sounds[name]) sounds[name].play();
}

// HUD
function updateHUD() {
  const healthEl = document.getElementById('health');
  const ammoEl = document.getElementById('ammo');
  const coinsEl = document.getElementById('coins');
  
  if (healthEl) healthEl.innerText = 'Vida: ' + Math.floor(player.health);
  if (ammoEl) ammoEl.innerText = `Ammo: ${player.ammo}/${player.reserve}`;
  if (coinsEl) coinsEl.innerText = 'Monedas: ' + player.coins;
}

// Minimap
function updateMinimap() {
  const mini = document.getElementById('minimap');
  if (!mini) return;
  
  const x = 75 + (player.position.x / 2);
  const z = 75 + (player.position.z / 2);
  
  mini.innerHTML = `<div style="position:absolute;left:${x}px;top:${z}px;width:5px;height:5px;background:red;border-radius:50%;"></div>`;
}

// Generar mapa
function generateMap() {
  updateLoadingStatus('Generando terreno...');
  
  const geometry = new THREE.PlaneGeometry(200, 200, 10, 10);
  const material = new THREE.MeshPhongMaterial({ color: 0x228B22 });
  const ground = new THREE.Mesh(geometry, material);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const boxGeo = new THREE.BoxGeometry(5, 5, 5);
  const boxMat = new THREE.MeshPhongMaterial({ color: 0x888888 });
  
  for (let i = 0; i < 10; i++) {
    const b = new THREE.Mesh(boxGeo, boxMat);
    b.position.set((Math.random() - 0.5) * 50, 2.5, (Math.random() - 0.5) * 50);
    b.castShadow = true;
    b.receiveShadow = true;
    scene.add(b);
  }
}

// Generar loot
function spawnLoot() {
  updateLoadingStatus('Spawneando loot...');
  
  lootList = [];
  for (let i = 0; i < 5; i++) {
    lootList.push({
      x: (Math.random() - 0.5) * 50,
      z: (Math.random() - 0.5) * 50,
      collected: false
    });
  }
}

// Actualizar loot
function updateLoot() {
  lootList.forEach(l => {
    if (!l.collected) {
      const dx = player.position.x - l.x;
      const dz = player.position.z - l.z;
      if (Math.sqrt(dx * dx + dz * dz) < 2) {
        l.collected = true;
        player.coins += 10;
        console.log('💰 Loot recogido +10 coins');
      }
    }
  });
}

// Generar bots
function generateBots() {
  updateLoadingStatus('Generando enemigos...');
  
  bots = [];
  for (let i = 0; i < 5; i++) {
    bots.push({
      position: { x: (Math.random() - 0.5) * 50, y: 2, z: (Math.random() - 0.5) * 50 },
      health: 100,
      weapon: 'rifle',
      state: 'patrol',
      lastShot: 0,
      index: i
    });
  }
}

// Actualizar AI
function updateAI(dt) {
  if (bots.length === 0) generateBots();
  
  bots.forEach(bot => {
    if (bot.state === 'patrol') {
      bot.position.x += Math.sin(Date.now() / 1000 + bot.index) * dt * 2;
      bot.position.z += Math.cos(Date.now() / 1000 + bot.index) * dt * 2;
      
      const dx = player.position.x - bot.position.x;
      const dz = player.position.z - bot.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      
      if (dist < 15) bot.state = 'attack';
    }
    
    if (bot.state === 'attack') {
      const dx = player.position.x - bot.position.x;
      const dz = player.position.z - bot.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      
      if (dist > 20) {
        bot.state = 'patrol';
      } else if (Date.now() / 1000 - bot.lastShot > weapons[bot.weapon].rate) {
        player.health -= weapons[bot.weapon].damage * 0.1; // Reducido para que no mate tan rápido
        bot.lastShot = Date.now() / 1000;
      }
    }
  });
}

// Zona
function updateZone(dt) {
  const zoneRadius = 50;
  const dx = player.position.x;
  const dz = player.position.z;
  const dist = Math.sqrt(dx * dx + dz * dz);
  if (dist > zoneRadius) {
    player.health -= 5 * dt;
  }
}

// Cargar modelo del arma
function loadWeaponModel(name) {
  updateLoadingStatus('Cargando arma...');
  
  const loader = new GLTFLoader();
  const modelUrl = 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/models/gltf/Duck/glTFBinary/Duck.glb';
  
  loader.load(
    modelUrl,
    (gltf) => {
      if (weaponModel) camera.remove(weaponModel);
      weaponModel = gltf.scene;
      weaponModel.scale.set(0.1, 0.1, 0.1);
      weaponModel.position.set(0.3, -0.5, -1);
      weaponModel.rotation.y = Math.PI;
      camera.add(weaponModel);
      console.log('Arma cargada');
    },
    undefined,
    (error) => console.error('Error loading weapon:', error)
  );
}

// Movimiento
function handleMovement(dt) {
  const speed = keys['ShiftLeft'] ? 10 : 5;
  const move = new THREE.Vector3();

  if (keys['KeyW']) move.z = -speed;
  if (keys['KeyS']) move.z = speed;
  if (keys['KeyA']) move.x = -speed;
  if (keys['KeyD']) move.x = speed;

  move.applyEuler(camera.rotation);
  move.y = 0;
  
  velocity.x = move.x;
  velocity.z = move.z;

  if (player.onGround && keys['Space']) {
    velocity.y = 15;
    player.onGround = false;
  }

  velocity.y += gravity * dt;
  player.position.addScaledVector(velocity, dt);

  if (player.position.y < 2) {
    player.position.y = 2;
    velocity.y = 0;
    player.onGround = true;
  }

  camera.position.copy(player.position);
}

// Loop principal
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.1);

  handleMovement(dt);
  updateAI(dt);
  updateHUD();
  updateMinimap();
  updateLoot();
  updateZone(dt);

  renderer.render(scene, camera);
}

// Controles globales
window.shoot = function() {
  if (!clock) return;
  const now = clock.getElapsedTime();
  if (now - lastShot > weapons[player.weapon].rate && player.ammo > 0) {
    player.ammo--;
    lastShot = now;
    playSound('shoot');
    if (weaponModel) {
      weaponModel.rotation.x -= 0.1;
      setTimeout(() => { if (weaponModel) weaponModel.rotation.x += 0.1; }, 50);
    }
  }
};

window.reload = function() {
  const need = weapons[player.weapon].mag - player.ammo;
  const take = Math.min(need, player.reserve);
  player.ammo += take;
  player.reserve -= take;
  playSound('reload');
};

window.throwGrenade = function() {
  playSound('grenade');
};

window.switchWeapon = function(name) {
  if (weapons[name]) {
    player.weapon = name;
    player.ammo = weapons[name].mag;
    player.reserve = weapons[name].mag * 3;
    loadWeaponModel(name);
  }
};

// Inicialización
async function init() {
  try {
    updateLoadingStatus('Configurando escena...');
    
    const gameCanvas = document.getElementById('gameCanvas');
    const loadingScreen = document.getElementById('loadingScreen');
    
    if (!gameCanvas) {
      throw new Error('Canvas no encontrado');
    }

    // Escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 20, 200);

    // Cámara
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500);
    camera.position.copy(player.position);

    // Renderer
    updateLoadingStatus('Configurando renderer...');
    renderer = new THREE.WebGLRenderer({ canvas: gameCanvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;

    clock = new THREE.Clock();

    // Luces
    updateLoadingStatus('Añadiendo luces...');
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const sun = new THREE.DirectionalLight(0xffffff, 0.8);
    sun.position.set(100, 200, 100);
    sun.castShadow = true;
    scene.add(sun);

    // Generar mundo
    generateMap();
    spawnLoot();
    generateBots();

    // Controles
    updateLoadingStatus('Configurando controles...');
    controls = new PointerLockControls(camera, document.body);
    
    document.body.addEventListener('click', () => {
      if (controls) controls.lock();
    });

    document.addEventListener('keydown', e => keys[e.code] = true);
    document.addEventListener('keyup', e => keys[e.code] = false);

    loadWeaponModel(player.weapon);

    // Resize
    window.addEventListener('resize', () => {
      if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    });

    // Ocultar loading
    updateLoadingStatus('¡Listo!');
    setTimeout(() => {
      if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        loadingScreen.style.transition = 'opacity 0.5s';
        setTimeout(() => {
          loadingScreen.style.display = 'none';
        }, 500);
      }
      animate();
      console.log('Juego iniciado correctamente');
    }, 1000);

  } catch (error) {
    console.error('Error al inicializar:', error);
    updateLoadingStatus('ERROR: ' + error.message);
  }
}

// Iniciar cuando cargue
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
</script>

</body>
</html>
