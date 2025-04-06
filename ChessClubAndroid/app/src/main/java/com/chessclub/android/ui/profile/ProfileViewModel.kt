package com.chessclub.android.ui.profile

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.chessclub.android.model.Game
import com.chessclub.android.model.Player
import com.chessclub.android.repository.GameRepository
import com.chessclub.android.repository.PlayerRepository
import kotlinx.coroutines.launch

class ProfileViewModel : ViewModel() {
    private val _player = MutableLiveData<Player?>()
    val player: LiveData<Player?> = _player
    
    private val _ratingHistory = MutableLiveData<List<Pair<Long, Int>>>()
    val ratingHistory: LiveData<List<Pair<Long, Int>>> = _ratingHistory
    
    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading
    
    private val _pinChangeResult = MutableLiveData<Boolean>()
    val pinChangeResult: LiveData<Boolean> = _pinChangeResult
    
    private val playerRepository = PlayerRepository()
    private val gameRepository = GameRepository()
    
    fun loadPlayerData(playerId: String) {
        _isLoading.value = true
        
        viewModelScope.launch {
            // Load player data
            playerRepository.getPlayerById(playerId).collect { playerData ->
                _player.value = playerData
                
                // After getting player data, load games for rating history
                gameRepository.getGamesForPlayer(playerId).collect { games ->
                    calculateRatingHistory(games, playerId)
                    _isLoading.value = false
                }
            }
        }
    }
    
    private fun calculateRatingHistory(games: List<Game>, playerId: String) {
        if (games.isEmpty()) {
            _ratingHistory.value = listOf()
            return
        }
        
        // Sort games by date
        val sortedGames = games.sortedBy { it.date }
        
        // Start with initial rating and build history
        val ratingHistory = mutableListOf<Pair<Long, Int>>()
        
        // Add player's current rating at the current time
        val currentPlayer = _player.value
        if (currentPlayer != null) {
            ratingHistory.add(Pair(System.currentTimeMillis(), currentPlayer.rating))
        }
        
        // Add ratings after each game
        for (game in sortedGames.reversed()) {
            val rating = if (game.whitePlayerId == playerId) {
                game.whitePlayerRatingAfter
            } else {
                game.blackPlayerRatingAfter
            }
            
            ratingHistory.add(Pair(game.date, rating))
        }
        
        // Reverse to get chronological order
        _ratingHistory.value = ratingHistory.reversed()
    }
    
    fun changePin(playerId: String, currentPin: String, newPin: String) {
        _isLoading.value = true
        
        viewModelScope.launch {
            // First verify the current PIN
            playerRepository.authenticatePlayer(
                _player.value?.name ?: "",
                currentPin
            ).collect { authenticatedPlayer ->
                if (authenticatedPlayer != null && authenticatedPlayer.id == playerId) {
                    // Current PIN is correct, change to new PIN
                    playerRepository.changePlayerPin(playerId, newPin).collect { success ->
                        _pinChangeResult.value = success
                        _isLoading.value = false
                    }
                } else {
                    // Current PIN is incorrect
                    _pinChangeResult.value = false
                    _isLoading.value = false
                }
            }
        }
    }
}
