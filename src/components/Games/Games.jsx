import React from 'react'
import { useState } from 'react';
import './Games.css'
import TicTacToe from './TicTacToe/TicTacToe'
import canvas_image from './TicTacToe/images/canvas.png'
import Ultimate from './TicTacToe/images/Ultimate.png'
import ThreeMove from './TicTacToe/images/ThreeMove.png'
import PixelRush1 from './TicTacToe/images/PixelRush.png'

import Modal from 'react-bootstrap/Modal';

import UltimateTicTacToe from './UltimateTicTacToe/UltimateTicTacToe'
import PixelRush from './PixelRush/PixelRush'
import ThreeMoveTicTacToe from './ThreeMoveTicTacToe/ThreeMoveTicTacToe'

function Games() {
    const [show,setShow]=useState(false)
    const [game,setGame]=useState(null)
    const [currentPlayer, setCurrentPlayer] = useState('X') 
    const [gameStatus, setGameStatus] = useState(`X ' s Turn`)
    const handleShow=(gameName)=> { 
        setShow(true)
        setGame(gameName)
    }
    const handleClose=()=>{
        setShow(false)
        setGame(null)
    }

    const showGame=()=>{
        if (game==='TicTacToe')
        {
            return(
                <TicTacToe
                    currentPlayer={currentPlayer}
                    setCurrentPlayer={setCurrentPlayer}
                    gameStatus={gameStatus}
                    setGameStatus={setGameStatus}
                />
            )
        }
        if (game==='ThreeMoveTicTacToe')
        {
            return(
                <ThreeMoveTicTacToe
                    currentPlayer={currentPlayer}
                    setCurrentPlayer={setCurrentPlayer}
                    gameStatus={gameStatus}
                    setGameStatus={setGameStatus}
                />
            )
        }
        if(game==='UltimateTicTacToe')
        {
            return (
                <UltimateTicTacToe />
            )
        }  
        if(game==='PixelRush')
        {
            return (
                <PixelRush />
            )
        } 

    }
    return (
        <div className="sky-container">
           
            <div className="moon"></div>
            <div className="night-fog"></div>
            
            <div className="foreground-cloud cloud-1"></div>
            <div className="foreground-cloud cloud-2"></div>
            <div className="foreground-cloud cloud-3"></div>
            <div className="foreground-cloud cloud-4"></div>
            <div className="foreground-cloud cloud-5"></div>
            <div className="foreground-cloud cloud-6"></div>

            <div className="games-content">
                <div className="games-grid">
                    <div className="game-card">
                        <img 
                            src={canvas_image} 
                            alt="Tic Tac Toe" 
                            className="card-image"
                        />
                        <h3>Tic Tac Toe</h3>
                        <button className="button" onClick={() => handleShow('TicTacToe')}>
                            <span className="shadow"></span>
                            <span className="edge"></span>
                            <div className="front">
                                <span>Play</span>
                            </div>
                        </button>
                    </div>
                    
                    <div className="game-card">
                        <img 
                            src={Ultimate} 
                            alt="Ultimate Tic Tac Toe" 
                            className="card-image"
                        />
                        <h3>Ultimate Tic Tac Toe</h3>
                        <button className="button" onClick={() => handleShow('UltimateTicTacToe')}>
                            <span className="shadow"></span>
                            <span className="edge"></span>
                            <div className="front">
                                <span>Play</span>
                            </div>
                        </button>
                    </div>
                    
                    <div className="game-card">
                        <img 
                            src={ThreeMove} 
                            alt="Snake Game" 
                            className="card-image"
                        />
                        <h3>Three Move Tic Tac Toe</h3>
                        <button className="button" onClick={() => handleShow('ThreeMoveTicTacToe')}>
                            <span className="shadow"></span>
                            <span className="edge"></span>
                            <div className="front">
                                <span>Play</span>
                            </div>
                        </button>
                    </div>

                    <div className="game-card">
                        <img 
                            src={PixelRush1} 
                            alt="Memory Cards" 
                            className="card-image"
                        />
                        <h3>Pixel Rush</h3>
                        <button className="button" onClick={() => handleShow('PixelRush')}>
                            <span className="shadow"></span>
                            <span className="edge"></span>
                            <div className="front">
                                <span>Play</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
            <Modal
                show={show}
                onHide={handleClose}
                centered
                animation={false}
                backdrop="static"    
                keyboard={true}
            >
                
                <Modal.Body>
                    <div className="game-container">
                        {showGame()}
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    )
}

export default Games