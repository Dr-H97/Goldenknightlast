package com.chessclub.android.ui.login

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import com.chessclub.android.MainActivity
import com.chessclub.android.R

class LoginActivity : AppCompatActivity() {
    private lateinit var viewModel: LoginViewModel
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)
        
        viewModel = ViewModelProvider(this).get(LoginViewModel::class.java)
        
        val usernameEditText: EditText = findViewById(R.id.username)
        val pinEditText: EditText = findViewById(R.id.pin)
        val loginButton: Button = findViewById(R.id.login_button)
        val loadingProgressBar: ProgressBar = findViewById(R.id.loading)
        
        // Set up observers
        viewModel.loginResult.observe(this) { result ->
            loadingProgressBar.visibility = View.GONE
            
            if (result == null) {
                Toast.makeText(this, getString(R.string.error) + ": " + getString(R.string.invalid_credentials), Toast.LENGTH_LONG).show()
                return@observe
            }
            
            // Save user data
            val prefs = getSharedPreferences("chess_club_prefs", MODE_PRIVATE)
            prefs.edit().apply {
                putString("player_id", result.id)
                putString("player_name", result.name)
                putBoolean("is_admin", result.isAdmin)
                apply()
            }
            
            // Navigate to main activity
            startActivity(Intent(this, MainActivity::class.java))
            finish()
        }
        
        // Set up login button
        loginButton.setOnClickListener {
            loadingProgressBar.visibility = View.VISIBLE
            val username = usernameEditText.text.toString()
            val pin = pinEditText.text.toString()
            
            if (username.isBlank() || pin.isBlank()) {
                Toast.makeText(this, getString(R.string.error) + ": " + getString(R.string.fields_required), Toast.LENGTH_LONG).show()
                loadingProgressBar.visibility = View.GONE
                return@setOnClickListener
            }
            
            viewModel.login(username, pin)
        }
    }
}
