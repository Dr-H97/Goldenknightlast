package com.chessclub.app.ui.rankings;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.chessclub.app.R;
import com.chessclub.app.model.Player;

import java.util.List;

/**
 * Adapter for displaying player items in a RecyclerView
 */
public class PlayerAdapter extends RecyclerView.Adapter<PlayerAdapter.PlayerViewHolder> {
    private List<Player> players;

    /**
     * Constructor
     * @param players List of players to display
     */
    public PlayerAdapter(List<Player> players) {
        this.players = players;
    }

    @NonNull
    @Override
    public PlayerViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_player, parent, false);
        return new PlayerViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull PlayerViewHolder holder, int position) {
        Player player = players.get(position);
        
        // Set position number (ranking)
        holder.tvRank.setText(String.valueOf(position + 1));
        
        // Set player name
        holder.tvName.setText(player.getName());
        
        // Set player ELO rating
        holder.tvElo.setText(String.valueOf(player.getElo()));
        
        // Set player stats
        String stats = player.getWins() + "W / " + player.getDraws() + "D / " + player.getLosses() + "L";
        holder.tvStats.setText(stats);
        
        // Calculate and set win rate
        float winRate = player.getWinRate();
        holder.tvWinRate.setText(String.format("%.1f%%", winRate));
        
        // Set games played
        holder.tvGamesPlayed.setText(String.valueOf(player.getGamesPlayed()));
    }

    @Override
    public int getItemCount() {
        return players == null ? 0 : players.size();
    }

    /**
     * Update the adapter with new players data
     * @param newPlayers New list of players
     */
    public void updatePlayers(List<Player> newPlayers) {
        this.players = newPlayers;
        notifyDataSetChanged();
    }

    /**
     * ViewHolder for player items
     */
    static class PlayerViewHolder extends RecyclerView.ViewHolder {
        TextView tvRank;
        TextView tvName;
        TextView tvElo;
        TextView tvStats;
        TextView tvWinRate;
        TextView tvGamesPlayed;

        public PlayerViewHolder(@NonNull View itemView) {
            super(itemView);
            tvRank = itemView.findViewById(R.id.tv_rank);
            tvName = itemView.findViewById(R.id.tv_name);
            tvElo = itemView.findViewById(R.id.tv_elo);
            tvStats = itemView.findViewById(R.id.tv_stats);
            tvWinRate = itemView.findViewById(R.id.tv_win_rate);
            tvGamesPlayed = itemView.findViewById(R.id.tv_games_played);
        }
    }
}
