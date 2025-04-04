package com.chessclub.app.ui.statistics;

import android.graphics.Color;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.chessclub.app.R;
import com.chessclub.app.database.PlayerDao;
import com.chessclub.app.model.Game;
import com.chessclub.app.model.Player;

import java.text.SimpleDateFormat;
import java.util.List;
import java.util.Locale;

/**
 * Adapter for displaying game history in a RecyclerView
 */
public class GameHistoryAdapter extends RecyclerView.Adapter<GameHistoryAdapter.GameViewHolder> {
    private List<Game> games;
    private int currentPlayerId;
    private PlayerDao playerDao;
    private SimpleDateFormat dateFormat;

    /**
     * Constructor
     * @param games List of games
     * @param currentPlayerId ID of current player
     * @param playerDao PlayerDao for player data
     */
    public GameHistoryAdapter(List<Game> games, int currentPlayerId, PlayerDao playerDao) {
        this.games = games;
        this.currentPlayerId = currentPlayerId;
        this.playerDao = playerDao;
        this.dateFormat = new SimpleDateFormat("MMM dd, yyyy", Locale.getDefault());
    }

    @NonNull
    @Override
    public GameViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_game_history, parent, false);
        return new GameViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull GameViewHolder holder, int position) {
        Game game = games.get(position);
        
        // Get player names
        Player whitePlayer = playerDao.getPlayerById(game.getWhitePlayerId());
        Player blackPlayer = playerDao.getPlayerById(game.getBlackPlayerId());
        
        if (whitePlayer == null || blackPlayer == null) {
            return;
        }
        
        // Set opponent name (other player)
        String opponentName;
        if (currentPlayerId == game.getWhitePlayerId()) {
            opponentName = blackPlayer.getName();
        } else {
            opponentName = whitePlayer.getName();
        }
        holder.tvOpponent.setText(opponentName);
        
        // Set result text and color
        String resultText;
        int resultColor;
        
        if (game.playerWon(currentPlayerId)) {
            resultText = "WIN";
            resultColor = Color.parseColor("#4CAF50"); // Green
        } else if (game.playerLost(currentPlayerId)) {
            resultText = "LOSS";
            resultColor = Color.parseColor("#F44336"); // Red
        } else {
            resultText = "DRAW";
            resultColor = Color.parseColor("#FFC107"); // Yellow
        }
        
        holder.tvResult.setText(resultText);
        holder.tvResult.setTextColor(resultColor);
        
        // Set date
        holder.tvDate.setText(dateFormat.format(game.getDate()));
        
        // Set ELO change
        int eloChange = game.getEloChangeForPlayer(currentPlayerId);
        String eloChangeText;
        if (eloChange > 0) {
            eloChangeText = "+" + eloChange;
            holder.tvEloChange.setTextColor(Color.parseColor("#4CAF50")); // Green
        } else if (eloChange < 0) {
            eloChangeText = String.valueOf(eloChange);
            holder.tvEloChange.setTextColor(Color.parseColor("#F44336")); // Red
        } else {
            eloChangeText = "0";
            holder.tvEloChange.setTextColor(Color.parseColor("#9E9E9E")); // Gray
        }
        holder.tvEloChange.setText(eloChangeText);
        
        // Set played as text (white or black)
        String playedAs = (currentPlayerId == game.getWhitePlayerId()) ? "White" : "Black";
        holder.tvPlayedAs.setText(playedAs);
    }

    @Override
    public int getItemCount() {
        return games == null ? 0 : games.size();
    }

    /**
     * ViewHolder for game history items
     */
    static class GameViewHolder extends RecyclerView.ViewHolder {
        TextView tvOpponent;
        TextView tvResult;
        TextView tvDate;
        TextView tvEloChange;
        TextView tvPlayedAs;

        public GameViewHolder(@NonNull View itemView) {
            super(itemView);
            tvOpponent = itemView.findViewById(R.id.tv_opponent);
            tvResult = itemView.findViewById(R.id.tv_result);
            tvDate = itemView.findViewById(R.id.tv_date);
            tvEloChange = itemView.findViewById(R.id.tv_elo_change);
            tvPlayedAs = itemView.findViewById(R.id.tv_played_as);
        }
    }
}
