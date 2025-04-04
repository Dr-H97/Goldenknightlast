package com.chessclub.app.model;

public class Player {
    private int id;
    private String name;
    private String pinHash;
    private int elo;
    private int wins;
    private int draws;
    private int losses;
    private boolean isAdmin;
    private String email;
    private String phone;

    public Player() {
        this.elo = 1200; // Default ELO rating
        this.wins = 0;
        this.draws = 0;
        this.losses = 0;
        this.isAdmin = false;
    }

    public Player(int id, String name, String pinHash, int elo, int wins, int draws, int losses, boolean isAdmin, String email, String phone) {
        this.id = id;
        this.name = name;
        this.pinHash = pinHash;
        this.elo = elo;
        this.wins = wins;
        this.draws = draws;
        this.losses = losses;
        this.isAdmin = isAdmin;
        this.email = email;
        this.phone = phone;
    }

    // Getters and Setters
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

    public String getPinHash() {
        return pinHash;
    }

    public void setPinHash(String pinHash) {
        this.pinHash = pinHash;
    }

    public int getElo() {
        return elo;
    }

    public void setElo(int elo) {
        this.elo = elo;
    }

    public int getWins() {
        return wins;
    }

    public void setWins(int wins) {
        this.wins = wins;
    }

    public int getDraws() {
        return draws;
    }

    public void setDraws(int draws) {
        this.draws = draws;
    }

    public int getLosses() {
        return losses;
    }

    public void setLosses(int losses) {
        this.losses = losses;
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

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    // Helper methods
    public int getGamesPlayed() {
        return wins + draws + losses;
    }

    public float getWinRate() {
        int gamesPlayed = getGamesPlayed();
        if (gamesPlayed == 0) {
            return 0;
        }
        return (float) wins / gamesPlayed;
    }

    @Override
    public String toString() {
        return name;
    }
}
