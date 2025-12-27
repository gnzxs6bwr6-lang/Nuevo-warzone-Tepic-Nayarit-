let sounds={};

export function initAudio(){
  ['shoot','reload','grenade'].forEach(name=>{
    const audio=new Audio(`https://rawcdn.githack.com/KenneyNL/3D-Assets/main/${name}.mp3`);
    audio.load();
    sounds[name]=audio;
  });
}

export function playSound(name){
  if(sounds[name]){
    sounds[name].currentTime=0;
    sounds[name].play().catch(()=>{});
  }
}
