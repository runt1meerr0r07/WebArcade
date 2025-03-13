import Confetti from 'react-confetti';
import { useEffect, useState } from 'react';
import styles from './GameBoard.module.css'
import Player from './Player'
import FinishLine from './FinishLine'
import { useGameContext } from '../hooks/GameContext';
import usePlayerControls from '../hooks/usePlayerControls';
import useCollisionSystems from '../hooks/useCollisionSystems';
import StartModal from './Modals/StartModal';
import PauseModal from './Modals/PauseModal';
import EndModal from './Modals/EndModal';
import useObstacleAnimation from '../hooks/useObstacleAnimation';
import TouchControls from './TouchControls';
import gearGif from './Assets/Gear.gif';
import cactus from './Assets/Cactus.png';
import spike from './Assets/Spike.png';
import Obstacle from './Obstacle'; 

function GameContent() {

    const {setModalState,modalState,setGameStatus,gameStatus,position,gameState,obstacles,level}=useGameContext()
    const [width, height] = [window.innerWidth, window.innerHeight];

    const [gearDimensions, setGearDimensions] = useState({ width: 0, height: 0 });
    const [cactusDimensions, setCactusDimensions] = useState({ width: 0, height: 0 });
    
    useEffect(() => {
        
        const gearImg = new Image();
        gearImg.onload = () => {
            setGearDimensions({ 
                width: gearImg.naturalWidth, 
                height: gearImg.naturalHeight 
            });
        };
        gearImg.src = gearGif;
        
        const cactusImg = new Image();
        cactusImg.onload = () => {
            setCactusDimensions({ 
                width: cactusImg.naturalWidth, 
                height: cactusImg.naturalHeight 
            });
        };
        cactusImg.src = spike;
    }, []);
    
    // console.log('Gear dimensions:', gearDimensions);
    // console.log('Cactus dimensions:', cactusDimensions);

    useEffect(() => {
        if (gameState.hasWon || gameState.hasLost) {
            setModalState(prev => ({...prev, endModal: true}));
            setGameStatus('ended');
        }
    }, [gameState.hasWon, gameState.hasLost, setModalState, setGameStatus]);
   
    usePlayerControls()
    useCollisionSystems()
    const setObstacleRef = useObstacleAnimation();
    return (
        <>
            <div className={styles.gameBoardContainer}>
                {gameState.hasWon && <Confetti width={width} height={height} numberOfPieces={400} recycle={false} />}
                <div className={styles.gameBoard}>
                    <Player
                        position={position}
                    />
                    <FinishLine />
                    {obstacles.map((obstacle, index) => (
                        <div 
                            key={`obstacle-${index}`}
                            className={styles.obstacle} 
                            ref={(node) => setObstacleRef(index, node)}
                            style={{ 
                                position: 'absolute',
                                top: `${obstacle.y}px`, 
                                left: `${obstacle.x}px`, 
                                width: `${obstacle.width}px`, 
                                height: `${obstacle.height}px`,
                            }}
                        >
                            <Obstacle obstacle={obstacle} level={level} />
                        </div>
                    ))}
                    {gameStatus === 'playing' && <TouchControls />}
                </div>
                <div className={styles.gameControls}>
                    {gameStatus === 'playing' && (
                        <button
                        className={styles.pauseButton}
                        onClick={(e) => {
                            e.stopPropagation()
                            setModalState(prev => ({...prev, pauseModal: true}));
                            setGameStatus('paused');
                        }}
                        >
                        ⏸️
                        </button>
                        )}
                </div>
            </div>
            {modalState.startModal && <StartModal />}
            {modalState.pauseModal && <PauseModal />}
            {modalState.endModal && <EndModal />}
        </>
    )
}

export default GameContent
