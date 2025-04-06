package com.chessclub.android.repository

import com.chessclub.android.model.Player
import com.chessclub.android.utils.FirebaseUtils
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow

class PlayerRepository {
    /**
     * Authenticate a player with name and PIN
     * 
     * @param name - Player's name
     * @param pin - Player's PIN
     * @return Flow of Player object if authentication successful, null otherwise
     */
    fun authenticatePlayer(name: String, pin: String): Flow<Player?> = flow {
        emit(FirebaseUtils.authenticatePlayer(name, pin))
    }
    
    /**
     * Get all players ordered by rating
     * 
     * @return Flow of list of players
     */
    fun getAllPlayers(): Flow<List<Player>> = flow {
        emit(FirebaseUtils.getAllPlayers())
    }
    
    /**
     * Get a player by ID
     * 
     * @param playerId - Player's ID
     * @return Flow of Player object if found, null otherwise
     */
    fun getPlayerById(playerId: String): Flow<Player?> = flow {
        emit(FirebaseUtils.getPlayerById(playerId))
    }
    
    /**
     * Change player's PIN
     * 
     * @param playerId - Player's ID
     * @param newPin - New PIN
     * @return Flow of true if successful, false otherwise
     */
    fun changePlayerPin(playerId: String, newPin: String): Flow<Boolean> = flow {
        emit(FirebaseUtils.changePlayerPin(playerId, newPin))
    }
    
    /**
     * Admin function: Create a new player
     * 
     * @param name - Player's name
     * @param pin - Player's PIN
     * @param isAdmin - Whether the player is an admin
     * @return Flow of Player ID if successful, null otherwise
     */
    fun createPlayer(name: String, pin: String, isAdmin: Boolean = false): Flow<String?> = flow {
        emit(FirebaseUtils.createPlayer(name, pin, isAdmin))
    }
    
    /**
     * Admin function: Update a player
     * 
     * @param player - Updated player object
     * @return Flow of true if successful, false otherwise
     */
    fun updatePlayer(player: Player): Flow<Boolean> = flow {
        emit(FirebaseUtils.updatePlayer(player))
    }
    
    /**
     * Admin function: Delete a player
     * 
     * @param playerId - Player's ID
     * @return Flow of true if successful, false otherwise
     */
    fun deletePlayer(playerId: String): Flow<Boolean> = flow {
        emit(FirebaseUtils.deletePlayer(playerId))
    }
}
