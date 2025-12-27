export function updateHUD(player){
  document.getElementById('health').innerText='Vida: '+Math.floor(player.health);
  document.getElementById('ammo').innerText=`Ammo: ${player.ammo}/${player.reserve}`;
  document.getElementById('coins').innerText='Monedas: '+player.coins;
