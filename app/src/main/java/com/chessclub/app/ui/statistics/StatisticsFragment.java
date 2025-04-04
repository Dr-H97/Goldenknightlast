package com.chessclub.app.ui.statistics;

import android.graphics.Color;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.DividerItemDecoration;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.chessclub.app.MainActivity;
import com.chessclub.app.R;
import com.chessclub.app.database.DatabaseHelper;
import com.chessclub.app.database.GameDao;
import com.chessclub.app.database.PlayerDao;
import com.chessclub.app.model.Game;
import com.chessclub.app.model.Player;

import org.eazegraph.lib.charts.PieChart;
import org.eazegraph.lib.models.PieModel;

import java.util.List;

/**
 * Fragment for displaying player statistics and game history
 */
public class StatisticsFragment extends Fragment {
    private TextView tvName;
    private TextView tvElo;
    private TextView tvWins;
    private TextView tvDraws;
    private TextView tvLosses;
    private TextView tvWinRate;
    private PieChart pieChart;
    private RecyclerView recyclerView;
    private TextView tvEmptyState;
    
    private GameHistoryAdapter gameHistoryAdapter;
    private Player currentPlayer;
    private List<Game> playerGames;
    
    private PlayerDao playerDao;
    private GameDao gameDao;

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Initialize database access
        DatabaseHelper dbHelper = DatabaseHelper.getInstance(requireContext());
        playerDao = dbHelper.getPlayerDao();
        gameDao = dbHelper.getGameDao();
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_statistics, container, false);
        
        // Initialize views
        tvName = view.findViewById(R.id.tv_name);
        tvElo = view.findViewById(R.id.tv_elo);
        tvWins = view.findViewById(R.id.tv_wins);
        tvDraws = view.findViewById(R.id.tv_draws);
        tvLosses = view.findViewById(R.id.tv_losses);
        tvWinRate = view.findViewById(R.id.tv_win_rate);
        pieChart = view.findViewById(R.id.pie_chart);
        recyclerView = view.findViewById(R.id.recycler_view);
        tvEmptyState = view.findViewById(R.id.tv_empty_state);
        
        // Set up RecyclerView
        recyclerView.setLayoutManager(new LinearLayoutManager(getContext()));
        recyclerView.addItemDecoration(new DividerItemDecoration(getContext(), DividerItemDecoration.VERTICAL));
        
        // Load data
        loadPlayerData();
        
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
                // Display player stats
                displayPlayerStats();
                
                // Load game history
                loadGameHistory();
            }
        }
    }

    /**
     * Display player statistics
     */
    private void displayPlayerStats() {
        tvName.setText(currentPlayer.getName());
        tvElo.setText(String.valueOf(currentPlayer.getElo()));
        tvWins.setText(String.valueOf(currentPlayer.getWins()));
        tvDraws.setText(String.valueOf(currentPlayer.getDraws()));
        tvLosses.setText(String.valueOf(currentPlayer.getLosses()));
        tvWinRate.setText(String.format("%.1f%%", currentPlayer.getWinRate()));
        
        // Set up pie chart
        setupPieChart();
    }

    /**
     * Set up pie chart with win/draw/loss data
     */
    private void setupPieChart() {
        pieChart.clearChart();
        
        // Add slices to pie chart
        if (currentPlayer.getWins() > 0) {
            pieChart.addPieSlice(new PieModel("Wins", currentPlayer.getWins(), Color.parseColor("#4CAF50")));
        }
        
        if (currentPlayer.getDraws() > 0) {
            pieChart.addPieSlice(new PieModel("Draws", currentPlayer.getDraws(), Color.parseColor("#FFC107")));
        }
        
        if (currentPlayer.getLosses() > 0) {
            pieChart.addPieSlice(new PieModel("Losses", currentPlayer.getLosses(), Color.parseColor("#F44336")));
        }
        
        // If no games played, add empty state
        if (currentPlayer.getGamesPlayed() == 0) {
            pieChart.addPieSlice(new PieModel("No Games", 1, Color.parseColor("#9E9E9E")));
        }
        
        pieChart.startAnimation();
    }

    /**
     * Load game history for current player
     */
    private void loadGameHistory() {
        playerGames = gameDao.getGamesForPlayer(currentPlayer.getId());
        
        if (playerGames.isEmpty()) {
            recyclerView.setVisibility(View.GONE);
            tvEmptyState.setVisibility(View.VISIBLE);
        } else {
            recyclerView.setVisibility(View.VISIBLE);
            tvEmptyState.setVisibility(View.GONE);
            
            // Set up adapter for game history
            gameHistoryAdapter = new GameHistoryAdapter(playerGames, currentPlayer.getId(), playerDao);
            recyclerView.setAdapter(gameHistoryAdapter);
        }
    }
}
