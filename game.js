import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/js/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/examples/js/loaders/GLTFLoader.js';
import { updateHUD } from './hud.js';
import { generateMap } from './map.js';
import { updateAI } from './ai.js';
import { weapons } from './items.js';
import { updateMinimap } from './minimap.js';
import { initAudio, playSound } from './audio.js';
import { spawnLoot, updateLoot } from './loot.js';
import { updateZone } from './zone.js';
import { updateContracts } from './contracts.js';

let scene, camera, renderer, clock, controls, lastShot = 0;
let velocity = new THREE.Vector3();
let gravity = -30;
let weaponModel;

export const player = {
  health: 100,
  weapon: 'rifle',
  ammo: 30,
  reserve: 90,
  coins: 0,
  position: new THREE.Vector3(0, 2, 0),
  onGround: false
};

// Carga persistencia
if(localStorage.getItem('player')){
  const saved = JSON.parse(localStorage.getItem('player'));
  Object.assign(player, saved);
  if(saved.position) player.position.set(saved.position.x, saved.position.y, saved.position.z);
}

const keys = {};

function init() {
  const loadingScreen = document.getElementById('loadingScreen'); // CORRECCIÓN

  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x87ceeb, 20, 200);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500);
  camera.position.copy(player.position);

  renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas'), antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  clock = new THREE.Clock();

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const sun = new THREE.DirectionalLight(0xffffff, 0.8);
  sun.position.set(100, 200, 100);
  scene.add(sun);

  generateMap(scene);
  initAudio();
  spawnLoot(scene);

  controls = new PointerLockControls(camera, document.body);
  document.body.addEventListener('click', () => controls.lock());

  document.addEventListener('keydown', e => keys[e.code] = true);
  document.addEventListener('keyup', e => keys[e.code] = false);

  loadWeaponModel(player.weapon);

  loadingScreen.style.display = 'none'; // CORRECCIÓN
  animate();
}

function savePlayer() {
  localStorage.setItem('player', JSON.stringify({
    health: player.health,
    ammo: player.ammo,
    reserve: player.reserve,
    coins: player.coins,
    weapon: player.weapon,
    position: { x: player.position.x, y: player.position.y, z: player.position.z } // CORRECCIÓN
  }));
}

function loadWeaponModel(name) {
  const loader = new GLTFLoader();
  const url = `https://rawcdn.githack.com/KenneyNL/3D-Assets/main/${name}.glb`;
  loader.load(
    url,
    gltf => {
      if(weaponModel) camera.remove(weaponModel);
      weaponModel = gltf.scene;
      weaponModel.position.set(0, -0.5, -1);
      camera.add(weaponModel);
    },
    undefined,
    err => console.error('Error cargando arma', err)
  );
}

function handleMovement(dt) {
  let speed = keys['ShiftLeft'] ? 10 : 5;
  let move = new THREE.Vector3();

  if(keys['KeyW']) move.z = -speed;
  if(keys['KeyS']) move.z = speed;
  if(keys['KeyA']) move.x = -speed;
  if(keys['KeyD']) move.x = speed;

  move.applyEuler(camera.rotation);
  velocity.x = move.x;
  velocity.z = move.z;

  if(player.onGround && keys['Space']){
    velocity.y = 15;
    player.onGround = false;
  }

  velocity.y += gravity * dt;
  player.position.addScaledVector(velocity, dt);

  if(player.position.y < 2){
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
  updateAI(scene, player, dt);
  updateHUD(player);
  updateMinimap(player);
  updateLoot(player);
  updateZone(player, scene, dt);
  updateContracts(player);

  renderer.render(scene, camera);
  savePlayer();
}

// Controles globales
window.shoot = function() {
  const now = clock.getElapsedTime();
  if(now - lastShot > weapons[player.weapon].rate && player.ammo > 0){
    player.ammo--;
    lastShot = now;
    playSound('shoot');
    if(weaponModel) weaponModel.rotation.x -= 0.1;
    setTimeout(() => { if(weaponModel) weaponModel.rotation.x += 0.1; }, 50);
  }
}

window.reload = function() {
  let need = weapons[player.weapon].mag - player.ammo;
  let take = Math.min(need, player.reserve);
  player.ammo += take;
  player.reserve -= take;
  playSound('reload');
}

window.throwGrenade = function() {
  playSound('grenade');
}

window.switchWeapon = function(name) {
  if(weapons[name]){
    player.weapon = name;
    loadWeaponModel(name);
  }
}

window.onload = init;
