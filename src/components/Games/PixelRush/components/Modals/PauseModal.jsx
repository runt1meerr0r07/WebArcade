import { useGameContext } from "../../hooks/GameContext";
import styles from './Modal.module.css';
import { useEffect } from "react";

function PauseModal() {
    const {setModalState,setGameStatus,resetGame}=useGameContext()
    const resumeGame=()=>{
        setModalState(prev=>({...prev,pauseModal:false}))
        setGameStatus('playing')
    }
    const quitGame=()=>{
        resetGame()
        setModalState(prev=>({...prev,pauseModal:false,startModal:true}))
        setGameStatus('idle')
    }
    useEffect(() => {
        const handleKeyDown = (e) => {
          if (e.key === 'Escape') {
            e.preventDefault(); 
            e.stopPropagation();
          }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
      }, []);
    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <h2>Game Paused</h2>
                <div className={styles.pauseOptions}>
                    <button onClick={resumeGame} className={styles.actionButton}>
                        Resume
                    </button>
                    <button onClick={quitGame} className={styles.actionButton + ' ' + styles.secondary}>
                        Quit Game
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PauseModal
