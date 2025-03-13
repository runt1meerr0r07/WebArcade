import {useEffect,useCallback } from 'react';
import { useGameContext } from './GameContext';
function usePlayerControls()
{
    const { position, setPosition, gameState,gameStatus} = useGameContext();
    
    const handleKeyDown = useCallback((e) => {
        
        if (gameStatus !== 'playing') 
        {
            return
        }
        if (gameState.hasWon || gameState.hasLost) 
        {
            return
        }
        if(e.keyCode===38)
        {
            const newPosition={x:position.x,y:(position.y-(gameState.speed))}
            setPosition(newPosition)
        }
        if(e.keyCode===40)
        {
            const newPosition={x:position.x,y:(position.y+(gameState.speed))}
            setPosition(newPosition)
        }
        if(e.keyCode===37)
        {
            const newPosition={x:(position.x-(gameState.speed)),y:position.y}
            setPosition(newPosition)
        }
        if(e.keyCode===39)
        {
            const newPosition={x:(position.x+(gameState.speed)),y:position.y}
            setPosition(newPosition)
        }
      }, [gameStatus, gameState.hasWon, gameState.hasLost, gameState.speed, position.x, position.y, setPosition]);
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
          };
        
      }, [handleKeyDown]);
    return [position, setPosition];
}
export default usePlayerControls