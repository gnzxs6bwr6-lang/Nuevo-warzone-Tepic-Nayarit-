import { player } from './Game.js';

export function updateMinimap(player){
  const mini=document.getElementById('minimap');
  mini.innerHTML=`<div style="position:absolute;left:${75+player.position.x/2}px;top:${75+player.position.z/2}px;width:5px;height:5px;background:red;"></div>`;
}
