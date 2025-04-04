package com.chessclub.app.ui.game;

import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import com.chessclub.app.R;
import com.chessclub.app.database.DatabaseHelper;
import com.chessclub.app.database.GameDao;
import com.chessclub.app.database.PlayerDao;
import com.chessclub.app.model.Game;
import com.chessclub.app.model.Player;

import java.util.ArrayList;
import java.util.List;

/**
 * Activity for submitting new chess games
 */
public class SubmitGameActivity extends AppCompatActivity {
    private static final String PREF_NAME = "ChessClubPrefs";
    private static final String KEY_LOGGED_IN_USER_ID = "loggedInUserId";

    private Toolbar toolbar;
    private Spinner spinnerWhitePlayer;
    private Spinner spinnerBlackPlayer;
    private RadioGroup radioGroupResult;
    private Button btnSubmit;
    private TextView tvError;
    
    private PlayerDao playerDao;
    private GameDao gameDao;
    private List<Player> players;
    private int whitePlayerId = -1;
    private int blackPlayerId = -1;
    private int currentPlayerId = -1;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_submit_game);
        
        // Initialize database
        DatabaseHelper dbHelper = DatabaseHelper.getInstance(this);
        playerDao = dbHelper.getPlayerDao();
        gameDao = dbHelper.getGameDao();
        
        // Get current user ID
        SharedPreferences prefs = getSharedPreferences(PREF_NAME, MODE_PRIVATE);
        currentPlayerId = prefs.getInt(KEY_LOGGED_IN_USER_ID, -1);
        
        // Initialize views
        toolbar = findViewById(R.id.toolbar);
        spinnerWhitePlayer = findViewById(R.id.spinner_white_player);
        spinnerBlackPlayer = findViewById(R.id.spinner_black_player);
        radioGroupResult = findViewById(R.id.radio_group_result);
        btnSubmit = findViewById(R.id.btn_submit);
        tvError = findViewById(R.id.tv_error);
        
        // Set up toolbar
        setSupportActionBar(toolbar);
        getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        getSupportActionBar().setTitle("Submit Game");
        
        // Load players for spinners
        loadPlayers();
        
        // Set up spinner listeners
        setupSpinnerListeners();
        
        // Set up submit button
        btnSubmit.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                submitGame();
            }
        });
    }

    /**
     * Load players from database and populate spinners
     */
    private void loadPlayers() {
        players = playerDao.getAllPlayers();
        
        if (players.isEmpty()) {
            showError("No players found in the system");
            btnSubmit.setEnabled(false);
            return;
        }
        
        // Create adapters for spinners
        List<String> playerNames = new ArrayList<>();
        for (Player player : players) {
            playerNames.add(player.getName() + " (" + player.getElo() + ")");
        }
        
        ArrayAdapter<String> adapter = new ArrayAdapter<>(
                this, android.R.layout.simple_spinner_item, playerNames);
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        
        spinnerWhitePlayer.setAdapter(adapter);
        spinnerBlackPlayer.setAdapter(adapter);
        
        // Try to set current user as white player by default
        if (currentPlayerId != -1) {
            for (int i = 0; i < players.size(); i++) {
                if (players.get(i).getId() == currentPlayerId) {
                    spinnerWhitePlayer.setSelection(i);
                    break;
                }
            }
        }
        
        // Set opponent as black player (next player in list)
        if (players.size() > 1) {
            int nextIndex = (spinnerWhitePlayer.getSelectedItemPosition() + 1) % players.size();
            spinnerBlackPlayer.setSelection(nextIndex);
        }
    }

    /**
     * Set up listeners for player selection spinners
     */
    private void setupSpinnerListeners() {
        spinnerWhitePlayer.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                whitePlayerId = players.get(position).getId();
                validatePlayerSelection();
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {
                whitePlayerId = -1;
                validatePlayerSelection();
            }
        });

        spinnerBlackPlayer.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                blackPlayerId = players.get(position).getId();
                validatePlayerSelection();
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {
                blackPlayerId = -1;
                validatePlayerSelection();
            }
        });
    }

    /**
     * Validate player selection
     */
    private void validatePlayerSelection() {
        if (whitePlayerId == blackPlayerId && whitePlayerId != -1) {
            showError("White and black players cannot be the same");
            btnSubmit.setEnabled(false);
        } else {
            hideError();
            btnSubmit.setEnabled(true);
        }
    }

    /**
     * Submit game to database
     */
    private void submitGame() {
        if (whitePlayerId == -1 || blackPlayerId == -1) {
            showError("Please select both players");
            return;
        }
        
        if (whitePlayerId == blackPlayerId) {
            showError("White and black players cannot be the same");
            return;
        }
        
        int selectedRadioId = radioGroupResult.getCheckedRadioButtonId();
        if (selectedRadioId == -1) {
            showError("Please select a game result");
            return;
        }
        
        // Determine result
        Game.Result result;
        if (selectedRadioId == R.id.radio_white_win) {
            result = Game.Result.WHITE_WIN;
        } else if (selectedRadioId == R.id.radio_black_win) {
            result = Game.Result.BLACK_WIN;
        } else {
            result = Game.Result.DRAW;
        }
        
        // Record game in database
        long gameId = gameDao.recordGameWithEloUpdate(whitePlayerId, blackPlayerId, result);
        
        if (gameId > 0) {
            // Show success message
            Toast.makeText(this, "Game recorded successfully", Toast.LENGTH_SHORT).show();
            finish(); // Go back to previous screen
        } else {
            showError("Failed to record game. Please try again.");
        }
    }

    /**
     * Display error message
     * @param message Error message to display
     */
    private void showError(String message) {
        tvError.setText(message);
        tvError.setVisibility(View.VISIBLE);
    }

    /**
     * Hide error message
     */
    private void hideError() {
        tvError.setVisibility(View.GONE);
    }

    @Override
    public boolean onSupportNavigateUp() {
        onBackPressed();
        return true;
    }
}
