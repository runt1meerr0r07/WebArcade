import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { updateScores, updateTotalOnly, GAME_INDICES } from "../../../../store/userSlice";
import { db } from "../../../../config/firebase";

const GameContext = createContext(null);

export function GameContextProvider({children}) {
    
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user);
    

    const [position, setPosition] = useState({ x: 100, y: 50 });
    const [gameState, setGameState] = useState({ hasWon: false, hasLost: false, speed: 10,touchSpeed:3});
    const [finishLine] = useState({ 
        x: 1177, 
        y: 0, 
        width: 10, 
        height: 500 
    });
    const levelConfig = useMemo(() => ({
      1: {
        obstacles: [
          {
            x: 250, 
            y: 20,  
            width: 40,
            height: 445, 
            movementType: 'vertical', 
            speed: 1.5, 
            minBound: 0,
            maxBound: 50 
          },
          {
            x: 350, 
            y: 20, 
            width: 40,
            height: 415, 
            movementType: 'vertical',
            speed: 1.5, 
            minBound: 100, 
            maxBound: 0, 
            delay: 1.5
          },
          {
            x: 450, 
            y: 20,  
            width: 40,
            height: 445, 
            movementType: 'vertical', 
            speed: 1.5,
            minBound: 0, 
            maxBound: 50 
          },
          {
            x: 850,               
            y: 50,               
            width: 150,           
            height: 150,
            movementType: 'horizontal',
            speed: 1.8,          
            minBound: 550,        
            maxBound: 850,
            delay:0  
          },
          {
            x: 530,               // Start position
            y: 300,               // Lower part of screen
            width: 150,            // Square shape
            height: 150,
            movementType: 'horizontal',
            speed: 1.8,
            minBound: 550,        // Left-most position
            maxBound: 850,        // Right-most position
            delay: 0.0            // Start with delay for out-of-sync movement
          }
        ],
        playerSpeed: 7,
        timeLimit:90
      },
      2: {
        obstacles: [
          {
            x: 120,          // Left position
            y: 0,            // Starts at top
            width: 150,
            height: 150,
            movementType: 'compound',
            speed: 1.5,
            rightBound: 200,  // Move right to x=300
            bottomBound: 300, // Move down to y=400
            leftBound: 0,   // Move left to x=120
            topBound: 0   
          },

          {
            x: 200,
            y: 20,
            width: 80,
            height: 240,
            movementType: 'circular',
            speed: 1.2,
            radius: 60,
            centerX: 300,    
            centerY: 150,
            direction: 1     
          },
          {
            x: 200,
            y: 150,
            width: 80,
            height: 240,
            movementType: 'circular',
            speed: 1.2,
            radius: 60,
            centerX: 300,    
            centerY: 220,
            direction: -1    
          },

          {
            x: 650, // Position from left
            y: 20, 
            width: 40,
            height: 400, 
            movementType: 'vertical', 
            speed: 1.5,  
            minBound: 0, // Top-most position 
            maxBound: 50 
          },
          // 4. Bottom Rising Platform
          {
            x: 700,
            y: 500,          // Starts at bottom
            width: 200,
            height: 70,
            movementType: 'vertical',
            speed: 1.3,
            minBound: 1000,  
            maxBound: 0    // Lowest position
          },
          {
            x: 950, // Position from left
            y: 20, // Start at bottom
            width: 40,
            height: 400, // Almost full height
            movementType: 'vertical',
            speed: 1.5, 
            minBound: 0, // Bottom position
            maxBound: 70, 
            delay: 1.5 
          }
          
        ],
        playerSpeed: 10,
        timeLimit:75
      },
      3: {
        obstacles: [
          {
            x: 200,
            y: 120,
            width: 80,
            height: 275,
            movementType: 'circular',
            speed: 2.0,
            radius: 0,
            centerX: 200,
            centerY: 40,
            direction: 1
          },
          
          {
            x: 380,
            y: 0,
            width: 40,
            height: 180,
            movementType: 'vertical',
            speed: 4.0,
            minBound: 0,
            maxBound: 60,
            delay: 0
          },
          {
            x: 380,
            y: 280,
            width: 40,
            height: 120,
            movementType: 'vertical',
            speed: 4.0,
            minBound: 280,
            maxBound: 340,
            delay: 1.0
          },
          
          {
            x: 300,          
            y: 0,          
            width: 120,
            height: 90,
            movementType: 'compound',
            speed: 6.0,
            rightBound: 480,  
            bottomBound: 120, 
            leftBound: 220,  
            topBound: 0,
            delay:0   
          },
          {
            x: 300,          
            y: 60,          
            width: 120,
            height: 90,
            movementType: 'compound',
            speed: 6.0,
            rightBound: 480,  
            bottomBound: 180, 
            leftBound: 220,   
            topBound: 60,
            delay:0   
          },
          {
            x: 300,          
            y: 120,          
            width: 120,
            height: 90,
            movementType: 'compound',
            speed: 6.0,
            rightBound: 480,  
            bottomBound: 240, 
            leftBound: 220,   
            topBound: 120,
            delay:0   
          },
          
          {
            x: 700,
            y: 220,
            width: 200,
            height: 25,
            movementType: 'circular',
            speed: 0.9,
            radius: 0,
            centerX: 700,
            centerY: 220,
            direction: -1
          },
          
          {
            x: 950,
            y: 0,
            width: 40,
            height: 480,
            movementType: 'vertical',
            speed: 0.7,
            minBound: 0,
            maxBound: 60,
            delay: 0
          }
        ],
        playerSpeed: 9,
        timeLimit: 45
      }
    }), []);


    const [obstacles, setObstacles] = useState([]);
    const [level,setLevel]=useState(1)
    
    const [gameStatus,setGameStatus]=useState('idle')


    useEffect(() => {
 
        setObstacles(levelConfig[level].obstacles);
    
        setGameState(prev => ({
          ...prev,
          speed: levelConfig[level].playerSpeed
        }));

        setTimeRemaining(levelConfig[level].timeLimit || 60);

        
      }, [level, levelConfig]);



    const [modalState, setModalState] = useState({
        startModal: true, 
        pauseModal: false,
        endModal: false,
        settingsModal: false
      })

    const resetGame = () => {
        setPosition({ x: 100, y: 50 });
        setGameState(prev => ({
            ...prev,
            hasWon: false,
            hasLost: false
        }));
        setTimeRemaining(levelConfig[level].timeLimit || 60);
    };
    const [timeRemaining,setTimeRemaining]=useState(120)
    useEffect(()=>{
      
      if(gameStatus === 'idle' || gameStatus==='paused' || gameState.hasLost || gameState.hasWon)
      {
        return
      }
      const intervalId = setInterval(() => setTimeRemaining(time => time - 1), 1000);

      return () => clearInterval(intervalId);
    },[gameState.hasWon,gameStatus,gameState.hasLost])

    const updatePlayerScore = (points) => {
        console.log("Updating PixelRush score with points:", points);
        
        if (user.isLoggedIn) {
          
            if (points > 0) {
                dispatch(updateScores({
                    gameId: 'PixelRush',
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
                        const gameIndex = GAME_INDICES.PixelRush;
                        
                       
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
                    console.log(`${points}`);
                })
                .catch(err => {
                    console.error("Error", err);
                });
        } else {
            console.log("User not logged in, skipping score update");
        }
    };

    return (
        <GameContext.Provider value={{
            position, 
            setPosition, 
            gameState, 
            setGameState,
            finishLine,
            levelConfig,
            obstacles,
            setObstacles,
            gameStatus,
            setGameStatus,
            level,
            setLevel,
            modalState,
            setModalState,
            resetGame,
            timeRemaining,
            setTimeRemaining,
            updatePlayerScore 
        }}>
            {children}
        </GameContext.Provider>
    );
}


export function useGameContext() {
    return useContext(GameContext);
}