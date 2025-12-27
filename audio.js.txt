const audioCtx=new (window.AudioContext||window.webkitAudioContext)();
const listener=audioCtx.listener;
listener.setPosition(0,1.6,0);

async function playSpatial(url,pos,material="concrete"){
  const res=await fetch(url);
  const buf=await res.arrayBuffer();
  const audioBuffer=await audioCtx.decodeAudioData(buf);
  const source=audioCtx.createBufferSource();
  source.buffer=audioBuffer;
  const panner=audioCtx.createPanner();
  panner.panningModel='HRTF'; panner.distanceModel='linear';
  panner.setPosition(pos.x,pos.y,pos.z);

  let echoSize=0;
  if(material==="concrete") echoSize=1.5;
  if(material==="metal") echoSize=0.8;
  if(material==="wood") echoSize=0.5;

  if(echoSize>0){
    const convolver=audioCtx.createConvolver();
    const impulse=audioCtx.createBuffer(2,audioCtx.sampleRate*echoSize,audioCtx.sampleRate);
    for(let ch=0;ch<2;ch++){
      const data=impulse.getChannelData(ch);
      for(let i=0;i<data.length;i++){ data[i]=(Math.random()*2-1)*Math.exp(-3*i/data.length); }
    }
    convolver.buffer=impulse;
    source.connect(convolver).connect(panner).connect(audioCtx.destination);
  } else {
    source.connect(panner).connect(audioCtx.destination);
  }
  source.start();
}

const sDisparo="https://actions.google.com/sounds/v1/foley/punch.ogg";
const sExplosion="https://actions.google.com/sounds/v1/explosions/explosion.ogg";
const sGranada="https://actions.google.com/sounds/v1/explosions/fireworks_burst.ogg";
