import { GameContextProvider } from './hooks/GameContext';
import GameBoard from './components/GameBoard';
function PixelRush() {
    return (
        <GameContextProvider>
            <GameBoard/>
        </GameContextProvider>
    )
}

export default PixelRush
