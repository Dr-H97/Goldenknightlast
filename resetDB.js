/**
 * Script to reset the database and reapply seed data
 */
const { pool, db } = require('./server/db');
const { initializeSampleData } = require('./server/seed');

async function resetDatabase() {
  try {
    console.log('Resetting database...');
    
    // Execute raw SQL to drop tables
    console.log('Dropping tables...');
    await pool.query('DROP TABLE IF EXISTS games');
    await pool.query('DROP TABLE IF EXISTS players');
    
    // Close and reconnect the pool
    await pool.end();
    console.log('Database connection reset');
    
    // Require db.js again to reinitialize the connection and create schema
    const { pool: newPool, db: newDb } = require('./server/db');
    console.log('Tables should be recreated by db.js');
    
    // Initialize sample data
    console.log('Initializing sample data...');
    await initializeSampleData();
    
    console.log('Database reset complete!');
    await newPool.end();
    process.exit(0);
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
}

resetDatabase();