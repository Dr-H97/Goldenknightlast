package com.chessclub.android.ui.rankings

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.chessclub.android.model.Player
import com.chessclub.android.repository.PlayerRepository
import kotlinx.coroutines.launch

class RankingsViewModel : ViewModel() {
    private val _players = MutableLiveData<List<Player>>()
    val players: LiveData<List<Player>> = _players
    
    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading
    
    private val playerRepository = PlayerRepository()
    
    fun loadPlayers() {
        _isLoading.value = true
        
        viewModelScope.launch {
            playerRepository.getAllPlayers().collect { playersList ->
                _players.value = playersList
                _isLoading.value = false
            }
        }
    }
}
