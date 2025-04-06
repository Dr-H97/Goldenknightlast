/**
 * Script to reset the database and reapply seed data
 */
const { db } = require('./server/db');
const { games, players } = require('./server/schema');
const { initializeSampleData } = require('./server/seed');

async function resetDatabase() {
  try {
    console.log('Resetting database...');
    
    // Drop tables (in reverse order of dependencies)
    console.log('Dropping tables...');
    await db.schema.dropTable(games);
    await db.schema.dropTable(players);
    
    // Create tables
    console.log('Creating tables...');
    await db.schema.createTable(players);
    await db.schema.createTable(games);
    
    // Initialize sample data
    console.log('Initializing sample data...');
    await initializeSampleData();
    
    console.log('Database reset complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
}

resetDatabase();