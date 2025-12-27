const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xa0a0a0, 10, 100);
scene.background = new THREE.Color(0xbfd1e5);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);

const ambient = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambient);

const light = new THREE.DirectionalLight(0xffffff, 0.8);
light.position.set(10, 20, 10);
scene.add(light);

const loader = new THREE.TextureLoader();
const grass = loader.load('https://cdn.pixabay.com/photo/2017/01/06/19/15/grass-1957402_1280.jpg');
grass.wrapS = grass.wrapT = THREE.RepeatWrapping;
grass.repeat.set(50, 50);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshLambertMaterial({ map: grass })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

const player = { hp: 100, mag: 30, reserve: 120 };

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
