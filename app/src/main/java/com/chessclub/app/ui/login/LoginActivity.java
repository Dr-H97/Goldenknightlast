package com.chessclub.app.ui.login;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.chessclub.app.MainActivity;
import com.chessclub.app.R;
import com.chessclub.app.database.DatabaseHelper;
import com.chessclub.app.database.PlayerDao;
import com.chessclub.app.model.Player;

import java.util.ArrayList;
import java.util.List;

/**
 * Activity for player login with PIN authentication
 */
public class LoginActivity extends AppCompatActivity {
    private static final String PREF_NAME = "ChessClubPrefs";
    private static final String KEY_LOGGED_IN_USER_ID = "loggedInUserId";
    
    private Spinner spinnerPlayers;
    private EditText etPin;
    private Button btnLogin;
    private TextView tvError;
    
    private PlayerDao playerDao;
    private List<Player> players;
    private int selectedPlayerId = -1;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);
        
        // Initialize database
        playerDao = DatabaseHelper.getInstance(this).getPlayerDao();
        
        // Initialize views
        spinnerPlayers = findViewById(R.id.spinner_players);
        etPin = findViewById(R.id.et_pin);
        btnLogin = findViewById(R.id.btn_login);
        tvError = findViewById(R.id.tv_error);
        
        // Load players for spinner
        loadPlayers();
        
        // Set up spinner listener
        spinnerPlayers.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                selectedPlayerId = players.get(position).getId();
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {
                selectedPlayerId = -1;
            }
        });
        
        // Set up login button
        btnLogin.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                attemptLogin();
            }
        });
        
        // Check if already logged in
        checkLoggedInUser();
    }

    /**
     * Load players from database and populate spinner
     */
    private void loadPlayers() {
        players = playerDao.getAllPlayers();
        
        if (players.isEmpty()) {
            // If no players exist, create a default admin user
            Player admin = new Player();
            admin.setName("Admin");
            admin.setPinCode("1234"); // Default pin
            admin.setAdmin(true);
            
            long adminId = playerDao.addPlayer(admin);
            if (adminId > 0) {
                admin.setId((int) adminId);
                players.add(admin);
                Toast.makeText(this, "Default admin account created with PIN 1234", Toast.LENGTH_LONG).show();
            }
        }
        
        // Create adapter for spinner
        List<String> playerNames = new ArrayList<>();
        for (Player player : players) {
            playerNames.add(player.getName() + " (" + player.getElo() + ")");
        }
        
        ArrayAdapter<String> adapter = new ArrayAdapter<>(
                this, android.R.layout.simple_spinner_item, playerNames);
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerPlayers.setAdapter(adapter);
    }

    /**
     * Check if user is already logged in and redirect accordingly
     */
    private void checkLoggedInUser() {
        SharedPreferences prefs = getSharedPreferences(PREF_NAME, MODE_PRIVATE);
        int userId = prefs.getInt(KEY_LOGGED_IN_USER_ID, -1);
        
        if (userId != -1) {
            Player player = playerDao.getPlayerById(userId);
            if (player != null) {
                // User is valid, go to main activity
                startMainActivity();
            }
        }
    }

    /**
     * Attempt to login with selected player and entered PIN
     */
    private void attemptLogin() {
        if (selectedPlayerId == -1) {
            showError("Please select a player");
            return;
        }
        
        String pin = etPin.getText().toString().trim();
        if (pin.isEmpty()) {
            showError("Please enter your PIN");
            return;
        }
        
        // Authenticate player
        Player player = playerDao.authenticatePlayerById(selectedPlayerId, pin);
        
        if (player != null) {
            // Store logged in user ID
            SharedPreferences prefs = getSharedPreferences(PREF_NAME, MODE_PRIVATE);
            prefs.edit().putInt(KEY_LOGGED_IN_USER_ID, player.getId()).apply();
            
            // Go to main activity
            startMainActivity();
        } else {
            showError("Invalid PIN");
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
     * Start main activity and finish login
     */
    private void startMainActivity() {
        Intent intent = new Intent(this, MainActivity.class);
        startActivity(intent);
        finish();
    }
}
