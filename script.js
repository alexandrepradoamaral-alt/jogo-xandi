const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const mensagemEl = document.getElementById("message");
const restartBtn = document.getElementById("restartBtn");

let pontos = 0;
let vidas = 3;
let fase = 1;
let gameOver = false;
const gravidade = 0.6;

const teclas = {};
window.addEventListener("keydown", (e) => teclas[e.code] = true);
window.addEventListener("keyup", (e) => teclas[e.code] = false);

// Jogador (Futuro Naruto - Laranja)
const jogador = {
    x: 50, y: 300, largura: 30, altura: 30, velX: 0, velY: 0, velocidade: 5, forcaPulo: -12, noChao: false, cor: "#ff9900" 
};

let shurikens = []; // Lista de armas voadoras

const plataformas = [
    { x: 0, y: 380, largura: 800, altura: 20 },
    { x: 150, y: 300, largura: 100, altura: 10 },
    { x: 350, y: 220, largura: 100, altura: 10 },
    { x: 550, y: 140, largura: 100, altura: 10 }
];

let moedas = [
    { x: 190, y: 270, raio: 10, coletada: false },
    { x: 390, y: 190, raio: 10, coletada: false },
    { x: 590, y: 110, raio: 10, coletada: false }
];

let inimigos = [
    { x: 350, y: 350, largura: 30, altura: 30, velocidade:
