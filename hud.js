function updateHUD() {
  document.getElementById("hp").textContent = player.hp;
  document.getElementById("ammo").textContent = `${player.mag}/${player.reserve}`;
}

document.getElementById("shoot").onclick = () => {
  if (player.mag > 0) {
    player.mag--;
    updateHUD();
    shootSound.play();
  }
};

document.getElementById("reload").onclick = () => {
  const needed = 30 - player.mag;
  const refill = Math.min(needed, player.reserve);
  player.mag += refill;
  player.reserve -= refill;
  updateHUD();
  reloadSound.play();
};

document.getElementById("grenade").onclick = () => {
  alert("¡Granada lanzada!");
};

document.getElementById("openConfig").onclick = () => {
  document.getElementById("configHUD").style.display = "block";
};

document.getElementById("closeConfig").onclick = () => {
  document.getElementById("configHUD").style.display = "none";
};

document.getElementById("toggleVida").onchange = (e) => {
  document.getElementById("hudVida").style.display = e.target.checked ? "block" : "none";
};

document.getElementById("toggleAmmo").onchange = (e) => {
  document.getElementById("hudAmmo").style.display = e.target.checked ? "block" : "none";
};

updateHUD();
document.getElementById("loading").style.display = "none";
