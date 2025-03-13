import { useCallback, useEffect, useRef } from "react";
import { useGameContext } from './GameContext';
import styles from '../components/GameBoard.module.css';


function useCollisionSystems() {
    const { position, gameState, setGameState, finishLine, gameStatus, timeRemaining } = useGameContext();
    const requestRef = useRef();
    
    const checkWinCondition = useCallback(() => {
        const playerRight = position.x + 20;
        
        if (playerRight >= finishLine.x && 
            position.y < finishLine.y + finishLine.height && 
            position.y + 20 > finishLine.y && 
            timeRemaining > 0) {
            setGameState(prev => ({ ...prev, hasWon: true }));
        }
    }, [finishLine, position, timeRemaining, setGameState]);

    const checkLostCondition = useCallback(() => {
        if (gameStatus !== 'playing') 
        {
            return;
        }
            
        const obstacleElements = document.querySelectorAll(`.${styles.obstacle}`);
        const gameBoard = document.querySelector(`.${styles.gameBoard}`);
        if (!gameBoard) 
        {
            return;
        }
        
        const boardRect = gameBoard.getBoundingClientRect();
        
        const playerPoints = [
            // Center point
            { x: position.x + 10, y: position.y + 10 },
            
            { x: position.x, y: position.y },             // Top-left
            { x: position.x + 10, y: position.y },        // Top-middle
            { x: position.x + 20, y: position.y },        // Top-right
            { x: position.x, y: position.y + 10 },        // Middle-left
            { x: position.x + 20, y: position.y + 10 },   // Middle-right
            { x: position.x, y: position.y + 20 },        // Bottom-left
            { x: position.x + 10, y: position.y + 20 },   // Bottom-middle
            { x: position.x + 20, y: position.y + 20 }    // Bottom-right
        ];
        
        if (timeRemaining <= 0 || position.y <= 0 || (position.y + 20) >= 480 || (position.x <= 0)) 
        {
            setGameState(prev => ({ ...prev, hasLost: true }));
            return;
        }
        
        for (const [index, obstacle] of [...obstacleElements].entries()) {
           
            if (!obstacle || !obstacle.getBoundingClientRect) {
                console.warn("Invalid obstacle found", index);
                continue;
            }
            
            try {
                const rect = obstacle.getBoundingClientRect(); 

                const obstacleX = rect.left - boardRect.left;
                const obstacleY = rect.top - boardRect.top;
                const obstacleWidth = rect.width;
                const obstacleHeight = rect.height;

                
                for (const point of playerPoints) {
                    
                    const isCircular = obstacle.querySelector('.circular-obstacle');
                    const isVertical = obstacle.querySelector('.vertical-obstacle');
                    const isCompound = obstacle.querySelector('img[alt="Gear obstacle"]');
                    
                    
                    let hitboxReduction = -2; 
                    
                    if (isCircular) {
                        
                        hitboxReduction = 15;
                    } else if (isVertical) {
                    
                        hitboxReduction = 5;
                    } else if (isCompound) {
                        
                        hitboxReduction = -1;
                    }
                    
                    if (point.x >= obstacleX + hitboxReduction && 
                        point.x <= obstacleX + obstacleWidth - hitboxReduction && 
                        point.y >= obstacleY + hitboxReduction && 
                        point.y <= obstacleY + obstacleHeight - hitboxReduction) {
                        
                        
                        
                        setGameState(prev => ({ ...prev, hasLost: true }));
                        return;
                    }
                }
            } catch (error) {
                console.error("Collision detection error for obstacle", index, error);
                continue;
            }
        }
    }, [position.x, position.y, gameStatus, timeRemaining, setGameState]);
    
    useEffect(() => {
        const runCheck = () => {
            if (gameStatus === 'playing') {
                checkWinCondition();
                checkLostCondition();
                requestRef.current = requestAnimationFrame(runCheck);
            }
        };
        
        requestRef.current = requestAnimationFrame(runCheck);
        return () => cancelAnimationFrame(requestRef.current);
    }, [gameStatus, checkWinCondition, checkLostCondition]);

    return { hasWon: gameState.hasWon, hasLost: gameState.hasLost };
}

export default useCollisionSystems;