import { useGameContext } from '../hooks/GameContext';
import styles from './GameBoard.module.css'


function Player() {
    const {position}=useGameContext()
    return (
        <div 
            className={styles.player} 
            style={{ 
                left: `${position.x}px`, 
                top: `${position.y}px`
            }}
        >
        </div>
    )
}

export default Player