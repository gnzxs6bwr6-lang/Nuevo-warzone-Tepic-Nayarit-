import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { updateHUD } from './hud.js';
import { generateMap } from './map.js';
import { updateAI } from './ai.js';
import { weapons } from './items.js';
import { updateMinimap } from './minimap.js';
import { initAudio, playSound } from './audio.js';
import { spawnLoot, updateLoot } from './loot.js';
import { updateZone } from './zone.js';
import { updateContracts } from './contracts.js';

// Variables globales del juego
let scene, camera, renderer, clock, controls, lastShot = 0;
let velocity = new THREE.Vector3();
const gravity = -30;
let weaponModel = null;
let isInitialized = false;
let animationFrameId = null;

// DOM elements
const loadingScreen = document.getElementById('loadingScreen');
const gameCanvas = document.getElementById('gameCanvas');

// Estado del jugador
export const player = {
  health: 100,
  weapon: 'rifle',
  ammo: 30,
  reserve: 90,
  coins: 0,
  position: new THREE.Vector3(0, 2, 0),
  onGround: false
};

// Estado del juego en memoria
const gameState = {
  player: null,
  lastSave: Date.now()
};

// Input handling
const keys = {};

// Cargar estado inicial
function loadGameState() {
  if (gameState.player) {
    Object.assign(player, gameState.player);
    if (gameState.player.position) {
      player.position.set(
        gameState.player.position.x,
        gameState.player.position.y,
        gameState.player.position.z
      );
    }
  }
}

// Inicialización principal
function init() {
  if (isInitialized) {
    console.warn('Game already initialized');
    return;
  }

  if (!gameCanvas) {
    console.error('Canvas element not found');
    return;
  }

  try {
    // Configurar escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 20, 200);

    // Configurar cámara
    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      500
    );
    camera.position.copy(player.position);

    // Configurar renderer
    renderer = new THREE.WebGLRenderer({ 
      canvas: gameCanvas, 
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Clock para delta time
    clock = new THREE.Clock();

    // Iluminación
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const sun = new THREE.DirectionalLight(0xffffff, 0.8);
    sun.position.set(100, 200, 100);
    sun.castShadow = true;
    sun.shadow.camera.left = -100;
    sun.shadow.camera.right = 100;
    sun.shadow.camera.top = 100;
    sun.shadow.camera.bottom = -100;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    scene.add(sun);

    // Generar mundo
    generateMap(scene);
    initAudio();
    spawnLoot(scene);

    // Configurar controles
    controls = new PointerLockControls(camera, document.body);

    // Click para activar pointer lock
    document.body.addEventListener('click', () => {
      if (controls && controls.lock) {
        controls.lock();
      }
    });

    // Input listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Cargar modelo del arma
    loadWeaponModel(player.weapon);

    // Ocultar pantalla de carga
    if (loadingScreen) {
      loadingScreen.style.display = 'none';
    }

    isInitialized = true;
    loadGameState();
    animate();

  } catch (error) {
    console.error('Error initializing game:', error);
  }
}

// Manejo de input
function handleKeyDown(e) {
  keys[e.code] = true;
}

function handleKeyUp(e) {
  keys[e.code] = false;
}

// Guardar estado del jugador
function savePlayer() {
  const now = Date.now();
  if (now - gameState.lastSave < 1000) return;
  
  gameState.player = {
    health: player.health,
    ammo: player.ammo,
    reserve: player.reserve,
    coins: player.coins,
    weapon: player.weapon,
    position: {
      x: player.position.x,
      y: player.position.y,
      z: player.position.z
    }
  };
  gameState.lastSave = now;
}

// Cargar modelo del arma
function loadWeaponModel(name) {
  const loader = new GLTFLoader();
  const modelUrl = `https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/models/gltf/Duck/glTFBinary/Duck.glb`;
  
  loader.load(
    modelUrl,
    (gltf) => {
      if (weaponModel) {
        camera.remove(weaponModel);
        weaponModel.traverse((child) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(m => m.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
      }
      
      weaponModel = gltf.scene;
      weaponModel.scale.set(0.1, 0.1, 0.1);
      weaponModel.position.set(0.3, -0.5, -1);
      weaponModel.rotation.y = Math.PI;
      camera.add(weaponModel);
    },
    undefined,
    (error) => {
      console.error('Error loading weapon model:', error);
    }
  );
}

// Movimiento del jugador
function handleMovement(dt) {
  if (!camera || !player) return;
  
  dt = Math.min(dt, 0.1);
  
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

  if (!player.onGround) {
    velocity.y += gravity * dt;
  }

  player.position.addScaledVector(velocity, dt);

  if (player.position.y <= 2) {
    player.position.y = 2;
    velocity.y = 0;
    player.onGround = true;
  }

  player.position.x = Math.max(-100, Math.min(100, player.position.x));
  player.position.z = Math.max(-100, Math.min(100, player.position.z));

  camera.position.copy(player.position);
}

// Loop principal
function animate() {
  if (!isInitialized) return;
  
  animationFrameId = requestAnimationFrame(animate);

  try {
    const dt = clock.getDelta();

    handleMovement(dt);
    updateAI(scene, player, dt);
    updateHUD(player);
    updateMinimap(player);
    updateLoot(player);
    updateZone(player, scene, dt);
    updateContracts(player);

    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }

    savePlayer();

  } catch (error) {
    console.error('Error in animation loop:', error);
  }
}

// ===================== CONTROLES PÚBLICOS =====================
window.shoot = function () {
  if (!clock || !weapons) return;
  
  const now = clock.getElapsedTime();
  const weaponData = weapons[player.weapon];
  
  if (!weaponData) return;
  
  const fireRate = weaponData.rate || 0.1;
  
  if (now - lastShot > fireRate && player.ammo > 0) {
    player.ammo--;
    lastShot = now;
    playSound('shoot');
    
    if (weaponModel) {
      weaponModel.rotation.x -= 0.1;
      setTimeout(() => {
        if (weaponModel) {
          weaponModel.rotation.x += 0.1;
        }
      }, 100);
    }
  }
};

window.reload = function () {
  if (!weapons) return;
  
  const weaponData = weapons[player.weapon];
  if (!weaponData) return;
  
  const need = weaponData.mag - player.ammo;
  if (need <= 0 || player.reserve <= 0) return;
  
  const take = Math.min(need, player.reserve);
  player.ammo += take;
  player.reserve -= take;
  playSound('reload');
};

window.throwGrenade = function () {
  playSound('grenade');
};

window.switchWeapon = function (name) {
  if (!weapons || !weapons[name]) return;
  
  if (player.weapon === name) return;
  
  player.weapon = name;
  const weaponData = weapons[name];
  player.ammo = weaponData.mag;
  player.reserve = weaponData.mag * 3;
  
  loadWeaponModel(name);
};

// Manejo de redimensionamiento
window.addEventListener('resize', () => {
  if (!camera || !renderer) return;
  
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Cleanup al cerrar
window.addEventListener('beforeunload', () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  
  if (controls) {
    controls.dispose();
  }
  
  if (renderer) {
    renderer.dispose();
  }
  
  savePlayer();
});

// Iniciar cuando cargue la página
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
