<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Tepic Resurgimiento</title>
<style>
* { margin: 0; padding: 0; }
body { overflow: hidden; background: #111; font-family: Arial; }
#gameCanvas { width: 100vw; height: 100vh; display: block; background: #87ceeb; }
#hud { position: absolute; top: 20px; left: 20px; color: white; font-size: 20px; z-index: 10; text-shadow: 2px 2px 4px #000; }
#hud div { margin-bottom: 10px; }
#controls { position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); display: flex; gap: 15px; }
#controls button { padding: 15px 25px; font-size: 18px; border: none; border-radius: 10px; background: #1e90ff; color: white; cursor: pointer; font-weight: bold; }
#controls button:hover { background: #4169e1; }
#loadingScreen { position: fixed; inset: 0; background: #000; color: white; display: flex; align-items: center; justify-content: center; font-size: 32px; z-index: 100; flex-direction: column; }
.loading-dot { font-size: 48px; animation: blink 1s infinite; }
@keyframes blink { 0%, 100% { opacity: 0; } 50% { opacity: 1; } }
</style>
</head>
<body>

<canvas id="gameCanvas"></canvas>

<div id="loadingScreen">
  <div>Cargando Tepic Ultra</div>
  <div class="loading-dot">...</div>
</div>

<div id="hud">
  <div id="health">❤️ Vida: 100</div>
  <div id="ammo">🔫 Ammo: 30/90</div>
  <div id="coins">💰 Monedas: 0</div>
</div>

<div id="controls">
  <button onclick="shootGame()">🔫 DISPARAR</button>
  <button onclick="reloadGame()">🔄 RECARGAR</button>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script>
// Variables del juego
var player = {
  health: 100,
  ammo: 30,
  reserve: 90,
  coins: 0,
  x: 0,
  y: 2,
  z: 5
};

var scene, camera, renderer, clock;
var lastShot = 0;
var keys = {};
var enemies = [];

// Actualizar HUD
function updateHUD() {
  document.getElementById('health').innerText = '❤️ Vida: ' + Math.floor(player.health);
  document.getElementById('ammo').innerText = '🔫 Ammo: ' + player.ammo + '/' + player.reserve;
  document.getElementById('coins').innerText = '💰 Monedas: ' + player.coins;
}

// Disparar
function shootGame() {
  if (!clock) return;
  var now = clock.getElapsedTime();
  if (now - lastShot > 0.3 && player.ammo > 0) {
    player.ammo--;
    lastShot = now;
    updateHUD();
    
    // Efecto visual
    flashScreen();
    checkHitEnemy();
  }
}

// Recargar
function reloadGame() {
  var need = 30 - player.ammo;
  var take = Math.min(need, player.reserve);
  player.ammo += take;
  player.reserve -= take;
  updateHUD();
}

// Flash al disparar
function flashScreen() {
  var canvas = document.getElementById('gameCanvas');
  canvas.style.filter = 'brightness(1.5)';
  setTimeout(function() {
    canvas.style.filter = 'brightness(1)';
  }, 50);
}

// Verificar impacto en enemigo
function checkHitEnemy() {
  for (var i = 0; i < enemies.length; i++) {
    var enemy = enemies[i];
    if (!enemy.dead) {
      var dx = camera.position.x - enemy.position.x;
      var dz = camera.position.z - enemy.position.z;
      var dist = Math.sqrt(dx*dx + dz*dz);
      
      // Si está mirando al enemigo y está cerca
      if (dist < 30) {
        enemy.health -= 25;
        if (enemy.health <= 0) {
          enemy.dead = true;
          enemy.mesh.visible = false;
          player.coins += 50;
          updateHUD();
        }
      }
    }
  }
}

// Crear enemigos
function createEnemies() {
  var geometry = new THREE.BoxGeometry(2, 3, 2);
  var material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
  
  for (var i = 0; i < 5; i++) {
    var mesh = new THREE.Mesh(geometry, material);
    var x = (Math.random() - 0.5) * 80;
    var z = (Math.random() - 0.5) * 80;
    mesh.position.set(x, 1.5, z);
    scene.add(mesh);
    
    enemies.push({
      mesh: mesh,
      position: mesh.position,
      health: 100,
      dead: false
    });
  }
}

// Inicializar juego
function init() {
  var canvas = document.getElementById('gameCanvas');
  
  // Crear escena
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);
  scene.fog = new THREE.Fog(0x87ceeb, 1, 150);

  // Crear cámara
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(player.x, player.y, player.z);

  // Crear renderer
  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(1); // Bajo para Xbox

  clock = new THREE.Clock();

  // Luces
  var ambient = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambient);
  
  var sun = new THREE.DirectionalLight(0xffffff, 0.5);
  sun.position.set(50, 100, 50);
  scene.add(sun);

  // Suelo
  var groundGeo = new THREE.PlaneGeometry(200, 200);
  var groundMat = new THREE.MeshPhongMaterial({ color: 0x228B22 });
  var ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // Obstáculos
  var boxGeo = new THREE.BoxGeometry(5, 5, 5);
  var boxMat = new THREE.MeshPhongMaterial({ color: 0x888888 });
  
  for (var i = 0; i < 8; i++) {
    var box = new THREE.Mesh(boxGeo, boxMat);
    box.position.set(
      (Math.random() - 0.5) * 80,
      2.5,
      (Math.random() - 0.5) * 80
    );
    scene.add(box);
  }

  // Crear enemigos
  createEnemies();

  // Controles
  document.addEventListener('keydown', function(e) { keys[e.code] = true; });
  document.addEventListener('keyup', function(e) { keys[e.code] = false; });

  // Gamepad (Xbox controller)
  window.addEventListener('gamepadconnected', function(e) {
    console.log('Gamepad conectado');
  });

  // Resize
  window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Ocultar loading
  var loading = document.getElementById('loadingScreen');
  setTimeout(function() {
    loading.style.display = 'none';
    animate();
  }, 1000);
}

// Loop de animación
function animate() {
  requestAnimationFrame(animate);
  
  var dt = Math.min(clock.getDelta(), 0.1);

  // Movimiento con teclado
  var speed = 10;
  if (keys['KeyW']) camera.position.z -= speed * dt;
  if (keys['KeyS']) camera.position.z += speed * dt;
  if (keys['KeyA']) camera.position.x -= speed * dt;
  if (keys['KeyD']) camera.position.x += speed * dt;
  
  // Disparar con espacio
  if (keys['Space']) shootGame();

  // Mantener altura
  camera.position.y = 2;

  // Límites del mapa
  camera.position.x = Math.max(-95, Math.min(95, camera.position.x));
  camera.position.z = Math.max(-95, Math.min(95, camera.position.z));

  // Animar enemigos vivos
  for (var i = 0; i < enemies.length; i++) {
    var enemy = enemies[i];
    if (!enemy.dead) {
      enemy.mesh.rotation.y += dt;
    }
  }

  // Renderizar
  renderer.render(scene, camera);
}

// Iniciar cuando cargue
window.onload = function() {
  setTimeout(init, 500);
};
</script>

</body>
</html>
