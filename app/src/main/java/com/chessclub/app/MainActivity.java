package com.chessclub.app;

import android.content.Intent;
import android.os.Bundle;
import android.view.MenuItem;
import android.view.View;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.fragment.app.Fragment;

import com.chessclub.app.ui.admin.AdminActivity;
import com.chessclub.app.ui.game.SubmitGameActivity;
import com.chessclub.app.ui.profile.ProfileFragment;
import com.chessclub.app.ui.rankings.RankingsFragment;
import com.chessclub.app.ui.statistics.StatisticsFragment;
import com.google.android.material.bottomnavigation.BottomNavigationView;
import com.google.android.material.floatingactionbutton.FloatingActionButton;

public class MainActivity extends AppCompatActivity {
    
    private BottomNavigationView bottomNavigationView;
    private boolean isAdmin = false;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        // Get isAdmin from intent
        isAdmin = getIntent().getBooleanExtra("isAdmin", false);
        
        // Set up toolbar
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        
        // Set up bottom navigation
        bottomNavigationView = findViewById(R.id.bottom_navigation);
        bottomNavigationView.setOnNavigationItemSelectedListener(navListener);
        
        // Set up FAB for submitting games
        FloatingActionButton fab = findViewById(R.id.fab_submit_game);
        fab.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                startActivity(new Intent(MainActivity.this, SubmitGameActivity.class));
            }
        });
        
        // Set up admin button
        FloatingActionButton fabAdmin = findViewById(R.id.fab_admin);
        if (isAdmin) {
            fabAdmin.setVisibility(View.VISIBLE);
            fabAdmin.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    startActivity(new Intent(MainActivity.this, AdminActivity.class));
                }
            });
        } else {
            fabAdmin.setVisibility(View.GONE);
        }
        
        // Load default fragment (Rankings)
        if (savedInstanceState == null) {
            bottomNavigationView.setSelectedItemId(R.id.nav_rankings);
        }
    }
    
    private BottomNavigationView.OnNavigationItemSelectedListener navListener =
            new BottomNavigationView.OnNavigationItemSelectedListener() {
                @Override
                public boolean onNavigationItemSelected(@NonNull MenuItem item) {
                    Fragment selectedFragment = null;
                    
                    int itemId = item.getItemId();
                    if (itemId == R.id.nav_rankings) {
                        selectedFragment = new RankingsFragment();
                    } else if (itemId == R.id.nav_statistics) {
                        selectedFragment = new StatisticsFragment();
                    } else if (itemId == R.id.nav_profile) {
                        selectedFragment = new ProfileFragment();
                    }
                    
                    if (selectedFragment != null) {
                        getSupportFragmentManager().beginTransaction()
                                .replace(R.id.fragment_container, selectedFragment)
                                .commit();
                    }
                    
                    return true;
                }
            };
}