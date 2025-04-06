package com.chessclub.android

import android.app.Application
import android.util.Log
import com.google.firebase.FirebaseApp
import com.google.firebase.ktx.Firebase
import com.google.firebase.ktx.initialize

class ChessClubApplication : Application() {
    companion object {
        private const val TAG = "ChessClubApplication"
    }
    
    override fun onCreate() {
        super.onCreate()
        
        // Initialize Firebase
        if (FirebaseApp.getApps(this).isEmpty()) {
            val app = Firebase.initialize(this)
            Log.d(TAG, "Firebase initialized with project ID: ${app.options.projectId}")
        } else {
            Log.d(TAG, "Firebase already initialized")
        }
    }
}
