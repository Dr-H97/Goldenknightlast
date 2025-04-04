package com.chessclub.app.database;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

import com.chessclub.app.model.Game;
import com.chessclub.app.model.Player;
import com.chessclub.app.utils.PinHasher;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class DatabaseHelper extends SQLiteOpenHelper {
    
    private static final String DATABASE_NAME = "chessclub.db";
    private static final int DATABASE_VERSION = 1;
    
    // Player table
    private static final String TABLE_PLAYERS = "players";
    private static final String COL_PLAYER_ID = "id";
    private static final String COL_PLAYER_NAME = "name";
    private static final String COL_PLAYER_PIN_HASH = "pin_hash";
    private static final String COL_PLAYER_ELO = "elo";
    private static final String COL_PLAYER_WINS = "wins";
    private static final String COL_PLAYER_DRAWS = "draws";
    private static final String COL_PLAYER_LOSSES = "losses";
    private static final String COL_PLAYER_IS_ADMIN = "is_admin";
    private static final String COL_PLAYER_EMAIL = "email";
    private static final String COL_PLAYER_PHONE = "phone";
    
    // Game table
    private static final String TABLE_GAMES = "games";
    private static final String COL_GAME_ID = "id";
    private static final String COL_GAME_WHITE_ID = "white_player_id";
    private static final String COL_GAME_BLACK_ID = "black_player_id";
    private static final String COL_GAME_RESULT = "result";
    private static final String COL_GAME_DATE = "date";
    private static final String COL_GAME_WHITE_ELO_CHANGE = "white_elo_change";
    private static final String COL_GAME_BLACK_ELO_CHANGE = "black_elo_change";
    
    // Singleton instance
    private static DatabaseHelper instance;
    
    public static synchronized DatabaseHelper getInstance(Context context) {
        if (instance == null) {
            instance = new DatabaseHelper(context.getApplicationContext());
        }
        return instance;
    }
    
    private DatabaseHelper(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }
    
    @Override
    public void onCreate(SQLiteDatabase db) {
        // Create players table
        String createPlayerTable = "CREATE TABLE " + TABLE_PLAYERS + "("
                + COL_PLAYER_ID + " INTEGER PRIMARY KEY AUTOINCREMENT,"
                + COL_PLAYER_NAME + " TEXT NOT NULL,"
                + COL_PLAYER_PIN_HASH + " TEXT NOT NULL,"
                + COL_PLAYER_ELO + " INTEGER DEFAULT 1200,"
                + COL_PLAYER_WINS + " INTEGER DEFAULT 0,"
                + COL_PLAYER_DRAWS + " INTEGER DEFAULT 0,"
                + COL_PLAYER_LOSSES + " INTEGER DEFAULT 0,"
                + COL_PLAYER_IS_ADMIN + " INTEGER DEFAULT 0,"
                + COL_PLAYER_EMAIL + " TEXT,"
                + COL_PLAYER_PHONE + " TEXT"
                + ")";
        db.execSQL(createPlayerTable);
        
        // Create games table
        String createGameTable = "CREATE TABLE " + TABLE_GAMES + "("
                + COL_GAME_ID + " INTEGER PRIMARY KEY AUTOINCREMENT,"
                + COL_GAME_WHITE_ID + " INTEGER,"
                + COL_GAME_BLACK_ID + " INTEGER,"
                + COL_GAME_RESULT + " INTEGER,"
                + COL_GAME_DATE + " INTEGER,"
                + COL_GAME_WHITE_ELO_CHANGE + " INTEGER,"
                + COL_GAME_BLACK_ELO_CHANGE + " INTEGER,"
                + "FOREIGN KEY(" + COL_GAME_WHITE_ID + ") REFERENCES " + TABLE_PLAYERS + "(" + COL_PLAYER_ID + "),"
                + "FOREIGN KEY(" + COL_GAME_BLACK_ID + ") REFERENCES " + TABLE_PLAYERS + "(" + COL_PLAYER_ID + ")"
                + ")";
        db.execSQL(createGameTable);
        
        // Insert default admin
        insertDefaultAdmin(db);
    }
    
    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        // Drop and recreate tables on upgrade
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_GAMES);
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_PLAYERS);
        onCreate(db);
    }
    
    private void insertDefaultAdmin(SQLiteDatabase db) {
        ContentValues values = new ContentValues();
        values.put(COL_PLAYER_NAME, "Admin");
        values.put(COL_PLAYER_PIN_HASH, PinHasher.hashPin("1234")); // Default PIN is 1234
        values.put(COL_PLAYER_ELO, 1200);
        values.put(COL_PLAYER_IS_ADMIN, 1);
        db.insert(TABLE_PLAYERS, null, values);
    }
    
    // Player methods
    
    /**
     * Add a new player to the database
     */
    public long addPlayer(Player player) {
        SQLiteDatabase db = getWritableDatabase();
        ContentValues values = new ContentValues();
        
        values.put(COL_PLAYER_NAME, player.getName());
        values.put(COL_PLAYER_PIN_HASH, player.getPinHash());
        values.put(COL_PLAYER_ELO, player.getElo());
        values.put(COL_PLAYER_WINS, player.getWins());
        values.put(COL_PLAYER_DRAWS, player.getDraws());
        values.put(COL_PLAYER_LOSSES, player.getLosses());
        values.put(COL_PLAYER_IS_ADMIN, player.isAdmin() ? 1 : 0);
        values.put(COL_PLAYER_EMAIL, player.getEmail());
        values.put(COL_PLAYER_PHONE, player.getPhone());
        
        long id = db.insert(TABLE_PLAYERS, null, values);
        player.setId((int) id);
        return id;
    }
    
    /**
     * Update an existing player
     */
    public int updatePlayer(Player player) {
        SQLiteDatabase db = getWritableDatabase();
        ContentValues values = new ContentValues();
        
        values.put(COL_PLAYER_NAME, player.getName());
        if (player.getPinHash() != null && !player.getPinHash().isEmpty()) {
            values.put(COL_PLAYER_PIN_HASH, player.getPinHash());
        }
        values.put(COL_PLAYER_ELO, player.getElo());
        values.put(COL_PLAYER_WINS, player.getWins());
        values.put(COL_PLAYER_DRAWS, player.getDraws());
        values.put(COL_PLAYER_LOSSES, player.getLosses());
        values.put(COL_PLAYER_IS_ADMIN, player.isAdmin() ? 1 : 0);
        values.put(COL_PLAYER_EMAIL, player.getEmail());
        values.put(COL_PLAYER_PHONE, player.getPhone());
        
        return db.update(TABLE_PLAYERS, values, COL_PLAYER_ID + " = ?",
                new String[]{String.valueOf(player.getId())});
    }
    
    /**
     * Delete a player
     */
    public int deletePlayer(int playerId) {
        SQLiteDatabase db = getWritableDatabase();
        
        // First check if player has any games
        String gameCountQuery = "SELECT COUNT(*) FROM " + TABLE_GAMES +
                " WHERE " + COL_GAME_WHITE_ID + " = ? OR " + COL_GAME_BLACK_ID + " = ?";
        Cursor cursor = db.rawQuery(gameCountQuery, new String[]{String.valueOf(playerId), String.valueOf(playerId)});
        int gameCount = 0;
        if (cursor.moveToFirst()) {
            gameCount = cursor.getInt(0);
        }
        cursor.close();
        
        if (gameCount > 0) {
            return -1; // Player has games, cannot delete
        }
        
        return db.delete(TABLE_PLAYERS, COL_PLAYER_ID + " = ?",
                new String[]{String.valueOf(playerId)});
    }
    
    /**
     * Get a player by ID
     */
    public Player getPlayer(int id) {
        SQLiteDatabase db = getReadableDatabase();
        
        String query = "SELECT * FROM " + TABLE_PLAYERS + " WHERE " + COL_PLAYER_ID + " = ?";
        Cursor cursor = db.rawQuery(query, new String[]{String.valueOf(id)});
        
        Player player = null;
        if (cursor.moveToFirst()) {
            player = cursorToPlayer(cursor);
        }
        cursor.close();
        
        return player;
    }
    
    /**
     * Get all players
     */
    public List<Player> getAllPlayers() {
        return getAllPlayers(null);
    }
    
    /**
     * Get all players with sorting
     */
    public List<Player> getAllPlayers(String sortBy) {
        String query = "SELECT * FROM " + TABLE_PLAYERS;
        if (sortBy != null) {
            query += " ORDER BY " + sortBy;
        }
        
        SQLiteDatabase db = getReadableDatabase();
        Cursor cursor = db.rawQuery(query, null);
        
        List<Player> players = new ArrayList<>();
        if (cursor.moveToFirst()) {
            do {
                players.add(cursorToPlayer(cursor));
            } while (cursor.moveToNext());
        }
        cursor.close();
        
        return players;
    }
    
    /**
     * Verify PIN for a player
     */
    public boolean verifyPlayerPin(int playerId, String pin) {
        SQLiteDatabase db = getReadableDatabase();
        
        String query = "SELECT " + COL_PLAYER_PIN_HASH + " FROM " + TABLE_PLAYERS +
                " WHERE " + COL_PLAYER_ID + " = ?";
        Cursor cursor = db.rawQuery(query, new String[]{String.valueOf(playerId)});
        
        boolean result = false;
        if (cursor.moveToFirst()) {
            String storedHash = cursor.getString(0);
            result = PinHasher.verifyPin(pin, storedHash);
        }
        cursor.close();
        
        return result;
    }
    
    /**
     * Update player PIN
     */
    public boolean updatePlayerPin(int playerId, String newPin) {
        SQLiteDatabase db = getWritableDatabase();
        ContentValues values = new ContentValues();
        
        values.put(COL_PLAYER_PIN_HASH, PinHasher.hashPin(newPin));
        
        int rowsAffected = db.update(TABLE_PLAYERS, values, COL_PLAYER_ID + " = ?",
                new String[]{String.valueOf(playerId)});
        return rowsAffected > 0;
    }
    
    /**
     * Convert cursor to Player object
     */
    private Player cursorToPlayer(Cursor cursor) {
        Player player = new Player();
        player.setId(cursor.getInt(cursor.getColumnIndex(COL_PLAYER_ID)));
        player.setName(cursor.getString(cursor.getColumnIndex(COL_PLAYER_NAME)));
        player.setPinHash(cursor.getString(cursor.getColumnIndex(COL_PLAYER_PIN_HASH)));
        player.setElo(cursor.getInt(cursor.getColumnIndex(COL_PLAYER_ELO)));
        player.setWins(cursor.getInt(cursor.getColumnIndex(COL_PLAYER_WINS)));
        player.setDraws(cursor.getInt(cursor.getColumnIndex(COL_PLAYER_DRAWS)));
        player.setLosses(cursor.getInt(cursor.getColumnIndex(COL_PLAYER_LOSSES)));
        player.setAdmin(cursor.getInt(cursor.getColumnIndex(COL_PLAYER_IS_ADMIN)) == 1);
        
        int emailIndex = cursor.getColumnIndex(COL_PLAYER_EMAIL);
        if (emailIndex >= 0 && !cursor.isNull(emailIndex)) {
            player.setEmail(cursor.getString(emailIndex));
        }
        
        int phoneIndex = cursor.getColumnIndex(COL_PLAYER_PHONE);
        if (phoneIndex >= 0 && !cursor.isNull(phoneIndex)) {
            player.setPhone(cursor.getString(phoneIndex));
        }
        
        return player;
    }
    
    // Game methods
    
    /**
     * Add a new game to the database
     */
    public long addGame(Game game) {
        SQLiteDatabase db = getWritableDatabase();
        ContentValues values = new ContentValues();
        
        values.put(COL_GAME_WHITE_ID, game.getWhitePlayerId());
        values.put(COL_GAME_BLACK_ID, game.getBlackPlayerId());
        values.put(COL_GAME_RESULT, game.getResult());
        values.put(COL_GAME_DATE, game.getDate());
        values.put(COL_GAME_WHITE_ELO_CHANGE, game.getWhiteEloChange());
        values.put(COL_GAME_BLACK_ELO_CHANGE, game.getBlackEloChange());
        
        long id = db.insert(TABLE_GAMES, null, values);
        game.setId((int) id);
        
        // Update player stats
        updatePlayerStatsAfterGame(game);
        
        return id;
    }
    
    /**
     * Update player statistics after a game
     */
    private void updatePlayerStatsAfterGame(Game game) {
        Player whitePlayer = getPlayer(game.getWhitePlayerId());
        Player blackPlayer = getPlayer(game.getBlackPlayerId());
        
        if (whitePlayer != null && blackPlayer != null) {
            // Update ELO ratings
            whitePlayer.setElo(whitePlayer.getElo() + game.getWhiteEloChange());
            blackPlayer.setElo(blackPlayer.getElo() + game.getBlackEloChange());
            
            // Update wins/draws/losses
            if (game.isDraw()) {
                whitePlayer.setDraws(whitePlayer.getDraws() + 1);
                blackPlayer.setDraws(blackPlayer.getDraws() + 1);
            } else if (game.whiteWon()) {
                whitePlayer.setWins(whitePlayer.getWins() + 1);
                blackPlayer.setLosses(blackPlayer.getLosses() + 1);
            } else if (game.blackWon()) {
                whitePlayer.setLosses(whitePlayer.getLosses() + 1);
                blackPlayer.setWins(blackPlayer.getWins() + 1);
            }
            
            // Save changes
            updatePlayer(whitePlayer);
            updatePlayer(blackPlayer);
        }
    }
    
    /**
     * Delete a game and update player stats
     */
    public boolean deleteGame(int gameId) {
        SQLiteDatabase db = getWritableDatabase();
        
        // First get the game
        Game game = getGame(gameId);
        if (game == null) {
            return false;
        }
        
        // Delete the game
        int rowsAffected = db.delete(TABLE_GAMES, COL_GAME_ID + " = ?",
                new String[]{String.valueOf(gameId)});
        
        if (rowsAffected > 0) {
            // Reverse player stats
            reversePlayerStatsForGame(game);
            return true;
        }
        return false;
    }
    
    /**
     * Reverse player statistics for a deleted game
     */
    private void reversePlayerStatsForGame(Game game) {
        Player whitePlayer = getPlayer(game.getWhitePlayerId());
        Player blackPlayer = getPlayer(game.getBlackPlayerId());
        
        if (whitePlayer != null && blackPlayer != null) {
            // Reverse ELO changes
            whitePlayer.setElo(whitePlayer.getElo() - game.getWhiteEloChange());
            blackPlayer.setElo(blackPlayer.getElo() - game.getBlackEloChange());
            
            // Reverse wins/draws/losses
            if (game.isDraw()) {
                whitePlayer.setDraws(whitePlayer.getDraws() - 1);
                blackPlayer.setDraws(blackPlayer.getDraws() - 1);
            } else if (game.whiteWon()) {
                whitePlayer.setWins(whitePlayer.getWins() - 1);
                blackPlayer.setLosses(blackPlayer.getLosses() - 1);
            } else if (game.blackWon()) {
                whitePlayer.setLosses(whitePlayer.getLosses() - 1);
                blackPlayer.setWins(blackPlayer.getWins() - 1);
            }
            
            // Save changes
            updatePlayer(whitePlayer);
            updatePlayer(blackPlayer);
        }
    }
    
    /**
     * Get a game by ID
     */
    public Game getGame(int id) {
        SQLiteDatabase db = getReadableDatabase();
        
        String query = "SELECT * FROM " + TABLE_GAMES + " WHERE " + COL_GAME_ID + " = ?";
        Cursor cursor = db.rawQuery(query, new String[]{String.valueOf(id)});
        
        Game game = null;
        if (cursor.moveToFirst()) {
            game = cursorToGame(cursor);
        }
        cursor.close();
        
        return game;
    }
    
    /**
     * Get all games
     */
    public List<Game> getAllGames() {
        String query = "SELECT * FROM " + TABLE_GAMES + " ORDER BY " + COL_GAME_DATE + " DESC";
        
        SQLiteDatabase db = getReadableDatabase();
        Cursor cursor = db.rawQuery(query, null);
        
        List<Game> games = new ArrayList<>();
        if (cursor.moveToFirst()) {
            do {
                games.add(cursorToGame(cursor));
            } while (cursor.moveToNext());
        }
        cursor.close();
        
        return games;
    }
    
    /**
     * Get all games for a player
     */
    public List<Game> getPlayerGames(int playerId) {
        String query = "SELECT * FROM " + TABLE_GAMES +
                " WHERE " + COL_GAME_WHITE_ID + " = ? OR " + COL_GAME_BLACK_ID + " = ?" +
                " ORDER BY " + COL_GAME_DATE + " DESC";
        
        SQLiteDatabase db = getReadableDatabase();
        Cursor cursor = db.rawQuery(query, new String[]{String.valueOf(playerId), String.valueOf(playerId)});
        
        List<Game> games = new ArrayList<>();
        if (cursor.moveToFirst()) {
            do {
                games.add(cursorToGame(cursor));
            } while (cursor.moveToNext());
        }
        cursor.close();
        
        return games;
    }
    
    /**
     * Convert cursor to Game object
     */
    private Game cursorToGame(Cursor cursor) {
        Game game = new Game();
        game.setId(cursor.getInt(cursor.getColumnIndex(COL_GAME_ID)));
        game.setWhitePlayerId(cursor.getInt(cursor.getColumnIndex(COL_GAME_WHITE_ID)));
        game.setBlackPlayerId(cursor.getInt(cursor.getColumnIndex(COL_GAME_BLACK_ID)));
        game.setResult(cursor.getInt(cursor.getColumnIndex(COL_GAME_RESULT)));
        game.setDate(cursor.getLong(cursor.getColumnIndex(COL_GAME_DATE)));
        game.setWhiteEloChange(cursor.getInt(cursor.getColumnIndex(COL_GAME_WHITE_ELO_CHANGE)));
        game.setBlackEloChange(cursor.getInt(cursor.getColumnIndex(COL_GAME_BLACK_ELO_CHANGE)));
        return game;
    }
}
