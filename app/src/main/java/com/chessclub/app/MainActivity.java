package com.chessclub.app;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.MenuItem;
import android.view.View;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;

import com.chessclub.app.database.DatabaseHelper;
import com.chessclub.app.database.PlayerDao;
import com.chessclub.app.model.Player;
import com.chessclub.app.ui.admin.AdminActivity;
import com.chessclub.app.ui.game.SubmitGameActivity;
import com.chessclub.app.ui.login.LoginActivity;
import com.chessclub.app.ui.profile.ProfileFragment;
import com.chessclub.app.ui.rankings.RankingsFragment;
import com.chessclub.app.ui.statistics.StatisticsFragment;
import com.google.android.material.bottomnavigation.BottomNavigationView;
import com.google.android.material.floatingactionbutton.FloatingActionButton;

/**
 * Main activity that hosts the different fragments of the app
 */
public class MainActivity extends AppCompatActivity {
    private static final String PREF_NAME = "ChessClubPrefs";
    private static final String KEY_LOGGED_IN_USER_ID = "loggedInUserId";

    private Player currentPlayer;
    private BottomNavigationView bottomNavigationView;
    private FloatingActionButton fabSubmitGame;
    private FloatingActionButton fabAdmin;
    private TextView tvUserName;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Initialize views
        bottomNavigationView = findViewById(R.id.bottom_navigation);
        fabSubmitGame = findViewById(R.id.fab_submit_game);
        fabAdmin = findViewById(R.id.fab_admin);
        tvUserName = findViewById(R.id.tv_username);

        // Check if user is logged in
        checkLoginStatus();
        
        // Set up navigation
        setupNavigation();
        
        // Set up action buttons
        setupActionButtons();
        
        // Load initial fragment
        if (savedInstanceState == null) {
            loadFragment(new RankingsFragment());
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        checkLoginStatus();
        updateUI();
    }

    /**
     * Check if user is logged in
     */
    private void checkLoginStatus() {
        SharedPreferences prefs = getSharedPreferences(PREF_NAME, MODE_PRIVATE);
        int userId = prefs.getInt(KEY_LOGGED_IN_USER_ID, -1);
        
        if (userId == -1) {
            // No user logged in, go to login screen
            startLoginActivity();
            return;
        }
        
        // Load user from database
        PlayerDao playerDao = DatabaseHelper.getInstance(this).getPlayerDao();
        currentPlayer = playerDao.getPlayerById(userId);
        
        if (currentPlayer == null) {
            // User not found, clear stored ID and go to login
            prefs.edit().remove(KEY_LOGGED_IN_USER_ID).apply();
            startLoginActivity();
        }
    }

    /**
     * Set up bottom navigation bar
     */
    private void setupNavigation() {
        bottomNavigationView.setOnNavigationItemSelectedListener(new BottomNavigationView.OnNavigationItemSelectedListener() {
            @Override
            public boolean onNavigationItemSelected(@NonNull MenuItem item) {
                Fragment fragment = null;
                
                int itemId = item.getItemId();
                if (itemId == R.id.nav_rankings) {
                    fragment = new RankingsFragment();
                } else if (itemId == R.id.nav_statistics) {
                    fragment = new StatisticsFragment();
                } else if (itemId == R.id.nav_profile) {
                    fragment = new ProfileFragment();
                }
                
                return loadFragment(fragment);
            }
        });
    }

    /**
     * Set up FAB buttons
     */
    private void setupActionButtons() {
        fabSubmitGame.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(MainActivity.this, SubmitGameActivity.class);
                startActivity(intent);
            }
        });
        
        fabAdmin.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(MainActivity.this, AdminActivity.class);
                startActivity(intent);
            }
        });
    }

    /**
     * Load a fragment into the container
     * @param fragment Fragment to load
     * @return true if fragment was loaded successfully
     */
    private boolean loadFragment(Fragment fragment) {
        if (fragment != null) {
            getSupportFragmentManager()
                    .beginTransaction()
                    .replace(R.id.fragment_container, fragment)
                    .commit();
            return true;
        }
        return false;
    }

    /**
     * Start login activity and finish current activity
     */
    private void startLoginActivity() {
        Intent intent = new Intent(this, LoginActivity.class);
        startActivity(intent);
        finish();
    }

    /**
     * Update UI based on current player data
     */
    private void updateUI() {
        if (currentPlayer != null) {
            tvUserName.setText(currentPlayer.getName() + " (" + currentPlayer.getElo() + ")");
            
            // Show/hide admin button based on user role
            if (currentPlayer.isAdmin()) {
                fabAdmin.setVisibility(View.VISIBLE);
            } else {
                fabAdmin.setVisibility(View.GONE);
            }
        }
    }

    /**
     * Log out current user
     */
    public void logout() {
        SharedPreferences prefs = getSharedPreferences(PREF_NAME, MODE_PRIVATE);
        prefs.edit().remove(KEY_LOGGED_IN_USER_ID).apply();
        currentPlayer = null;
        startLoginActivity();
    }

    /**
     * Get the current logged in player
     * @return Current player object
     */
    public Player getCurrentPlayer() {
        return currentPlayer;
    }
}
