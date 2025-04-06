package com.chessclub.android.model

data class Player(
    val id: String = "",
    val name: String = "",
    val rating: Int = 1500,
    val gamesPlayed: Int = 0,
    val gamesWon: Int = 0,
    val gamesLost: Int = 0,
    val gamesDrawn: Int = 0,
    val isAdmin: Boolean = false,
    val pin: String = "", // Note: PIN should be hashed in the database
    val createdAt: Long = System.currentTimeMillis()
) {
    // Convenience method to get win rate
    fun getWinRate(): Float {
        if (gamesPlayed == 0) return 0f
        return gamesWon.toFloat() / gamesPlayed.toFloat()
    }
    
    // Convenience method to get draw rate
    fun getDrawRate(): Float {
        if (gamesPlayed == 0) return 0f
        return gamesDrawn.toFloat() / gamesPlayed.toFloat()
    }
    
    // Create a display-friendly player entry (omits sensitive data)
    fun toDisplayPlayer(): Player {
        return this.copy(pin = "")
    }
}
