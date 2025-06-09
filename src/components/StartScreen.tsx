// src/components/StartScreen.tsx
import React from 'react';

interface StartScreenProps {
    onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
    return (
        <div className="Screen">
            <h1>CLOUD HERO QUEST</h1>
            <p>
                Your mission: Navigate the treacherous skies of legacy tech.
                Jump over HURDLES (old problems) and collect BONUSES (modern solutions) to boost your Cloud Modernization Score!
            </p>
            <p>Press <strong>SPACEBAR</strong> to Jump!</p>
            <button className="StartButton" onClick={onStart}>
                Start Mission
            </button>
        </div>
    );
};

export default StartScreen;