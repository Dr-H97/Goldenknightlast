package com.chessclub.android.utils

import kotlin.math.pow

/**
 * Calculator for ELO ratings based on game results
 */
object EloCalculator {
    private const val K_FACTOR = 20 // K factor used in ELO calculation
    
    /**
     * Calculate new ELO ratings based on game result
     * 
     * @param whiteElo - White player's current ELO rating
     * @param blackElo - Black player's current ELO rating
     * @param gameResult - Result of the game ('1-0' for white win, '0-1' for black win, '1/2-1/2' for draw)
     * @return Pair of new ratings (white, black)
     */
    fun calculateNewRatings(whiteElo: Int, blackElo: Int, gameResult: String): Pair<Int, Int> {
        // Calculate expected scores
        val whiteExpected = getExpectedScore(whiteElo, blackElo)
        val blackExpected = 1.0 - whiteExpected
        
        // Calculate actual scores
        val whiteActual = when(gameResult) {
            "1-0" -> 1.0
            "0-1" -> 0.0
            else -> 0.5 // Draw
        }
        val blackActual = 1.0 - whiteActual
        
        // Calculate new ratings
        val whiteNew = (whiteElo + K_FACTOR * (whiteActual - whiteExpected)).toInt()
        val blackNew = (blackElo + K_FACTOR * (blackActual - blackExpected)).toInt()
        
        return Pair(whiteNew, blackNew)
    }
    
    /**
     * Calculate expected score for player A against player B
     * 
     * @param ratingA - Player A's rating
     * @param ratingB - Player B's rating
     * @return Expected score for player A (between 0 and 1)
     */
    private fun getExpectedScore(ratingA: Int, ratingB: Int): Double {
        return 1.0 / (1.0 + 10.0.pow((ratingB - ratingA) / 400.0))
    }
    
    /**
     * Calculate performance rating
     * 
     * @param opponentAvgRating - Average rating of opponents
     * @param score - Score achieved (e.g., 7.5 points out of 10 games)
     * @param games - Number of games played
     * @return Performance rating
     */
    fun calculatePerformanceRating(opponentAvgRating: Int, score: Double, games: Int): Int {
        if (games == 0) return 0
        
        val percentage = score / games
        val ratingDiff = when {
            percentage == 1.0 -> 800 // Perfect score
            percentage == 0.0 -> -800 // Zero score
            else -> (400 * Math.log10(percentage / (1 - percentage))).toInt()
        }
        
        return opponentAvgRating + ratingDiff
    }
}
