export function generateMap(scene, THREE) {
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
