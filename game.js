// Variables globales
let scene, camera, renderer, clock;
let controls;
let weaponModel;
let keys = {};

// Inicializamos el jugador antes de todo
const player = {
  position: new THREE.Vector3(0, 1.8, 0),
  weapon: 'pistol' // Cambia por el arma que quieras
};

function init() {
  const loadingScreen = document.getElementById('loadingScreen');

  try {
    // Crear la escena
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x87ceeb, 20, 200);

    // Configurar cámara
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500);
    camera.position.copy(player.position);

    // Configurar renderer
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas'), antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Reloj para animaciones
    clock = new THREE.Clock();

    // Luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const sun = new THREE.DirectionalLight(0xffffff, 0.8);
    sun.position.set(100, 200, 100);
    scene.add(sun);

    // Generar mapa y loot
    generateMap(scene);
    spawnLoot(scene);
    initAudio();

    // Controles
    controls = new PointerLockControls(camera, document.body);
    document.body.addEventListener('click', () => controls.lock());

    // Teclado
    document.addEventListener('keydown', e => keys[e.code] = true);
    document.addEventListener('keyup', e => keys[e.code] = false);

    // Cargar arma
    loadWeaponModel(player.weapon, loadingScreen);

    // Garantizar que la pantalla de carga desaparezca
    setTimeout(() => {
      if (loadingScreen) loadingScreen.style.display = 'none';
    }, 7000); // 7 segundos máximo

    // Iniciar animación
    animate();
  } catch (e) {
    console.error('Error en init:', e);
    if (loadingScreen) loadingScreen.style.display = 'none';
  }
}

function loadWeaponModel(name, loadingScreen) {
  const loader = new THREE.GLTFLoader();
  loader.load(
    `https://rawcdn.githack.com/KenneyNL/3D-Assets/main/${name}.glb`,
    gltf => {
      // Remover arma anterior si existe
      if (weaponModel) camera.remove(weaponModel);

      // Agregar nuevo modelo
      weaponModel = gltf.scene;
      weaponModel.position.set(0, -0.5, -1);
      camera.add(weaponModel);

      if (loadingScreen) loadingScreen.style.display = 'none';
      console.log('Arma cargada correctamente:', name);
    },
    undefined,
    error => {
      console.error('Error cargando el arma:', error);
      if (loadingScreen) loadingScreen.style.display = 'none';
    }
  );
}

// Guardado periódico
setInterval(savePlayer, 5000);

// Animación básica
function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  if (controls) controls.update(delta);

  renderer.render(scene, camera);
}
