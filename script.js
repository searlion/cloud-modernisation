
// --- Game Config ---
const GAME_WIDTH = 1024;
const GAME_HEIGHT = 600;
const GRAVITY = 0.6;
const JUMP_FORCE = -18;
const GROUND_Y = GAME_HEIGHT - 100;
const PLAYER_START_X = 100;
const PLAYER_WIDTH = 60 * 1.5;
const PLAYER_HEIGHT = 80 * 1.5;
const OBSTACLE_SPEED = 5;
const OBSTACLE_WIDTH = 120;
const OBSTACLE_HEIGHT = 60;
const OBSTACLE_SPAWN_INTERVAL = 1500;
const OBSTACLE_MIN_Y = 150;
const OBSTACLE_MAX_Y = GAME_HEIGHT - 150;
const HURDLE_PENALTY = -100;
const BONUS_POINTS = 50;
const GAME_DURATION = 60000;

const HURDLES = [
    "Vendor Lock-In", "Siloed Data", "Legacy Monolith", "High Latency", "Security Risks",
    "Cost Overruns", "Manual Deployments", "Cloud complexity", "Security vulnerabilities",
    "Cloud cost", "Skills gap", "Vendor lock-in", "Data silos", "Change management",
    "Outdated legacy systems"
];
const BONUSES = [
    "App modernisation", "Data modernisation", "Real-time data integration",
    "Infrastructure modernisation", "Seamless data migration", "AI and automation", "FinOps",
    "Data encryption", "Zero-trust security", "Mainframe modernization", "Intelligent automation",
    "Edge computing", "Cloud migration", "Data lakes", "Data warehouses",
    "Regular audits and monitoring"
];

// --- DOM Elements ---
const gameContainer = document.getElementById('game-container');
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const player = document.getElementById('player');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const finalScoreDisplay = document.getElementById('final-score');
const rankDisplay = document.getElementById('rank');
const rankMessage = document.getElementById('rank-message');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const linkedinShareButton = document.getElementById('linkedin-share');
const facebookShareButton = document.getElementById('facebook-share');
const copyLinkButton = document.getElementById('copy-link');
const copiedMessage = document.getElementById('copied-message');

// --- Game State ---
let gameState = 'start'; // 'start', 'playing', 'gameOver'
let score = 0;
let playerY = GROUND_Y;
let playerVelocityY = 0;
let jumpsLeft = 2;
let obstacles = [];
let timeLeft = GAME_DURATION / 1000;
let gameInterval;
let gameLoopRequest;
let lastSpawnTime = 0;
let gameStartTime = 0;

// --- Audio ---
const bgm = new Audio('public/assets/audio/bgm.mp3');
bgm.loop = true;
bgm.volume = 0.3;

function playSound(sound) {
    new Audio(`public/assets/audio/${sound}`).play().catch(e => console.error("Audio play failed:", e));
}

// --- Game Logic ---
function startGame() {
    // Clear existing obstacles from the screen
    const existingObstacles = document.querySelectorAll('.obstacle');
    existingObstacles.forEach(obs => obs.remove());

    gameState = 'playing';
    score = 0;
    playerY = GROUND_Y;
    playerVelocityY = 0;
    jumpsLeft = 2;
    obstacles = [];
    timeLeft = GAME_DURATION / 1000;
    gameStartTime = Date.now();
    lastSpawnTime = 0;

    scoreDisplay.textContent = score;
    timerDisplay.textContent = timeLeft;
    player.style.top = `${playerY}px`;
    player.style.left = `${PLAYER_START_X}px`;

    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    gameScreen.style.display = 'block';

    bgm.currentTime = 0;
    bgm.play().catch(e => console.error("BGM play failed:", e));

    gameInterval = setInterval(updateTimer, 1000);
    gameLoopRequest = requestAnimationFrame(gameLoop);
}

function gameOver() {
    gameState = 'gameOver';
    bgm.pause();
    playSound('game-over.mp3');
    cancelAnimationFrame(gameLoopRequest);
    clearInterval(gameInterval);

    finalScoreDisplay.textContent = score;
    const rank = getRank(score);
    rankDisplay.textContent = rank;
    rankMessage.textContent = getMessage(score);

    gameScreen.style.display = 'none';
    gameOverScreen.style.display = 'block';
}

function updateTimer() {
    const elapsedTime = Date.now() - gameStartTime;
    const remaining = Math.max(0, Math.ceil((GAME_DURATION - elapsedTime) / 1000));
    timeLeft = remaining;
    timerDisplay.textContent = timeLeft;

    if (timeLeft <= 0) {
        gameOver();
    }
}

function handleJump(e) {
    if (e.code === 'Space' && jumpsLeft > 0 && gameState === 'playing') {
        playerVelocityY = JUMP_FORCE;
        jumpsLeft--;
        playSound('jump.mp3');
    }
}

function gameLoop(timestamp) {
    if (gameState !== 'playing') return;

    // Update player position
    playerVelocityY += GRAVITY;
    playerY += playerVelocityY;

    if (playerY >= GROUND_Y) {
        playerY = GROUND_Y;
        playerVelocityY = 0;
        if (jumpsLeft < 2) {
            jumpsLeft = 2;
        }
    }
    player.style.top = `${playerY}px`;

    // Player animation
    if (jumpsLeft < 2) {
        player.className = 'jumping';
    } else {
        player.className = 'idle';
    }

    // Update obstacles
    const playerRect = player.getBoundingClientRect();
    obstacles.forEach(obstacle => {
        obstacle.x -= OBSTACLE_SPEED;
        obstacle.element.style.left = `${obstacle.x}px`;
    });

    // Collision detection and cleanup
    obstacles = obstacles.filter(obstacle => {
        if (obstacle.x < -OBSTACLE_WIDTH) {
            obstacle.element.remove();
            return false;
        }

        const obstacleRect = obstacle.element.getBoundingClientRect();
        if (
            playerRect.x < obstacleRect.x + obstacleRect.width &&
            playerRect.x + playerRect.width > obstacleRect.x &&
            playerRect.y < obstacleRect.y + obstacleRect.height &&
            playerRect.y + playerRect.height > obstacleRect.y
        ) {
            if (obstacle.type === 'bonus') {
                score += BONUS_POINTS;
                playSound('get-bonus.mp3');
            } else {
                score += HURDLE_PENALTY;
                playSound('destroy-hurdle.mp3');
            }
            scoreDisplay.textContent = score;
            obstacle.element.remove();
            return false;
        }
        return true;
    });

    // Spawn new obstacles
    if (timestamp - lastSpawnTime > OBSTACLE_SPAWN_INTERVAL) {
        lastSpawnTime = timestamp;
        const type = Math.random() > 0.4 ? 'hurdle' : 'bonus';
        const contentArray = type === 'hurdle' ? HURDLES : BONUSES;
        const text = contentArray[Math.floor(Math.random() * contentArray.length)];
        const y = OBSTACLE_MIN_Y + Math.random() * (OBSTACLE_MAX_Y - OBSTACLE_MIN_Y);

        const obstacleElement = document.createElement('div');
        obstacleElement.className = `obstacle ${type}`;
        obstacleElement.style.top = `${y}px`;
        obstacleElement.style.left = `${GAME_WIDTH}px`;
        obstacleElement.textContent = text;
        gameScreen.appendChild(obstacleElement);

        obstacles.push({
            element: obstacleElement,
            type: type,
            x: GAME_WIDTH,
            y: y
        });
    }

    // Check game over condition
    if (score < 0) {
        gameOver();
    } else {
        gameLoopRequest = requestAnimationFrame(gameLoop);
    }
}

function getRank(score) {
    if (score < 100) return "Legacy Laggard";
    if (score < 300) return "Cloud Apprentice";
    if (score < 600) return "Migration Master";
    if (score < 1000) return "Modernization Maverick";
    return "Cloud Native G.O.A.T.";
}

function getMessage(score) {
    if (score < 100) return "Don't let legacy issues win! Modernize your stack and try again.";
    if (score < 300) return "You’ve crossed over, avoided the legacy traps, and kept your systems intact. Next mission: optimize, scale, and outpace the competition.";
    return "Congratulations! Your cloud setup isn’t just modern—it’s legendary. Scalable, agile, and totally ready for whatever the game throws next.";
}

// --- Event Listeners ---
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);
window.addEventListener('keydown', handleJump);

const shareText = () => `I achieved the rank of "${getRank(score)}" with ${score} points in Cloud Hero Quest! Can you beat my score? #CloudModernization #DevOps`;
const shareUrl = window.location.href;

linkedinShareButton.addEventListener('click', () => {
    const url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText())}`;
    window.open(url, '_blank', 'noopener,noreferrer');
});

facebookShareButton.addEventListener('click', () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText())}`;
    window.open(url, '_blank', 'noopener,noreferrer');
});

copyLinkButton.addEventListener('click', () => {
    navigator.clipboard.writeText(`${shareText()} ${shareUrl}`);
    copiedMessage.style.display = 'block';
    setTimeout(() => {
        copiedMessage.style.display = 'none';
    }, 2000);
});
