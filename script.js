const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const mensagemEl = document.getElementById("message");
const restartBtn = document.getElementById("restartBtn");

// VARIÁVEIS PRINCIPAIS
let pontos = 0;
let vidas = 3;
let faseAtual = 0;
let gameOver = false;
let vitoria = false;
const gravidade = 0.6;

// TECLADO
const teclas = {};
window.addEventListener("keydown", (e) => teclas[e.code] = true);
window.addEventListener("keyup", (e) => teclas[e.code] = false);

// NARUTO (JOGADOR)
const jogador = {
    x: 50, y: 300, largura: 30, altura: 30,
    velX: 0, velY: 0, velocidade: 5, forcaPulo: -12,
    noChao: false, cor: "#e67e22", // Laranja (Naruto)
    direcao: 1 // 1 para direita, -1 para esquerda
};

// SHURIKENS
let shurikens = [];
let podeAtirar = true;

// DADOS DAS FASES (Cenários e Inimigos)
const fases = [
    {   // FASE 1 - A Aldeia da Folha
        corFundo: "#87CEEB",
        plataformas: [
            { x: 0, y: 380, largura: 800, altura: 20 },
            { x: 200, y: 300, largura: 100, altura: 10 },
            { x: 400, y: 220, largura: 100, altura: 10 }
        ],
        inimigos: [
            { x: 400, y: 350, largura: 30, altura: 30, vel: 2, dir: 1, minX: 300, maxX: 500, cor: "#e74c3c", hp: 1 }
        ],
        porta: { x: 700, y: 330, largura: 40, altura: 50 } // Saída
    },
    {   // FASE 2 - A Floresta da Morte
        corFundo: "#2c3e50",
        plataformas: [
            { x: 0, y: 380, largura: 300, altura: 20 },
            { x: 400, y: 380, largura: 400, altura: 20 },
            { x: 150, y: 280, largura: 80, altura: 10 },
            { x: 350, y: 200, largura: 80, altura: 10 },
            { x: 550, y: 150, largura: 80, altura: 10 }
        ],
        inimigos: [
            { x: 450, y: 350, largura: 30, altura: 30, vel: 3, dir: -1, minX: 400, maxX: 750, cor: "#8e44ad", hp: 1 },
            { x: 550, y: 120, largura: 30, altura: 30, vel: 1, dir: 1, minX: 500, maxX: 600, cor: "#8e44ad", hp: 1 }
        ],
        porta: { x: 750, y: 100, largura: 40, altura: 50 }
    }
];

let plataformasAtuais = [];
let inimigosAtuais = [];
let portaAtual = {};
let corFundoAtual = "";

function carregarFase(index) {
    if (index >= fases.length) {
        vitoria = true;
        mensagemEl.innerText = "Você se tornou um Hokage! Você Venceu!";
        restartBtn.style.display = "block";
        return;
    }
    const dados = fases[index];
    plataformasAtuais = JSON.parse(JSON.stringify(dados.plataformas));
    inimigosAtuais = JSON.parse(JSON.stringify(dados.inimigos));
    portaAtual = Object.assign({}, dados.porta);
    corFundoAtual = dados.corFundo;
    
    jogador.x = 50;
    jogador.y = 300;
    jogador.velY = 0;
    shurikens = [];
}

window.addEventListener("keydown", (e) => {
    // ATIRAR SHURIKEN COM A TECLA F
    if (e.code === "KeyF" && podeAtirar && !gameOver && !vitoria) {
        shurikens.push({
            x: jogador.x + 15,
            y: jogador.y + 15,
            velX: 10 * jogador.direcao,
            tamanho: 8
        });
        podeAtirar = false;
        setTimeout(() => podeAtirar = true, 400); // Espera um pouco pra atirar outra
    }
});

function atualizar() {
    if (gameOver || vitoria) return;

    // Movimento do Naruto
    if (teclas["ArrowLeft"] || teclas["KeyA"]) { 
        jogador.velX = -jogador.velocidade; 
        jogador.direcao = -1;
    } else if (teclas["ArrowRight"] || teclas["KeyD"]) { 
        jogador.velX = jogador.velocidade; 
        jogador.direcao = 1;
    } else { 
        jogador.velX = 0; 
    }

    if ((teclas["Space"] || teclas["ArrowUp"] || teclas["KeyW"]) && jogador.noChao) {
        jogador.velY = jogador.forcaPulo;
        jogador.noChao = false;
    }

    jogador.velY += gravidade;
    jogador.x += jogador.velX;
    jogador.y += jogador.velY;

    if (jogador.x < 0) jogador.x = 0;
    if (jogador.x + jogador.largura > canvas.width) jogador.x = canvas.width - jogador.largura;
    if (jogador.y > canvas.height) perderVida();

    // Colisão com Plataformas
    jogador.noChao = false;
    plataformasAtuais.forEach(plat => {
        if (jogador.x < plat.x + plat.largura && jogador.x + jogador.largura > plat.x &&
            jogador.y + jogador.altura >= plat.y && jogador.y + jogador.altura <= plat.y + jogador.velY + 2) {
            jogador.noChao = true;
            jogador.y = plat.y - jogador.altura;
            jogador.velY = 0;
        }
    });

    // Passar de Fase (Porta)
    if (jogador.x < portaAtual.x + portaAtual.largura && jogador.x + jogador.largura > portaAtual.x &&
        jogador.y < portaAtual.y + portaAtual.altura && jogador.y + jogador.altura > portaAtual.y) {
        faseAtual++;
        carregarFase(faseAtual);
    }

    // Atualizar Shurikens
    for (let i = shurikens.length - 1; i >= 0; i--) {
        let sh = shurikens[i];
        sh.x += sh.velX;
        
        // Remove shuriken fora da tela
        if (sh.x < 0 || sh.x > canvas.width) {
            shurikens.splice(i, 1);
            continue;
        }

        // Shuriken acerta inimigo
        for (let j = inimigosAtuais.length - 1; j >= 0; j--) {
            let inimigo = inimigosAtuais[j];
            if (sh.x < inimigo.x + inimigo.largura && sh.x + sh.tamanho > inimigo.x &&
                sh.y < inimigo.y + inimigo.altura && sh.y + sh.tamanho > inimigo.y) {
                inimigosAtuais.splice(j, 1); // Destrói o inimigo
                shurikens.splice(i, 1); // Destrói a shuriken
                pontos += 50;
                break;
            }
        }
    }

    // Inimigos
    inimigosAtuais.forEach(inimigo => {
        inimigo.x += inimigo.vel * inimigo.dir;
        if (inimigo.x <= inimigo.minX || inimigo.x + inimigo.largura >= inimigo.maxX) inimigo.dir *= -1;
        
        // Colisão Naruto toma dano
        if (jogador.x < inimigo.x + inimigo.largura && jogador.x + jogador.largura > inimigo.x &&
            jogador.y < inimigo.y + inimigo.altura && jogador.y + jogador.altura > inimigo.y) {
            perderVida();
        }
    });
}

function perderVida() {
    vidas--;
    if (vidas <= 0) {
        gameOver = true;
        mensagemEl.innerText = "Missão Falhou!";
        restartBtn.style.display = "block";
    } else {
        jogador.x = 50;
        jogador.y = 300;
        jogador.velY = 0;
    }
}

function reiniciarJogo() {
    vidas = 3;
    pontos = 0;
    faseAtual = 0;
    gameOver = false;
    vitoria = false;
    mensagemEl.innerText = "";
    restartBtn.style.display = "none";
    carregarFase(faseAtual);
    loop();
}

function desenhar() {
    // Fundo
    ctx.fillStyle = corFundoAtual;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Porta / Saída
    ctx.fillStyle = "#f39c12"; // Dourado
    ctx.fillRect(portaAtual.x, portaAtual.y, portaAtual.largura, portaAtual.altura);

    // Plataformas
    ctx.fillStyle = "#27ae60";
    plataformasAtuais.forEach(p => ctx.fillRect(p.x, p.y, p.largura, p.altura));

    // Inimigos
    inimigosAtuais.forEach(i => {
        ctx.fillStyle = i.cor;
        ctx.fillRect(i.x, i.y, i.largura, i.altura);
    });

    // Shurikens
    ctx.fillStyle = "#bdc3c7"; // Prata
    shurikens.forEach(sh => ctx.fillRect(sh.x, sh.y, sh.tamanho, sh.tamanho));

    // Jogador (Naruto)
    ctx.fillStyle = jogador.cor;
    ctx.fillRect(jogador.x, jogador.y, jogador.largura, jogador.altura);

    // Textos
    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.fillText("Pontos: " + pontos, 10, 30);
    ctx.fillText("Vidas: " + vidas, 10, 60);
    ctx.fillText("Fase: " + (faseAtual + 1), 10, 90);
}

function loop() {
    if (!gameOver && !vitoria) {
        atualizar();
        desenhar();
        requestAnimationFrame(loop);
    }
}

carregarFase(0);
loop();
