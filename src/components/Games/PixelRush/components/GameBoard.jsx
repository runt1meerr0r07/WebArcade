import { useGameContext } from "../hooks/GameContext";
import GameContent from "./GameContent";
import styles from './GameBoard.module.css'
import Timer from "./Timer";

function GameBoard() {
    const { level, gameStatus, setGameStatus } = useGameContext();
    
    const startGame = () => {
        setGameStatus('playing');
    };

    return (
        <div className={styles.gameBoardContainer}>
            <div className={styles.levelIndicator}>
                <h2>Pixel Rush - Level {level}</h2>
            </div>
            
            
            {gameStatus === 'playing' && <Timer />}
            
            <div className={styles.gameBoard}>
                <GameContent />
            </div>
        </div>
    );
}

export default GameBoard;