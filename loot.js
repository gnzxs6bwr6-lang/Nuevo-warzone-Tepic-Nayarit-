let lootList = [];

export function spawnLoot(scene) {
  lootList = [];
  for (let i = 0; i < 5; i++) {
    lootList.push({
      x: (Math.random() - 0.5) * 50,
      z: (Math.random() - 0.5) * 50,
      collected: false
    });
  }
}

export function updateLoot(player) {
  lootList.forEach(l => {
    if (!l.collected) {
      const dx = player.position.x - l.x;
      const dz = player.position.z - l.z;
      if (Math.sqrt(dx * dx + dz * dz) < 2) {
        l.collected = true;
        player.coins += 10;
        console.log('💰 Loot recogido +10 coins');
      }
    }
  });
}
