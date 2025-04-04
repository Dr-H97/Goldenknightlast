package com.chessclub.app.ui.profile;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import com.chessclub.app.MainActivity;
import com.chessclub.app.R;
import com.chessclub.app.database.DatabaseHelper;
import com.chessclub.app.database.PlayerDao;
import com.chessclub.app.model.Player;
import com.chessclub.app.utils.PinHasher;

/**
 * Fragment for displaying and editing player profile
 */
public class ProfileFragment extends Fragment {
    private TextView tvName;
    private TextView tvElo;
    private TextView tvStats;
    private TextView tvWinRate;
    private TextView tvGamesPlayed;
    private EditText etEmail;
    private EditText etPhone;
    private Button btnChangePin;
    private Button btnSaveProfile;
    private Button btnLogout;
    
    private Player currentPlayer;
    private PlayerDao playerDao;

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Initialize database access
        playerDao = DatabaseHelper.getInstance(requireContext()).getPlayerDao();
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_profile, container, false);
        
        // Initialize views
        tvName = view.findViewById(R.id.tv_name);
        tvElo = view.findViewById(R.id.tv_elo);
        tvStats = view.findViewById(R.id.tv_stats);
        tvWinRate = view.findViewById(R.id.tv_win_rate);
        tvGamesPlayed = view.findViewById(R.id.tv_games_played);
        etEmail = view.findViewById(R.id.et_email);
        etPhone = view.findViewById(R.id.et_phone);
        btnChangePin = view.findViewById(R.id.btn_change_pin);
        btnSaveProfile = view.findViewById(R.id.btn_save_profile);
        btnLogout = view.findViewById(R.id.btn_logout);
        
        // Load player data
        loadPlayerData();
        
        // Set up button listeners
        btnChangePin.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                showChangePinDialog();
            }
        });
        
        btnSaveProfile.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                saveProfile();
            }
        });
        
        btnLogout.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                logout();
            }
        });
        
        return view;
    }

    @Override
    public void onResume() {
        super.onResume();
        loadPlayerData(); // Refresh data when returning to this fragment
    }

    /**
     * Load current player data from MainActivity
     */
    private void loadPlayerData() {
        MainActivity activity = (MainActivity) getActivity();
        if (activity != null) {
            currentPlayer = activity.getCurrentPlayer();
            
            if (currentPlayer != null) {
                displayPlayerData();
            }
        }
    }

    /**
     * Display player data in the UI
     */
    private void displayPlayerData() {
        tvName.setText(currentPlayer.getName());
        tvElo.setText(String.valueOf(currentPlayer.getElo()));
        
        String stats = currentPlayer.getWins() + "W / " + currentPlayer.getDraws() + "D / " + currentPlayer.getLosses() + "L";
        tvStats.setText(stats);
        
        tvWinRate.setText(String.format("%.1f%%", currentPlayer.getWinRate()));
        tvGamesPlayed.setText(String.valueOf(currentPlayer.getGamesPlayed()));
        
        etEmail.setText(currentPlayer.getEmail());
        etPhone.setText(currentPlayer.getPhoneNumber());
    }

    /**
     * Show dialog to change PIN
     */
    private void showChangePinDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(getContext());
        View dialogView = getLayoutInflater().inflate(R.layout.dialog_change_pin, null);
        
        final EditText etCurrentPin = dialogView.findViewById(R.id.et_current_pin);
        final EditText etNewPin = dialogView.findViewById(R.id.et_new_pin);
        final EditText etConfirmPin = dialogView.findViewById(R.id.et_confirm_pin);
        
        builder.setTitle("Change PIN")
                .setView(dialogView)
                .setPositiveButton("Save", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        // Do nothing here, we'll override this later
                    }
                })
                .setNegativeButton("Cancel", null);
        
        final AlertDialog dialog = builder.create();
        dialog.show();
        
        // Override the positive button click to avoid dismissing when validation fails
        dialog.getButton(DialogInterface.BUTTON_POSITIVE).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String currentPin = etCurrentPin.getText().toString().trim();
                String newPin = etNewPin.getText().toString().trim();
                String confirmPin = etConfirmPin.getText().toString().trim();
                
                if (validatePinChange(currentPin, newPin, confirmPin)) {
                    changePin(newPin);
                    dialog.dismiss();
                }
            }
        });
    }

    /**
     * Validate PIN change inputs
     * @param currentPin Current PIN
     * @param newPin New PIN
     * @param confirmPin Confirmation of new PIN
     * @return true if valid, false otherwise
     */
    private boolean validatePinChange(String currentPin, String newPin, String confirmPin) {
        if (TextUtils.isEmpty(currentPin)) {
            Toast.makeText(getContext(), "Please enter your current PIN", Toast.LENGTH_SHORT).show();
            return false;
        }
        
        if (TextUtils.isEmpty(newPin)) {
            Toast.makeText(getContext(), "Please enter a new PIN", Toast.LENGTH_SHORT).show();
            return false;
        }
        
        if (TextUtils.isEmpty(confirmPin)) {
            Toast.makeText(getContext(), "Please confirm your new PIN", Toast.LENGTH_SHORT).show();
            return false;
        }
        
        if (!newPin.equals(confirmPin)) {
            Toast.makeText(getContext(), "New PINs do not match", Toast.LENGTH_SHORT).show();
            return false;
        }
        
        // Verify current PIN
        if (!PinHasher.verifyPin(currentPin, currentPlayer.getPinCode())) {
            Toast.makeText(getContext(), "Current PIN is incorrect", Toast.LENGTH_SHORT).show();
            return false;
        }
        
        return true;
    }

    /**
     * Change user's PIN
     * @param newPin New PIN
     */
    private void changePin(String newPin) {
        boolean success = playerDao.updatePlayerPinCode(currentPlayer.getId(), newPin);
        
        if (success) {
            Toast.makeText(getContext(), "PIN changed successfully", Toast.LENGTH_SHORT).show();
            
            // Update current player object with new PIN
            currentPlayer = playerDao.getPlayerById(currentPlayer.getId());
        } else {
            Toast.makeText(getContext(), "Failed to change PIN", Toast.LENGTH_SHORT).show();
        }
    }

    /**
     * Save profile information
     */
    private void saveProfile() {
        String email = etEmail.getText().toString().trim();
        String phone = etPhone.getText().toString().trim();
        
        // Update player object
        currentPlayer.setEmail(email);
        currentPlayer.setPhoneNumber(phone);
        
        // Save to database
        int rowsAffected = playerDao.updatePlayer(currentPlayer);
        
        if (rowsAffected > 0) {
            Toast.makeText(getContext(), "Profile updated successfully", Toast.LENGTH_SHORT).show();
        } else {
            Toast.makeText(getContext(), "Failed to update profile", Toast.LENGTH_SHORT).show();
        }
    }

    /**
     * Log out current user
     */
    private void logout() {
        MainActivity activity = (MainActivity) getActivity();
        if (activity != null) {
            activity.logout();
        }
    }
}
