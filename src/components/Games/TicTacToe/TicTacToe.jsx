import React, { useRef, useEffect } from 'react'
import { useState } from 'react'
import './TicTacToe.css';
import X_image from './images/X_image.png';
import O_image from './images/O_image.png';
import canvas_image from './images/canvas.png'
import { useDispatch, useSelector } from 'react-redux';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { updateScores, updateTotalOnly, GAME_INDICES } from "../../../store/userSlice";
import { db } from "../../../config/firebase";

const Cell=({symbol,movePlayed})=>{
    return(
        <button className="square" onClick={movePlayed}>
            {symbol && <img src={symbol==='X' ? X_image : O_image} alt={symbol} />}
        </button>
    )
}

function TicTacToe({currentPlayer, setCurrentPlayer, gameStatus, setGameStatus}) {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user);
    
    const [game, setGame] = useState(Array(9).fill(null))
    const [isGameover, setIsGameOver] = useState(false);
    const [isDialogBoxOpen, setIsDialogBoxOpen] = useState(false);
    const [dialogMessage, setDialogMessage] = useState("");
    
    const [playAgainstComputer, setPlayAgainstComputer] = useState(false);
    const [difficulty, setDifficulty] = useState(1); 
    const [computerSymbol] = useState("X"); 
    const [gameStarted, setGameStarted] = useState(false);
    const [isFirstTurn, setIsFirstTurn] = useState(true);
    const [humanFirst, setHumanFirst] = useState(false);
    

    const closeButtonRef = useRef(null);

    const checkWinner = (board) => {
        return (
            (board[0] && board[0] === board[1] && board[1] === board[2]) ||
            (board[3] && board[3] === board[4] && board[4] === board[5]) ||
            (board[6] && board[6] === board[7] && board[7] === board[8]) ||
            (board[0] && board[0] === board[3] && board[3] === board[6]) ||
            (board[1] && board[1] === board[4] && board[4] === board[7]) ||
            (board[2] && board[2] === board[5] && board[5] === board[8]) ||
            (board[0] && board[0] === board[4] && board[4] === board[8]) ||
            (board[2] && board[2] === board[4] && board[4] === board[6])
        );
    };
    
    const checkDraw = (board) => {
        for (let index = 0; index < board.length; index++) {
            if(!board[index]) {
                return false; 
            }
        }
        return true;
    };

    const makeRandomMove = (gameBoard) => {
        const emptyCells = [];
        for (let i = 0; i < gameBoard.length; i++) {
            if (gameBoard[i] === null) {
                emptyCells.push(i);
            }
        }
        
        if (emptyCells.length === 0) return null;
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    };
    
    const makeMediumMove = (gameBoard) => {
        const playerSymbol = "O";
        
        for (let i = 0; i < gameBoard.length; i++) {
            if (gameBoard[i] === null) {
                const testBoard = [...gameBoard];
                testBoard[i] = computerSymbol;
                if (checkWinner(testBoard)) {
                    return i;
                }
            }
        }
        //blocking move check
        for (let i = 0; i < gameBoard.length; i++) {
            if (gameBoard[i] === null) {
                const testBoard = [...gameBoard];
                testBoard[i] = playerSymbol;
                if (checkWinner(testBoard)) {
                    return i;
                }
            }
        }
        
        return makeRandomMove(gameBoard);
    };
 
    const makeHardMove = (gameBoard) => {
        const playerSymbol = "O"; 
        
        for (let i = 0; i < gameBoard.length; i++) {
            if (gameBoard[i] === null) {
                const testBoard = [...gameBoard];
                testBoard[i] = computerSymbol;
                if (checkWinner(testBoard)) {
                    return i; 
                }
            }
        }
        
        for (let i = 0; i < gameBoard.length; i++) {
            if (gameBoard[i] === null) {
                const testBoard = [...gameBoard];
                testBoard[i] = playerSymbol;
                if (checkWinner(testBoard)) {
                    return i; 
                }
            }
        }
        
        const priorityPositions = [
            4,  
            0,  
            2,  
            6,  
            8,  
            1,  
            3,  
            5,  
            7   
        ];
        
        for (const position of priorityPositions) {
            if (gameBoard[position] === null) {
                return position;
            }
        }
        
        return makeRandomMove(gameBoard);
    };
    
    const handleMove = (index) => {
        if (game[index] != null || isGameover) {
            return;
        }

        let newGame = [...game];
        newGame[index] = currentPlayer;
        
        const isWinner = checkWinner(newGame);
        const isDraw = checkDraw(newGame);
        
        setGame(newGame);
        setIsFirstTurn(false);

        if (isDraw && !isWinner) {
            setIsGameOver(true);
            setIsDialogBoxOpen(true);
            setDialogMessage("Game is DRAWN!!!")
            setGameStatus('Game Over!');
            
            
            if (playAgainstComputer) {
                updatePlayerScore(0);
            }
            return;
        }

        if (isWinner) {
            setIsGameOver(true);
            setIsDialogBoxOpen(true);
            setDialogMessage(`${currentPlayer} wins!`);
            setGameStatus('Game Over!');
            
            
            if (playAgainstComputer && currentPlayer !== computerSymbol) {
                const winPoints = difficulty === 1 ? 40 : difficulty === 2 ? 60 : 1000;
                updatePlayerScore(winPoints);
            }
            return;   
        }
       
        const nextPlayer = currentPlayer === "X" ? "O" : "X";
        setCurrentPlayer(nextPlayer);
        
      
        setGameStatus(`${nextPlayer}'s Turn`);
        
        if (playAgainstComputer && nextPlayer === computerSymbol) {
            setTimeout(() => {
                let computerMoveIndex;
                
                switch(difficulty) {
                    case 1:
                        computerMoveIndex = makeRandomMove(newGame);
                        break;
                    case 2:
                        computerMoveIndex = makeMediumMove(newGame);
                        break;
                    case 3:
                        computerMoveIndex = makeHardMove(newGame);
                        break;
                    default:
                        computerMoveIndex = makeRandomMove(newGame);
                }
                
                if (computerMoveIndex !== null) {
                    const computerBoard = [...newGame];
                    computerBoard[computerMoveIndex] = nextPlayer;
                    
                    const computerWins = checkWinner(computerBoard);
                    const computerDraw = checkDraw(computerBoard);
                    
                    setGame(computerBoard);
                    
                    if (computerWins) {
                        setIsGameOver(true);
                        setIsDialogBoxOpen(true);
                        setDialogMessage(`Computer wins!`);
                        setGameStatus('Game Over!');
                        
                        
                        const lossPoints = difficulty === 1 ? -100 : difficulty === 2 ? -40 : -20;
                        updatePlayerScore(lossPoints);
                        return;
                    }

                    if (computerDraw && !computerWins) {
                        setIsGameOver(true);
                        setIsDialogBoxOpen(true);
                        setDialogMessage("Game is DRAWN!!!")
                        setGameStatus('Game Over!');
                        
                      
                        const drawPoints = difficulty === 3 ? 40 : 0;
                        updatePlayerScore(drawPoints);
                        return;
                    }
                    
                  
                    setCurrentPlayer("O"); 
                    setGameStatus("Your Turn"); 
                }
            }, 600);
        }
    };

    const renderBoard = () => {
        return game.map((value, index) => (
            <Cell key={index} symbol={value} movePlayed={() => handleMove(index)} />
        ))
    }

    const resetGame = () => {
        setGame(Array(9).fill(null));
        setIsGameOver(false); 
        setIsDialogBoxOpen(false);
        setDialogMessage("");
        setCurrentPlayer("X"); 
        setIsFirstTurn(true);
        setGameStarted(false); 
        setGameStatus(''); 
        
        setTimeout(() => {
            const gameElement = document.querySelector('.game');
            if (gameElement) {
                gameElement.classList.add('reset');
                setTimeout(() => {
                    gameElement.classList.remove('reset');
                }, 10);
            }
        }, 0);
    };
    
    useEffect(() => {
        if (!gameStarted && closeButtonRef.current) {
            closeButtonRef.current.focus();
        }
    }, [gameStarted]);

    const startGame = (againstComputer, level) => {
        setGame(Array(9).fill(null));
        setIsGameOver(false);
        
        setPlayAgainstComputer(againstComputer);
        setDifficulty(level);
        setIsFirstTurn(true);
        
        const randomHumanFirst = Math.random() < 0.5;
        setHumanFirst(randomHumanFirst);
        
        if (againstComputer) {
            if (randomHumanFirst) {
                
                setCurrentPlayer("O");
                setGameStatus("Your Turn");
            } else {
                setCurrentPlayer("X");
                setGameStatus("Computer is thinking...");
                
                
                setTimeout(() => {
                    const newGame = Array(9).fill(null);
                    let moveIndex;
                    
                    switch(level) {
                        case 1:
                            moveIndex = makeRandomMove(newGame);
                            break;
                        case 2:
                            moveIndex = makeMediumMove(newGame);
                            break;
                        case 3:
                            moveIndex = 4;
                            break;
                        default:
                            moveIndex = makeRandomMove(newGame);
                    }
                    
                    newGame[moveIndex] = "X";
                    setGame(newGame);
                    setCurrentPlayer("O");
                    setGameStatus("Your Turn");
                }, 800);
            }
        } 
        else 
        {
            setCurrentPlayer("X");
            setGameStatus("X's Turn");
        }
        
        setGameStarted(true);
    };

    const updatePlayerScore = (points) => {
        console.log("Updating score with points:", points);
        
        if (user.isLoggedIn) {        
            if (points > 0) {
                
                dispatch(updateScores({
                    gameId: 'TicTacToe',
                    gameScore: points
                }));
            } 
            else 
            {
                dispatch(updateTotalOnly(points));
            }
    

            const userRef = doc(db, "users", user.userId);
            
            getDoc(userRef)
                .then((docSnap) => {
                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        const currentHighScore = userData.highScore || [0, 0, 0, 0];
                        const gameIndex = GAME_INDICES.TicTacToe;

                        let highScoreArray = Array.isArray(currentHighScore) 
                            ? [...currentHighScore] 
                            : [0, 0, 0, 0];
                        

                        while (highScoreArray.length < 4) {
                            highScoreArray.push(0);
                        }
                        
                        if (points > 0) {
                            highScoreArray[gameIndex] = Math.max(highScoreArray[gameIndex] || 0, points);
                        }

                        const newTotalScore = userData.totalScore + points;
                        
                        return updateDoc(userRef, {
                            totalScore: newTotalScore,
                            highScore: highScoreArray
                        });
                    }
                })
                .then(() => {
                    console.log(` Firestore update${points}`);
                })
                .catch(err => {
                    console.error("Error firebase:", err);
                });
        } else {
            console.log("User not logged in, skipping score update");
        }
    };

    const closeGame = () => {
        setGame(Array(9).fill(null));
        setIsGameOver(false);
        setIsDialogBoxOpen(false);
        setGameStarted(false);
        
        setGameStatus('closed');
        
        const escKeyEvent = new KeyboardEvent('keydown', {
            key: 'Escape',
            code: 'Escape',
            keyCode: 27,
            which: 27,
            bubbles: true
        });
        document.dispatchEvent(escKeyEvent);
        
        setTimeout(() => {
            const modalCloseButtons = document.querySelectorAll('.btn-close, .close, [aria-label="Close"]');
            if (modalCloseButtons.length > 0) {
                modalCloseButtons[0].click();
            }
        }, 100);
        
        
    };

    return (
        <div className="game">
            {!gameStarted && (
                <div className="game-mode-selector">
                    <button className="close-button-fixed" onClick={closeGame} ref={closeButtonRef}>
                        ✕
                    </button>
                    <h3>Select Game Mode</h3>
                    <button className="mode-button" onClick={() => {
                        startGame(false, 0);
                    }}>
                        2 Players
                    </button>
                    <h3>Play vs Computer</h3>
                    <button className="mode-button" onClick={() => startGame(true, 1)}>
                        Easy
                    </button>
                    <button className="mode-button" onClick={() => startGame(true, 2)}>
                        Medium
                    </button>
                    <button className="mode-button" onClick={() => startGame(true, 3)}>
                        Impossible
                    </button>
                </div>
            )}
            
            {gameStarted && (
                <>
                    <button className="close-button-game" onClick={closeGame}>
                        ✕
                    </button>
                    <div className="turn-indicator">
                        {gameStatus}
                    </div>
                    <div className="board">
                        {renderBoard()}
                    </div>
                    
                </>                
            )}
            
            {isDialogBoxOpen && (
                <div className="dialog-overlay">
                    <div className={`dialog-box ${
                        dialogMessage.includes('wins!') ? 'victory' : 
                        dialogMessage.includes('DRAWN') ? '' : 'defeat'
                    }`}>
                        <button className="dialog-close-button" onClick={() => setIsDialogBoxOpen(false)}>
                            ✕
                        </button>
                        <div className={`dialog-message ${
                            dialogMessage.includes('wins!') ? 'victory' : 
                            dialogMessage.includes('DRAWN') ? '' : 'defeat'
                        }`}>
                            {dialogMessage}
                        </div>
                        
                        {playAgainstComputer && (
                            <div className={`score-message ${
                                dialogMessage.includes('Computer wins!') ? 'negative' : 
                                dialogMessage.includes('DRAWN') ? 'neutral' : 'positive'
                            }`}>
                                {dialogMessage.includes('Computer wins!') ? 
                                    `${difficulty === 1 ? '-100' : difficulty === 2 ? '-40' : '-20'} points` :
                                dialogMessage.includes('DRAWN') ?
                                    `${difficulty === 3 ? '+40' : '0'} points` :
                                    `${difficulty === 1 ? '+40' : difficulty === 2 ? '+60' : '+1000'} points`
                                }
                            </div>
                        )}
                        
                        <div className="dialog-buttons">
                            <button className="reset-button" onClick={resetGame}>
                                Play Again
                            </button>
                            <button className="view-button" onClick={() => setIsDialogBoxOpen(false)}>
                                View Board
                            </button>
                        </div>
                    </div>
                </div>
            )}  
        </div>
    )
}

export default TicTacToe