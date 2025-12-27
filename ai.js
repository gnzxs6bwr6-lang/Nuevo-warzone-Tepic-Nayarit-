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
