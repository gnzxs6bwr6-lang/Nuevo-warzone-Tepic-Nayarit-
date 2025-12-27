export function updateHUD(player) {
  const healthEl = document.getElementById('health');
  const ammoEl = document.getElementById('ammo');
  const coinsEl = document.getElementById('coins');
  
  if (healthEl) healthEl.innerText = 'Vida: ' + Math.floor(player.health);
  if (ammoEl) ammoEl.innerText = `Ammo: ${player.ammo}/${player.reserve}`;
  if (coinsEl) coinsEl.innerText = 'Monedas: ' + player.coins;
}
