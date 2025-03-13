import React, { useCallback, useState, useEffect, useRef } from 'react';
import styles from './TouchControls.module.css';
import { useGameContext } from '../hooks/GameContext';

import upArrow from './Assets/up-arrow.png';
import downArrow from './Assets/down-arrow.png';
import leftArrow from './Assets/left-arrow.png';
import rightArrow from './Assets/right-arrow.png';

function TouchControls() {
    const { position, setPosition, gameState, gameStatus } = useGameContext();
    const [activeDirections, setActiveDirections] = useState({
        up: false,
        down: false,
        left: false,
        right: false
    });
    
    const animationRef = useRef();
    
    const startMove = useCallback((direction) => {
        setActiveDirections(prev => ({
            ...prev,
            [direction]: true
        }));
    }, []);
    
    
    const stopMove = useCallback((direction) => {
        setActiveDirections(prev => ({
            ...prev,
            [direction]: false
        }));
    }, []);
    
    useEffect(() => {
        const updatePosition = () => {
            if (gameStatus !== 'playing' || gameState.hasWon || gameState.hasLost) {
                return;
            }
            
            let newX = position.x;
            let newY = position.y;
            
            if (activeDirections.up) {
                newY -= gameState.touchSpeed;
            }
            if (activeDirections.down) {
                newY += gameState.touchSpeed;
            }
            if (activeDirections.left) {
                newX -= gameState.touchSpeed;
            }
            if (activeDirections.right) {
                newX += gameState.touchSpeed;
            }
            
            if (newX !== position.x || newY !== position.y) {
                setPosition({ x: newX, y: newY });
            }
            
            animationRef.current = requestAnimationFrame(updatePosition);
        };
        
        
        if (Object.values(activeDirections).some(active => active)) {
            animationRef.current = requestAnimationFrame(updatePosition);
        }
        
       
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [activeDirections, position, setPosition, gameState, gameStatus]);
    
    return (
        <div className={styles.touchControlsContainer}>
            <div className={styles.directionalPad}>
                <button 
                    className={`${styles.touchButton} ${styles.upButton} ${activeDirections.up ? styles.active : ''}`}
                    onTouchStart={() => startMove('up')}
                    onMouseDown={() => startMove('up')}
                    onTouchEnd={() => stopMove('up')}
                    onTouchCancel={() => stopMove('up')}
                    onMouseUp={() => stopMove('up')}
                    onMouseLeave={() => stopMove('up')}
                    aria-label="Move Up"
                >
                    <img src={upArrow} alt="Up" className={styles.buttonImage} />
                </button>
                
                <div className={styles.middleRow}>
                    <button 
                        className={`${styles.touchButton} ${styles.leftButton} ${activeDirections.left ? styles.active : ''}`}
                        onTouchStart={() => startMove('left')}
                        onMouseDown={() => startMove('left')}
                        onTouchEnd={() => stopMove('left')}
                        onTouchCancel={() => stopMove('left')}
                        onMouseUp={() => stopMove('left')}
                        onMouseLeave={() => stopMove('left')}
                        aria-label="Move Left"
                    >
                        <img src={leftArrow} alt="Left" className={styles.buttonImage} />
                    </button>
                    
                    <div className={styles.spacer}></div>
                    
                    <button 
                        className={`${styles.touchButton} ${styles.rightButton} ${activeDirections.right ? styles.active : ''}`}
                        onTouchStart={() => startMove('right')}
                        onMouseDown={() => startMove('right')}
                        onTouchEnd={() => stopMove('right')}
                        onTouchCancel={() => stopMove('right')}
                        onMouseUp={() => stopMove('right')}
                        onMouseLeave={() => stopMove('right')}
                        aria-label="Move Right"
                    >
                        <img src={rightArrow} alt="Right" className={styles.buttonImage} />
                    </button>
                </div>
                
                <button 
                    className={`${styles.touchButton} ${styles.downButton} ${activeDirections.down ? styles.active : ''}`}
                    onTouchStart={() => startMove('down')}
                    onMouseDown={() => startMove('down')}
                    onTouchEnd={() => stopMove('down')}
                    onTouchCancel={() => stopMove('down')}
                    onMouseUp={() => stopMove('down')}
                    onMouseLeave={() => stopMove('down')}
                    aria-label="Move Down"
                >
                    <img src={downArrow} alt="Down" className={styles.buttonImage} />
                </button>
            </div>
        </div>
    );
}

export default TouchControls;
