package com.chessclub.app.database;

import android.content.Context;

import com.chessclub.app.model.Game;
import com.chessclub.app.model.Player;
import com.chessclub.app.utils.EloCalculator;

import java.util.List;

/**
 * Data Access Object for Game entities
 */
public class GameDao {
    
    private final DatabaseHelper dbHelper;
    
    public GameDao(Context context) {
        dbHelper = DatabaseHelper.getInstance(context);
    }
    
    /**
     * Create a new game and update player stats
     */
    public long createGame(int whitePlayerId, int blackPlayerId, int result) {
        Player whitePlayer = dbHelper.getPlayer(whitePlayerId);
        Player blackPlayer = dbHelper.getPlayer(blackPlayerId);
        
        if (whitePlayer == null || blackPlayer == null) {
            return -1;
        }
        
        // Calculate ELO changes
        int[] eloChanges = EloCalculator.calculateGameEloChanges(
                whitePlayer.getElo(), blackPlayer.getElo(), result);
        
        // Create game
        Game game = new Game();
        game.setWhitePlayerId(whitePlayerId);
        game.setBlackPlayerId(blackPlayerId);
        game.setResult(result);
        game.setDate(System.currentTimeMillis());
        game.setWhiteEloChange(eloChanges[0]);
        game.setBlackEloChange(eloChanges[1]);
        
        return dbHelper.addGame(game);
    }
    
    /**
     * Delete a game and update player stats
     */
    public boolean deleteGame(int gameId) {
        return dbHelper.deleteGame(gameId);
    }
    
    /**
     * Get game by ID
     */
    public Game getGame(int id) {
        return dbHelper.getGame(id);
    }
    
    /**
     * Get all games
     */
    public List<Game> getAllGames() {
        return dbHelper.getAllGames();
    }
    
    /**
     * Get all games for a player
     */
    public List<Game> getPlayerGames(int playerId) {
        return dbHelper.getPlayerGames(playerId);
    }
    
    /**
     * Get player name for a game
     */
    public String getPlayerName(int playerId) {
        Player player = dbHelper.getPlayer(playerId);
        return player != null ? player.getName() : "Unknown";
    }
}
