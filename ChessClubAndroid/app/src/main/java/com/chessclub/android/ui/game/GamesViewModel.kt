package com.chessclub.android.ui.game

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.chessclub.android.model.Game
import com.chessclub.android.repository.GameRepository
import kotlinx.coroutines.launch

class GamesViewModel : ViewModel() {
    private val _games = MutableLiveData<List<Game>>()
    val games: LiveData<List<Game>> = _games
    
    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading
    
    private val gameRepository = GameRepository()
    
    fun loadGamesForPlayer(playerId: String) {
        _isLoading.value = true
        
        viewModelScope.launch {
            gameRepository.getGamesForPlayer(playerId).collect { gamesList ->
                _games.value = gamesList
                _isLoading.value = false
            }
        }
    }
}
