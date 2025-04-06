package com.chessclub.android.ui.game

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ProgressBar
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.chessclub.android.R

class GamesFragment : Fragment() {
    private lateinit var viewModel: GamesViewModel
    private lateinit var recyclerView: RecyclerView
    private lateinit var adapter: GameAdapter
    private lateinit var progressBar: ProgressBar
    private lateinit var noDataText: TextView
    
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val root = inflater.inflate(R.layout.fragment_games, container, false)
        
        recyclerView = root.findViewById(R.id.games_recycler_view)
        progressBar = root.findViewById(R.id.progress_bar)
        noDataText = root.findViewById(R.id.no_data_text)
        
        return root
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        viewModel = ViewModelProvider(this).get(GamesViewModel::class.java)
        
        setupRecyclerView()
        observeViewModel()
        
        // Get current player ID from preferences
        val prefs = requireActivity().getSharedPreferences("chess_club_prefs", 0)
        val playerId = prefs.getString("player_id", "") ?: ""
        
        // Load games for current player
        viewModel.loadGamesForPlayer(playerId)
    }
    
    private fun setupRecyclerView() {
        adapter = GameAdapter()
        recyclerView.layoutManager = LinearLayoutManager(context)
        recyclerView.adapter = adapter
    }
    
    private fun observeViewModel() {
        viewModel.games.observe(viewLifecycleOwner) { games ->
            progressBar.visibility = View.GONE
            
            if (games.isEmpty()) {
                noDataText.visibility = View.VISIBLE
                recyclerView.visibility = View.GONE
            } else {
                noDataText.visibility = View.GONE
                recyclerView.visibility = View.VISIBLE
                adapter.submitList(games)
            }
        }
        
        viewModel.isLoading.observe(viewLifecycleOwner) { isLoading ->
            progressBar.visibility = if (isLoading) View.VISIBLE else View.GONE
        }
    }
}
