package com.chessclub.android.ui.rankings

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
import com.google.android.material.floatingactionbutton.FloatingActionButton
import android.content.Intent
import com.chessclub.android.ui.game.SubmitGameActivity

class RankingsFragment : Fragment() {
    private lateinit var viewModel: RankingsViewModel
    private lateinit var recyclerView: RecyclerView
    private lateinit var adapter: PlayerAdapter
    private lateinit var progressBar: ProgressBar
    private lateinit var noDataText: TextView
    
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val root = inflater.inflate(R.layout.fragment_rankings, container, false)
        
        recyclerView = root.findViewById(R.id.rankings_recycler_view)
        progressBar = root.findViewById(R.id.progress_bar)
        noDataText = root.findViewById(R.id.no_data_text)
        
        val fab: FloatingActionButton = root.findViewById(R.id.fab_submit_game)
        fab.setOnClickListener {
            startActivity(Intent(activity, SubmitGameActivity::class.java))
        }
        
        return root
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        viewModel = ViewModelProvider(this).get(RankingsViewModel::class.java)
        
        setupRecyclerView()
        observeViewModel()
        
        // Load players initially
        viewModel.loadPlayers()
    }
    
    private fun setupRecyclerView() {
        adapter = PlayerAdapter()
        recyclerView.layoutManager = LinearLayoutManager(context)
        recyclerView.adapter = adapter
    }
    
    private fun observeViewModel() {
        viewModel.players.observe(viewLifecycleOwner) { players ->
            progressBar.visibility = View.GONE
            
            if (players.isEmpty()) {
                noDataText.visibility = View.VISIBLE
                recyclerView.visibility = View.GONE
            } else {
                noDataText.visibility = View.GONE
                recyclerView.visibility = View.VISIBLE
                adapter.submitList(players)
            }
        }
        
        viewModel.isLoading.observe(viewLifecycleOwner) { isLoading ->
            progressBar.visibility = if (isLoading) View.VISIBLE else View.GONE
        }
    }
}
