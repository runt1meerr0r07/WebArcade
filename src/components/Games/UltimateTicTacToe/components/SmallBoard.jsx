import React, { useState } from 'react'
import Cell from './Cell'
import '../UltimateTicTacToe.css'
import styles from './Boards.module.css';

import X_image from '../assets/X_image.png'
import O_image from '../assets/O_image.png'
import Draw_image from '../assets/Draw_image.png'

const SmallBoard = ({ boardIndex, cells, onMove, winner, disabled }) => {
    const renderWinnerImage = () => {
        if (winner === 'X') return <img src={X_image} alt="X" />;
        if (winner === 'O') return <img src={O_image} alt="O" />;
        if (winner === 'DRAW') return <img src={Draw_image} alt="Draw" />;
    };
    return (
        <div 
            className={`
                ${styles.smallBoard}
                ${winner ? styles.won : ''}
                ${disabled ? styles.disabled : ''}
            `}
        >
            {winner && (
                <div className={styles.winnerOverlay}>
                  {renderWinnerImage()}
                </div>
            )}
            {cells.map((value, cellIndex) => (
                <Cell 
                    key={cellIndex}
                    value={value} 
                    boardIndex={boardIndex}
                    cellIndex={cellIndex}
                    onMove={onMove}
                />
            ))}
        </div>
    );
};
    
export default SmallBoard
