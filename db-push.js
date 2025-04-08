/**
 * Script to push database schema changes
 */
require('dotenv').config();
const { initializeDatabase } = require('./server/db');
const { initializeSampleData } = require('./server/seed');

async function pushDatabaseChanges() {
  try {
    console.log('Pushing database schema changes...');
    
    // Initialize database schema
    await initializeDatabase();
    console.log('Database schema updated successfully');
    
    // Check if we should initialize sample data
    const shouldInitializeSampleData = process.argv.includes('--with-sample-data');
    
    if (shouldInitializeSampleData) {
      console.log('Initializing sample data...');
      await initializeSampleData();
      console.log('Sample data initialized successfully');
    }
    
    console.log('Database update completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error pushing database changes:', error);
    process.exit(1);
  }
}

// Execute the function
pushDatabaseChanges();