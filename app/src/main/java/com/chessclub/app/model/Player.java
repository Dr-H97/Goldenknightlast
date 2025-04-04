package com.chessclub.app.model;

/**
 * Model class representing a chess club player
 */
public class Player {
    private int id;
    private String name;
    private String pinCode; // Hashed pin code for authentication
    private int elo;
    private int gamesPlayed;
    private int wins;
    private int losses;
    private int draws;
    private boolean isAdmin;
    private String email;
    private String phoneNumber;

    // Default constructor
    public Player() {
        this.elo = 1200; // Default starting ELO
        this.gamesPlayed = 0;
        this.wins = 0;
        this.losses = 0;
        this.draws = 0;
        this.isAdmin = false;
    }

    // Constructor with parameters
    public Player(int id, String name, String pinCode, int elo, int gamesPlayed, 
                 int wins, int losses, int draws, boolean isAdmin, 
                 String email, String phoneNumber) {
        this.id = id;
        this.name = name;
        this.pinCode = pinCode;
        this.elo = elo;
        this.gamesPlayed = gamesPlayed;
        this.wins = wins;
        this.losses = losses;
        this.draws = draws;
        this.isAdmin = isAdmin;
        this.email = email;
        this.phoneNumber = phoneNumber;
    }

    // Getters and setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPinCode() {
        return pinCode;
    }

    public void setPinCode(String pinCode) {
        this.pinCode = pinCode;
    }

    public int getElo() {
        return elo;
    }

    public void setElo(int elo) {
        this.elo = elo;
    }

    public int getGamesPlayed() {
        return gamesPlayed;
    }

    public void setGamesPlayed(int gamesPlayed) {
        this.gamesPlayed = gamesPlayed;
    }

    public int getWins() {
        return wins;
    }

    public void setWins(int wins) {
        this.wins = wins;
    }

    public int getLosses() {
        return losses;
    }

    public void setLosses(int losses) {
        this.losses = losses;
    }

    public int getDraws() {
        return draws;
    }

    public void setDraws(int draws) {
        this.draws = draws;
    }

    public boolean isAdmin() {
        return isAdmin;
    }

    public void setAdmin(boolean admin) {
        isAdmin = admin;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    // Helper methods
    public void incrementGamesPlayed() {
        this.gamesPlayed++;
    }

    public void incrementWins() {
        this.wins++;
    }

    public void incrementLosses() {
        this.losses++;
    }

    public void incrementDraws() {
        this.draws++;
    }

    public float getWinRate() {
        if (gamesPlayed == 0) {
            return 0;
        }
        return (float) wins / gamesPlayed * 100;
    }

    @Override
    public String toString() {
        return name + " (" + elo + ")";
    }
}
