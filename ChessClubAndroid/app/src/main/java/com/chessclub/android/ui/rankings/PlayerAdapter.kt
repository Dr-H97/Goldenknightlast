package com.chessclub.android.ui.rankings

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.chessclub.android.R
import com.chessclub.android.model.Player

class PlayerAdapter : ListAdapter<Player, PlayerAdapter.PlayerViewHolder>(PlayerDiffCallback()) {
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): PlayerViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_player, parent, false)
        return PlayerViewHolder(view)
    }
    
    override fun onBindViewHolder(holder: PlayerViewHolder, position: Int) {
        val player = getItem(position)
        holder.bind(player, position + 1) // position + 1 for rank
    }
    
    class PlayerViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val rankTextView: TextView = itemView.findViewById(R.id.rank)
        private val nameTextView: TextView = itemView.findViewById(R.id.player_name)
        private val ratingTextView: TextView = itemView.findViewById(R.id.rating)
        private val gamesPlayedTextView: TextView = itemView.findViewById(R.id.games_played)
        
        fun bind(player: Player, rank: Int) {
            rankTextView.text = rank.toString()
            nameTextView.text = player.name
            ratingTextView.text = player.rating.toString()
            gamesPlayedTextView.text = player.gamesPlayed.toString()
            
            // Apply special styling for top 3 players
            if (rank <= 3) {
                itemView.setBackgroundResource(R.drawable.top_player_background)
                nameTextView.setTextAppearance(R.style.TextAppearance_AppCompat_Medium)
                nameTextView.setTypeface(null, android.graphics.Typeface.BOLD)
            } else {
                itemView.setBackgroundResource(0)
                nameTextView.setTextAppearance(R.style.TextAppearance_AppCompat_Body1)
                nameTextView.setTypeface(null, android.graphics.Typeface.NORMAL)
            }
        }
    }
    
    class PlayerDiffCallback : DiffUtil.ItemCallback<Player>() {
        override fun areItemsTheSame(oldItem: Player, newItem: Player): Boolean {
            return oldItem.id == newItem.id
        }
        
        override fun areContentsTheSame(oldItem: Player, newItem: Player): Boolean {
            return oldItem == newItem
        }
    }
}
