import { useGameContext } from "../../hooks/GameContext";
import styles from './Modal.module.css';

function StartModal() {
    const {setModalState,level,setLevel,setGameStatus}=useGameContext()
    const startGame=(level)=>{
        setLevel(level)
        setModalState(prev=>({...prev,startModal:false}))
        setGameStatus('playing')

    }
    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <h2>Pixel Rush</h2>
                <div className={styles.levelSelect}>
                  <h3>Select Level</h3>
                  <div className={styles.levelButtons}>
                    {[1, 2, 3].map(lvl => (
                        <button key={lvl} onClick={() => startGame(lvl)} className={styles.levelButton}>
                            Level {lvl}
                        </button>
                    ))}
                  </div>
                </div>
            </div>
        </div>
    );
}

export default StartModal
