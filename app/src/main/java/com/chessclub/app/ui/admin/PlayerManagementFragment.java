package com.chessclub.app.ui.admin;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.DividerItemDecoration;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import com.chessclub.app.R;
import com.chessclub.app.database.DatabaseHelper;
import com.chessclub.app.database.PlayerDao;
import com.chessclub.app.model.Player;
import com.chessclub.app.utils.PinHasher;
import com.google.android.material.floatingactionbutton.FloatingActionButton;

import java.util.List;

/**
 * Fragment for player management (admin functionality)
 */
public class PlayerManagementFragment extends Fragment implements PlayerAdminAdapter.PlayerAdminListener {
    private RecyclerView recyclerView;
    private FloatingActionButton fabAddPlayer;
    private SwipeRefreshLayout swipeRefreshLayout;
    
    private PlayerAdminAdapter adapter;
    private PlayerDao playerDao;
    private List<Player> players;

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        playerDao = DatabaseHelper.getInstance(requireContext()).getPlayerDao();
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_player_management, container, false);
        
        recyclerView = view.findViewById(R.id.recycler_view);
        fabAddPlayer = view.findViewById(R.id.fab_add_player);
        swipeRefreshLayout = view.findViewById(R.id.swipe_refresh);
        
        // Set up RecyclerView
        recyclerView.setLayoutManager(new LinearLayoutManager(getContext()));
        recyclerView.addItemDecoration(new DividerItemDecoration(getContext(), DividerItemDecoration.VERTICAL));
        
        // Set up FAB
        fabAddPlayer.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                showAddPlayerDialog();
            }
        });
        
        // Set up swipe refresh
        swipeRefreshLayout.setOnRefreshListener(new SwipeRefreshLayout.OnRefreshListener() {
            @Override
            public void onRefresh() {
                loadPlayers();
            }
        });
        
        // Load data
        loadPlayers();
        
        return view;
    }

    /**
     * Load players from database
     */
    private void loadPlayers() {
        players = playerDao.getAllPlayers();
        
        if (adapter == null) {
            adapter = new PlayerAdminAdapter(players, this);
            recyclerView.setAdapter(adapter);
        } else {
            adapter.updatePlayers(players);
        }
        
        if (swipeRefreshLayout.isRefreshing()) {
            swipeRefreshLayout.setRefreshing(false);
        }
    }

    /**
     * Show dialog to add a new player
     */
    private void showAddPlayerDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(getContext());
        View dialogView = getLayoutInflater().inflate(R.layout.dialog_add_player, null);
        
        final EditText etName = dialogView.findViewById(R.id.et_name);
        final EditText etPin = dialogView.findViewById(R.id.et_pin);
        final EditText etEmail = dialogView.findViewById(R.id.et_email);
        final EditText etPhone = dialogView.findViewById(R.id.et_phone);
        final CheckBox cbIsAdmin = dialogView.findViewById(R.id.cb_is_admin);
        
        builder.setTitle("Add New Player")
                .setView(dialogView)
                .setPositiveButton("Add", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        // Do nothing here, we'll override this later
                    }
                })
                .setNegativeButton("Cancel", null);
        
        final AlertDialog dialog = builder.create();
        dialog.show();
        
        // Override the positive button click to prevent dialog from closing on invalid input
        dialog.getButton(DialogInterface.BUTTON_POSITIVE).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String name = etName.getText().toString().trim();
                String pin = etPin.getText().toString().trim();
                String email = etEmail.getText().toString().trim();
                String phone = etPhone.getText().toString().trim();
                boolean isAdmin = cbIsAdmin.isChecked();
                
                if (validateNewPlayerInput(name, pin)) {
                    addPlayer(name, pin, email, phone, isAdmin);
                    dialog.dismiss();
                }
            }
        });
    }

    /**
     * Validate new player input
     * @param name Player name
     * @param pin PIN code
     * @return true if valid, false otherwise
     */
    private boolean validateNewPlayerInput(String name, String pin) {
        if (TextUtils.isEmpty(name)) {
            Toast.makeText(getContext(), "Please enter a name", Toast.LENGTH_SHORT).show();
            return false;
        }
        
        if (TextUtils.isEmpty(pin)) {
            Toast.makeText(getContext(), "Please enter a PIN", Toast.LENGTH_SHORT).show();
            return false;
        }
        
        return true;
    }

    /**
     * Add a new player to the database
     * @param name Player name
     * @param pin PIN code
     * @param email Email address
     * @param phone Phone number
     * @param isAdmin Admin status
     */
    private void addPlayer(String name, String pin, String email, String phone, boolean isAdmin) {
        // Create new player object
        Player player = new Player();
        player.setName(name);
        
        // Hash the PIN
        String hashedPin = PinHasher.hashPin(pin);
        player.setPinCode(hashedPin);
        
        player.setEmail(email);
        player.setPhoneNumber(phone);
        player.setAdmin(isAdmin);
        
        // Add to database
        long playerId = playerDao.addPlayer(player);
        
        if (playerId > 0) {
            Toast.makeText(getContext(), "Player added successfully", Toast.LENGTH_SHORT).show();
            loadPlayers();
        } else {
            Toast.makeText(getContext(), "Failed to add player", Toast.LENGTH_SHORT).show();
        }
    }

    /**
     * Show dialog to edit player
     * @param player Player to edit
     */
    private void showEditPlayerDialog(final Player player) {
        AlertDialog.Builder builder = new AlertDialog.Builder(getContext());
        View dialogView = getLayoutInflater().inflate(R.layout.dialog_add_player, null);
        
        final EditText etName = dialogView.findViewById(R.id.et_name);
        final EditText etPin = dialogView.findViewById(R.id.et_pin);
        final EditText etEmail = dialogView.findViewById(R.id.et_email);
        final EditText etPhone = dialogView.findViewById(R.id.et_phone);
        final CheckBox cbIsAdmin = dialogView.findViewById(R.id.cb_is_admin);
        
        // Set existing values
        etName.setText(player.getName());
        etEmail.setText(player.getEmail());
        etPhone.setText(player.getPhoneNumber());
        cbIsAdmin.setChecked(player.isAdmin());
        
        builder.setTitle("Edit Player")
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
        
        // Override the positive button click
        dialog.getButton(DialogInterface.BUTTON_POSITIVE).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String name = etName.getText().toString().trim();
                String pin = etPin.getText().toString().trim();
                String email = etEmail.getText().toString().trim();
                String phone = etPhone.getText().toString().trim();
                boolean isAdmin = cbIsAdmin.isChecked();
                
                if (TextUtils.isEmpty(name)) {
                    Toast.makeText(getContext(), "Please enter a name", Toast.LENGTH_SHORT).show();
                    return;
                }
                
                // Update player
                player.setName(name);
                player.setEmail(email);
                player.setPhoneNumber(phone);
                player.setAdmin(isAdmin);
                
                // Update PIN if provided
                if (!TextUtils.isEmpty(pin)) {
                    String hashedPin = PinHasher.hashPin(pin);
                    player.setPinCode(hashedPin);
                }
                
                // Save to database
                int rowsAffected = playerDao.updatePlayer(player);
                
                if (rowsAffected > 0) {
                    Toast.makeText(getContext(), "Player updated successfully", Toast.LENGTH_SHORT).show();
                    loadPlayers();
                    dialog.dismiss();
                } else {
                    Toast.makeText(getContext(), "Failed to update player", Toast.LENGTH_SHORT).show();
                }
            }
        });
    }

    /**
     * Show confirmation dialog for player deletion
     * @param player Player to delete
     */
    private void showDeletePlayerConfirmation(final Player player) {
        AlertDialog.Builder builder = new AlertDialog.Builder(getContext());
        builder.setTitle("Delete Player")
                .setMessage("Are you sure you want to delete " + player.getName() + "? This will also delete all their games.")
                .setPositiveButton("Delete", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        deletePlayer(player);
                    }
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    /**
     * Delete a player
     * @param player Player to delete
     */
    private void deletePlayer(Player player) {
        int rowsAffected = playerDao.deletePlayer(player.getId());
        
        if (rowsAffected > 0) {
            Toast.makeText(getContext(), "Player deleted successfully", Toast.LENGTH_SHORT).show();
            loadPlayers();
        } else {
            Toast.makeText(getContext(), "Failed to delete player", Toast.LENGTH_SHORT).show();
        }
    }

    @Override
    public void onEditPlayer(Player player) {
        showEditPlayerDialog(player);
    }

    @Override
    public void onDeletePlayer(Player player) {
        showDeletePlayerConfirmation(player);
    }

    /**
     * Adapter for displaying players in admin view
     */
    public static class PlayerAdminAdapter extends RecyclerView.Adapter<PlayerAdminAdapter.ViewHolder> {
        private List<Player> players;
        private PlayerAdminListener listener;

        public interface PlayerAdminListener {
            void onEditPlayer(Player player);
            void onDeletePlayer(Player player);
        }

        public PlayerAdminAdapter(List<Player> players, PlayerAdminListener listener) {
            this.players = players;
            this.listener = listener;
        }

        @NonNull
        @Override
        public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            View view = LayoutInflater.from(parent.getContext())
                    .inflate(R.layout.item_admin_player, parent, false);
            return new ViewHolder(view);
        }

        @Override
        public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
            Player player = players.get(position);
            
            holder.tvName.setText(player.getName());
            holder.tvElo.setText(String.valueOf(player.getElo()));
            holder.tvGamesPlayed.setText(String.valueOf(player.getGamesPlayed()));
            
            String statsText = player.getWins() + "W / " + player.getDraws() + "D / " + player.getLosses() + "L";
            holder.tvStats.setText(statsText);
            
            if (player.isAdmin()) {
                holder.tvAdmin.setVisibility(View.VISIBLE);
            } else {
                holder.tvAdmin.setVisibility(View.GONE);
            }
            
            holder.btnEdit.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    if (listener != null) {
                        listener.onEditPlayer(player);
                    }
                }
            });
            
            holder.btnDelete.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    if (listener != null) {
                        listener.onDeletePlayer(player);
                    }
                }
            });
        }

        @Override
        public int getItemCount() {
            return players == null ? 0 : players.size();
        }

        public void updatePlayers(List<Player> newPlayers) {
            this.players = newPlayers;
            notifyDataSetChanged();
        }

        static class ViewHolder extends RecyclerView.ViewHolder {
            TextView tvName;
            TextView tvElo;
            TextView tvGamesPlayed;
            TextView tvStats;
            TextView tvAdmin;
            Button btnEdit;
            Button btnDelete;

            public ViewHolder(@NonNull View itemView) {
                super(itemView);
                tvName = itemView.findViewById(R.id.tv_name);
                tvElo = itemView.findViewById(R.id.tv_elo);
                tvGamesPlayed = itemView.findViewById(R.id.tv_games_played);
                tvStats = itemView.findViewById(R.id.tv_stats);
                tvAdmin = itemView.findViewById(R.id.tv_admin);
                btnEdit = itemView.findViewById(R.id.btn_edit);
                btnDelete = itemView.findViewById(R.id.btn_delete);
            }
        }
    }
}
