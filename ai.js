export let bots = [];

export function generateBots(scene) {
  bots = [];
  for (let i = 0; i < 5; i++) {
    bots.push({
      position: { x: (Math.random() - 0.5) * 50, y: 2, z: (Math.random() - 0.5) * 50 },
      health: 100,
      weapon: 'rifle',
      state: 'patrol',
      target: null,
      lastShot: 0,
      index: i
    });
  }
}

export function updateAI(scene, player, dt, weapons, playSound) {
  if (bots.length === 0) generateBots(scene);
  
  bots.forEach(bot => {
    if (bot.state === 'patrol') {
      bot.position.x += Math.sin(Date.now() / 1000 + bot.index) * dt * 2;
      bot.position.z += Math.cos(Date.now() / 1000 + bot.index) * dt * 2;
      
      const dx = player.position.x - bot.position.x;
      const dz = player.position.z - bot.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      
      if (dist < 15) bot.state = 'attack';
    }
    
    if (bot.state === 'attack') {
      const dx = player.position.x - bot.position.x;
      const dz = player.position.z - bot.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      
      if (dist > 20) {
        bot.state = 'patrol';
      } else if (Date.now() / 1000 - bot.lastShot > weapons[bot.weapon].rate) {
        player.health -= weapons[bot.weapon].damage;
        bot.lastShot = Date.now() / 1000;
        playSound('shoot');
      }
    }
  });
}
