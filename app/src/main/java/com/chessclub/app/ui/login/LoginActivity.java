package com.chessclub.app.ui.login;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.chessclub.app.MainActivity;
import com.chessclub.app.R;
import com.chessclub.app.database.PlayerDao;
import com.chessclub.app.model.Player;

import java.util.List;

public class LoginActivity extends AppCompatActivity {
    
    private Spinner spinnerPlayer;
    private EditText etPin;
    private Button btnLogin;
    
    private PlayerDao playerDao;
    private List<Player> playerList;
    private Player selectedPlayer;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);
        
        // Initialize views
        spinnerPlayer = findViewById(R.id.spinner_player);
        etPin = findViewById(R.id.et_pin);
        btnLogin = findViewById(R.id.btn_login);
        
        // Initialize DAO
        playerDao = new PlayerDao(this);
        
        // Load players
        loadPlayers();
        
        // Set up spinner
        spinnerPlayer.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                selectedPlayer = playerList.get(position);
            }
            
            @Override
            public void onNothingSelected(AdapterView<?> parent) {
                selectedPlayer = null;
            }
        });
        
        // Set up login button
        btnLogin.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                login();
            }
        });
    }
    
    @Override
    protected void onResume() {
        super.onResume();
        // Reload players in case of changes
        loadPlayers();
    }
    
    private void loadPlayers() {
        playerList = playerDao.getAllPlayers("name");
        
        // Create adapter
        ArrayAdapter<Player> adapter = new ArrayAdapter<>(
                this, android.R.layout.simple_spinner_item, playerList);
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        
        // Set adapter
        spinnerPlayer.setAdapter(adapter);
    }
    
    private void login() {
        if (selectedPlayer == null) {
            Toast.makeText(this, "Please select a player", Toast.LENGTH_SHORT).show();
            return;
        }
        
        String pin = etPin.getText().toString().trim();
        if (pin.isEmpty()) {
            etPin.setError("Please enter your PIN");
            etPin.requestFocus();
            return;
        }
        
        // Authenticate player
        boolean authenticated = playerDao.authenticatePlayer(selectedPlayer.getId(), pin);
        
        if (authenticated) {
            // Clear PIN field
            etPin.setText("");
            
            // Start MainActivity
            Intent intent = new Intent(this, MainActivity.class);
            intent.putExtra("playerId", selectedPlayer.getId());
            intent.putExtra("isAdmin", selectedPlayer.isAdmin());
            startActivity(intent);
        } else {
            Toast.makeText(this, "Invalid PIN", Toast.LENGTH_SHORT).show();
            etPin.setError("Invalid PIN");
            etPin.requestFocus();
        }
    }
}
