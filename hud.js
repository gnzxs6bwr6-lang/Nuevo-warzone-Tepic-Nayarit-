function updateHUD(player){
  document.getElementById('hp').textContent=player.hp;
  document.getElementById('ammo').textContent=`${player.mag}/${player.reserve}`;
}

// Drag HUD con guardado
function makeDraggable(el){
  let offsetX,offsetY,dragging=false;
  el.addEventListener('mousedown',e=>{dragging=true;offsetX=e.offsetX;offsetY=e.offsetY;});
  document.addEventListener('mousemove',e=>{
    if(dragging){
      el.style.left=(e.pageX-offsetX)+'px';
      el.style.top=(e.pageY-offsetY)+'px';
      saveHUDPositions();
    }
  });
  document.addEventListener('mouseup',()=>{dragging=false;});
}

// Guardar posiciones en localStorage
function saveHUDPositions(){
  const hudData={
    vida:{left:document.getElementById('hudVida').style.left,top:document.getElementById('hudVida').style.top},
    ammo:{left:document.getElementById('hudAmmo').style.left,top:document.getElementById('hudAmmo').style.top}
  };
  localStorage.setItem('hudConfig',JSON.stringify(hudData));
}

// Cargar posiciones
function loadHUDPositions(){
  const hudData=JSON.parse(localStorage.getItem('hudConfig'));
  if(hudData){
    document.getElementById('hudVida').style.left=hudData.vida.left;
    document.getElementById('hudVida').style.top=hudData.vida.top;
    document.getElementById('hudAmmo').style.left=hudData.ammo.left;
    document.getElementById('hudAmmo').style.top=hudData.ammo.top;
  }
}

// Configuración HUD persistente
function applyHUDConfig(){
  const showVida=document.getElementById('toggleVida').checked;
  const showAmmo=document.getElementById('toggleAmmo').checked;
  document.getElementById('hudVida').style.display=showVida?'block':'none';
  document.getElementById('hudAmmo').style.display=showAmmo?'block':'none';
  localStorage.setItem('hudVisibility',JSON.stringify({vida:showVida,ammo:showAmmo}));
}

function loadHUDConfig(){
  const vis=JSON.parse(localStorage.getItem('hudVisibility'));
  if(vis){
    document.getElementById('toggleVida').checked=vis.vida;
    document.getElementById('toggleAmmo').checked=vis.ammo;
    applyHUDConfig();
  }
}

// Inicialización
['hudVida','hudAmmo'].forEach(id=>makeDraggable(document.getElementById(id)));
loadHUDPositions();
loadHUDConfig();

// Eventos
document.getElementById('toggleVida').onchange=applyHUDConfig;
document.getElementById('toggleAmmo').onchange=applyHUDConfig;
document.getElementById('openConfig').onclick=()=>{document.getElementById('configHUD').style.display='block';};
document.getElementById('closeConfig').onclick=()=>{document.getElementById('configHUD').style.display='none';};
