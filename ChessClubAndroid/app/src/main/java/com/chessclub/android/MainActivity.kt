package com.chessclub.android

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.navigation.findNavController
import androidx.navigation.ui.setupWithNavController
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.chessclub.android.ui.login.LoginActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        // Check if user is logged in
        val prefs = getSharedPreferences("chess_club_prefs", MODE_PRIVATE)
        val playerId = prefs.getString("player_id", null)
        
        if (playerId == null) {
            // User is not logged in, redirect to login screen
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
            return
        }
        
        // Set up bottom navigation
        val navView: BottomNavigationView = findViewById(R.id.nav_view)
        val navController = findNavController(R.id.nav_host_fragment)
        navView.setupWithNavController(navController)
    }
}
