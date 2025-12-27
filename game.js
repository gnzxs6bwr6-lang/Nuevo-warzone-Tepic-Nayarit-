// Inicializar renderizador
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Crear escena
const scene = new THREE.Scene();

// Crear cámara
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

// Luz básica
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 1, 1).normalize();
scene.add(light);

// Suelo
const loader = new THREE.TextureLoader();
const grass = loader.load('https://threejs.org/examples/textures/grasslight-big.jpg');
grass.wrapS = grass.wrapT = THREE.RepeatWrapping;
grass.repeat.set(25, 25);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  new THREE.MeshPhongMaterial({ map: grass })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Jugador
const player = { hp: 100, mag: 30, reserve: 120 };

// Animación
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
