import { useState, useEffect } from 'react';

export function useTimer(initialDuration = 25 * 60) {
    const [timer, setTimer] = useState(initialDuration);
    const [initialTimer, setInitialTimer] = useState(initialDuration);
    const [mode, setMode] = useState('focus');
    const [isRunning, setIsRunning] = useState(false);
    const [completedSessions, setCompletedSessions] = useState(0);

    useEffect(() => {
        let interval = null;
        if (isRunning && timer > 0) {
            interval = setInterval(() => setTimer((t) => t - 1), 1000);
        } else if (timer === 0 && isRunning) {
            setIsRunning(false);
            // Logic for session completion is handled here or in the component depending on how we track global stats
            // For now, we just stop.
        }
        return () => clearInterval(interval);
    }, [isRunning, timer]);

    const setDuration = (mins, newMode = 'focus') => {
        const secs = mins * 60;
        setTimer(secs);
        setInitialTimer(secs);
        setMode(newMode);
        setIsRunning(false);
    };

    const toggleTimer = () => setIsRunning(!isRunning);
    const resetTimer = () => {
        setTimer(initialTimer);
        setIsRunning(false);
    };

    return {
        timer,
        setTimer,
        initialTimer,
        mode,
        isRunning,
        setDuration,
        toggleTimer,
        resetTimer,
        setIsRunning
    };
}
