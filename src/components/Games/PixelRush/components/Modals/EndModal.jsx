import { useEffect, useRef } from 'react';
import { useGameContext } from '../../hooks/GameContext';
import styles from './Modal.module.css';

function EndModal() {
    const { gameState, level, resetGame, setGameStatus, setModalState, updatePlayerScore } = useGameContext();
    const scoreUpdatedRef = useRef(false);
    

    useEffect(() => {

        if (!scoreUpdatedRef.current && (gameState.hasWon || gameState.hasLost)) {
            scoreUpdatedRef.current = true;
            
            if (gameState.hasWon) {
                
                const winPoints = level === 1 ? 30 : level === 2 ? 70 : 130;
                updatePlayerScore(winPoints);
            } else if (gameState.hasLost) {
                
                const lossPoints = level === 1 ? -70 : level === 2 ? -40 : -30;
                updatePlayerScore(lossPoints);
            }
        }
        
        
        if (!gameState.hasWon && !gameState.hasLost) {
            scoreUpdatedRef.current = false;
        }
    }, [gameState.hasWon, gameState.hasLost, level, updatePlayerScore]);

    const handlePlayAgain = () => {
        resetGame();
        setModalState(prev => ({...prev, endModal: false}));
        setGameStatus('playing');
    };
    
    const backToMenu = () => {
        resetGame();
        setModalState(prev => ({...prev, endModal: false, startModal: true}));
        setGameStatus('idle');
    };
    
    const points = gameState.hasWon 
        ? (level === 1 ? 30 : level === 2 ? 70 : 130)
        : (level === 1 ? -70 : level === 2 ? -40 : -30);

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <h2 className={gameState.hasWon ? styles.victoryTitle : styles.defeatTitle}>
                    {gameState.hasWon ? '🏆 Level Complete! 🏆' : '💥 Game Over 💥'}
                </h2>
                
                <p className={styles.messageText}>
                    {gameState.hasWon 
                        ? `Congratulations! You've conquered level ${level}!` 
                        : `Oh no! You crashed on level ${level}. Want to try again?`}
                </p>
                
                <div className={`${styles.scoreBox} ${points > 0 ? styles.scoreWin : styles.scoreLoss}`}>
                    <div className={styles.scoreTitle}>
                        {points > 0 ? 'POINTS EARNED' : 'POINTS LOST'}
                    </div>
                    <div className={styles.scoreValue}>
                        {points > 0 ? `+${points}` : points}
                    </div>
                    <div className={styles.scoreDetail}>
                        {gameState.hasWon 
                            ? `Level ${level} completion bonus!` 
                            : `PLEASE DON'T BE A LOSER`}
                    </div>
                </div>
                
                <div className={styles.buttonContainer}>
                    <button onClick={handlePlayAgain} className={styles.actionButton}>
                        Play Again
                    </button>
                    <button onClick={backToMenu} className={`${styles.actionButton} ${styles.secondary}`}>
                        Level Select
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EndModal;