package com.chessclub.app.ui.rankings;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.DividerItemDecoration;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.chessclub.app.R;
import com.chessclub.app.database.DatabaseHelper;
import com.chessclub.app.database.PlayerDao;
import com.chessclub.app.model.Player;

import java.util.List;

/**
 * Fragment for displaying player rankings by ELO
 */
public class RankingsFragment extends Fragment {
    private RecyclerView recyclerView;
    private PlayerAdapter playerAdapter;
    private TextView tvEmptyState;
    
    private PlayerDao playerDao;
    private List<Player> players;
    
    // Sorting options
    private static final int SORT_BY_ELO = 0;
    private static final int SORT_BY_NAME = 1;
    private static final int SORT_BY_GAMES = 2;
    private static final int SORT_BY_WINS = 3;
    
    private int currentSortMethod = SORT_BY_ELO;
    private boolean ascendingOrder = false;

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setHasOptionsMenu(true);
        
        // Initialize database access
        playerDao = DatabaseHelper.getInstance(requireContext()).getPlayerDao();
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_rankings, container, false);
        
        recyclerView = view.findViewById(R.id.recycler_view);
        tvEmptyState = view.findViewById(R.id.tv_empty_state);
        
        // Set up RecyclerView
        recyclerView.setLayoutManager(new LinearLayoutManager(getContext()));
        recyclerView.addItemDecoration(new DividerItemDecoration(getContext(), DividerItemDecoration.VERTICAL));
        
        // Load data
        loadPlayers();
        
        return view;
    }

    @Override
    public void onResume() {
        super.onResume();
        loadPlayers(); // Refresh data when returning to this fragment
    }

    @Override
    public void onCreateOptionsMenu(@NonNull Menu menu, @NonNull MenuInflater inflater) {
        inflater.inflate(R.menu.rankings_menu, menu);
        super.onCreateOptionsMenu(menu, inflater);
    }

    @Override
    public boolean onOptionsItemSelected(@NonNull MenuItem item) {
        int itemId = item.getItemId();
        
        if (itemId == R.id.action_sort_elo) {
            if (currentSortMethod == SORT_BY_ELO) {
                ascendingOrder = !ascendingOrder;
            } else {
                currentSortMethod = SORT_BY_ELO;
                ascendingOrder = false; // Default to descending for ELO
            }
            loadPlayers();
            return true;
        } else if (itemId == R.id.action_sort_name) {
            if (currentSortMethod == SORT_BY_NAME) {
                ascendingOrder = !ascendingOrder;
            } else {
                currentSortMethod = SORT_BY_NAME;
                ascendingOrder = true; // Default to ascending for name
            }
            loadPlayers();
            return true;
        } else if (itemId == R.id.action_sort_games) {
            if (currentSortMethod == SORT_BY_GAMES) {
                ascendingOrder = !ascendingOrder;
            } else {
                currentSortMethod = SORT_BY_GAMES;
                ascendingOrder = false; // Default to descending for games played
            }
            loadPlayers();
            return true;
        } else if (itemId == R.id.action_sort_wins) {
            if (currentSortMethod == SORT_BY_WINS) {
                ascendingOrder = !ascendingOrder;
            } else {
                currentSortMethod = SORT_BY_WINS;
                ascendingOrder = false; // Default to descending for wins
            }
            loadPlayers();
            return true;
        } else if (itemId == R.id.action_refresh) {
            loadPlayers();
            return true;
        }
        
        return super.onOptionsItemSelected(item);
    }

    /**
     * Load players based on current sort method
     */
    private void loadPlayers() {
        String sortColumn;
        
        // Determine sort column
        switch (currentSortMethod) {
            case SORT_BY_NAME:
                sortColumn = DatabaseHelper.COLUMN_PLAYER_NAME;
                break;
            case SORT_BY_GAMES:
                sortColumn = DatabaseHelper.COLUMN_PLAYER_GAMES_PLAYED;
                break;
            case SORT_BY_WINS:
                sortColumn = DatabaseHelper.COLUMN_PLAYER_WINS;
                break;
            case SORT_BY_ELO:
            default:
                sortColumn = DatabaseHelper.COLUMN_PLAYER_ELO;
                break;
        }
        
        // Load players with selected sorting
        players = playerDao.getAllPlayersSorted(sortColumn, ascendingOrder);
        
        if (players.isEmpty()) {
            recyclerView.setVisibility(View.GONE);
            tvEmptyState.setVisibility(View.VISIBLE);
        } else {
            recyclerView.setVisibility(View.VISIBLE);
            tvEmptyState.setVisibility(View.GONE);
            
            // Set up or update adapter
            if (playerAdapter == null) {
                playerAdapter = new PlayerAdapter(players);
                recyclerView.setAdapter(playerAdapter);
            } else {
                playerAdapter.updatePlayers(players);
            }
        }
    }
}
