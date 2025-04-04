package com.chessclub.app.database;

import android.content.Context;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.util.Log;

import com.chessclub.app.utils.PinHasher;

/**
 * SQLite database helper for the chess club app
 */
public class DatabaseHelper extends SQLiteOpenHelper {
    private static final String TAG = "DatabaseHelper";
    
    // Database Information
    private static final String DATABASE_NAME = "chessclub.db";
    private static final int DATABASE_VERSION = 1;

    // Table Names
    public static final String TABLE_PLAYERS = "players";
    public static final String TABLE_GAMES = "games";

    // Player Table Columns
    public static final String COLUMN_PLAYER_ID = "id";
    public static final String COLUMN_PLAYER_NAME = "name";
    public static final String COLUMN_PLAYER_PIN_CODE = "pin_code";
    public static final String COLUMN_PLAYER_ELO = "elo";
    public static final String COLUMN_PLAYER_GAMES_PLAYED = "games_played";
    public static final String COLUMN_PLAYER_WINS = "wins";
    public static final String COLUMN_PLAYER_LOSSES = "losses";
    public static final String COLUMN_PLAYER_DRAWS = "draws";
    public static final String COLUMN_PLAYER_IS_ADMIN = "is_admin";
    public static final String COLUMN_PLAYER_EMAIL = "email";
    public static final String COLUMN_PLAYER_PHONE = "phone";

    // Game Table Columns
    public static final String COLUMN_GAME_ID = "id";
    public static final String COLUMN_GAME_WHITE_PLAYER_ID = "white_player_id";
    public static final String COLUMN_GAME_BLACK_PLAYER_ID = "black_player_id";
    public static final String COLUMN_GAME_RESULT = "result";
    public static final String COLUMN_GAME_DATE = "date";
    public static final String COLUMN_GAME_WHITE_ELO_CHANGE = "white_elo_change";
    public static final String COLUMN_GAME_BLACK_ELO_CHANGE = "black_elo_change";

    // Create table statements
    private static final String CREATE_TABLE_PLAYERS = "CREATE TABLE " + TABLE_PLAYERS + "("
            + COLUMN_PLAYER_ID + " INTEGER PRIMARY KEY AUTOINCREMENT, "
            + COLUMN_PLAYER_NAME + " TEXT NOT NULL, "
            + COLUMN_PLAYER_PIN_CODE + " TEXT NOT NULL, "
            + COLUMN_PLAYER_ELO + " INTEGER DEFAULT 1200, "
            + COLUMN_PLAYER_GAMES_PLAYED + " INTEGER DEFAULT 0, "
            + COLUMN_PLAYER_WINS + " INTEGER DEFAULT 0, "
            + COLUMN_PLAYER_LOSSES + " INTEGER DEFAULT 0, "
            + COLUMN_PLAYER_DRAWS + " INTEGER DEFAULT 0, "
            + COLUMN_PLAYER_IS_ADMIN + " INTEGER DEFAULT 0, "
            + COLUMN_PLAYER_EMAIL + " TEXT, "
            + COLUMN_PLAYER_PHONE + " TEXT"
            + ");";

    private static final String CREATE_TABLE_GAMES = "CREATE TABLE " + TABLE_GAMES + "("
            + COLUMN_GAME_ID + " INTEGER PRIMARY KEY AUTOINCREMENT, "
            + COLUMN_GAME_WHITE_PLAYER_ID + " INTEGER NOT NULL, "
            + COLUMN_GAME_BLACK_PLAYER_ID + " INTEGER NOT NULL, "
            + COLUMN_GAME_RESULT + " TEXT NOT NULL, "
            + COLUMN_GAME_DATE + " INTEGER NOT NULL, "
            + COLUMN_GAME_WHITE_ELO_CHANGE + " INTEGER NOT NULL, "
            + COLUMN_GAME_BLACK_ELO_CHANGE + " INTEGER NOT NULL, "
            + "FOREIGN KEY (" + COLUMN_GAME_WHITE_PLAYER_ID + ") REFERENCES " + TABLE_PLAYERS + "(" + COLUMN_PLAYER_ID + "), "
            + "FOREIGN KEY (" + COLUMN_GAME_BLACK_PLAYER_ID + ") REFERENCES " + TABLE_PLAYERS + "(" + COLUMN_PLAYER_ID + ")"
            + ");";

    private static DatabaseHelper instance;

    /**
     * Get singleton instance of DatabaseHelper
     * @param context Application context
     * @return DatabaseHelper instance
     */
    public static synchronized DatabaseHelper getInstance(Context context) {
        if (instance == null) {
            instance = new DatabaseHelper(context.getApplicationContext());
        }
        return instance;
    }

    /**
     * Private constructor to enforce singleton pattern
     * @param context Application context
     */
    private DatabaseHelper(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        db.execSQL(CREATE_TABLE_PLAYERS);
        db.execSQL(CREATE_TABLE_GAMES);
        
        // Add default admin user
        insertDefaultAdmin(db);
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        Log.w(TAG, "Upgrading database from version " + oldVersion + " to " + newVersion);
        
        // Drop older tables if they exist
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_GAMES);
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_PLAYERS);
        
        // Create tables again
        onCreate(db);
    }

    /**
     * Insert a default admin user
     * @param db SQLiteDatabase instance
     */
    private void insertDefaultAdmin(SQLiteDatabase db) {
        String adminPin = "1234"; // Default admin PIN
        String hashedPin = PinHasher.hashPin(adminPin);
        
        String sql = "INSERT INTO " + TABLE_PLAYERS + " ("
                + COLUMN_PLAYER_NAME + ", "
                + COLUMN_PLAYER_PIN_CODE + ", "
                + COLUMN_PLAYER_IS_ADMIN + ") VALUES ('Admin', '" + hashedPin + "', 1);";
        
        db.execSQL(sql);
    }

    /**
     * Get PlayerDao for player data operations
     * @return PlayerDao instance
     */
    public PlayerDao getPlayerDao() {
        return new PlayerDao(this);
    }

    /**
     * Get GameDao for game data operations
     * @return GameDao instance
     */
    public GameDao getGameDao() {
        return new GameDao(this);
    }
}
