let vidaGorila = 100;
let humanos = Array.from({ length: 100 }, () => ({ vivo: true }));
let defendendo = false;
let ataqueAutomatico;
let curasRestantes = 4;
const somAtaque = document.getElementById('som-ataque');
const somMataHumano = document.getElementById('som-mata-humano');
const somCura = document.getElementById('som-cura');

function atacar() {
  somMataHumano.currentTime = 0;
  somMataHumano.play();

  const gorila = document.getElementById('gorila');
  gorila.classList.add('ataque-gorila');
  setTimeout(() => gorila.classList.remove('ataque-gorila'), 400);

  let mortos = 0;
  let esquivaram = 0;
  const vivos = humanos.filter(h => h.vivo);
  const chanceBase = 0.3;
  const chanceEsquiva = chanceBase * (vivos.length / 100);

  vivos.forEach(h => {
    if (Math.random() < chanceEsquiva) {
      esquivaram++;
      return;
    }
    h.vivo = false;
    mortos++;
  });

  logBatalha(`O gorila atacou! ${mortos} humanos foram eliminados. ${esquivaram} esquivaram!`);
  atualizarDOM();
  verificarFimDeJogo();
}

function defender() {
  defendendo = true;
  logBatalha("O gorila está se defendendo e receberá menos dano no próximo turno!");
}

function curar() {
  if (curasRestantes <= 0) {
    logBatalha("O gorila não possui mais bananas!");
    return;
  }
  somCura.currentTime = 0;
  somCura.play();
  const cura = Math.floor(Math.random() * 15) + 5;
  vidaGorila = Math.min(vidaGorila + cura, 100);
  curasRestantes--;

  logBatalha(`O gorila se curou em ${cura} pontos de vida. (${curasRestantes} bananas restantes)`);
  atualizarDOM();
}

function humanosAtacam() {
  const vivos = humanos.filter(h => h.vivo).length;
  if (vivos === 0) return;

  const variacao = Math.random() * 0.2 + 0.9;
  const danoBase = vivos * 0.3;
  const danoComVariacao = Math.round(danoBase * variacao);
  const danoFinal = defendendo ? Math.floor(danoComVariacao / 2) : danoComVariacao;
  vidaGorila -= danoFinal;
  defendendo = false;
  somAtaque.currentTime = 0;
  somAtaque.play();

  logBatalha(`${vivos} humanos atacaram e causaram ${danoFinal} de dano!`);
  atualizarDOM();
  verificarFimDeJogo();
}

function iniciarAtaqueAutomatico() {
  ataqueAutomatico = setInterval(() => {
    if (vidaGorila > 0 && humanos.some(h => h.vivo)) {
      humanosAtacam();
    } else {
      clearInterval(attaqueAutomatico);
    }
  }, 5000);
}

function atualizarDOM() {
  document.getElementById('vida-gorila').textContent = Math.max(vidaGorila, 0);
  document.getElementById('humanos-restantes').textContent = humanos.filter(h => h.vivo).length;
  document.getElementById('curas-restantes').textContent = curasRestantes;

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

function desativarBotoes() {
  document.getElementById('btn-atacar').disabled = true;
  document.getElementById('btn-defender').disabled = true;
  document.getElementById('btn-curar').disabled = true;
}

function verificarFimDeJogo() {
  const vivos = humanos.filter(h => h.vivo).length;

  if (vidaGorila <= 0) {
    logBatalha("O gorila foi derrotado!");
    alert("Fim de jogo: os humanos venceram!");
    desativarBotoes();
    clearInterval(ataqueAutomatico);
  } else if (vivos === 0) {
    logBatalha("O gorila eliminou todos os humanos!");
    alert("Fim de jogo: o gorila venceu!");
    desativarBotoes();
    clearInterval(ataqueAutomatico);
  }
}

window.onload = () => {
  atualizarDOM();

  document.getElementById('btn-atacar').addEventListener('click', atacar);
  document.getElementById('btn-defender').addEventListener('click', defender);
  document.getElementById('btn-curar').addEventListener('click', curar);

  iniciarAtaqueAutomatico();
};
