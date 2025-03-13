import React, { useState } from 'react'
import '../UltimateTicTacToe.css'
import SmallBoard from './SmallBoard'

const BigBoard = ({bigGame,setBigGame,onMove,smallBoardResult,fieldofPlay,isGameover}) => {
    return (
        <div className="big-board">
            {bigGame.map((smallBoardCells, boardIndex) => (
                <SmallBoard 
                    key={boardIndex} 
                    boardIndex={boardIndex}
                    cells={smallBoardCells}
                    onMove={onMove}
                    disabled={isGameover || (smallBoardResult[boardIndex] !== null) || ((boardIndex !==fieldofPlay) && (fieldofPlay !==null))}
                    winner={smallBoardResult[boardIndex]}
                />
            ))}
        </div>
    )
}
    
export default BigBoard