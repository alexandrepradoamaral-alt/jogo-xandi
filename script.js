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
    jogador.noChao =
