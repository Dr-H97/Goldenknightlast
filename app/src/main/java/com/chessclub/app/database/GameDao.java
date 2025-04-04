package com.chessclub.app.database;

import android.content.ContentValues;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;

import com.chessclub.app.model.Game;
import com.chessclub.app.model.Player;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * Data Access Object for Game-related database operations
 */
public class GameDao {
    private final DatabaseHelper dbHelper;

    /**
     * Constructor
     * @param dbHelper DatabaseHelper instance
     */
    public GameDao(DatabaseHelper dbHelper) {
        this.dbHelper = dbHelper;
    }

    /**
     * Add a new game to the database
     * @param game Game to add
     * @return ID of inserted game, or -1 if failed
     */
    public long addGame(Game game) {
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        ContentValues values = new ContentValues();
        
        values.put(DatabaseHelper.COLUMN_GAME_WHITE_PLAYER_ID, game.getWhitePlayerId());
        values.put(DatabaseHelper.COLUMN_GAME_BLACK_PLAYER_ID, game.getBlackPlayerId());
        values.put(DatabaseHelper.COLUMN_GAME_RESULT, game.getResult().toString());
        values.put(DatabaseHelper.COLUMN_GAME_DATE, game.getDate().getTime());
        values.put(DatabaseHelper.COLUMN_GAME_WHITE_ELO_CHANGE, game.getWhiteEloChange());
        values.put(DatabaseHelper.COLUMN_GAME_BLACK_ELO_CHANGE, game.getBlackEloChange());
        
        long id = db.insert(DatabaseHelper.TABLE_GAMES, null, values);
        db.close();
        return id;
    }

    /**
     * Update an existing game
     * @param game Game to update
     * @return Number of rows affected
     */
    public int updateGame(Game game) {
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        ContentValues values = new ContentValues();
        
        values.put(DatabaseHelper.COLUMN_GAME_WHITE_PLAYER_ID, game.getWhitePlayerId());
        values.put(DatabaseHelper.COLUMN_GAME_BLACK_PLAYER_ID, game.getBlackPlayerId());
        values.put(DatabaseHelper.COLUMN_GAME_RESULT, game.getResult().toString());
        values.put(DatabaseHelper.COLUMN_GAME_DATE, game.getDate().getTime());
        values.put(DatabaseHelper.COLUMN_GAME_WHITE_ELO_CHANGE, game.getWhiteEloChange());
        values.put(DatabaseHelper.COLUMN_GAME_BLACK_ELO_CHANGE, game.getBlackEloChange());
        
        int rowsAffected = db.update(
                DatabaseHelper.TABLE_GAMES,
                values,
                DatabaseHelper.COLUMN_GAME_ID + " = ?",
                new String[]{String.valueOf(game.getId())}
        );
        
        db.close();
        return rowsAffected;
    }

    /**
     * Delete a game
     * @param gameId ID of game to delete
     * @return Number of rows affected
     */
    public int deleteGame(int gameId) {
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        int rowsAffected = db.delete(
                DatabaseHelper.TABLE_GAMES,
                DatabaseHelper.COLUMN_GAME_ID + " = ?",
                new String[]{String.valueOf(gameId)}
        );
        db.close();
        return rowsAffected;
    }

    /**
     * Get a game by ID
     * @param gameId Game ID
     * @return Game object or null if not found
     */
    public Game getGameById(int gameId) {
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        
        Cursor cursor = db.query(
                DatabaseHelper.TABLE_GAMES,
                null,
                DatabaseHelper.COLUMN_GAME_ID + " = ?",
                new String[]{String.valueOf(gameId)},
                null,
                null,
                null
        );
        
        Game game = null;
        if (cursor != null && cursor.moveToFirst()) {
            game = extractGameFromCursor(cursor);
            cursor.close();
        }
        
        db.close();
        return game;
    }

    /**
     * Get all games
     * @return List of all games
     */
    public List<Game> getAllGames() {
        List<Game> games = new ArrayList<>();
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        
        Cursor cursor = db.query(
                DatabaseHelper.TABLE_GAMES,
                null,
                null,
                null,
                null,
                null,
                DatabaseHelper.COLUMN_GAME_DATE + " DESC"
        );
        
        if (cursor != null && cursor.moveToFirst()) {
            do {
                Game game = extractGameFromCursor(cursor);
                games.add(game);
            } while (cursor.moveToNext());
            
            cursor.close();
        }
        
        db.close();
        return games;
    }

    /**
     * Get all games for a specific player
     * @param playerId Player ID
     * @return List of games
     */
    public List<Game> getGamesForPlayer(int playerId) {
        List<Game> games = new ArrayList<>();
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        
        String selection = DatabaseHelper.COLUMN_GAME_WHITE_PLAYER_ID + " = ? OR " + 
                          DatabaseHelper.COLUMN_GAME_BLACK_PLAYER_ID + " = ?";
        String[] selectionArgs = {String.valueOf(playerId), String.valueOf(playerId)};
        
        Cursor cursor = db.query(
                DatabaseHelper.TABLE_GAMES,
                null,
                selection,
                selectionArgs,
                null,
                null,
                DatabaseHelper.COLUMN_GAME_DATE + " DESC"
        );
        
        if (cursor != null && cursor.moveToFirst()) {
            do {
                Game game = extractGameFromCursor(cursor);
                games.add(game);
            } while (cursor.moveToNext());
            
            cursor.close();
        }
        
        db.close();
        return games;
    }

    /**
     * Get recent games (limit by count)
     * @param count Number of recent games to retrieve
     * @return List of recent games
     */
    public List<Game> getRecentGames(int count) {
        List<Game> games = new ArrayList<>();
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        
        Cursor cursor = db.query(
                DatabaseHelper.TABLE_GAMES,
                null,
                null,
                null,
                null,
                null,
                DatabaseHelper.COLUMN_GAME_DATE + " DESC",
                String.valueOf(count)
        );
        
        if (cursor != null && cursor.moveToFirst()) {
            do {
                Game game = extractGameFromCursor(cursor);
                games.add(game);
            } while (cursor.moveToNext());
            
            cursor.close();
        }
        
        db.close();
        return games;
    }

    /**
     * Add a new game and update player statistics
     * @param whitePlayerId White player ID
     * @param blackPlayerId Black player ID
     * @param result Game result
     * @return ID of the inserted game, or -1 if failed
     */
    public long recordGameWithEloUpdate(int whitePlayerId, int blackPlayerId, Game.Result result) {
        PlayerDao playerDao = dbHelper.getPlayerDao();
        
        // Get player data
        Player whitePlayer = playerDao.getPlayerById(whitePlayerId);
        Player blackPlayer = playerDao.getPlayerById(blackPlayerId);
        
        if (whitePlayer == null || blackPlayer == null) {
            return -1;
        }
        
        // Calculate ELO changes
        double whiteScore = 0.0;
        double blackScore = 0.0;
        
        switch (result) {
            case WHITE_WIN:
                whiteScore = 1.0;
                blackScore = 0.0;
                break;
            case BLACK_WIN:
                whiteScore = 0.0;
                blackScore = 1.0;
                break;
            case DRAW:
                whiteScore = 0.5;
                blackScore = 0.5;
                break;
        }
        
        // Calculate expected scores (probability of winning)
        double whiteExpected = 1.0 / (1.0 + Math.pow(10, (blackPlayer.getElo() - whitePlayer.getElo()) / 400.0));
        double blackExpected = 1.0 / (1.0 + Math.pow(10, (whitePlayer.getElo() - blackPlayer.getElo()) / 400.0));
        
        // Calculate ELO changes (K-factor of 32 for players below 2100)
        int kFactor = 32;
        int whiteEloChange = (int) Math.round(kFactor * (whiteScore - whiteExpected));
        int blackEloChange = (int) Math.round(kFactor * (blackScore - blackExpected));
        
        // Create and save the game
        Game game = new Game();
        game.setWhitePlayerId(whitePlayerId);
        game.setBlackPlayerId(blackPlayerId);
        game.setResult(result);
        game.setDate(new Date());
        game.setWhiteEloChange(whiteEloChange);
        game.setBlackEloChange(blackEloChange);
        
        // Begin transaction
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        db.beginTransaction();
        
        try {
            // Insert the game
            ContentValues values = new ContentValues();
            values.put(DatabaseHelper.COLUMN_GAME_WHITE_PLAYER_ID, game.getWhitePlayerId());
            values.put(DatabaseHelper.COLUMN_GAME_BLACK_PLAYER_ID, game.getBlackPlayerId());
            values.put(DatabaseHelper.COLUMN_GAME_RESULT, game.getResult().toString());
            values.put(DatabaseHelper.COLUMN_GAME_DATE, game.getDate().getTime());
            values.put(DatabaseHelper.COLUMN_GAME_WHITE_ELO_CHANGE, game.getWhiteEloChange());
            values.put(DatabaseHelper.COLUMN_GAME_BLACK_ELO_CHANGE, game.getBlackEloChange());
            
            long gameId = db.insert(DatabaseHelper.TABLE_GAMES, null, values);
            game.setId((int) gameId);
            
            if (gameId == -1) {
                // Insert failed
                return -1;
            }
            
            // Update white player stats
            whitePlayer.incrementGamesPlayed();
            whitePlayer.setElo(whitePlayer.getElo() + whiteEloChange);
            
            if (result == Game.Result.WHITE_WIN) {
                whitePlayer.incrementWins();
            } else if (result == Game.Result.BLACK_WIN) {
                whitePlayer.incrementLosses();
            } else {
                whitePlayer.incrementDraws();
            }
            
            // Update black player stats
            blackPlayer.incrementGamesPlayed();
            blackPlayer.setElo(blackPlayer.getElo() + blackEloChange);
            
            if (result == Game.Result.BLACK_WIN) {
                blackPlayer.incrementWins();
            } else if (result == Game.Result.WHITE_WIN) {
                blackPlayer.incrementLosses();
            } else {
                blackPlayer.incrementDraws();
            }
            
            // Save white player changes
            ContentValues whiteValues = new ContentValues();
            whiteValues.put(DatabaseHelper.COLUMN_PLAYER_ELO, whitePlayer.getElo());
            whiteValues.put(DatabaseHelper.COLUMN_PLAYER_GAMES_PLAYED, whitePlayer.getGamesPlayed());
            whiteValues.put(DatabaseHelper.COLUMN_PLAYER_WINS, whitePlayer.getWins());
            whiteValues.put(DatabaseHelper.COLUMN_PLAYER_LOSSES, whitePlayer.getLosses());
            whiteValues.put(DatabaseHelper.COLUMN_PLAYER_DRAWS, whitePlayer.getDraws());
            
            db.update(
                    DatabaseHelper.TABLE_PLAYERS,
                    whiteValues,
                    DatabaseHelper.COLUMN_PLAYER_ID + " = ?",
                    new String[]{String.valueOf(whitePlayer.getId())}
            );
            
            // Save black player changes
            ContentValues blackValues = new ContentValues();
            blackValues.put(DatabaseHelper.COLUMN_PLAYER_ELO, blackPlayer.getElo());
            blackValues.put(DatabaseHelper.COLUMN_PLAYER_GAMES_PLAYED, blackPlayer.getGamesPlayed());
            blackValues.put(DatabaseHelper.COLUMN_PLAYER_WINS, blackPlayer.getWins());
            blackValues.put(DatabaseHelper.COLUMN_PLAYER_LOSSES, blackPlayer.getLosses());
            blackValues.put(DatabaseHelper.COLUMN_PLAYER_DRAWS, blackPlayer.getDraws());
            
            db.update(
                    DatabaseHelper.TABLE_PLAYERS,
                    blackValues,
                    DatabaseHelper.COLUMN_PLAYER_ID + " = ?",
                    new String[]{String.valueOf(blackPlayer.getId())}
            );
            
            db.setTransactionSuccessful();
            return gameId;
        } finally {
            db.endTransaction();
            db.close();
        }
    }

    /**
     * Extract a Game object from cursor
     * @param cursor Database cursor
     * @return Game object
     */
    private Game extractGameFromCursor(Cursor cursor) {
        Game game = new Game();
        
        game.setId(cursor.getInt(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_GAME_ID)));
        game.setWhitePlayerId(cursor.getInt(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_GAME_WHITE_PLAYER_ID)));
        game.setBlackPlayerId(cursor.getInt(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_GAME_BLACK_PLAYER_ID)));
        
        String resultStr = cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_GAME_RESULT));
        Game.Result result = Game.Result.valueOf(resultStr);
        game.setResult(result);
        
        long dateMillis = cursor.getLong(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_GAME_DATE));
        game.setDate(new Date(dateMillis));
        
        game.setWhiteEloChange(cursor.getInt(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_GAME_WHITE_ELO_CHANGE)));
        game.setBlackEloChange(cursor.getInt(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_GAME_BLACK_ELO_CHANGE)));
        
        return game;
    }
}
