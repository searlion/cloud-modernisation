// src/components/GameOverScreen.tsx
import React, { useState, useMemo } from 'react';

interface GameOverScreenProps {
    score: number;
    onRestart: () => void;
}

const getRank = (score: number): string => {
    if (score < 100) return "Legacy Laggard";
    if (score < 300) return "Cloud Apprentice";
    if (score < 600) return "Migration Master";
    if (score < 1000) return "Modernization Maverick";
    return "Cloud Native G.O.A.T.";
};

const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, onRestart }) => {
    const [copied, setCopied] = useState(false);
    const rank = useMemo(() => getRank(score), [score]);
    const shareText = `I achieved the rank of "${rank}" with ${score} points in Cloud Hero Quest! Can you beat my score? #CloudModernization #DevOps`;
    const shareUrl = window.location.href;

    const handleShare = (platform: 'linkedin' | 'facebook') => {
        let url = '';
        if (platform === 'linkedin') {
            url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`;
        } else {
            url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}"e=${encodeURIComponent(shareText)}`;
        }
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="Screen">
            <h1>Mission Over</h1>
            <h2>Final Score: {score}</h2>
            <div className="Ranking">Your Rank: {rank}</div>
            <p>
                Don't let legacy issues win! Modernize your stack and try again.
            </p>

            <div className="ShareContainer">
                <button className="ShareButton" onClick={() => handleShare('linkedin')}>
                    <img src="/assets/images/linkedin-icon.png" alt="LinkedIn"/>
                    Share
                </button>
                <button className="ShareButton facebook" onClick={() => handleShare('facebook')}>
                    <img src="/assets/images/facebook-icon.png" alt="Facebook"/>
                    Share
                </button>
                <button className="ShareButton copy-link" onClick={handleCopy}>
                    <img src="/assets/images/link-icon.png" alt="Copy Link"/>
                    Copy
                </button>
            </div>
            {copied && <div className="CopiedMessage">Link Copied to Clipboard!</div>}

            <button className="StartButton" style={{marginTop: '40px'}} onClick={onRestart}>
                Try Again
            </button>
        </div>
    );
};

export default GameOverScreen;