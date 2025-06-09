// src/hooks/useGameLoop.ts
import { useRef, useEffect } from 'react';

type GameLoopCallback = (deltaTime: number) => void;

export const useGameLoop = (callback: GameLoopCallback, isRunning: boolean) => {
    const requestRef = useRef<number>(0);
    const previousTimeRef = useRef<number>(0);

    const loop = (time: number) => {
        if (previousTimeRef.current !== undefined) {
            const deltaTime = time - previousTimeRef.current;
            callback(deltaTime);
        }
        previousTimeRef.current = time;
        requestRef.current = requestAnimationFrame(loop);
    };

    useEffect(() => {
        if (isRunning) {
            requestRef.current = requestAnimationFrame(loop);
        } else {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
                previousTimeRef.current = 0; // Reset time for next run
            }
        }
        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [isRunning, callback]);
};