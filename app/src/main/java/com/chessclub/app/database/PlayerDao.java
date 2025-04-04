package com.chessclub.app.database;

import android.content.ContentValues;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;

import com.chessclub.app.model.Player;
import com.chessclub.app.utils.PinHasher;

import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object for Player-related database operations
 */
public class PlayerDao {
    private final DatabaseHelper dbHelper;

    /**
     * Constructor
     * @param dbHelper DatabaseHelper instance
     */
    public PlayerDao(DatabaseHelper dbHelper) {
        this.dbHelper = dbHelper;
    }

    /**
     * Add a new player to the database
     * @param player Player to add
     * @return ID of inserted player, or -1 if failed
     */
    public long addPlayer(Player player) {
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        ContentValues values = new ContentValues();
        
        values.put(DatabaseHelper.COLUMN_PLAYER_NAME, player.getName());
        values.put(DatabaseHelper.COLUMN_PLAYER_PIN_CODE, player.getPinCode());
        values.put(DatabaseHelper.COLUMN_PLAYER_ELO, player.getElo());
        values.put(DatabaseHelper.COLUMN_PLAYER_GAMES_PLAYED, player.getGamesPlayed());
        values.put(DatabaseHelper.COLUMN_PLAYER_WINS, player.getWins());
        values.put(DatabaseHelper.COLUMN_PLAYER_LOSSES, player.getLosses());
        values.put(DatabaseHelper.COLUMN_PLAYER_DRAWS, player.getDraws());
        values.put(DatabaseHelper.COLUMN_PLAYER_IS_ADMIN, player.isAdmin() ? 1 : 0);
        values.put(DatabaseHelper.COLUMN_PLAYER_EMAIL, player.getEmail());
        values.put(DatabaseHelper.COLUMN_PLAYER_PHONE, player.getPhoneNumber());
        
        long id = db.insert(DatabaseHelper.TABLE_PLAYERS, null, values);
        db.close();
        return id;
    }

    /**
     * Update an existing player
     * @param player Player to update
     * @return Number of rows affected
     */
    public int updatePlayer(Player player) {
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        ContentValues values = new ContentValues();
        
        values.put(DatabaseHelper.COLUMN_PLAYER_NAME, player.getName());
        values.put(DatabaseHelper.COLUMN_PLAYER_PIN_CODE, player.getPinCode());
        values.put(DatabaseHelper.COLUMN_PLAYER_ELO, player.getElo());
        values.put(DatabaseHelper.COLUMN_PLAYER_GAMES_PLAYED, player.getGamesPlayed());
        values.put(DatabaseHelper.COLUMN_PLAYER_WINS, player.getWins());
        values.put(DatabaseHelper.COLUMN_PLAYER_LOSSES, player.getLosses());
        values.put(DatabaseHelper.COLUMN_PLAYER_DRAWS, player.getDraws());
        values.put(DatabaseHelper.COLUMN_PLAYER_IS_ADMIN, player.isAdmin() ? 1 : 0);
        values.put(DatabaseHelper.COLUMN_PLAYER_EMAIL, player.getEmail());
        values.put(DatabaseHelper.COLUMN_PLAYER_PHONE, player.getPhoneNumber());
        
        int rowsAffected = db.update(
                DatabaseHelper.TABLE_PLAYERS,
                values,
                DatabaseHelper.COLUMN_PLAYER_ID + " = ?",
                new String[]{String.valueOf(player.getId())}
        );
        
        db.close();
        return rowsAffected;
    }

    /**
     * Delete a player
     * @param playerId ID of player to delete
     * @return Number of rows affected
     */
    public int deletePlayer(int playerId) {
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        int rowsAffected = db.delete(
                DatabaseHelper.TABLE_PLAYERS,
                DatabaseHelper.COLUMN_PLAYER_ID + " = ?",
                new String[]{String.valueOf(playerId)}
        );
        db.close();
        return rowsAffected;
    }

    /**
     * Get a player by ID
     * @param playerId Player ID
     * @return Player object or null if not found
     */
    public Player getPlayerById(int playerId) {
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        
        Cursor cursor = db.query(
                DatabaseHelper.TABLE_PLAYERS,
                null,
                DatabaseHelper.COLUMN_PLAYER_ID + " = ?",
                new String[]{String.valueOf(playerId)},
                null,
                null,
                null
        );
        
        Player player = null;
        if (cursor != null && cursor.moveToFirst()) {
            player = extractPlayerFromCursor(cursor);
            cursor.close();
        }
        
        db.close();
        return player;
    }

    /**
     * Get all players
     * @return List of all players
     */
    public List<Player> getAllPlayers() {
        List<Player> players = new ArrayList<>();
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        
        Cursor cursor = db.query(
                DatabaseHelper.TABLE_PLAYERS,
                null,
                null,
                null,
                null,
                null,
                DatabaseHelper.COLUMN_PLAYER_ELO + " DESC"
        );
        
        if (cursor != null && cursor.moveToFirst()) {
            do {
                Player player = extractPlayerFromCursor(cursor);
                players.add(player);
            } while (cursor.moveToNext());
            
            cursor.close();
        }
        
        db.close();
        return players;
    }

    /**
     * Get all players sorted by a specific column
     * @param sortColumn Column to sort by
     * @param ascending Whether to sort in ascending order
     * @return List of sorted players
     */
    public List<Player> getAllPlayersSorted(String sortColumn, boolean ascending) {
        List<Player> players = new ArrayList<>();
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        
        String sortOrder = sortColumn + (ascending ? " ASC" : " DESC");
        
        Cursor cursor = db.query(
                DatabaseHelper.TABLE_PLAYERS,
                null,
                null,
                null,
                null,
                null,
                sortOrder
        );
        
        if (cursor != null && cursor.moveToFirst()) {
            do {
                Player player = extractPlayerFromCursor(cursor);
                players.add(player);
            } while (cursor.moveToNext());
            
            cursor.close();
        }
        
        db.close();
        return players;
    }

    /**
     * Authenticate a player with name and PIN
     * @param playerName Player name
     * @param pinCode PIN code
     * @return Player object if authentication successful, null otherwise
     */
    public Player authenticatePlayer(String playerName, String pinCode) {
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        
        Cursor cursor = db.query(
                DatabaseHelper.TABLE_PLAYERS,
                null,
                DatabaseHelper.COLUMN_PLAYER_NAME + " = ?",
                new String[]{playerName},
                null,
                null,
                null
        );
        
        Player player = null;
        if (cursor != null && cursor.moveToFirst()) {
            String storedHashedPin = cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_PLAYER_PIN_CODE));
            if (PinHasher.verifyPin(pinCode, storedHashedPin)) {
                player = extractPlayerFromCursor(cursor);
            }
            cursor.close();
        }
        
        db.close();
        return player;
    }

    /**
     * Authenticate a player by ID and PIN
     * @param playerId Player ID
     * @param pinCode PIN code
     * @return Player object if authentication successful, null otherwise
     */
    public Player authenticatePlayerById(int playerId, String pinCode) {
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        
        Cursor cursor = db.query(
                DatabaseHelper.TABLE_PLAYERS,
                null,
                DatabaseHelper.COLUMN_PLAYER_ID + " = ?",
                new String[]{String.valueOf(playerId)},
                null,
                null,
                null
        );
        
        Player player = null;
        if (cursor != null && cursor.moveToFirst()) {
            String storedHashedPin = cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_PLAYER_PIN_CODE));
            if (PinHasher.verifyPin(pinCode, storedHashedPin)) {
                player = extractPlayerFromCursor(cursor);
            }
            cursor.close();
        }
        
        db.close();
        return player;
    }

    /**
     * Update player's ELO and stats after a game
     * @param playerId Player ID
     * @param eloChange ELO change (positive or negative)
     * @param result Game result (1=win, 0=draw, -1=loss)
     * @return true if successful, false otherwise
     */
    public boolean updatePlayerAfterGame(int playerId, int eloChange, int result) {
        Player player = getPlayerById(playerId);
        if (player == null) {
            return false;
        }

        // Update player stats
        player.incrementGamesPlayed();
        player.setElo(player.getElo() + eloChange);
        
        if (result > 0) {
            player.incrementWins();
        } else if (result < 0) {
            player.incrementLosses();
        } else {
            player.incrementDraws();
        }
        
        // Save changes to database
        int rowsAffected = updatePlayer(player);
        return rowsAffected > 0;
    }

    /**
     * Update player's PIN code
     * @param playerId Player ID
     * @param newPinCode New PIN code (unhashed)
     * @return true if successful, false otherwise
     */
    public boolean updatePlayerPinCode(int playerId, String newPinCode) {
        Player player = getPlayerById(playerId);
        if (player == null) {
            return false;
        }
        
        // Hash the new PIN code
        String hashedPinCode = PinHasher.hashPin(newPinCode);
        player.setPinCode(hashedPinCode);
        
        // Save changes to database
        int rowsAffected = updatePlayer(player);
        return rowsAffected > 0;
    }

    /**
     * Check if a player is an admin
     * @param playerId Player ID
     * @return true if admin, false otherwise
     */
    public boolean isPlayerAdmin(int playerId) {
        Player player = getPlayerById(playerId);
        return player != null && player.isAdmin();
    }

    /**
     * Extract a Player object from cursor
     * @param cursor Database cursor
     * @return Player object
     */
    private Player extractPlayerFromCursor(Cursor cursor) {
        Player player = new Player();
        
        player.setId(cursor.getInt(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_PLAYER_ID)));
        player.setName(cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_PLAYER_NAME)));
        player.setPinCode(cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_PLAYER_PIN_CODE)));
        player.setElo(cursor.getInt(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_PLAYER_ELO)));
        player.setGamesPlayed(cursor.getInt(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_PLAYER_GAMES_PLAYED)));
        player.setWins(cursor.getInt(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_PLAYER_WINS)));
        player.setLosses(cursor.getInt(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_PLAYER_LOSSES)));
        player.setDraws(cursor.getInt(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_PLAYER_DRAWS)));
        player.setAdmin(cursor.getInt(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_PLAYER_IS_ADMIN)) == 1);
        
        int emailIndex = cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_PLAYER_EMAIL);
        if (!cursor.isNull(emailIndex)) {
            player.setEmail(cursor.getString(emailIndex));
        }
        
        int phoneIndex = cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_PLAYER_PHONE);
        if (!cursor.isNull(phoneIndex)) {
            player.setPhoneNumber(cursor.getString(phoneIndex));
        }
        
        return player;
    }
}
