const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const mensagemEl = document.getElementById("message");
const restartBtn = document.getElementById("restartBtn");

// 1. VARIÁVEIS DO JOGO
let pontos = 0;
let vidas = 3;
let gameOver = false;
let vitoria = false;
const gravidade = 0.6; // Puxa o jogador para baixo

// 2. CONTROLES DO TECLADO
const teclas = {};
window.addEventListener("keydown", (e) => teclas[e.code] = true);
window.addEventListener("keyup", (e) => teclas[e.code] = false);

// 3. O PERSONAGEM PRINCIPAL
const jogador = {
    x: 50, y: 300, largura: 30, altura: 30,
    velX: 0, velY: 0,
    velocidade: 5, forcaPulo: -12,
    noChao: false, cor: "#2980b9" // Azul
};

// 4. CENÁRIO: PLATAFORMAS, MOEDAS E INIMIGOS
const plataformas = [
    { x: 0, y: 380, largura: 800, altura: 20 }, // Chão principal
    { x: 150, y: 300, largura: 100, altura: 10 },
    { x: 350, y: 220, largura: 100, altura: 10 },
    { x: 550, y: 140, largura: 100, altura: 10 }
];

let moedas = [
    { x: 190, y: 270, raio: 10, coletada: false },
    { x: 390, y: 190, raio: 10, coletada: false },
    { x: 590, y: 110, raio: 10, coletada: false }
];

const inimigos = [
    // Move-se de um lado para o outro
    { x: 350, y: 350, largura: 30, altura: 30, velocidade: 2, direcao: 1, minX: 250, maxX: 500 }
];

// 5. LÓGICA DO JOGO (Atualiza posições e colisões)
function atualizar() {
    if (gameOver || vitoria) return;

    // Movimentação Horizontal (Setas ou WASD)
    if (teclas["ArrowLeft"] || teclas["KeyA"]) { jogador.velX = -jogador.velocidade; } 
    else if (teclas["ArrowRight"] || teclas["KeyD"]) { jogador.velX = jogador.velocidade; } 
    else { jogador.velX = 0; }

    // Pulo (Espaço, Seta pra Cima ou W)
    if ((teclas["Space"] || teclas["ArrowUp"] || teclas["KeyW"]) && jogador.noChao) {
        jogador.velY = jogador.forcaPulo;
        jogador.noChao = false;
    }

    // Aplica gravidade e move o personagem
    jogador.velY += gravidade;
    jogador.x += jogador.velX;
    jogador.y += jogador.velY;

    // Limites da tela lateralmente
    if (jogador.x < 0) jogador.x = 0;
    if (jogador.x + jogador.largura > canvas.width) jogador.x = canvas.width - jogador.largura;
    
    // Se cair no buraco do fundo da tela
    if (jogador.y > canvas.height) { perderVida(); }

    // Colisão com Plataformas
    jogador.noChao = false;
    plataformas.forEach(plat => {
        if (jogador.x < plat.x + plat.largura &&
            jogador.x + jogador.largura > plat.x &&
            jogador.y + jogador.altura >= plat.y &&
            jogador.y + jogador.altura <= plat.y + jogador.velY + 2) {
            jogador.noChao = true;
            jogador.y = plat.y - jogador.altura;
            jogador.velY = 0;
        }
    });

    // Colisão com moedas
    moedas.forEach(moeda => {
        if (!moeda.coletada) {
            if (jogador.x < moeda.x + moeda.raio && jogador.x + jogador.largura > moeda.x - moeda.raio &&
                jogador.y < moeda.y + moeda.raio && jogador.y + jogador.altura > moeda.y - moeda.raio) {
                moeda.coletada = true;
                pontos += 10;
            }
        }
    });

    // Colisão e movimento dos inimigos
    inimigos.forEach(inimigo => {
        inimigo.x += inimigo.velocidade * inimigo.direcao;
        if (inimigo.x <= inimigo.minX || inimigo.x + inimigo.largura >= inimigo.maxX) {
            inimigo.direcao *= -1;
        }
        if (jogador.x < inimigo.x + inimigo.largura && jogador.x + jogador.largura > inimigo.x &&
            jogador.y < inimigo.y + inimigo.altura && jogador.y + jogador.altura > inimigo.y) {
            perderVida();
        }
    });
}

// 6. FUNÇÕES DE VIDA E REINICIAR
function perderVida() {
    vidas--;
    if (vidas <= 0) {
        gameOver = true;
        mensagemEl.innerText = "Fim de Jogo!";
        restartBtn.style.display = "block";
    } else {
        // Volta pro começo se ainda tem vida
        jogador.x = 50;
        jogador.y = 300;
        jogador.velY = 0;
    }
}

function reiniciarJogo() {
    vidas = 3;
    pontos = 0;
    gameOver = false;
    jogador.x = 50;
    jogador.y = 300;
    jogador.velY = 0;
    moedas.forEach(m => m.coletada = false);
    mensagemEl.innerText = "";
    restartBtn.style.display = "none";
    loop(); // Faz o jogo voltar a rodar
}

// 7. DESENHAR TUDO NA TELA
function desenhar() {
    // Fundo
    ctx.fillStyle = "#87CEEB"; // Cor de céu azul
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Plataformas
    ctx.fillStyle = "#2ecc71"; // Verde
    plataformas.forEach(plat => ctx.fillRect(plat.x, plat.y, plat.largura, plat.altura));

    // Moedas
    ctx.fillStyle = "#f1c40f"; // Amarelo
    moedas.forEach(moeda => {
        if (!moeda.coletada) {
            ctx.beginPath();
            ctx.arc(moeda.x, moeda.y, moeda.raio, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // Inimigos
    ctx.fillStyle = "#e74c3c"; // Vermelho
    inimigos.forEach(inimigo => ctx.fillRect(inimigo.x, inimigo.y, inimigo.largura, inimigo.altura));

    // Jogador
    ctx.fillStyle = jogador.cor;
    ctx.fillRect(jogador.x, jogador.y, jogador.largura, jogador.altura);

    // Placar
    ctx.fillStyle = "#000";
    ctx.font = "20px Arial";
    ctx.fillText("Pontos: " + pontos, 10, 30);
    ctx.fillText("Vidas: " + vidas, 10, 60);
}

// 8. O MOTOR DO JOGO (Loop)
function loop() {
    if (!gameOver) {
        atualizar();
        desenhar();
        requestAnimationFrame(loop);
    }
}

// Começa o jogo pela primeira vez!
loop();
