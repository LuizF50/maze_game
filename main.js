// Importar Kaboom via npm
import kaboom from "kaboom";

// Inicialização do Kaboom
const k = kaboom({
    canvas: document.querySelector("#game-canvas"),
    width: 500,
    height: 400,
    background: [15, 23, 42],
    scale: 2,
});

// Definições de cores
const COLORS = {
    wall: [30, 41, 59],
    path: [71, 85, 105],
    start: [16, 185, 129],
    end: [239, 68, 68],
    player: [79, 70, 229],
    solution: [249, 115, 22],
};

// Labirintos disponíveis
const MAZES = [
    [
        ['#', '#', '#', '#', '#'],
        ['#', 'S', '.', '.', '#'],
        ['#', '#', '.', '#', '#'],
        ['#', '.', '.', 'E', '#'],
        ['#', '#', '#', '#', '#']
    ],
    [
        ['#', '#', '#', '#', '#', '#', '#'],
        ['#', 'S', '.', '.', '.', '.', '#'],
        ['#', '#', '#', '#', '.', '#', '#'],
        ['#', '.', '.', '.', '.', '.', '#'],
        ['#', '.', '#', '#', '#', '.', '#'],
        ['#', '.', '.', '.', 'E', '.', '#'],
        ['#', '#', '#', '#', '#', '#', '#']
    ],
    [
        ['#', '#', '#', '#', '#', '#', '#', '#', '#'],
        ['#', 'S', '.', '.', '#', '.', '.', '.', '#'],
        ['#', '#', '#', '.', '#', '.', '#', '.', '#'],
        ['#', '.', '.', '.', '.', '.', '#', '.', '#'],
        ['#', '.', '#', '#', '#', '#', '#', '.', '#'],
        ['#', '.', '.', '.', '.', '.', '.', '.', '#'],
        ['#', '#', '#', '#', '#', '.', '#', '#', '#'],
        ['#', 'E', '.', '.', '.', '.', '.', '.', '#'],
        ['#', '#', '#', '#', '#', '#', '#', '#', '#']
    ]
];

// Estado do jogo
let currentMaze = 0;
let maze = MAZES[currentMaze];
let startPos = null;
let endPos = null;
let playerPos = null;
let solution = null;
let showingSolution = false;
let solutionIndex = 0;
let cellSize = 40;

// Inicializar o jogo
function initGame() {
    showingSolution = false;
    solution = null;
    solutionIndex = 0;

    // Encontrar posições iniciais
    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {
            if (maze[y][x] === 'S') {
                startPos = { x, y };
                playerPos = { x, y };
            } else if (maze[y][x] === 'E') {
                endPos = { x, y };
            }
        }
    }
}

// Renderizar o labirinto
function drawMaze() {
    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {
            const cell = maze[y][x];
            const xPos = x * cellSize;
            const yPos = y * cellSize;

            if (cell === '#') {
                k.drawRect({
                    pos: k.vec2(xPos, yPos),
                    width: cellSize,
                    height: cellSize,
                    color: COLORS.wall,
                });
            } else if (cell === '.') {
                k.drawRect({
                    pos: k.vec2(xPos, yPos),
                    width: cellSize,
                    height: cellSize,
                    color: COLORS.path,
                });
            } else if (cell === 'S') {
                k.drawRect({
                    pos: k.vec2(xPos, yPos),
                    width: cellSize,
                    height: cellSize,
                    color: COLORS.start,
                });
            } else if (cell === 'E') {
                k.drawRect({
                    pos: k.vec2(xPos, yPos),
                    width: cellSize,
                    height: cellSize,
                    color: COLORS.end,
                });
            }
        }
    }
}

// Desenhar o jogador
function drawPlayer() {
    const xPos = playerPos.x * cellSize + cellSize / 2;
    const yPos = playerPos.y * cellSize + cellSize / 2;

    k.drawCircle({
        pos: k.vec2(xPos, yPos),
        radius: cellSize / 3,
        color: COLORS.player,
    });
}

// Desenhar a solução
function drawSolution() {
    if (!solution || !showingSolution) return;

    for (let i = 0; i <= solutionIndex && i < solution.length; i++) {
        const { x, y } = solution[i];
        const xPos = x * cellSize + cellSize / 2;
        const yPos = y * cellSize + cellSize / 2;

        k.drawCircle({
            pos: k.vec2(xPos, yPos),
            radius: cellSize / 6,
            color: COLORS.solution,
        });
    }
}

// Algoritmo BFS para encontrar o caminho mais curto
function findShortestPath() {
    const queue = [{ pos: startPos, path: [startPos] }];
    const visited = new Set();
    visited.add(`${startPos.x},${startPos.y}`);

    while (queue.length > 0) {
        const { pos, path } = queue.shift();

        if (pos.x === endPos.x && pos.y === endPos.y) {
            return path;
        }

        // Movimentos possíveis: cima, baixo, esquerda, direita
        const directions = [
            { x: 0, y: -1 }, // cima
            { x: 0, y: 1 },  // baixo
            { x: -1, y: 0 }, // esquerda
            { x: 1, y: 0 },  // direita
        ];

        for (const dir of directions) {
            const newX = pos.x + dir.x;
            const newY = pos.y + dir.y;
            const newPos = { x: newX, y: newY };
            const key = `${newX},${newY}`;

            // Verificar se é um movimento válido
            if (
                newY >= 0 && newY < maze.length &&
                newX >= 0 && newX < maze[newY].length &&
                (maze[newY][newX] === '.' || maze[newY][newX] === 'E') &&
                !visited.has(key)
            ) {
                visited.add(key);
                queue.push({
                    pos: newPos,
                    path: [...path, newPos],
                });
            }
        }
    }

    return null; // Não há caminho
}

// Loop principal do jogo
k.onUpdate(() => {
    // Usar clear() em vez de clearCanvas()
    k.clear();
    drawMaze();
    drawSolution();
    drawPlayer();

    // Animar solução
    if (showingSolution && solutionIndex < solution.length - 1) {
        solutionIndex += 0.05;
        if (solutionIndex >= solution.length - 1) {
            solutionIndex = solution.length - 1;
        }
        playerPos = { ...solution[Math.floor(solutionIndex)] };
    }

    // Verificar vitória
    if (playerPos.x === endPos.x && playerPos.y === endPos.y) {
        k.drawText({
            text: "PARABÉNS!",
            pos: k.vec2(k.width() / 2, 20),
            size: 24,
            color: k.rgb(74, 222, 128),
            origin: "center",
        });
    }
});

// Controles do teclado
k.onKeyPress("up", () => {
    if (showingSolution) return;
    const newY = playerPos.y - 1;
    if (newY >= 0 && (maze[newY][playerPos.x] === '.' || maze[newY][playerPos.x] === 'E')) {
        playerPos.y = newY;
    }
});

k.onKeyPress("down", () => {
    if (showingSolution) return;
    const newY = playerPos.y + 1;
    if (newY < maze.length && (maze[newY][playerPos.x] === '.' || maze[newY][playerPos.x] === 'E')) {
        playerPos.y = newY;
    }
});

k.onKeyPress("left", () => {
    if (showingSolution) return;
    const newX = playerPos.x - 1;
    if (newX >= 0 && (maze[playerPos.y][newX] === '.' || maze[playerPos.y][newX] === 'E')) {
        playerPos.x = newX;
    }
});

k.onKeyPress("right", () => {
    if (showingSolution) return;
    const newX = playerPos.x + 1;
    if (newX < maze[playerPos.y].length && (maze[playerPos.y][newX] === '.' || maze[playerPos.y][newX] === 'E')) {
        playerPos.x = newX;
    }
});

// Botões de interface
document.getElementById("solve-btn").addEventListener("click", () => {
    solution = findShortestPath();
    showingSolution = true;
    solutionIndex = 0;
});

document.getElementById("reset-btn").addEventListener("click", () => {
    playerPos = { ...startPos };
    showingSolution = false;
    solutionIndex = 0;
});

document.getElementById("new-map-btn").addEventListener("click", () => {
    currentMaze = (currentMaze + 1) % MAZES.length;
    maze = MAZES[currentMaze];
    initGame();
});

// Iniciar o jogo
initGame();