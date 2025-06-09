// src/App.tsx
import { useState, useEffect, useRef } from 'react';
import Game from './components/Game';
import StartScreen from './components/StartScreen';
import GameOverScreen from './components/GameOverScreen';

type GameState = 'start' | 'playing' | 'gameOver';

function App() {
    const [gameState, setGameState] = useState<GameState>('start');
    const [finalScore, setFinalScore] = useState(0);

    // --- BGM Control ---
    const bgmRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Initialize BGM audio element
        if (!bgmRef.current) {
            const audio = new Audio('/assets/audio/bgm.mp3');
            audio.loop = true;
            audio.volume = 0.3;
            bgmRef.current = audio;
        }
    }, []);

    const handleStartGame = () => {
        setGameState('playing');
        bgmRef.current?.play().catch(e => console.error("BGM play failed:", e));
    };

    const handleGameOver = (score: number) => {
        setFinalScore(score);
        setGameState('gameOver');
        bgmRef.current?.pause();
        if(bgmRef.current) bgmRef.current.currentTime = 0; // Rewind for next playthrough
    };

    const handleRestart = () => {
        setFinalScore(0);
        setGameState('start');
    };

    const renderGameState = () => {
        switch (gameState) {
            case 'playing':
                return <Game onGameOver={handleGameOver} />;
            case 'gameOver':
                return <GameOverScreen score={finalScore} onRestart={handleRestart} />;
            case 'start':
            default:
                return <StartScreen onStart={handleStartGame} />;
        }
    };

    return (
        <div className="App">
            {renderGameState()}
        </div>
    );
}

export default App;