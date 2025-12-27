export function updateMinimap(player) {
  const mini = document.getElementById('minimap');
  if (!mini) return;
  
  const x = 75 + (player.position.x / 2);
  const z = 75 + (player.position.z / 2);
  
  mini.innerHTML = `<div style="position:absolute;left:${x}px;top:${z}px;width:5px;height:5px;background:red;border-radius:50%;"></div>`;
}
