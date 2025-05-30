let vidaGorila = 100;
let humanos = Array.from({ length: 100 }, () => ({ vivo: true, armado: false }));
let defendendo = false;
let ataqueAutomatico;
let descansando = null;
let descansandoAtivo = false;
let jogoEncerrado = false;
let curasRestantes = 4;
let energiaGorila = 120;
const somAtaque = document.getElementById('som-ataque');
const somMataHumano = document.getElementById('som-mata-humano');
const somCura = document.getElementById('som-cura');
const somCriarArma = document.getElementById('som-criar-arma');

function atacar() {
  if (energiaGorila < 10) {
    logBatalha("O gorila está cansado demais para atacar!");
    return;
  }
  energiaGorila -= 10;

  const gorila = document.getElementById('gorila');
  gorila.classList.add('ataque-gorila');
  setTimeout(() => gorila.classList.remove('ataque-gorila'), 400);

  let mortos = 0;
  let esquivaram = 0;
  const maxAlvos = 10;
  const vivos = humanos.filter(h => h.vivo);
  const chanceBase = 0.9;
  const chanceEsquiva = chanceBase * (vivos.length / 100);
  const alvosSelecionados = shuffleArray(vivos).slice(0, maxAlvos);

  alvosSelecionados.forEach(h => {
    if (Math.random() < chanceEsquiva) {
      esquivaram++;
    } else {
      h.vivo = false;
      mortos++;
      somMataHumano.currentTime = 0;
      somMataHumano.play();
    }
  });

  function shuffleArray(array) {
    const copia = [...array];
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
  }


  if (descansandoAtivo) {
    clearInterval(descansando);
    descansandoAtivo = false;
  }

  logBatalha(`O gorila atacou! ${mortos} humanos foram eliminados. ${esquivaram} esquivaram!`);
  atualizarDOM();
  salvarEstado();
  verificarFimDeJogo();

  bloquearAcoes(900);
}

function defender() {
  if (energiaGorila < 5) {
    logBatalha("O gorila está cansado demais para defender!");
    return;
  }
  energiaGorila -=5;
  defendendo = true;
  logBatalha("O gorila está se defendendo e receberá menos dano no próximo turno!");

  if (descansandoAtivo) {
    clearInterval(descansando);
    descansandoAtivo = false;
  }

  bloquearAcoes(900);
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
  energiaGorila = Math.min(energiaGorila + cura, 120);
  curasRestantes--;

  logBatalha(`O gorila se curou em ${cura} pontos de vida. (${curasRestantes} bananas restantes)`);
  salvarEstado();
  atualizarDOM();

  bloquearAcoes(900);
}

function tentarCriarArmas() {
  const humanosNaoArmados = humanos.filter(h => h.vivo && !h.armado);
  const vivos = humanos.filter(h => h.vivo).length;

  const chanceCriarArma = 1 - (vivos / 100);
  humanosNaoArmados.forEach(h => {
    if (Math.random() < chanceCriarArma * 0.1) {
      h.armado = true;
      somCriarArma.currentTime = 0;
      somCriarArma.play();
      logBatalha("Um humano improvisou uma arma!");
    }
  });
}

function humanosAtacam() {
  const atacantes = humanos.filter(h => h.vivo);
  if (atacantes.length === 0) return;

  tentarCriarArmas();

  let danoTotal = 0;

  atacantes.forEach(h => {
    const base = h.armado ? 0.6 : 0.3;
    const variacao = Math.random() * 0.2 + 0.9;
    danoTotal += base * variacao;
  });

  const danoFinal = defendendo ? Math.floor(danoTotal / 2) : Math.round(danoTotal);
  vidaGorila -= danoFinal;
  defendendo = false;
  somAtaque.currentTime = 0;
  somAtaque.play();

  logBatalha(`${atacantes.length} humanos atacaram e causaram ${danoFinal} de dano!`);
  atualizarDOM();
  salvarEstado();
  verificarFimDeJogo();
}

function iniciarAtaqueAutomatico() {
  function ataqueComDelay() {
    if (vidaGorila > 0 && humanos.some(h => h.vivo)) {
      humanosAtacam();

      const delay = 4000 + Math.random() * 5000;
      ataqueAutomatico = setTimeout(ataqueComDelay, delay);
    } else {
      clearTimeout(ataqueAutomatico);
    }
  }

  const delayInicial = 4000 + Math.random() * 5000; 
  ataqueAutomatico = setTimeout(ataqueComDelay, delayInicial);
}


function atualizarDOM() {
  const vivos = humanos.filter(h => h.vivo).length;

  document.getElementById('vida-gorila').textContent = Math.max(vidaGorila, 0);
  document.getElementById('energia-gorila').textContent = energiaGorila;
  document.getElementById('curas-restantes').textContent = curasRestantes;
  document.getElementById('humanos-restantes').textContent = vivos;

  document.getElementById('barra-vida').style.width = `${vidaGorila}%`;
  document.getElementById('barra-energia').style.width = `${(energiaGorila / 120) * 100}%`;
  document.getElementById('barra-humanos').style.width = `${vivos}%`;

  const container = document.getElementById('humanos');
  container.innerHTML = '';
  humanos.forEach(h => {
    const img = document.createElement('img');
    img.src = h.armado ? 'assets/humano-armado.png' : 'assets/humano.png';
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
  document.getElementById('btn-reiniciar').style.display = 'block';
}

function salvarEstado() {
  localStorage.setItem('vidaGorila', vidaGorila);
  localStorage.setItem('humanos', JSON.stringify(humanos));
  localStorage.setItem('curasRestantes', curasRestantes);
  localStorage.setItem('energiaGorila', energiaGorila);
}

function carregarEstado() {
  const vida = localStorage.getItem('vidaGorila');
  const dados = localStorage.getItem('humanos');
  const curas = localStorage.getItem('curasRestantes');
  const energia = localStorage.getItem('energiaGorila');

  if (vida && dados && curas && energia) {
    vidaGorila = parseInt(vida);
    humanos = JSON.parse(dados);
    curasRestantes = parseInt(curas);
    energiaGorila = parseInt(energia);
  }
}

function verificarFimDeJogo() {
  const vivos = humanos.filter(h => h.vivo).length;
  
  if (vidaGorila <= 0) {
    logBatalha("O gorila foi derrotado!");
    alert("Fim de jogo: os humanos venceram!");
    desativarBotoes();
    clearInterval(ataqueAutomatico);
    clearInterval(descansando);
    descansandoAtivo = false;
    jogoEncerrado = true;
    if (window.musicaAtiva) {
      window.musicaAtiva.pause();
      window.musicaAtiva.currentTime = 0;
    }
  } else if (vivos === 0) {
    logBatalha("O gorila eliminou todos os humanos!");
    alert("Fim de jogo: o gorila venceu!");
    desativarBotoes();
    clearInterval(ataqueAutomatico);
    clearInterval(descansando);
    descansandoAtivo = false;
    jogoEncerrado = true;
    if (window.musicaAtiva) {
      window.musicaAtiva.pause();
      window.musicaAtiva.currentTime = 0;
    }
  } else if (!descansandoAtivo) {
    descansar();
  }
}

function descansar() {
  if (descansandoAtivo || vidaGorila <= 0 || !humanos.some(h => h.vivo)) return;

  descansandoAtivo = true;
  logBatalha("O gorila está descansando para recuperar energia...");

  descansando = setInterval(() => {
    if (vidaGorila <= 0 || !humanos.some(h => h.vivo)) {
      clearInterval(descansando);
      descansandoAtivo = false;
      return;
    }

    const recuperado = Math.min(120 - energiaGorila, 15);
    energiaGorila += recuperado;
    energiaGorila = Math.min(energiaGorila, 120); 
    logBatalha(`O gorila recuperou ${recuperado} de energia.`);
    atualizarDOM();

    if (energiaGorila >= 120) {
      clearInterval(descansando);
      descansandoAtivo = false;
      logBatalha("Energia do gorila está cheia. Descanso encerrado.");
    }
  }, 3500);
}

function reiniciarJogo() {
  vidaGorila = 100;
  curasRestantes = 4;
  energiaGorila = 120;
  defendendo = false;
  jogoEncerrado = false

  humanos = Array.from({ length: 100 }, () => ({ vivo: true, armado: false }));

  salvarEstado();
  atualizarDOM();
  document.getElementById('log-batalha').innerHTML = '';
  document.getElementById('btn-reiniciar').style.display = 'none';
  document.getElementById('btn-atacar').disabled = false;
  document.getElementById('btn-defender').disabled = false;
  document.getElementById('btn-curar').disabled = false;

  clearInterval(ataqueAutomatico);
  iniciarAtaqueAutomatico();
  if (window.musicaAtiva) {
    window.musicaAtiva.currentTime = 0;
    window.musicaAtiva.play();
  }
}

function bloquearAcoes(tempoMs) {
  const botoes = [
    document.getElementById('btn-atacar'),
    document.getElementById('btn-defender'),
    document.getElementById('btn-curar'),
  ];
  botoes.forEach(botao => botao.disabled = true);
  
  setTimeout(() => {
    if (podeAtivarBotoes()) {
      botoes.forEach(botao => botao.disabled = false);
    }
  }, tempoMs);
}

function podeAtivarBotoes() {
  return !jogoEncerrado && vidaGorila > 0 && humanos.some(h => h.vivo);
}

window.onload = () => {
  carregarEstado();
  atualizarDOM();
  verificarFimDeJogo();

  document.getElementById('btn-atacar').addEventListener('click', atacar);
  document.getElementById('btn-defender').addEventListener('click', defender);
  document.getElementById('btn-curar').addEventListener('click', curar);
  document.getElementById('btn-reiniciar').addEventListener('click', reiniciarJogo);

  iniciarAtaqueAutomatico();
  if (!jogoEncerrado) descansar();

  const musicaPrincipal = document.getElementById('musica-fundo');
  const musicaAlt = document.getElementById('musica-fundo-alt');

  const tocarAlternativa = Math.random() < 0.2;
  const musicaEscolhida = tocarAlternativa ? musicaAlt : musicaPrincipal;

  musicaEscolhida.volume = 0.5;
  musicaEscolhida.play().catch(e => {
    console.log("Interação do usuário necessária para iniciar o áudio:", e);
  });

  window.musicaAtiva = musicaEscolhida;
};
