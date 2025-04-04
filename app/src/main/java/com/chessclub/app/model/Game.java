package com.chessclub.app.model;

import java.util.Date;

/**
 * Model class representing a chess game between two players
 */
public class Game {
    public enum Result {
        WHITE_WIN, BLACK_WIN, DRAW
    }

    private int id;
    private int whitePlayerId;
    private int blackPlayerId;
    private Result result;
    private Date date;
    private int whiteEloChange;
    private int blackEloChange;

    // Default constructor
    public Game() {
        this.date = new Date();
    }

    // Constructor with parameters
    public Game(int id, int whitePlayerId, int blackPlayerId, Result result, 
                Date date, int whiteEloChange, int blackEloChange) {
        this.id = id;
        this.whitePlayerId = whitePlayerId;
        this.blackPlayerId = blackPlayerId;
        this.result = result;
        this.date = date;
        this.whiteEloChange = whiteEloChange;
        this.blackEloChange = blackEloChange;
    }

    // Getters and setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getWhitePlayerId() {
        return whitePlayerId;
    }

    public void setWhitePlayerId(int whitePlayerId) {
        this.whitePlayerId = whitePlayerId;
    }

    public int getBlackPlayerId() {
        return blackPlayerId;
    }

    public void setBlackPlayerId(int blackPlayerId) {
        this.blackPlayerId = blackPlayerId;
    }

    public Result getResult() {
        return result;
    }

    public void setResult(Result result) {
        this.result = result;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    public int getWhiteEloChange() {
        return whiteEloChange;
    }

    public void setWhiteEloChange(int whiteEloChange) {
        this.whiteEloChange = whiteEloChange;
    }

    public int getBlackEloChange() {
        return blackEloChange;
    }

    public void setBlackEloChange(int blackEloChange) {
        this.blackEloChange = blackEloChange;
    }

    /**
     * Gets the winner's player ID
     * @return player ID of the winner, or -1 if draw
     */
    public int getWinnerId() {
        switch (result) {
            case WHITE_WIN:
                return whitePlayerId;
            case BLACK_WIN:
                return blackPlayerId;
            case DRAW:
            default:
                return -1; // No winner in case of a draw
        }
    }

    /**
     * Gets the loser's player ID
     * @return player ID of the loser, or -1 if draw
     */
    public int getLoserId() {
        switch (result) {
            case WHITE_WIN:
                return blackPlayerId;
            case BLACK_WIN:
                return whitePlayerId;
            case DRAW:
            default:
                return -1; // No loser in case of a draw
        }
    }

    /**
     * Checks if the specified player won the game
     * @param playerId The player ID to check
     * @return true if the player won, false otherwise
     */
    public boolean playerWon(int playerId) {
        return (result == Result.WHITE_WIN && playerId == whitePlayerId) || 
               (result == Result.BLACK_WIN && playerId == blackPlayerId);
    }

    /**
     * Checks if the specified player lost the game
     * @param playerId The player ID to check
     * @return true if the player lost, false otherwise
     */
    public boolean playerLost(int playerId) {
        return (result == Result.WHITE_WIN && playerId == blackPlayerId) || 
               (result == Result.BLACK_WIN && playerId == whitePlayerId);
    }

    /**
     * Checks if the game ended in a draw
     * @return true if draw, false otherwise
     */
    public boolean isDraw() {
        return result == Result.DRAW;
    }

    /**
     * Gets the ELO change for a specific player
     * @param playerId The player ID
     * @return The ELO change for the player
     */
    public int getEloChangeForPlayer(int playerId) {
        if (playerId == whitePlayerId) {
            return whiteEloChange;
        } else if (playerId == blackPlayerId) {
            return blackEloChange;
        }
        return 0;
    }
}
