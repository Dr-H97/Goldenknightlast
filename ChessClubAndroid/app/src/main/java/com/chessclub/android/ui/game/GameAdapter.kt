package com.chessclub.android.ui.game

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.chessclub.android.R
import com.chessclub.android.model.Game
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class GameAdapter : ListAdapter<Game, GameAdapter.GameViewHolder>(GameDiffCallback()) {
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): GameViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_game, parent, false)
        return GameViewHolder(view)
    }
    
    override fun onBindViewHolder(holder: GameViewHolder, position: Int) {
        val game = getItem(position)
        holder.bind(game)
    }
    
    class GameViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val dateTextView: TextView = itemView.findViewById(R.id.date)
        private val whitePlayerTextView: TextView = itemView.findViewById(R.id.white_player)
        private val blackPlayerTextView: TextView = itemView.findViewById(R.id.black_player)
        private val resultTextView: TextView = itemView.findViewById(R.id.result)
        private val ratingChangeTextView: TextView = itemView.findViewById(R.id.rating_change)
        
        private val dateFormat = SimpleDateFormat("MMM dd, yyyy", Locale.getDefault())
        
        fun bind(game: Game) {
            dateTextView.text = dateFormat.format(Date(game.date))
            whitePlayerTextView.text = game.whitePlayerName
            blackPlayerTextView.text = game.blackPlayerName
            resultTextView.text = game.getResultDisplayText()
            
            // Calculate rating changes
            val whiteRatingChange = game.whitePlayerRatingAfter - game.whitePlayerRatingBefore
            val blackRatingChange = game.blackPlayerRatingAfter - game.blackPlayerRatingBefore
            
            ratingChangeTextView.text = itemView.context.getString(
                R.string.rating_change_format,
                formatRatingChange(whiteRatingChange),
                formatRatingChange(blackRatingChange)
            )
        }
        
        private fun formatRatingChange(change: Int): String {
            return when {
                change > 0 -> "+$change"
                change < 0 -> "$change"
                else -> "±0"
            }
        }
    }
    
    class GameDiffCallback : DiffUtil.ItemCallback<Game>() {
        override fun areItemsTheSame(oldItem: Game, newItem: Game): Boolean {
            return oldItem.id == newItem.id
        }
        
        override fun areContentsTheSame(oldItem: Game, newItem: Game): Boolean {
            return oldItem == newItem
        }
    }
}
