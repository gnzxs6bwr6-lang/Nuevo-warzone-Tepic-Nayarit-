export let contract={type:'none',target:null};

export function updateContracts(player){
  if(contract.type!=='none'){
    document.getElementById('contract').innerText=`Contrato: ${contract.type}`;
  } else document.getElementById('contract').innerText='Sin contrato';
}
