import React from 'react'
import { useMemo, useState, useCallback, useEffect } from 'react'
import './ThreeMoveTicTacToe.css';
import X_image from './images/X_image.png';
import O_image from './images/O_image.png';
import canvas_image from './images/canvas.png'
import { useDispatch, useSelector } from 'react-redux';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { updateScores, updateTotalOnly,GAME_INDICES } from "../../../store/userSlice";
import { db } from "../../../config/firebase";


function ThreeMoveTicTacToe({ currentPlayer, setCurrentPlayer, gameStatus, setGameStatus }) {
    
    const [game, setGame] = useState(Array(9).fill(null))
    const [isGameover, setIsGameOver] = useState(false);
    const [isDialogBoxOpen, setIsDialogBoxOpen] = useState(false);
    const [dialogMessage, setDialogMessage] = useState("");
    const [Xmarker, setXmarker] = useState([])
    const [Omarker, setOmarker] = useState([])
    const [animatingCell, setAnimatingCell] = useState(null);
    
    
    const [playAgainstComputer, setPlayAgainstComputer] = useState(false);
    const [difficulty, setDifficulty] = useState(1);
    const [computerSymbol, setComputerSymbol] = useState("O");
    const [gameStarted, setGameStarted] = useState(false);
    
    
    const oldestXMark = useMemo(() => Xmarker.length > 0 ? Xmarker[0] : -1, [Xmarker]);
    const oldestOMark = useMemo(() => Omarker.length > 0 ? Omarker[0] : -1, [Omarker]);
    
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user);

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
       
        for (let i = 0; i < board.length; i++) {
            if (!board[i]) {
                return false;
            }
        }
        return true;
    };
    const updatePlayerScore = (points) => {
        console.log("Updating score with points:", points);
        
        if (user.isLoggedIn) {
            
            if (points > 0) {
                
                dispatch(updateScores({
                    gameId: 'threeMoveTTT',
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
                        const gameIndex = GAME_INDICES.threeMoveTTT;
                        
                       
                        let highScoreArray = Array.isArray(currentHighScore) 
                            ? [...currentHighScore] 
                            : [0, 0, 0, 0];
                       
                        while (highScoreArray.length < 4) {
                            highScoreArray.push(0);
                        }
                        
                        
                        if (points > 0) 
                        {
                            highScoreArray[gameIndex] = Math.max(highScoreArray[gameIndex] || 0, points);
                        }
                        
                        const newTotalScore = userData.totalScore + points
                        
                        return updateDoc(userRef, {
                            totalScore: newTotalScore,
                            highScore: highScoreArray
                        });
                    }
                })
                .then(() => {
                    console.log(`Firestore update ${points}`);
                })
                .catch(err => {
                    console.error("Error firestore:", err);
                });
        } else {
            console.log("User not logged in, skipping score update");
        }
    };
    
    const Cell = useCallback(({symbol, movePlayed, index}) => {
        
        const isOldestCurrentPlayerMark = 
            (symbol === 'X' && index === oldestXMark && currentPlayer === 'X' && Xmarker.length === 3) || 
            (symbol === 'O' && index === oldestOMark && currentPlayer === 'O' && Omarker.length === 3);
        
        const isAnimating = index === animatingCell;
        
        const imgStyle = {
            opacity: isOldestCurrentPlayerMark ? 0.4 : 1,
            transition: 'opacity 0.3s ease'
        };
        
        return (
            <button className={`square ${isAnimating ? 'disappearing' : ''}`} onClick={movePlayed}>
                {symbol && <img 
                    src={symbol === 'X' ? X_image : O_image} 
                    alt={symbol} 
                    style={imgStyle} 
                />}
            </button>
        );
    }, [oldestXMark, oldestOMark, animatingCell, currentPlayer, Xmarker.length, Omarker.length]);
    
    const makeRandomMove = (currentBoard, currentXMarker, currentOMarker) => {
        const emptyCells = [];
        
        for (let i = 0; i < currentBoard.length; i++) {
            if (currentBoard[i] === null) {
                emptyCells.push(i);
            }
        }
        
        if (emptyCells.length === 0) 
        {
            return null;
        }
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    };
    
    const makeStrategicMove = (currentBoard, currentXMarker, currentOMarker) => {
        const computerMarker = computerSymbol === 'X' ? currentXMarker : currentOMarker;
        const playerSymbol = computerSymbol === 'X' ? 'O' : 'X';
        const playerMarker = computerSymbol === 'X' ? currentOMarker : currentXMarker;
        
        for (let i = 0; i < currentBoard.length; i++) {
            if (currentBoard[i] === null) {
                const testBoard = [...currentBoard];
                testBoard[i] = computerSymbol;
                
                if (checkWinner(testBoard)) {
                    return i;
                }
            }
        }
        

        for (let i = 0; i < currentBoard.length; i++) {
            if (currentBoard[i] === null) {
                const testBoard = [...currentBoard];
                testBoard[i] = playerSymbol;
                
                if (checkWinner(testBoard)) {
                    return i;
                }
            }
        }
        
        return makeRandomMove(currentBoard, currentXMarker, currentOMarker);
    };
    
    const handleMove = useCallback((index) => {
        if (game[index] != null || isGameover) 
        {
            return;
        } 

        let newGame = [...game];
        newGame[index] = currentPlayer;
        
        let cellToAnimate = null;

        if(currentPlayer === 'X') {
            const newMarker = [...Xmarker, index];
            
            if(newMarker.length > 3) {
                cellToAnimate = newMarker[0];
                const oldestMarkPosition = newMarker.shift();
                newGame[oldestMarkPosition] = null;
            }
            setXmarker(newMarker);
        }
        if(currentPlayer ==='O')
        {
            const newMarker=[...Omarker,index]

            if(newMarker.length >3)
            {
                cellToAnimate = newMarker[0];
                const oldestMarkPosition = newMarker.shift(); 
                newGame[oldestMarkPosition] = null;
            }
            setOmarker(newMarker)
        }
        
        const isWinner = checkWinner(newGame);
        const isDraw = checkDraw(newGame);
        
        setGame(newGame);

        if (isWinner) {
            setIsGameOver(true);
            setIsDialogBoxOpen(true);
            setDialogMessage(`${currentPlayer} wins!`);
            setGameStatus('Game Over!');
            
            if (playAgainstComputer && currentPlayer !== computerSymbol) {
                
                let winPoints;
                if (difficulty === 1) 
                {
                    winPoints = 30;
                } 
                else 
                {
                    winPoints = 60;
                }
                updatePlayerScore(winPoints);
            }
            return;   
        }

        if (isDraw && !isWinner) {
            setIsGameOver(true);
            setIsDialogBoxOpen(true);
            setDialogMessage("Game is DRAWN!!!");
            setGameStatus('Game Over!');
            
            if (playAgainstComputer) {
                updatePlayerScore(0);
            }
            return;
        }
        
        const nextPlayer = currentPlayer === "X" ? "O" : "X";
        setCurrentPlayer(nextPlayer);
        setGameStatus(`${nextPlayer}'s Turn`);

        if (cellToAnimate !== null) {
            setAnimatingCell(cellToAnimate);
            setTimeout(() => setAnimatingCell(null), 500);
        }
        
        if (playAgainstComputer && nextPlayer === computerSymbol && !isWinner && !isDraw) {
            setGameStatus("Computer is thinking...");
            
            setTimeout(() => {
                makeComputerMove(newGame);
            }, 800);
        }
    }, [game, isGameover, currentPlayer, Xmarker, Omarker, playAgainstComputer, computerSymbol, difficulty]);
    
    const makeComputerMove = (currentBoard) => {
        if (isGameover) return
        
        let moveIndex;
        
        switch(difficulty) {
            case 2:
                moveIndex = makeStrategicMove(currentBoard, Xmarker, Omarker);
                break;
            case 1:
                moveIndex = makeRandomMove(currentBoard, Xmarker, Omarker);
                break;
            default:
                moveIndex = makeRandomMove(currentBoard, Xmarker, Omarker);
                break;
        }
        
        if (moveIndex === null) return 
        
        
        let newGame = [...currentBoard];
        newGame[moveIndex] = computerSymbol;
        
        let cellToAnimate = null;
        
        if (computerSymbol === 'X') {
            const newMarker = [...Xmarker, moveIndex];
            
            if (newMarker.length > 3) {
                cellToAnimate = newMarker[0];
                const oldestMarkPosition = newMarker.shift();
                newGame[oldestMarkPosition] = null;
            }
            setXmarker(newMarker);
        } else {
            const newMarker = [...Omarker, moveIndex];
            
            if (newMarker.length > 3) {
                cellToAnimate = newMarker[0];
                const oldestMarkPosition = newMarker.shift();
                newGame[oldestMarkPosition] = null;
            }
            setOmarker(newMarker);
        }
        
        
        const isWinner = checkWinner(newGame);
        const isDraw = checkDraw(newGame);
        
        setGame(newGame);
        
        if (isDraw && !isWinner) {
            setIsGameOver(true);
            setIsDialogBoxOpen(true);
            setDialogMessage("Game is DRAWN!!!");
            setGameStatus('Game Over!');
            
            updatePlayerScore(0);
            return;
        }
        
        if (isWinner) {
            setIsGameOver(true);
            setIsDialogBoxOpen(true);
            setDialogMessage(`Computer wins!`);
            setGameStatus('Game Over!');
            
            
            const lossPoints = difficulty === 1 ? -60 : -30; 
            updatePlayerScore(lossPoints);
            return;
        }
        
        const nextPlayer = computerSymbol === "X" ? "O" : "X";
        setCurrentPlayer(nextPlayer);
        setGameStatus(`Your Turn`);
        
        if (cellToAnimate !== null) {
            setAnimatingCell(cellToAnimate);
            setTimeout(() => setAnimatingCell(null), 500);
        }
    };
    
    const renderBoard = useCallback(() => {
        return game.map((value, index) => (
            <Cell 
                key={index} 
                index={index}
                symbol={value} 
                movePlayed={() => handleMove(index)} 
            />
        ));
    }, [game, handleMove, Cell]);
    

    const startGame = (againstComputer, level) => {
        setGame(Array(9).fill(null));
        setXmarker([]);
        setOmarker([]);
        setIsGameOver(false); 
        setIsDialogBoxOpen(false);
        setDialogMessage("");
        
        setPlayAgainstComputer(againstComputer);
        setDifficulty(level);
        
        const randomComputerFirst = Math.random() < 0.5;
        
        if (againstComputer) {
            if (randomComputerFirst) {
                
                const compSymbol = "X";  
                setComputerSymbol(compSymbol);
                setCurrentPlayer(compSymbol);
                setGameStatus("Computer is thinking...");
                
                setTimeout(() => {
                    const moveIndex = Math.floor(Math.random() * 9);
                    const newGame = Array(9).fill(null);
                    newGame[moveIndex] = compSymbol;
                    
                    setGame(newGame);
                    
                    if (compSymbol === 'X') {
                        setXmarker([moveIndex]);
                    } else {
                        setOmarker([moveIndex]);
                    }
                    
                    setCurrentPlayer("O");
                    setGameStatus("Your Turn");
                }, 800);
            } 
            else 
            {
                const compSymbol = "O";  
                setComputerSymbol(compSymbol);
                setCurrentPlayer("X");
                setGameStatus("Your Turn");
            }
        } 
        else 
        {
            setCurrentPlayer("X");
            setGameStatus("X's Turn");
        }
        
        setGameStarted(true);
    };

    const resetGame = () => {
        setGame(Array(9).fill(null));
        setIsGameOver(false); 
        setIsDialogBoxOpen(false);
        setDialogMessage("");
        setXmarker([]);
        setOmarker([]);
        setGameStarted(false);  
    };

    const closeGame = () => {
        
        setGame(Array(9).fill(null));
        setIsGameOver(false);
        setIsDialogBoxOpen(false);
        setDialogMessage("");
        setXmarker([]);
        setOmarker([]);
        setGameStarted(false);
        
        const escKeyEvent = new KeyboardEvent('keydown', {
            key: 'Escape',
            code: 'Escape',
            keyCode: 27,
            which: 27,
            bubbles: true
        });
        document.dispatchEvent(escKeyEvent);
    };

    return (
        <div className="game">
            {!gameStarted ? (
                <div className="game-mode-selector">
                    <button className="close-button-fixed" onClick={closeGame}>
                        ✕
                    </button>
                    <h3>Select Game Mode</h3>
                    <button className="mode-button" onClick={() => startGame(false, 0)}>
                        2 Players
                    </button>
                    <h3>Play vs Computer</h3>
                    <button className="mode-button" onClick={() => startGame(true, 1)}>
                        Easy
                    </button>
                    <button className="mode-button" onClick={() => startGame(true, 2)}>
                        Strategic
                    </button>
                </div>
            ) : (
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
                        dialogMessage.includes('Computer wins!') ? 'defeat' : 
                        dialogMessage.includes('wins!') ? 'victory' : 
                        dialogMessage.includes('DRAWN') ? '' : ''
                    }`}>
                        <button className="dialog-close-button" onClick={() => setIsDialogBoxOpen(false)}>
                            ✕
                        </button>
                        <div className={`dialog-message ${
                            dialogMessage.includes('Computer wins!') ? 'defeat' : 
                            dialogMessage.includes('wins!') ? 'victory' : 
                            dialogMessage.includes('DRAWN') ? '' : ''
                        }`}>
                            {dialogMessage}
                        </div>
                        
                        {playAgainstComputer && (
                            <div className={`score-message ${
                                dialogMessage.includes('Computer wins!') ? 'negative' : 
                                dialogMessage.includes('DRAWN') ? 'neutral' : 'positive'
                            }`}>
                                {dialogMessage.includes('Computer wins!') ? 
                                    `${difficulty === 1 ? '-60' : '-30'} points` :
                                dialogMessage.includes('DRAWN') ?
                                    '0 points' :
                                    `${difficulty === 1 ? '+30' : '+60'} points`
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
    );
}

export default ThreeMoveTicTacToe