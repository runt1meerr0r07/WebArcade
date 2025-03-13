import React from 'react'
import X_image from '../assets/X_image.png'
import O_image from '../assets/O_image.png'

import '../UltimateTicTacToe.css'

const Cell = ({ value, boardIndex, cellIndex,onMove}) => {
    return (
        <button 
            className="ultimate-square" 
            onClick={() => onMove(boardIndex, cellIndex)}
        >
            {value && <img src={value === 'X' ? X_image : O_image} alt={value} />}
        </button>
    )
}
export default Cell 