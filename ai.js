import { player } from './Game.js';
import { weapons } from './items.js';
import { playSound } from './audio.js';

export let bots = [];

export function generateBots(scene){
  bots = [];
  for(let i = 0; i < 5; i++){
    let bot = {
      position: { x: (Math.random() - 0.5) * 50, y: 2, z: (Math.random() - 0.5) * 50 },
      health: 100,
      weapon: 'rifle',
      state: 'patrol',
      target: null,
      lastShot: 0
    };
    bots.push(bot);
  }
}

export function updateAI(scene, player, dt){
  if(bots.length === 0) generateBots(scene);
  bots.forEach((bot, i) => { // CORRECCIÓN: agregamos índice i
    if(bot.state === 'patrol'){
      bot.position.x += Math.sin(Date.now()/1000 + i) * dt * 2;
      bot.position.z += Math.cos(Date.now()/1000 + i) * dt * 2;

      let dx = player.position.x - bot.position.x;
      let dz = player.position.z - bot.position.z;
      let dist = Math.sqrt(dx*dx + dz*dz);
      if(dist < 15) bot.state = 'attack';
    }
    if(bot.state === 'attack'){
      let dx = player.position.x - bot.position.x;
      let dz = player.position.z - bot.position.z;
      let dist = Math.sqrt(dx*dx + dz*dz);
      if(dist > 20) bot.state = 'patrol';
      else if(Date.now()/1000 - bot.lastShot > weapons[bot.weapon].rate){
        player.health -= weapons[bot.weapon].damage;
        bot.lastShot = Date.now()/1000;
        playSound('shoot');
      }
    }
  });
}
