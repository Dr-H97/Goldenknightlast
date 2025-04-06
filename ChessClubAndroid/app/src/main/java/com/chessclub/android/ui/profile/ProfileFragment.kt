package com.chessclub.android.ui.profile

import android.app.AlertDialog
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import com.chessclub.android.R
import com.github.mikephil.charting.charts.LineChart
import com.github.mikephil.charting.data.Entry
import com.github.mikephil.charting.data.LineData
import com.github.mikephil.charting.data.LineDataSet
import android.content.Intent
import com.chessclub.android.ui.login.LoginActivity

class ProfileFragment : Fragment() {
    private lateinit var viewModel: ProfileViewModel
    
    private lateinit var nameTextView: TextView
    private lateinit var ratingTextView: TextView
    private lateinit var gamesPlayedTextView: TextView
    private lateinit var gamesWonTextView: TextView
    private lateinit var gamesLostTextView: TextView
    private lateinit var gamesDrawnTextView: TextView
    private lateinit var winRateTextView: TextView
    private lateinit var changePinButton: Button
    private lateinit var logoutButton: Button
    private lateinit var progressBar: ProgressBar
    private lateinit var ratingChart: LineChart
    
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val root = inflater.inflate(R.layout.fragment_profile, container, false)
        
        nameTextView = root.findViewById(R.id.player_name)
        ratingTextView = root.findViewById(R.id.player_rating)
        gamesPlayedTextView = root.findViewById(R.id.games_played)
        gamesWonTextView = root.findViewById(R.id.games_won)
        gamesLostTextView = root.findViewById(R.id.games_lost)
        gamesDrawnTextView = root.findViewById(R.id.games_drawn)
        winRateTextView = root.findViewById(R.id.win_rate)
        changePinButton = root.findViewById(R.id.change_pin_button)
        logoutButton = root.findViewById(R.id.logout_button)
        progressBar = root.findViewById(R.id.progress_bar)
        ratingChart = root.findViewById(R.id.rating_chart)
        
        return root
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        viewModel = ViewModelProvider(this).get(ProfileViewModel::class.java)
        
        // Get current player ID from preferences
        val prefs = requireActivity().getSharedPreferences("chess_club_prefs", 0)
        val playerId = prefs.getString("player_id", "") ?: ""
        
        // Set up observers
        observeViewModel()
        
        // Load player data
        viewModel.loadPlayerData(playerId)
        
        // Set up buttons
        changePinButton.setOnClickListener { showChangePinDialog() }
        logoutButton.setOnClickListener { logout() }
    }
    
    private fun observeViewModel() {
        viewModel.player.observe(viewLifecycleOwner) { player ->
            progressBar.visibility = View.GONE
            
            if (player != null) {
                nameTextView.text = player.name
                ratingTextView.text = player.rating.toString()
                gamesPlayedTextView.text = player.gamesPlayed.toString()
                gamesWonTextView.text = player.gamesWon.toString()
                gamesLostTextView.text = player.gamesLost.toString()
                gamesDrawnTextView.text = player.gamesDrawn.toString()
                
                val winRate = if (player.gamesPlayed > 0) {
                    (player.gamesWon.toFloat() / player.gamesPlayed.toFloat() * 100).toInt()
                } else {
                    0
                }
                
                winRateTextView.text = "$winRate%"
            }
        }
        
        viewModel.ratingHistory.observe(viewLifecycleOwner) { ratings ->
            if (ratings.isNotEmpty()) {
                setupRatingChart(ratings)
            }
        }
        
        viewModel.isLoading.observe(viewLifecycleOwner) { isLoading ->
            progressBar.visibility = if (isLoading) View.VISIBLE else View.GONE
        }
        
        viewModel.pinChangeResult.observe(viewLifecycleOwner) { success ->
            if (success) {
                Toast.makeText(context, getString(R.string.pin_changed_successfully), Toast.LENGTH_SHORT).show()
            } else {
                Toast.makeText(context, getString(R.string.error_changing_pin), Toast.LENGTH_LONG).show()
            }
        }
    }
    
    private fun setupRatingChart(ratings: List<Pair<Long, Int>>) {
        val entries = ratings.mapIndexed { index, (date, rating) ->
            Entry(index.toFloat(), rating.toFloat())
        }
        
        val dataSet = LineDataSet(entries, getString(R.string.rating))
        dataSet.color = resources.getColor(R.color.dark_primary, null)
        dataSet.valueTextColor = resources.getColor(R.color.dark_text_primary, null)
        dataSet.lineWidth = 2f
        dataSet.setDrawCircles(true)
        dataSet.setDrawValues(false)
        dataSet.circleRadius = 4f
        dataSet.setCircleColor(resources.getColor(R.color.dark_highlight, null))
        
        val lineData = LineData(dataSet)
        ratingChart.data = lineData
        ratingChart.description.isEnabled = false
        ratingChart.legend.isEnabled = true
        ratingChart.animateX(1000)
        ratingChart.invalidate()
    }
    
    private fun showChangePinDialog() {
        val dialogView = layoutInflater.inflate(R.layout.dialog_change_pin, null)
        val currentPinEdit: EditText = dialogView.findViewById(R.id.current_pin)
        val newPinEdit: EditText = dialogView.findViewById(R.id.new_pin)
        val confirmPinEdit: EditText = dialogView.findViewById(R.id.confirm_pin)
        
        AlertDialog.Builder(requireContext())
            .setTitle(R.string.change_pin)
            .setView(dialogView)
            .setPositiveButton(R.string.save) { _, _ ->
                val currentPin = currentPinEdit.text.toString()
                val newPin = newPinEdit.text.toString()
                val confirmPin = confirmPinEdit.text.toString()
                
                if (currentPin.isBlank() || newPin.isBlank() || confirmPin.isBlank()) {
                    Toast.makeText(context, getString(R.string.fill_all_fields), Toast.LENGTH_SHORT).show()
                    return@setPositiveButton
                }
                
                if (newPin != confirmPin) {
                    Toast.makeText(context, getString(R.string.pins_dont_match), Toast.LENGTH_SHORT).show()
                    return@setPositiveButton
                }
                
                // Verify current PIN and change to new PIN
                val playerId = requireActivity().getSharedPreferences("chess_club_prefs", 0)
                    .getString("player_id", "") ?: ""
                
                viewModel.changePin(playerId, currentPin, newPin)
            }
            .setNegativeButton(R.string.cancel, null)
            .create()
            .show()
    }
    
    private fun logout() {
        // Clear preferences
        requireActivity().getSharedPreferences("chess_club_prefs", 0)
            .edit()
            .clear()
            .apply()
        
        // Navigate to login screen
        startActivity(Intent(activity, LoginActivity::class.java))
        activity?.finish()
    }
}
