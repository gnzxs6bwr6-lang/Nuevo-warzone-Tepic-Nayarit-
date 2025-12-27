let sounds = {};

export function initAudio() {
  // Audio context para navegadores modernos
  sounds.shoot = { play: () => console.log('🔫 shoot') };
  sounds.reload = { play: () => console.log('🔄 reload') };
  sounds.grenade = { play: () => console.log('💣 grenade') };
}

export function playSound(name) {
  if (sounds[name]) {
    sounds[name].play();
  }
}
