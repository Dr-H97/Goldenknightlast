package com.chessclub.app.utils;

/**
 * Utility class for ELO rating calculations
 */
public class EloCalculator {
    // K-factor determines how much a single game affects the rating
    // Standard value is 32 for players below 2100
    private static final int K_FACTOR = 32;
    
    /**
     * Calculate ELO change based on player ratings and game outcome
     * @param playerRating Current player ELO rating
     * @param opponentRating Opponent ELO rating
     * @param playerScore Player's score (1.0 for win, 0.5 for draw, 0.0 for loss)
     * @return ELO rating change (positive or negative)
     */
    public static int calculateEloChange(int playerRating, int opponentRating, double playerScore) {
        // Calculate expected score (probability of winning)
        double expectedScore = 1.0 / (1.0 + Math.pow(10, (opponentRating - playerRating) / 400.0));
        
        // Calculate and return ELO change
        return (int) Math.round(K_FACTOR * (playerScore - expectedScore));
    }
    
    /**
     * Calculate ELO changes for both players in a game
     * @param whiteRating White player's current ELO rating
     * @param blackRating Black player's current ELO rating
     * @param result Game result (1 for white win, 0 for draw, -1 for black win)
     * @return Array of two integers: [whiteEloChange, blackEloChange]
     */
    public static int[] calculateEloChanges(int whiteRating, int blackRating, int result) {
        double whiteScore;
        double blackScore;
        
        if (result > 0) {
            // White wins
            whiteScore = 1.0;
            blackScore = 0.0;
        } else if (result < 0) {
            // Black wins
            whiteScore = 0.0;
            blackScore = 1.0;
        } else {
            // Draw
            whiteScore = 0.5;
            blackScore = 0.5;
        }
        
        int whiteEloChange = calculateEloChange(whiteRating, blackRating, whiteScore);
        int blackEloChange = calculateEloChange(blackRating, whiteRating, blackScore);
        
        return new int[] {whiteEloChange, blackEloChange};
    }
    
    /**
     * Get a rating change description (for display purposes)
     * @param change ELO rating change
     * @return Formatted string with + or - sign
     */
    public static String getChangeDescription(int change) {
        if (change > 0) {
            return "+" + change;
        } else {
            return String.valueOf(change);
        }
    }
    
    /**
     * Calculate provisional ELO after n games
     * @param initialElo Initial ELO (usually 1200)
     * @param performanceRating Average opponent rating + 400 * (wins - losses) / games
     * @param gamesPlayed Number of games played
     * @return New provisional ELO
     */
    public static int calculateProvisionalElo(int initialElo, int performanceRating, int gamesPlayed) {
        if (gamesPlayed <= 0) {
            return initialElo;
        }
        
        // For provisional ratings (< 20 games), weight more toward performance
        double weight = Math.min(gamesPlayed / 20.0, 1.0);
        return (int) Math.round(initialElo * (1 - weight) + performanceRating * weight);
    }
}
