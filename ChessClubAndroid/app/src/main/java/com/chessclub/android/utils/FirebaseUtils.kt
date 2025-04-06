package com.chessclub.android.utils

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import com.chessclub.android.model.Player
import com.chessclub.android.model.Game
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import android.util.Log

/**
 * Utility class for Firebase operations
 */
object FirebaseUtils {
    private const val TAG = "FirebaseUtils"

    private val auth = FirebaseAuth.getInstance()
    private val db = FirebaseFirestore.getInstance()

    init {
        Log.d(TAG, "Firebase initialized with project ID: ${com.google.firebase.FirebaseApp.getInstance().options.projectId}")
    }
    
    // Collection references
    private val playersCollection = db.collection("players")
    private val gamesCollection = db.collection("games")
    
    /**
     * Authenticate a player with name and PIN
     * 
     * @param name - Player's name
     * @param pin - Player's PIN
     * @return Player object if authentication successful, null otherwise
     */
    suspend fun authenticatePlayer(name: String, pin: String): Player? = withContext(Dispatchers.IO) {
        try {
            val snapshot = playersCollection
                .whereEqualTo("name", name)
                .get()
                .await()
                
            if (snapshot.isEmpty) return@withContext null
            
            val player = snapshot.documents[0].toObject(Player::class.java)
            
            // In a real app, you would use secure password hashing
            // For simplicity, we're doing direct PIN comparison here
            if (player?.pin == pin) {
                return@withContext player
            }
            
            return@withContext null
        } catch (e: Exception) {
            Log.e(TAG, "Error authenticating player", e)
            return@withContext null
        }
    }
    
    /**
     * Get all players ordered by rating
     * 
     * @return List of players
     */
    suspend fun getAllPlayers(): List<Player> = withContext(Dispatchers.IO) {
        try {
            val snapshot = playersCollection
                .orderBy("rating", Query.Direction.DESCENDING)
                .get()
                .await()
            
            Log.d(TAG, "Retrieved ${snapshot.size()} players")    
            return@withContext snapshot.toObjects(Player::class.java)
        } catch (e: Exception) {
            Log.e(TAG, "Error getting all players", e)
            return@withContext emptyList()
        }
    }
    
    /**
     * Get a player by ID
     * 
     * @param playerId - Player's ID
     * @return Player object if found, null otherwise
     */
    suspend fun getPlayerById(playerId: String): Player? = withContext(Dispatchers.IO) {
        try {
            val snapshot = playersCollection.document(playerId).get().await()
            return@withContext snapshot.toObject(Player::class.java)
        } catch (e: Exception) {
            Log.e(TAG, "Error getting player by ID: $playerId", e)
            return@withContext null
        }
    }
    
    /**
     * Get games for a player
     * 
     * @param playerId - Player's ID
     * @return List of games
     */
    suspend fun getGamesForPlayer(playerId: String): List<Game> = withContext(Dispatchers.IO) {
        try {
            val snapshot = gamesCollection
                .whereEqualTo("whitePlayerId", playerId)
                .whereEqualTo("verified", true)
                .orderBy("date", Query.Direction.DESCENDING)
                .get()
                .await()
                
            val games = snapshot.toObjects(Game::class.java).toMutableList()
            
            // Get black games as well
            val blackGames = gamesCollection
                .whereEqualTo("blackPlayerId", playerId)
                .whereEqualTo("verified", true)
                .orderBy("date", Query.Direction.DESCENDING)
                .get()
                .await()
                .toObjects(Game::class.java)
                
            games.addAll(blackGames)
            
            // Sort all games by date descending
            return@withContext games.sortedByDescending { it.date }
        } catch (e: Exception) {
            Log.e(TAG, "Error getting games for player: $playerId", e)
            return@withContext emptyList()
        }
    }
    
    /**
     * Create a new game
     * 
     * @param whitePlayerId - White player's ID
     * @param blackPlayerId - Black player's ID
     * @param result - Game result
     * @return Game ID if successful, null otherwise
     */
    suspend fun createGame(whitePlayerId: String, blackPlayerId: String, result: String): String? = withContext(Dispatchers.IO) {
        try {
            // Get player data
            val whitePlayer = getPlayerById(whitePlayerId) ?: return@withContext null
            val blackPlayer = getPlayerById(blackPlayerId) ?: return@withContext null
            
            // Calculate new ratings
            val (whiteNewRating, blackNewRating) = EloCalculator.calculateNewRatings(
                whitePlayer.rating,
                blackPlayer.rating,
                result
            )
            
            // Create game document
            val gameRef = gamesCollection.document()
            val game = Game(
                id = gameRef.id,
                whitePlayerId = whitePlayerId,
                blackPlayerId = blackPlayerId,
                result = result,
                date = System.currentTimeMillis(),
                verified = true, // Auto-verify for mobile app
                whitePlayerName = whitePlayer.name,
                blackPlayerName = blackPlayer.name,
                whitePlayerRatingBefore = whitePlayer.rating,
                blackPlayerRatingBefore = blackPlayer.rating,
                whitePlayerRatingAfter = whiteNewRating,
                blackPlayerRatingAfter = blackNewRating
            )
            
            // Update player statistics based on result
            val whiteWins = if (result == "1-0") 1 else 0
            val blackWins = if (result == "0-1") 1 else 0
            val draws = if (result == "1/2-1/2") 1 else 0
            
            // Update white player
            val whiteUpdates = hashMapOf<String, Any>(
                "rating" to whiteNewRating,
                "gamesPlayed" to (whitePlayer.gamesPlayed + 1),
                "gamesWon" to (whitePlayer.gamesWon + whiteWins),
                "gamesLost" to (whitePlayer.gamesLost + blackWins),
                "gamesDrawn" to (whitePlayer.gamesDrawn + draws)
            )
            
            // Update black player
            val blackUpdates = hashMapOf<String, Any>(
                "rating" to blackNewRating,
                "gamesPlayed" to (blackPlayer.gamesPlayed + 1),
                "gamesWon" to (blackPlayer.gamesWon + blackWins),
                "gamesLost" to (blackPlayer.gamesLost + whiteWins),
                "gamesDrawn" to (blackPlayer.gamesDrawn + draws)
            )
            
            // Execute batch update
            db.runBatch { batch ->
                batch.set(gameRef, game)
                batch.update(playersCollection.document(whitePlayerId), whiteUpdates)
                batch.update(playersCollection.document(blackPlayerId), blackUpdates)
            }.await()
            
            Log.d(TAG, "Game created successfully with ID: ${gameRef.id}")
            return@withContext gameRef.id
        } catch (e: Exception) {
            Log.e(TAG, "Error creating game", e)
            return@withContext null
        }
    }
    
    /**
     * Change player PIN
     * 
     * @param playerId - Player's ID
     * @param newPin - New PIN
     * @return true if successful, false otherwise
     */
    suspend fun changePlayerPin(playerId: String, newPin: String): Boolean = withContext(Dispatchers.IO) {
        try {
            // In a real app, you would hash the PIN
            playersCollection.document(playerId)
                .update("pin", newPin)
                .await()
            Log.d(TAG, "PIN updated for player: $playerId")
            return@withContext true
        } catch (e: Exception) {
            Log.e(TAG, "Error changing PIN for player: $playerId", e)
            return@withContext false
        }
    }
    
    /**
     * Admin function: Create a new player
     * 
     * @param name - Player's name
     * @param pin - Player's PIN
     * @param isAdmin - Whether the player is an admin
     * @return Player ID if successful, null otherwise
     */
    suspend fun createPlayer(name: String, pin: String, isAdmin: Boolean = false): String? = withContext(Dispatchers.IO) {
        try {
            // Check if player with this name already exists
            val existing = playersCollection
                .whereEqualTo("name", name)
                .get()
                .await()
                
            if (!existing.isEmpty) {
                Log.w(TAG, "Player with name '$name' already exists")
                return@withContext null // Player already exists
            }
            
            val playerRef = playersCollection.document()
            val player = Player(
                id = playerRef.id,
                name = name,
                rating = 1500, // Starting rating
                pin = pin, // In real app, hash the PIN
                isAdmin = isAdmin,
                createdAt = System.currentTimeMillis()
            )
            
            playerRef.set(player).await()
            Log.d(TAG, "Player created successfully with ID: ${playerRef.id}")
            return@withContext playerRef.id
        } catch (e: Exception) {
            Log.e(TAG, "Error creating player", e)
            return@withContext null
        }
    }
    
    /**
     * Admin function: Update a player
     * 
     * @param player - Updated player object
     * @return true if successful, false otherwise
     */
    suspend fun updatePlayer(player: Player): Boolean = withContext(Dispatchers.IO) {
        try {
            playersCollection.document(player.id)
                .set(player)
                .await()
            Log.d(TAG, "Player updated successfully: ${player.id}")
            return@withContext true
        } catch (e: Exception) {
            Log.e(TAG, "Error updating player: ${player.id}", e)
            return@withContext false
        }
    }
    
    /**
     * Admin function: Delete a player
     * 
     * @param playerId - Player's ID
     * @return true if successful, false otherwise
     */
    suspend fun deletePlayer(playerId: String): Boolean = withContext(Dispatchers.IO) {
        try {
            playersCollection.document(playerId)
                .delete()
                .await()
            Log.d(TAG, "Player deleted successfully: $playerId")
            return@withContext true
        } catch (e: Exception) {
            Log.e(TAG, "Error deleting player: $playerId", e)
            return@withContext false
        }
    }
}
