package com.chessclub.android.model

data class Game(
    val id: String = "",
    val whitePlayerId: String = "",
    val blackPlayerId: String = "",
    val result: String = "", // "1-0" for white win, "0-1" for black win, "1/2-1/2" for draw
    val date: Long = System.currentTimeMillis(),
    val verified: Boolean = false,
    val whitePlayerName: String = "", // Denormalized for convenience
    val blackPlayerName: String = "", // Denormalized for convenience
    val whitePlayerRatingBefore: Int = 0,
    val blackPlayerRatingBefore: Int = 0,
    val whitePlayerRatingAfter: Int = 0,
    val blackPlayerRatingAfter: Int = 0
) {
    // Get winner ID (returns empty if draw)
    fun getWinnerId(): String {
        return when (result) {
            "1-0" -> whitePlayerId
            "0-1" -> blackPlayerId
            else -> ""
        }
    }
    
    // Get winner name (returns "Draw" if draw)
    fun getWinnerName(): String {
        return when (result) {
            "1-0" -> whitePlayerName
            "0-1" -> blackPlayerName
            else -> "Draw"
        }
    }
    
    // Get result display text
    fun getResultDisplayText(): String {
        return when (result) {
            "1-0" -> "1-0 (White wins)"
            "0-1" -> "0-1 (Black wins)"
            "1/2-1/2" -> "½-½ (Draw)"
            else -> result
        }
    }
}
