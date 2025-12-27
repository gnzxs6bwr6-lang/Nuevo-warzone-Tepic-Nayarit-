export let contract = { type: 'none', target: null };

export function updateContracts(player) {
  const contractEl = document.getElementById('contract');
  if (!contractEl) return;
  
  if (contract.type !== 'none') {
    contractEl.innerText = `Contrato: ${contract.type}`;
  } else {
    contractEl.innerText = 'Sin contrato';
  }
}
