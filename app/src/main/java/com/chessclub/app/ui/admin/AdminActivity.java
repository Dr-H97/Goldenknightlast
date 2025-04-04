package com.chessclub.app.ui.admin;

import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.MenuItem;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.viewpager.widget.ViewPager;

import com.chessclub.app.R;
import com.chessclub.app.database.DatabaseHelper;
import com.chessclub.app.database.PlayerDao;
import com.google.android.material.tabs.TabLayout;

/**
 * Activity for admin functionality
 */
public class AdminActivity extends AppCompatActivity {
    private static final String PREF_NAME = "ChessClubPrefs";
    private static final String KEY_LOGGED_IN_USER_ID = "loggedInUserId";

    private Toolbar toolbar;
    private TabLayout tabLayout;
    private ViewPager viewPager;
    private AdminPagerAdapter pagerAdapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Check if user is admin
        if (!isCurrentUserAdmin()) {
            finish(); // Close activity if not admin
            return;
        }
        
        setContentView(R.layout.activity_admin);
        
        // Initialize views
        toolbar = findViewById(R.id.toolbar);
        tabLayout = findViewById(R.id.tab_layout);
        viewPager = findViewById(R.id.view_pager);
        
        // Set up toolbar
        setSupportActionBar(toolbar);
        getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        getSupportActionBar().setTitle("Admin Panel");
        
        // Set up ViewPager with TabLayout
        setupViewPager();
    }

    /**
     * Check if current user is an admin
     * @return true if admin, false otherwise
     */
    private boolean isCurrentUserAdmin() {
        SharedPreferences prefs = getSharedPreferences(PREF_NAME, MODE_PRIVATE);
        int userId = prefs.getInt(KEY_LOGGED_IN_USER_ID, -1);
        
        if (userId == -1) {
            return false;
        }
        
        PlayerDao playerDao = DatabaseHelper.getInstance(this).getPlayerDao();
        return playerDao.isPlayerAdmin(userId);
    }

    /**
     * Set up ViewPager with TabLayout
     */
    private void setupViewPager() {
        pagerAdapter = new AdminPagerAdapter(getSupportFragmentManager());
        
        // Add fragments to adapter
        pagerAdapter.addFragment(new PlayerManagementFragment(), "Players");
        pagerAdapter.addFragment(new GameManagementFragment(), "Games");
        
        // Set up ViewPager
        viewPager.setAdapter(pagerAdapter);
        tabLayout.setupWithViewPager(viewPager);
    }

    @Override
    public boolean onOptionsItemSelected(@NonNull MenuItem item) {
        if (item.getItemId() == android.R.id.home) {
            onBackPressed();
            return true;
        }
        return super.onOptionsItemSelected(item);
    }

    /**
     * ViewPager adapter for Admin tabs
     */
    private static class AdminPagerAdapter extends androidx.fragment.app.FragmentPagerAdapter {
        private final java.util.List<androidx.fragment.app.Fragment> fragmentList = new java.util.ArrayList<>();
        private final java.util.List<String> fragmentTitles = new java.util.ArrayList<>();

        public AdminPagerAdapter(androidx.fragment.app.FragmentManager fm) {
            super(fm, BEHAVIOR_RESUME_ONLY_CURRENT_FRAGMENT);
        }

        public void addFragment(androidx.fragment.app.Fragment fragment, String title) {
            fragmentList.add(fragment);
            fragmentTitles.add(title);
        }

        @NonNull
        @Override
        public androidx.fragment.app.Fragment getItem(int position) {
            return fragmentList.get(position);
        }

        @Override
        public int getCount() {
            return fragmentList.size();
        }

        @Override
        public CharSequence getPageTitle(int position) {
            return fragmentTitles.get(position);
        }
    }
}
