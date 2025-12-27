import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let scene, camera, renderer, clock, controls, lastShot = 0;
let velocity = new THREE.Vector3();
const gravity = -30;
let weaponModel = null;

const player = {
  health: 100,
  weapon: 'rifle',
  ammo: 30,
  reserve: 90,
  coins: 0,
  position: new THREE.Vector3(0, 2, 0),
  onGround: false
};

// Estado en memoria
const gameState = {};

// Cargar estado guardado
if (gameState.player) {
  Object.assign(player, gameState.player);
}

const keys = {};

function init() {
  const gameCanvas = document.getElementById('gameCanvas');
  const loadingScreen = document.getElementById('loadingScreen');
  
  if (!gameCanvas) {
    console.error('Canvas no encontrado');
    return;
  }

  try {
    // Escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 20, 200);

    // Cámara
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500);
    camera.position.copy(player.position);

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas: gameCanvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;

    clock = new THREE.Clock();

    // Luces
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const sun = new THREE.DirectionalLight(0xffffff, 0.8);
    sun.position.set(100, 200, 100);
    sun.castShadow = true;
    scene.add(sun);

    // Generar mundo
    generateMap(scene, THREE);
    initAudio();
    spawnLoot(scene);

    // Controles
    controls = new PointerLockControls(camera, document.body);
    document.body.addEventListener('click', () => {
      if (controls) controls.lock();
    });

    document.addEventListener('keydown', e => keys[e.code] = true);
    document.addEventListener('keyup', e => keys[e.code] = false);

    loadWeaponModel(player.weapon);

    // Ocultar loading
    if (loadingScreen) {
      loadingScreen.style.display = 'none';
    }

    animate();

  } catch (error) {
    console.error('Error al inicializar:', error);
  }
}

function savePlayer() {
  gameState.player = {
    health: player.health,
    ammo: player.ammo,
    reserve: player.reserve,
    coins: player.coins,
    weapon: player.weapon,
    position: { x: player.position.x, y: player.position.y, z: player.position.z }
  };
}

function loadWeaponModel(name) {
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
    },
    undefined,
    (error) => console.error('Error loading weapon:', error)
  );
}

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

function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();

  handleMovement(dt);
  updateAI(scene, player, dt, weapons, playSound);
  updateHUD(player);
  updateMinimap(player);
  updateLoot(player);
  updateZone(player, scene, dt);
  updateContracts(player);

  renderer.render(scene, camera);
  savePlayer();
}

// Controles
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

// Resize
window.addEventListener('resize', () => {
  if (camera && renderer) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
});

// Iniciar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
</script>

</body>
</html>
