package com.chessclub.android.ui.login

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.chessclub.android.model.Player
import com.chessclub.android.repository.PlayerRepository
import kotlinx.coroutines.launch

class LoginViewModel : ViewModel() {
    private val _loginResult = MutableLiveData<Player?>()
    val loginResult: LiveData<Player?> = _loginResult
    
    private val playerRepository = PlayerRepository()
    
    fun login(username: String, pin: String) {
        viewModelScope.launch {
            playerRepository.authenticatePlayer(username, pin).collect { player ->
                _loginResult.value = player
            }
        }
    }
}
