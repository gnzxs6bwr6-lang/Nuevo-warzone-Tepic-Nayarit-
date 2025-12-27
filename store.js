import { player } from './Game.js';

export const storeItems=[
  {name:'ammoPack',cost:50,action:player=>{
    player.reserve+=30;
  }},
  {name:'medkit',cost:100,action:player=>{
    player.health=Math.min(100,player.health+50);
  }}
];

export function buyItem(index){
  const item=storeItems[index];
  if(item && player.coins>=item.cost){
    player.coins-=item.cost;
    item.action(player);
  }
}
