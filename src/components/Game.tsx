// src/components/Game.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGameLoop } from '../hooks/useGameLoop';
import * as Config from '../GameConfig';

// --- Types ---
type ObstacleType = 'hurdle' | 'bonus';
interface Obstacle {
    id: number;
    type: ObstacleType;
    text: string;
    x: number;
    y: number;
}

interface GameProps {
    onGameOver: (score: number) => void;
}

// --- Audio Helper ---
const playSound = (sound: string) => {
    new Audio(`/assets/audio/${sound}`).play().catch(e => console.error("Audio play failed:", e));
};


const Game: React.FC<GameProps> = ({ onGameOver }) => {
    // --- State Management ---
    const [score, setScore] = useState(0);
    const [playerY, setPlayerY] = useState(Config.GROUND_Y);
    const [playerVelocityY, setPlayerVelocityY] = useState(0);
    const [timeLeft, setTimeLeft] = useState(Config.GAME_DURATION / 1000); // Convert to seconds for display

    // NEW: We'll use a counter for jumps instead of a boolean. This enables the double jump.
    const [jumpsLeft, setJumpsLeft] = useState(2);

    const [obstacles, setObstacles] = useState<Obstacle[]>([]);
    const [isGameOver, setIsGameOver] = useState(false);

    const lastSpawnTimeRef = useRef(0);
    const gameStartTimeRef = useRef(Date.now());

    // --- Timer Logic ---
    useEffect(() => {
        const timer = setInterval(() => {
            const elapsedTime = Date.now() - gameStartTimeRef.current;
            const remaining = Math.max(0, Math.ceil((Config.GAME_DURATION - elapsedTime) / 1000));

            setTimeLeft(remaining);

            if (remaining <= 0 && !isGameOver) {
                setIsGameOver(true);
                playSound('game-over.mp3');
                onGameOver(score);
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [score, isGameOver, onGameOver]);

    // --- Player Jump Logic ---
    const handleJump = useCallback((e: KeyboardEvent) => {
        // UPDATED: Check if jumps are available instead of a simple boolean.
        if (e.code === 'Space' && jumpsLeft > 0 && !isGameOver) {
            setPlayerVelocityY(Config.JUMP_FORCE);
            setJumpsLeft(prev => prev - 1); // Decrement jumps.
            playSound('jump.mp3');
        }
    }, [jumpsLeft, isGameOver]);

    useEffect(() => {
        window.addEventListener('keydown', handleJump);
        return () => window.removeEventListener('keydown', handleJump);
    }, [handleJump]);

    // --- Collision Detection ---
    const checkCollision = (playerRect: DOMRect, obstacleRect: DOMRect): boolean => {
        return (
            playerRect.x < obstacleRect.x + obstacleRect.width &&
            playerRect.x + playerRect.width > obstacleRect.x &&
            playerRect.y < obstacleRect.y + obstacleRect.height &&
            playerRect.y + playerRect.height > obstacleRect.y
        );
    };

    // --- Main Game Loop ---
    const gameLoop = useCallback((deltaTime: number) => {
        if(isGameOver) return;

        // 1. Update Player Position (Gravity)
        setPlayerVelocityY(prev => prev + Config.GRAVITY);
        setPlayerY(prev => {
            const newY = prev + playerVelocityY;
            if (newY >= Config.GROUND_Y) {
                // UPDATED: When the player lands, reset their jumps.
                if (jumpsLeft < 2) {
                    setJumpsLeft(2);
                }
                return Config.GROUND_Y;
            }
            return newY;
        });

        // 2. Update Obstacles
        const playerRect = {
            x: Config.PLAYER_START_X,
            y: playerY,
            width: Config.PLAYER_WIDTH,
            height: Config.PLAYER_HEIGHT
        };

        let newScore = score;
        const updatedObstacles = obstacles.map(obs => ({ ...obs, x: obs.x - Config.OBSTACLE_SPEED }))
            .filter(obs => {
                if (obs.x < -Config.OBSTACLE_WIDTH) return false;

                const obstacleRect = { x: obs.x, y: obs.y, width: Config.OBSTACLE_WIDTH, height: Config.OBSTACLE_HEIGHT };
                if (checkCollision(playerRect as DOMRect, obstacleRect as DOMRect)) {
                    if (obs.type === 'bonus') {
                        newScore += Config.BONUS_POINTS;
                        playSound('get-bonus.mp3');
                    } else {
                        newScore += Config.HURDLE_PENALTY;
                        playSound('destroy-hurdle.mp3');
                    }
                    return false;
                }
                return true;
            });

        setScore(newScore);
        setObstacles(updatedObstacles);

        // 3. Spawn New Obstacles
        lastSpawnTimeRef.current += deltaTime;
        if(lastSpawnTimeRef.current > Config.OBSTACLE_SPAWN_INTERVAL) {
            lastSpawnTimeRef.current = 0;

            const type: ObstacleType = Math.random() > 0.4 ? 'hurdle' : 'bonus';
            const contentArray = type === 'hurdle' ? Config.HURDLES : Config.BONUSES;
            const text = contentArray[Math.floor(Math.random() * contentArray.length)];
            const y = Config.OBSTACLE_MIN_Y + Math.random() * (Config.OBSTACLE_MAX_Y - Config.OBSTACLE_MIN_Y);

            setObstacles(prev => [...prev, { id: Date.now(), type, text, x: Config.GAME_WIDTH, y }]);
        }

        // 4. Check Game Over Condition
        if (newScore < 0) {
            setIsGameOver(true);
            playSound('game-over.mp3');
            onGameOver(score);
        }

    }, [playerY, playerVelocityY, obstacles, score, onGameOver, isGameOver, jumpsLeft]);

    useGameLoop(gameLoop, !isGameOver);

    // UPDATED: The player is "jumping" (in the air) if they don't have their full 2 jumps available.
    const isInAir = jumpsLeft < 2;

    return (
        <div className="Game">
            <div className="HUD">SCORE: {score}</div>
            <div className="Timer">TIME: {timeLeft}s</div>
            <div
                // UPDATED: Animation is now based on whether the player is in the air.
                className={`Player ${isInAir ? 'jumping' : 'idle'}`}
                style={{ top: `${playerY}px`, left: `${Config.PLAYER_START_X}px` }}
            />
            {obstacles.map(obs => (
                <div
                    key={obs.id}
                    className={`Obstacle ${obs.type}`}
                    style={{ top: `${obs.y}px`, left: `${obs.x}px` }}
                >
                    {obs.text}
                </div>
            ))}
        </div>
    );
};

export default Game;