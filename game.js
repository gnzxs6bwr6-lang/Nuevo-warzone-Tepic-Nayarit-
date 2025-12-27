function init() {
  const loadingScreen = document.getElementById('loadingScreen');

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

  // Carga del arma con manejo de errores
  loadWeaponModel(player.weapon, loadingScreen);

  // Asegurarse de que la pantalla de carga desaparezca aunque falle la carga
  setTimeout(() => {
    if (loadingScreen) loadingScreen.style.display = 'none';
  }, 5000); // 5 segundos máximo

  animate();
}

function loadWeaponModel(name, loadingScreen) {
  const loader = new GLTFLoader();
  loader.load(
    `https://rawcdn.githack.com/KenneyNL/3D-Assets/main/${name}.glb`,
    gltf => {
      if (weaponModel) camera.remove(weaponModel);
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

// Guardado periódico en lugar de cada frame
setInterval(savePlayer, 5000);
