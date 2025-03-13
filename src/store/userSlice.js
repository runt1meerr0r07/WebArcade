import {createSlice} from '@reduxjs/toolkit'

export const GAME_INDICES = {
    TicTacToe: 0,
    UltimateTTT: 1,
    threeMoveTTT: 2,
    PixelRush: 3
};

const initialState = {
    userId: null,
    username: null,
    totalScore: 0,
    highScore: [0, 0, 0, 0], 
    isLoggedIn: false
}

export const userSlice = createSlice({
    name: 'userInfo',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.userId = action.payload.userId
            state.username = action.payload.username
            state.isLoggedIn = true
            
            if (action.payload.highScore) {
                state.highScore = action.payload.highScore;
            }
            
            if (action.payload.totalScore) {
                state.totalScore = action.payload.totalScore;
            }
        },
        updateScores: (state, action) => {
            const { gameId, gameScore } = action.payload;
            const gameIndex = GAME_INDICES[gameId];
            
            state.totalScore += gameScore;
            
            
            if (gameIndex !== undefined && gameScore > state.highScore[gameIndex]) {
                state.highScore[gameIndex] = gameScore;
            }
        },
        updateTotalOnly: (state, action) => {
                state.totalScore = state.totalScore + action.payload;
            },
        },
    }
)

export const {setUser, updateScores, updateTotalOnly} = userSlice.actions
export default userSlice.reducer