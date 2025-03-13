import { useEffect } from 'react';
import { useGameContext } from '../hooks/GameContext';
import styles from './Timer.module.css';

function Timer() {
    const { timeRemaining, gameStatus, setGameState } = useGameContext();
    
    useEffect(() => {
        if (timeRemaining <= 0 && gameStatus === 'playing') 
        {
            setGameState(prev => ({
                ...prev,
                hasLost: true
            }));
        }
    }, [timeRemaining, gameStatus, setGameState]);
 
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };
    
    const getTimerClass = () => {
        if (timeRemaining <= 10) 
        {
            return styles.critical;
        }
            
        if (timeRemaining <= 30) 
        {
            return styles.warning;
        }
        return styles.normal;
    };
    
    return (
        <div className={styles.timerContainer}>
            <div className={`${styles.timer} ${getTimerClass()}`}>
                <span className={styles.timerIcon}>⏱️</span>
                <span className={styles.timerText}>{formatTime(timeRemaining)}</span>
            </div>
        </div>
    );
}

export default Timer;