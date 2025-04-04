package com.chessclub.app.database;

import android.content.Context;

import com.chessclub.app.model.Player;
import com.chessclub.app.utils.PinHasher;

import java.util.List;

/**
 * Data Access Object for Player entities
 */
public class PlayerDao {
    
    private final DatabaseHelper dbHelper;
    
    public PlayerDao(Context context) {
        dbHelper = DatabaseHelper.getInstance(context);
    }
    
    /**
     * Create a new player
     */
    public long createPlayer(String name, String pin, boolean isAdmin) {
        Player player = new Player();
        player.setName(name);
        player.setPinHash(PinHasher.hashPin(pin));
        player.setAdmin(isAdmin);
        return dbHelper.addPlayer(player);
    }
    
    /**
     * Update a player
     */
    public boolean updatePlayer(Player player) {
        return dbHelper.updatePlayer(player) > 0;
    }
    
    /**
     * Delete a player
     */
    public boolean deletePlayer(int playerId) {
        return dbHelper.deletePlayer(playerId) > 0;
    }
    
    /**
     * Get player by ID
     */
    public Player getPlayer(int id) {
        return dbHelper.getPlayer(id);
    }
    
    /**
     * Get all players
     */
    public List<Player> getAllPlayers() {
        return dbHelper.getAllPlayers();
    }
    
    /**
     * Get all players sorted by a field
     */
    public List<Player> getAllPlayers(String sortBy) {
        return dbHelper.getAllPlayers(sortBy);
    }
    
    /**
     * Get player by name
     */
    public Player getPlayerByName(String name) {
        List<Player> players = getAllPlayers();
        for (Player player : players) {
            if (player.getName().equals(name)) {
                return player;
            }
        }
        return null;
    }
    
    /**
     * Authenticate a player with PIN
     */
    public boolean authenticatePlayer(int playerId, String pin) {
        return dbHelper.verifyPlayerPin(playerId, pin);
    }
    
    /**
     * Change a player's PIN
     */
    public boolean changePlayerPin(int playerId, String newPin) {
        return dbHelper.updatePlayerPin(playerId, newPin);
    }
}
