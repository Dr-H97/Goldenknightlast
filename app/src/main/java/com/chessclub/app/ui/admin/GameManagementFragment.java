package com.chessclub.app.ui.admin;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;
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
import com.chessclub.app.database.GameDao;
import com.chessclub.app.database.PlayerDao;
import com.chessclub.app.model.Game;
import com.chessclub.app.model.Player;

import java.text.SimpleDateFormat;
import java.util.List;
import java.util.Locale;

/**
 * Fragment for game management (admin functionality)
 */
public class GameManagementFragment extends Fragment {
    private RecyclerView recyclerView;
    private SwipeRefreshLayout swipeRefreshLayout;
    private TextView tvEmptyState;
    
    private GameAdminAdapter adapter;
    private GameDao gameDao;
    private PlayerDao playerDao;
    private List<Game> games;

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        DatabaseHelper dbHelper = DatabaseHelper.getInstance(requireContext());
        gameDao = dbHelper.getGameDao();
        playerDao = dbHelper.getPlayerDao();
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_game_management, container, false);
        
        recyclerView = view.findViewById(R.id.recycler_view);
        swipeRefreshLayout = view.findViewById(R.id.swipe_refresh);
        tvEmptyState = view.findViewById(R.id.tv_empty_state);
        
        // Set up RecyclerView
        recyclerView.setLayoutManager(new LinearLayoutManager(getContext()));
        recyclerView.addItemDecoration(new DividerItemDecoration(getContext(), DividerItemDecoration.VERTICAL));
        
        // Set up swipe refresh
        swipeRefreshLayout.setOnRefreshListener(new SwipeRefreshLayout.OnRefreshListener() {
            @Override
            public void onRefresh() {
                loadGames();
            }
        });
        
        // Load data
        loadGames();
        
        return view;
    }

    /**
     * Load games from database
     */
    private void loadGames() {
        games = gameDao.getAllGames();
        
        if (games.isEmpty()) {
            recyclerView.setVisibility(View.GONE);
            tvEmptyState.setVisibility(View.VISIBLE);
        } else {
            recyclerView.setVisibility(View.VISIBLE);
            tvEmptyState.setVisibility(View.GONE);
            
            if (adapter == null) {
                adapter = new GameAdminAdapter(games, playerDao, new GameAdminAdapter.GameAdminListener() {
                    @Override
                    public void onDeleteGame(Game game) {
                        showDeleteGameConfirmation(game);
                    }
                });
                recyclerView.setAdapter(adapter);
            } else {
                adapter.updateGames(games);
            }
        }
        
        if (swipeRefreshLayout.isRefreshing()) {
            swipeRefreshLayout.setRefreshing(false);
        }
    }

    /**
     * Show confirmation dialog for game deletion
     * @param game Game to delete
     */
    private void showDeleteGameConfirmation(final Game game) {
        AlertDialog.Builder builder = new AlertDialog.Builder(getContext());
        builder.setTitle("Delete Game")
                .setMessage("Are you sure you want to delete this game? This will also revert ELO changes.")
                .setPositiveButton("Delete", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        deleteGame(game);
                    }
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    /**
     * Delete a game
     * @param game Game to delete
     */
    private void deleteGame(Game game) {
        // Get players involved
        Player whitePlayer = playerDao.getPlayerById(game.getWhitePlayerId());
        Player blackPlayer = playerDao.getPlayerById(game.getBlackPlayerId());
        
        if (whitePlayer == null || blackPlayer == null) {
            Toast.makeText(getContext(), "Error: Player not found", Toast.LENGTH_SHORT).show();
            return;
        }
        
        // Revert ELO and stats changes
        revertGameStats(whitePlayer, blackPlayer, game);
        
        // Delete game
        int rowsAffected = gameDao.deleteGame(game.getId());
        
        if (rowsAffected > 0) {
            Toast.makeText(getContext(), "Game deleted successfully", Toast.LENGTH_SHORT).show();
            loadGames();
        } else {
            Toast.makeText(getContext(), "Failed to delete game", Toast.LENGTH_SHORT).show();
        }
    }

    /**
     * Revert player stats (ELO, wins, losses, draws) after game deletion
     * @param whitePlayer White player
     * @param blackPlayer Black player
     * @param game Game to revert
     */
    private void revertGameStats(Player whitePlayer, Player blackPlayer, Game game) {
        // Revert ELO changes
        whitePlayer.setElo(whitePlayer.getElo() - game.getWhiteEloChange());
        blackPlayer.setElo(blackPlayer.getElo() - game.getBlackEloChange());
        
        // Decrement games played
        whitePlayer.setGamesPlayed(whitePlayer.getGamesPlayed() - 1);
        blackPlayer.setGamesPlayed(blackPlayer.getGamesPlayed() - 1);
        
        // Revert win/loss/draw stats
        switch (game.getResult()) {
            case WHITE_WIN:
                whitePlayer.setWins(whitePlayer.getWins() - 1);
                blackPlayer.setLosses(blackPlayer.getLosses() - 1);
                break;
            case BLACK_WIN:
                blackPlayer.setWins(blackPlayer.getWins() - 1);
                whitePlayer.setLosses(whitePlayer.getLosses() - 1);
                break;
            case DRAW:
                whitePlayer.setDraws(whitePlayer.getDraws() - 1);
                blackPlayer.setDraws(blackPlayer.getDraws() - 1);
                break;
        }
        
        // Update players in database
        playerDao.updatePlayer(whitePlayer);
        playerDao.updatePlayer(blackPlayer);
    }

    /**
     * Adapter for displaying games in admin view
     */
    public static class GameAdminAdapter extends RecyclerView.Adapter<GameAdminAdapter.ViewHolder> {
        private List<Game> games;
        private PlayerDao playerDao;
        private GameAdminListener listener;
        private SimpleDateFormat dateFormat;

        public interface GameAdminListener {
            void onDeleteGame(Game game);
        }

        public GameAdminAdapter(List<Game> games, PlayerDao playerDao, GameAdminListener listener) {
            this.games = games;
            this.playerDao = playerDao;
            this.listener = listener;
            this.dateFormat = new SimpleDateFormat("MMM dd, yyyy HH:mm", Locale.getDefault());
        }

        @NonNull
        @Override
        public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            View view = LayoutInflater.from(parent.getContext())
                    .inflate(R.layout.item_admin_game, parent, false);
            return new ViewHolder(view);
        }

        @Override
        public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
            Game game = games.get(position);
            
            // Get player names
            Player whitePlayer = playerDao.getPlayerById(game.getWhitePlayerId());
            Player blackPlayer = playerDao.getPlayerById(game.getBlackPlayerId());
            
            if (whitePlayer == null || blackPlayer == null) {
                return;
            }
            
            // Set player names
            holder.tvWhitePlayer.setText(whitePlayer.getName() + " (" + whitePlayer.getElo() + ")");
            holder.tvBlackPlayer.setText(blackPlayer.getName() + " (" + blackPlayer.getElo() + ")");
            
            // Set result
            String resultText;
            switch (game.getResult()) {
                case WHITE_WIN:
                    resultText = "White Won";
                    break;
                case BLACK_WIN:
                    resultText = "Black Won";
                    break;
                case DRAW:
                    resultText = "Draw";
                    break;
                default:
                    resultText = "Unknown";
                    break;
            }
            holder.tvResult.setText(resultText);
            
            // Set date
            holder.tvDate.setText(dateFormat.format(game.getDate()));
            
            // Set ELO changes
            holder.tvWhiteEloChange.setText("ELO: " + (game.getWhiteEloChange() >= 0 ? "+" : "") + game.getWhiteEloChange());
            holder.tvBlackEloChange.setText("ELO: " + (game.getBlackEloChange() >= 0 ? "+" : "") + game.getBlackEloChange());
            
            // Set delete button listener
            holder.btnDelete.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    if (listener != null) {
                        listener.onDeleteGame(game);
                    }
                }
            });
        }

        @Override
        public int getItemCount() {
            return games == null ? 0 : games.size();
        }

        public void updateGames(List<Game> newGames) {
            this.games = newGames;
            notifyDataSetChanged();
        }

        static class ViewHolder extends RecyclerView.ViewHolder {
            TextView tvWhitePlayer;
            TextView tvBlackPlayer;
            TextView tvResult;
            TextView tvDate;
            TextView tvWhiteEloChange;
            TextView tvBlackEloChange;
            Button btnDelete;

            public ViewHolder(@NonNull View itemView) {
                super(itemView);
                tvWhitePlayer = itemView.findViewById(R.id.tv_white_player);
                tvBlackPlayer = itemView.findViewById(R.id.tv_black_player);
                tvResult = itemView.findViewById(R.id.tv_result);
                tvDate = itemView.findViewById(R.id.tv_date);
                tvWhiteEloChange = itemView.findViewById(R.id.tv_white_elo_change);
                tvBlackEloChange = itemView.findViewById(R.id.tv_black_elo_change);
                btnDelete = itemView.findViewById(R.id.btn_delete);
            }
        }
    }
}
