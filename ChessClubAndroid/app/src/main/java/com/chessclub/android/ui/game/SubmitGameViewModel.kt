package com.chessclub.android.ui.game

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.chessclub.android.model.Player
import com.chessclub.android.repository.GameRepository
import com.chessclub.android.repository.PlayerRepository
import kotlinx.coroutines.launch

class SubmitGameViewModel : ViewModel() {
    private val _players = MutableLiveData<List<Player>>()
    val players: LiveData<List<Player>> = _players
    
    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading
    
    private val _gameCreated = MutableLiveData<Boolean>()
    val gameCreated: LiveData<Boolean> = _gameCreated
    
    private val playerRepository = PlayerRepository()
    private val gameRepository = GameRepository()
    
    fun loadPlayers() {
        _isLoading.value = true
        
        viewModelScope.launch {
            playerRepository.getAllPlayers().collect { playersList ->
                _players.value = playersList
                _isLoading.value = false
            }
        }
    }
    
    fun submitGame(
        whitePlayerId: String,
        blackPlayerId: String,
        whitePlayerPin: String,
        blackPlayerPin: String,
        gameResult: String
    ) {
        _isLoading.value = true
        
        viewModelScope.launch {
            // Verify white player PIN
            val whitePlayerAuthResult = playerRepository.authenticatePlayer(
                _players.value?.find { it.id == whitePlayerId }?.name ?: "",
                whitePlayerPin
            ).collect { player ->
                if (player == null || player.id != whitePlayerId) {
                    _isLoading.value = false
                    _gameCreated.value = false
                    return@collect
                }
                
                // Verify black player PIN
                playerRepository.authenticatePlayer(
                    _players.value?.find { it.id == blackPlayerId }?.name ?: "",
                    blackPlayerPin
                ).collect { blackPlayer ->
                    if (blackPlayer == null || blackPlayer.id != blackPlayerId) {
                        _isLoading.value = false
                        _gameCreated.value = false
                        return@collect
                    }
                    
                    // Both PINs verified, create the game
                    gameRepository.createGame(whitePlayerId, blackPlayerId, gameResult)
                        .collect { gameId ->
                            _isLoading.value = false
                            _gameCreated.value = gameId != null
                        }
                }
            }
        }
    }
}
