package com.chessclub.app.utils;

public class EloCalculator {
    private static final int K_FACTOR = 32;
    private static final double DRAW_SCORE = 0.5;
    private static final double WIN_SCORE = 1.0;
    private static final double LOSS_SCORE = 0.0;

    /**
     * Calculate the expected score for a player against their opponent
     * @param playerRating The ELO rating of the player
     * @param opponentRating The ELO rating of the opponent
     * @return The expected score between 0 and 1
     */
    public static double calculateExpectedScore(int playerRating, int opponentRating) {
        return 1.0 / (1.0 + Math.pow(10.0, (opponentRating - playerRating) / 400.0));
    }

    /**
     * Calculate the new ELO rating for a player
     * @param currentRating The player's current ELO rating
     * @param opponentRating The opponent's ELO rating
     * @param actualScore The actual score (1 for win, 0.5 for draw, 0 for loss)
     * @return The player's new ELO rating
     */
    public static int calculateNewRating(int currentRating, int opponentRating, double actualScore) {
        double expectedScore = calculateExpectedScore(currentRating, opponentRating);
        return (int) Math.round(currentRating + K_FACTOR * (actualScore - expectedScore));
    }

    /**
     * Calculate the ELO change from a game result
     * @param playerRating The player's current ELO rating
     * @param opponentRating The opponent's ELO rating
     * @param actualScore The actual score (1 for win, 0.5 for draw, 0 for loss)
     * @return The ELO change (positive or negative)
     */
    public static int calculateEloChange(int playerRating, int opponentRating, double actualScore) {
        int newRating = calculateNewRating(playerRating, opponentRating, actualScore);
        return newRating - playerRating;
    }

    /**
     * Calculate ELO changes for both players in a game
     * @param whiteRating The white player's current ELO rating
     * @param blackRating The black player's current ELO rating
     * @param result The game result (Game.WHITE_WINS, Game.BLACK_WINS, or Game.DRAW)
     * @return An array with [whiteEloChange, blackEloChange]
     */
    public static int[] calculateGameEloChanges(int whiteRating, int blackRating, int result) {
        double whiteScore, blackScore;
        
        if (result == 1) { // WHITE_WINS
            whiteScore = WIN_SCORE;
            blackScore = LOSS_SCORE;
        } else if (result == 2) { // BLACK_WINS
            whiteScore = LOSS_SCORE;
            blackScore = WIN_SCORE;
        } else { // DRAW
            whiteScore = DRAW_SCORE;
            blackScore = DRAW_SCORE;
        }
        
        int whiteChange = calculateEloChange(whiteRating, blackRating, whiteScore);
        int blackChange = calculateEloChange(blackRating, whiteRating, blackScore);
        
        return new int[] {whiteChange, blackChange};
    }
}
