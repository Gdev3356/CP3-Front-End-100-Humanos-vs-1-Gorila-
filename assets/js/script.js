let vidaGorila = 100;
let humanos = Array.from({ length: 100 }, () => ({ vivo: true }));
let defendendo = false;
const somAtaque = document.getElementById('som-ataque');
const somMataHumano = document.getElementById('som-mata-humano');

function atacar() {
  let atacados = 5;
  for (let i = 0; i < humanos.length && atacados > 0; i++) {
    if (humanos[i].vivo) {
      somMataHumano.currentTime = 0;
      somMataHumano.play();
      humanos[i].vivo = false;
      atacados--;
    }
  }

  logBatalha("O gorila atacou e eliminou até 5 humanos!");
  atualizarDOM();
  humanosAtacam();
}



function humanosAtacam() {
  const vivos = humanos.filter(h => h.vivo).length;
  if (vivos === 0) return;

  const dano = Math.floor(Math.random() * vivos * 0.2);
  const danoFinal = defendendo ? Math.floor(dano / 2) : dano;
  vidaGorila -= danoFinal;
  defendendo = false;
  somAtaque.currentTime = 0;
  somAtaque.play();

  logBatalha(`🧍‍♂️ ${vivos} humanos atacaram e causaram ${danoFinal} de dano!`);
  atualizarDOM();
}

function atualizarDOM() {
  document.getElementById('vida-gorila').textContent = Math.max(vidaGorila, 0);
  document.getElementById('humanos-restantes').textContent = humanos.filter(h => h.vivo).length;

  const container = document.getElementById('humanos');
  container.innerHTML = '';
  humanos.forEach(h => {
    const img = document.createElement('img');
    img.src = 'assets/humano.png';
    if (!h.vivo) img.classList.add('morto');
    container.appendChild(img);
  });
}

function logBatalha(mensagem) {
  const logDiv = document.getElementById('log-batalha');
  const p = document.createElement('p');
  p.textContent = mensagem;
  logDiv.prepend(p);
}


window.onload = () => {
  atualizarDOM();

  document.getElementById('btn-atacar').addEventListener('click', atacar);
};
