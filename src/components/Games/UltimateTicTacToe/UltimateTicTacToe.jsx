import React, { useEffect, useState } from 'react'
import BigBoard from './components/BigBoard'
import styles from './components/GameStatus.module.css'
import { useDispatch, useSelector } from 'react-redux';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { updateScores, updateTotalOnly, GAME_INDICES } from "../../../store/userSlice";
import { db } from "../../../config/firebase";

function UltimateTicTacToe() {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user);
    
    const [bigGame, setBigGame] = useState(Array(9).fill().map(() => Array(9).fill(null)))
    const [turn, setTurn] = useState("X")
    const [isGameover, setIsGameOver] = useState(false)
    const [fieldofPlay, setFieldofPlay] = useState(null)
    const [smallBoardResult, setSmallBoardResult] = useState(Array(9).fill(null));
    const [lastPlayedCell, setLastPlayedCell] = useState(null);
    
    //state for computer play
    const [playAgainstComputer, setPlayAgainstComputer] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [computerSymbol, setComputerSymbol] = useState("O");
    
    const isSmallWin = (newBigGame, boardIndex) => {    
        if (
            (newBigGame[boardIndex][0] && newBigGame[boardIndex][0] === newBigGame[boardIndex][1] && newBigGame[boardIndex][1] === newBigGame[boardIndex][2]) ||
            (newBigGame[boardIndex][3] && newBigGame[boardIndex][3] === newBigGame[boardIndex][4] && newBigGame[boardIndex][4] === newBigGame[boardIndex][5]) ||
            (newBigGame[boardIndex][6] && newBigGame[boardIndex][6] === newBigGame[boardIndex][7] && newBigGame[boardIndex][7] === newBigGame[boardIndex][8]) ||
            (newBigGame[boardIndex][0] && newBigGame[boardIndex][0] === newBigGame[boardIndex][3] && newBigGame[boardIndex][3] === newBigGame[boardIndex][6]) ||
            (newBigGame[boardIndex][1] && newBigGame[boardIndex][1] === newBigGame[boardIndex][4] && newBigGame[boardIndex][4] === newBigGame[boardIndex][7]) ||
            (newBigGame[boardIndex][2] && newBigGame[boardIndex][2] === newBigGame[boardIndex][5] && newBigGame[boardIndex][5] === newBigGame[boardIndex][8]) ||
            (newBigGame[boardIndex][0] && newBigGame[boardIndex][0] === newBigGame[boardIndex][4] && newBigGame[boardIndex][4] === newBigGame[boardIndex][8]) ||
            (newBigGame[boardIndex][2] && newBigGame[boardIndex][2] === newBigGame[boardIndex][4] && newBigGame[boardIndex][4] === newBigGame[boardIndex][6])
        )
            return true
        else
        {
            return false
        }
    }
    
    const isSmallDraw = (newBigGame, boardIndex) => {
        for (let index = 0; index < 9; index++) {
            if(newBigGame[boardIndex][index] == null)
            {
                return false;
            }
        }
        return true;
    }
    
    useEffect(() => {
        const previousPlayer = turn === 'X' ? 'O' : 'X';
        for (let index = 0; index < 9; index++)
        {
            if(isSmallWin(bigGame, index))
            {
                setSmallBoardResult(prev => {
                    const newResult = [...prev];
                    if(newResult[index] !== null)
                    {
                        return newResult
                    }
                    newResult[index] = previousPlayer;
                    return newResult;
                });
            }
            else
            {
                if(isSmallDraw(bigGame, index))
                {
                    setSmallBoardResult(prev => {
                        if (prev[index] !== null) 
                        {
                            return prev;
                        }
                        const newResult = [...prev];
                        if(newResult[index] !== null)
                        {
                            return newResult
                        }
                        newResult[index] = "DRAW";
                        return newResult
                    });
                }
            }
        }
    }, [turn, bigGame])

    const isFinalWin = (smallBoardResult) => {
        if (
            (smallBoardResult[0] && smallBoardResult[0] !== "DRAW" && smallBoardResult[0] === smallBoardResult[1] && smallBoardResult[1] === smallBoardResult[2]) ||
            (smallBoardResult[3] && smallBoardResult[3] !== "DRAW" && smallBoardResult[3] === smallBoardResult[4] && smallBoardResult[4] === smallBoardResult[5]) ||
            (smallBoardResult[6] && smallBoardResult[6] !== "DRAW" && smallBoardResult[6] === smallBoardResult[7] && smallBoardResult[7] === smallBoardResult[8]) ||
            (smallBoardResult[0] && smallBoardResult[0] !== "DRAW" && smallBoardResult[0] === smallBoardResult[3] && smallBoardResult[3] === smallBoardResult[6]) ||
            (smallBoardResult[1] && smallBoardResult[1] !== "DRAW" && smallBoardResult[1] === smallBoardResult[4] && smallBoardResult[4] === smallBoardResult[7]) ||
            (smallBoardResult[2] && smallBoardResult[2] !== "DRAW" && smallBoardResult[2] === smallBoardResult[5] && smallBoardResult[5] === smallBoardResult[8]) ||
            (smallBoardResult[0] && smallBoardResult[0] !== "DRAW" && smallBoardResult[0] === smallBoardResult[4] && smallBoardResult[4] === smallBoardResult[8]) ||
            (smallBoardResult[2] && smallBoardResult[2] !== "DRAW" && smallBoardResult[2] === smallBoardResult[4] && smallBoardResult[4] === smallBoardResult[6])
        ) 
        {  
            return true
        }
        return false
    }

    const isFinalDraw = (smallBoardResult) => {
        if (isFinalWin(smallBoardResult)) {
            return false;
        }
        for (let index = 0; index < 9; index++) {
            if(smallBoardResult[index] === null) {
                return false
            }
        }
        return true
    }

    useEffect(() => {
        if(isFinalWin(smallBoardResult) || isFinalDraw(smallBoardResult)) {
            setIsGameOver(true)
            setFieldofPlay(null)  
        }
    }, [smallBoardResult])

    useEffect(() => {
        if(smallBoardResult[lastPlayedCell] === null) {
            setFieldofPlay(lastPlayedCell)
        }
        else {
            setFieldofPlay(null)
        }
    }, [smallBoardResult, lastPlayedCell])
    
  
    const onMove = (boardIndex, cellIndex) => {
        // Skip if game already over or invalid move
        if (isGameover || bigGame[boardIndex][cellIndex] !== null || (fieldofPlay !== null && boardIndex !== fieldofPlay)) {
            return;
        }
        
        // Make the move
        const newBigGame = bigGame.map(row => [...row]);
        newBigGame[boardIndex][cellIndex] = turn;
        setBigGame(newBigGame);
        setLastPlayedCell(cellIndex);
        
        
        const tempSmallBoardResults = [...smallBoardResult];
        
        const currentPlayer = turn;
        let gameEnded = false;
        
        // Check if this move won any small boards
        for (let index = 0; index < 9; index++) {
            if (tempSmallBoardResults[index] === null) {
                if (isSmallWin(newBigGame, index)) {
                    tempSmallBoardResults[index] = currentPlayer;
                } else if (isSmallDraw(newBigGame, index)) {
                    tempSmallBoardResults[index] = "DRAW";
                }
            }
        }
        
        // Check if the game is now won
        if (isFinalWin(tempSmallBoardResults) || isFinalDraw(tempSmallBoardResults)) {
            gameEnded = true;
            setIsGameOver(true);
            setFieldofPlay(null);
            
            if (playAgainstComputer) {
                if (isFinalWin(tempSmallBoardResults)) {
                    // The current player is the winner
                    if (currentPlayer === computerSymbol) {
                        updatePlayerScore(-70);
                    } else {
                        updatePlayerScore(70);
                    }
                } else {
                    updatePlayerScore(0);
                }
            }
        }
  
        const nextTurn = turn === 'X' ? 'O' : 'X';
        setTurn(nextTurn);
        
       
        if (!gameEnded && playAgainstComputer && nextTurn === computerSymbol) {
            setTimeout(() => {

                if (!isGameover) {
                    makeComputerMove(newBigGame, cellIndex);
                }
            }, 800);
        }
    };


    const makeComputerMove = (currentBoard, cellIndex) => {
        
        if (isGameover) 
        {
            return
        }
        
        const nextFieldOfPlay = smallBoardResult[cellIndex] === null ? cellIndex : null;
        
        let validBoardIndex = [];
        if (nextFieldOfPlay !== null) 
        {
            validBoardIndex = [nextFieldOfPlay];
        } 
        else 
        {
            
            for (let index = 0; index < smallBoardResult.length; index++)
            {
                
                if (smallBoardResult[index] === null) 
                {
                    validBoardIndex.push(index);
                }
            }
        }
        
        if (validBoardIndex.length === 0) 
        {
            return
        }
        
        for (const boardIndex of validBoardIndex) {
            for (let i = 0; i < 9; i++) {
                if (currentBoard[boardIndex][i] !== null) 
                {
                    continue;
                }
                const testBoard = currentBoard.map(row => [...row]);
                testBoard[boardIndex][i] = computerSymbol;
                
                if (isSmallWin(testBoard, boardIndex)) {
                    executeComputerMove(currentBoard, boardIndex, i);
                    return;
                }
            }
        }
     
        const playerSymbol = computerSymbol === 'X' ? 'O' : 'X';
        for (const boardIndex of validBoardIndex) {
            for (let i = 0; i < 9; i++) {
                if (currentBoard[boardIndex][i] !== null) 
                {
                    continue;
                }    
                const testBoard = currentBoard.map(row => [...row]);
                testBoard[boardIndex][i] = playerSymbol;
                
                if (isSmallWin(testBoard, boardIndex)) {
                    executeComputerMove(currentBoard, boardIndex, i);
                    return;
                }
            }
        }
        
        const availableMoves = [];
        for (const boardIndex of validBoardIndex) {
            for (let i = 0; i < 9; i++) {
                if (currentBoard[boardIndex][i] === null) {
                    availableMoves.push({ boardIndex, cellIndex: i });
                }
            }
        }
        
        if (availableMoves.length > 0) {
            const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
            executeComputerMove(currentBoard, randomMove.boardIndex, randomMove.cellIndex);
        }
    };


    const executeComputerMove = (currentBoard, boardIndex, cellIndex) => {
        
        setBigGame(prevGame => {

            const newGame = prevGame.map(row => [...row]);

            newGame[boardIndex][cellIndex] = computerSymbol;
            return newGame;
        });
        
        setLastPlayedCell(cellIndex);
        setTurn(computerSymbol === 'X' ? 'O' : 'X');
    };


    const startGame = (againstComputer) => {
        
        setBigGame(Array(9).fill().map(() => Array(9).fill(null)));
        setSmallBoardResult(Array(9).fill(null));
        setLastPlayedCell(null);
        setFieldofPlay(null);
        setIsGameOver(false);
      
        const randomComputerFirst = Math.random() < 0.5;
        const compSymbol = randomComputerFirst ? "X" : "O";
        setComputerSymbol(compSymbol);
      
        setTurn("X");
        setPlayAgainstComputer(againstComputer);
        setGameStarted(true);
        
        if (againstComputer && randomComputerFirst) {
            setTimeout(() => {

        const centerBoard = 4;  
        const centerCell = 4;   

        
        const shouldUseRandomMove = Math.random() < 0.3;  

        
        let boardIndex;
        if (shouldUseRandomMove) 
        {
            boardIndex = Math.floor(Math.random() * 9);
        } 
        else 
        {
            boardIndex = centerBoard;
        }
        let cellIndex;
        if (shouldUseRandomMove) 
        {
            cellIndex = Math.floor(Math.random() * 9);
        } 
        else 
        {  
            cellIndex = centerCell;
        }
                
        const firstMove = Array(9).fill().map(() => Array(9).fill(null));
        firstMove[boardIndex][cellIndex] = "X";
                
        setBigGame(firstMove);
        setLastPlayedCell(cellIndex);
        setTurn("O");
            }, 800);
        }
    };
    
    const resetGame = () => {
        setGameStarted(false);
    }

    const getGameStatus = () => {
        if (isGameover) {
            if (isFinalWin(smallBoardResult)) {
                const winner = turn === 'X' ? 'O' : 'X';
                return playAgainstComputer && winner === computerSymbol 
                    ? 'Computer Wins!' 
                    : `Player ${winner} Wins!`;
            }
            return 'Game Draw!';
        }
        
        if (playAgainstComputer && turn === computerSymbol) {
            return "Computer's Turn";
        }
        
        return playAgainstComputer ? "Your Turn" : `Player ${turn}'s Turn`;
    };

    const updatePlayerScore = (points) => {
        console.log("Updating score with points:", points);
        
        if (user.isLoggedIn) {

            if (points > 0) {
                dispatch(updateScores({
                    gameId: 'UltimateTTT',
                    gameScore: points
                }));
            } else {
                dispatch(updateTotalOnly(points));
            }
    
            const userRef = doc(db, "users", user.userId);
            
            getDoc(userRef)
                .then((docSnap) => {
                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        const currentHighScore = userData.highScore || [0, 0, 0, 0];
                        const gameIndex = GAME_INDICES.UltimateTTT;
                        
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
                    console.log(`Firestore update ${points}`);
                })
                .catch(err => {
                    console.error("Error Firestore", err);
                });
        } else {
            console.log("User not logged in, skipping score update");
        }
    };

    useEffect(() => {
        if(isFinalWin(smallBoardResult) || isFinalDraw(smallBoardResult)) {
            
            if (!isGameover) {
                setIsGameOver(true);
                setFieldofPlay(null);
               
                const winningPlayer = turn === 'X' ? 'O' : 'X';
                
                if (playAgainstComputer) {
                    if (isFinalWin(smallBoardResult)) {
                        if (winningPlayer === computerSymbol) {
                            updatePlayerScore(-70);
                        } else {
                            updatePlayerScore(70);
                        }
                    } else {
                        updatePlayerScore(0);
                    }
                }
            }
        }
    }, [smallBoardResult]);  


    const closeGame = () => {
        
        setBigGame(Array(9).fill().map(() => Array(9).fill(null)));
        setSmallBoardResult(Array(9).fill(null));
        setLastPlayedCell(null);
        setFieldofPlay(null);
        setIsGameOver(false);
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
        <div className={styles.gameContainer}>
            {!gameStarted ? (
                <div className={styles.modeSelector}>
                    <button className={styles.closeButtonFixed} onClick={closeGame}>
                        ✕
                    </button>
                    <h3>Select Game Mode</h3>
                    <button 
                        className={styles.modeButton}
                        onClick={() => startGame(false)}
                    >
                        2 Players
                    </button>
                    <button 
                        className={styles.modeButton}
                        onClick={() => startGame(true)}
                    >
                        Play vs Computer
                    </button>
                </div>
            ) : (
                <>
                    <button className={styles.closeButtonGame} onClick={closeGame}>
                        ✕
                    </button>
                    <div className={`${styles.statusBar} ${styles[`turn${turn}`]}`}>
                        {getGameStatus()}
                        {isGameover && (
                            <button 
                                className={styles.resetButton}
                                onClick={resetGame}
                            >
                                New Game
                            </button>
                        )}
                    </div>
                    <BigBoard 
                        bigGame={bigGame}
                        setBigGame={setBigGame}
                        onMove={onMove}
                        smallBoardResult={smallBoardResult}
                        fieldofPlay={fieldofPlay}
                        isGameover={isGameover}
                    />
                    
                    {isGameover && playAgainstComputer && (
                        <div className={styles.dialogOverlay}>
                            <div className={`${styles.dialogBox} ${
                                isFinalWin(smallBoardResult) && (turn === 'X' ? 'O' : 'X') !== computerSymbol ? styles.victory :
                                isFinalWin(smallBoardResult) ? styles.defeat : ''
                            }`}>
                                <button className={styles.dialogCloseButton} onClick={() => setIsGameOver(false)}>
                                    ✕
                                </button>
                                <div className={styles.dialogMessage}>
                                    {isFinalWin(smallBoardResult) ? 
                                        ((turn === 'X' ? 'O' : 'X') === computerSymbol ? 'Computer wins!' : 'You win!') : 
                                        'Game is DRAWN!!!'}
                                </div>
                                
                                <div className={`${styles.scoreMessage} ${
                                    isFinalWin(smallBoardResult) && (turn === 'X' ? 'O' : 'X') === computerSymbol ? styles.negative :
                                    isFinalWin(smallBoardResult) ? styles.positive : styles.neutral
                                }`}>
                                    {isFinalWin(smallBoardResult) && (turn === 'X' ? 'O' : 'X') === computerSymbol ? '-70 points' :
                                    isFinalWin(smallBoardResult) ? '+70 points' : '0 points'}
                                </div>
                                
                                <div className={styles.dialogButtons}>
                                    <button className={styles.resetButton} onClick={resetGame}>
                                        Play Again
                                    </button>
                                    <button className={styles.viewButton} onClick={() => setIsGameOver(false)}>
                                        View Board
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default UltimateTicTacToe
