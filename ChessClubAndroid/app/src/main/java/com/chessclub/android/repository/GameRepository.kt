package com.chessclub.android.repository

import com.chessclub.android.model.Game
import com.chessclub.android.utils.FirebaseUtils
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow

class GameRepository {
    /**
     * Get games for a player
     * 
     * @param playerId - Player's ID
     * @return Flow of list of games
     */
    fun getGamesForPlayer(playerId: String): Flow<List<Game>> = flow {
        emit(FirebaseUtils.getGamesForPlayer(playerId))
    }
    
    /**
     * Create a new game
     * 
     * @param whitePlayerId - White player's ID
     * @param blackPlayerId - Black player's ID
     * @param result - Game result
     * @return Flow of Game ID if successful, null otherwise
     */
    fun createGame(whitePlayerId: String, blackPlayerId: String, result: String): Flow<String?> = flow {
        emit(FirebaseUtils.createGame(whitePlayerId, blackPlayerId, result))
    }
}
