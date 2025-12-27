const canvas=document.getElementById('view');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
renderer.setSize(window.innerWidth,window.innerHeight);
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x0f1218);
const camera=new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,600);
camera.position.set(0,1.6,5);
scene.add(new THREE.HemisphereLight(0xffffff,0x444444,0.8));
const sun=new THREE.DirectionalLight(0xffffff,0.6); sun.position.set(10,20,10); scene.add(sun);

const loader=new THREE.TextureLoader();
const grass=loader.load('https://threejsfundamentals.org/threejs/resources/images/grass.jpg');
grass.wrapS=grass.wrapT=THREE.RepeatWrapping; grass.repeat.set(40,40);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(400,400),new THREE.MeshStandardMaterial({map:grass}));
ground.rotation.x=-Math.PI/2; scene.add(ground);

const player={hp:100,mag:30,reserve:120,pos:new THREE.Vector3(0,1.6,5)};
updateHUD(player);

document.getElementById('shoot').onclick=()=>{
  if(player.mag>0){
    player.mag--; updateHUD(player);
    playSpatial(sDisparo,{x:camera.position.x,y:camera.position.y,z:camera.position.z},"concrete");
  }
};

document.getElementById('reload').onclick=()=>{
  if(player.reserve>0){
    const need=30-player.mag; const take=Math.min(need
