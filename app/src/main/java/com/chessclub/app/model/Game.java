package com.chessclub.app.model;

import java.util.Date;

public class Game {
    public static final int WHITE_WINS = 1;
    public static final int BLACK_WINS = 2;
    public static final int DRAW = 0;

    private int id;
    private int whitePlayerId;
    private int blackPlayerId;
    private int result;
    private long date;
    private int whiteEloChange;
    private int blackEloChange;

    public Game() {
        this.date = new Date().getTime();
    }

    public Game(int id, int whitePlayerId, int blackPlayerId, int result, long date, int whiteEloChange, int blackEloChange) {
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

    public int getResult() {
        return result;
    }

    public void setResult(int result) {
        this.result = result;
    }

    public long getDate() {
        return date;
    }

    public void setDate(long date) {
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

    // Helper methods
    public boolean isDraw() {
        return result == DRAW;
    }

    public boolean whiteWon() {
        return result == WHITE_WINS;
    }

    public boolean blackWon() {
        return result == BLACK_WINS;
    }

    public int getWinnerId() {
        if (whiteWon()) {
            return whitePlayerId;
        } else if (blackWon()) {
            return blackPlayerId;
        }
        return -1; // No winner (draw)
    }

    public int getLoserId() {
        if (whiteWon()) {
            return blackPlayerId;
        } else if (blackWon()) {
            return whitePlayerId;
        }
        return -1; // No loser (draw)
    }

    public String getResultText() {
        if (whiteWon()) {
            return "1-0";
        } else if (blackWon()) {
            return "0-1";
        } else {
            return "½-½";
        }
    }
}
