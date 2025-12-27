export let zone={radius:50,center:{x:0,z:0}};

export function updateZone(player,scene,dt){
  const dx=player.position.x-zone.center.x;
  const dz=player.position.z-zone.center.z;
  const dist=Math.sqrt(dx*dx+dz*dz);
  if(dist>zone.radius) player.health-=10*dt;
}
