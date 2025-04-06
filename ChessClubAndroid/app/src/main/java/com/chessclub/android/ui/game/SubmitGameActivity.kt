package com.chessclub.android.ui.game

import android.os.Bundle
import android.view.View
import android.widget.ArrayAdapter
import android.widget.AutoCompleteTextView
import android.widget.Button
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.RadioButton
import android.widget.RadioGroup
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import com.chessclub.android.R
import com.chessclub.android.model.Player

class SubmitGameActivity : AppCompatActivity() {
    private lateinit var viewModel: SubmitGameViewModel
    
    private lateinit var whitePlayerAutoComplete: AutoCompleteTextView
    private lateinit var blackPlayerAutoComplete: AutoCompleteTextView
    private lateinit var whitePlayerPinEdit: EditText
    private lateinit var blackPlayerPinEdit: EditText
    private lateinit var resultRadioGroup: RadioGroup
    private lateinit var submitButton: Button
    private lateinit var cancelButton: Button
    private lateinit var progressBar: ProgressBar
    
    private var players: List<Player> = listOf()
    private var playerMap: Map<String, String> = mapOf() // Maps player name to ID
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_submit_game)
        
        viewModel = ViewModelProvider(this).get(SubmitGameViewModel::class.java)
        
        // Initialize views
        whitePlayerAutoComplete = findViewById(R.id.white_player_autocomplete)
        blackPlayerAutoComplete = findViewById(R.id.black_player_autocomplete)
        whitePlayerPinEdit = findViewById(R.id.white_player_pin)
        blackPlayerPinEdit = findViewById(R.id.black_player_pin)
        resultRadioGroup = findViewById(R.id.result_radio_group)
        submitButton = findViewById(R.id.submit_button)
        cancelButton = findViewById(R.id.cancel_button)
        progressBar = findViewById(R.id.progress_bar)
        
        // Set up observers
        observeViewModel()
        
        // Load player data
        viewModel.loadPlayers()
        
        // Set up button actions
        submitButton.setOnClickListener { submitGame() }
        cancelButton.setOnClickListener { finish() }
    }
    
    private fun observeViewModel() {
        viewModel.players.observe(this) { playerList ->
            players = playerList
            
            // Create map for player name to ID lookup
            playerMap = playerList.associateBy({ it.name }, { it.id })
            
            // Set up autocomplete adapters
            val playerNames = playerList.map { it.name }
            val adapter = ArrayAdapter(this, android.R.layout.simple_dropdown_item_1line, playerNames)
            
            whitePlayerAutoComplete.setAdapter(adapter)
            blackPlayerAutoComplete.setAdapter(adapter)
        }
        
        viewModel.isLoading.observe(this) { isLoading ->
            progressBar.visibility = if (isLoading) View.VISIBLE else View.GONE
            submitButton.isEnabled = !isLoading
        }
        
        viewModel.gameCreated.observe(this) { success ->
            if (success) {
                Toast.makeText(this, getString(R.string.game_submitted), Toast.LENGTH_SHORT).show()
                finish()
            } else {
                Toast.makeText(this, getString(R.string.error_submitting_game), Toast.LENGTH_LONG).show()
            }
        }
    }
    
    private fun submitGame() {
        val whitePlayerName = whitePlayerAutoComplete.text.toString()
        val blackPlayerName = blackPlayerAutoComplete.text.toString()
        val whitePlayerPin = whitePlayerPinEdit.text.toString()
        val blackPlayerPin = blackPlayerPinEdit.text.toString()
        
        // Validate inputs
        if (whitePlayerName.isBlank() || blackPlayerName.isBlank() || 
            whitePlayerPin.isBlank() || blackPlayerPin.isBlank()) {
            Toast.makeText(this, getString(R.string.fill_all_fields), Toast.LENGTH_SHORT).show()
            return
        }
        
        if (whitePlayerName == blackPlayerName) {
            Toast.makeText(this, getString(R.string.different_players_required), Toast.LENGTH_SHORT).show()
            return
        }
        
        // Get selected result
        val resultRadioId = resultRadioGroup.checkedRadioButtonId
        if (resultRadioId == -1) {
            Toast.makeText(this, getString(R.string.select_result), Toast.LENGTH_SHORT).show()
            return
        }
        
        val resultRadioButton = findViewById<RadioButton>(resultRadioId)
        val gameResult = when (resultRadioButton.id) {
            R.id.radio_white_wins -> "1-0"
            R.id.radio_black_wins -> "0-1"
            R.id.radio_draw -> "1/2-1/2"
            else -> ""
        }
        
        // Get player IDs
        val whitePlayerId = playerMap[whitePlayerName]
        val blackPlayerId = playerMap[blackPlayerName]
        
        if (whitePlayerId == null || blackPlayerId == null) {
            Toast.makeText(this, getString(R.string.invalid_player_names), Toast.LENGTH_SHORT).show()
            return
        }
        
        // Submit game
        viewModel.submitGame(
            whitePlayerId,
            blackPlayerId,
            whitePlayerPin,
            blackPlayerPin,
            gameResult
        )
    }
}
