/**
 * Script to push database schema changes
 * 
 * Usage:
 * - Basic: node db-push.js
 * - With sample data: node db-push.js --with-sample-data
 */

require('dotenv').config();
const { migrate } = require('drizzle-orm/node-postgres/migrator');
const { db, pool } = require('./server/db');
const schema = require('./server/schema');
const bcrypt = require('bcrypt');

async function pushDatabaseChanges() {
  try {
    console.log('Initializing database...');
    
    // Check if the database tables already exist
    try {
      const result = await db.select().from(schema.players).limit(1);
      console.log('Database tables already exist');
    } catch (error) {
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('Creating database tables...');
        
        // Create players table
        await db.execute(`
          CREATE TABLE IF NOT EXISTS players (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            pin VARCHAR(255) NOT NULL,
            elo INTEGER NOT NULL DEFAULT 1200,
            is_admin BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        // Create games table
        await db.execute(`
          CREATE TABLE IF NOT EXISTS games (
            id SERIAL PRIMARY KEY,
            white_player_id INTEGER NOT NULL REFERENCES players(id),
            black_player_id INTEGER NOT NULL REFERENCES players(id),
            result VARCHAR(10) NOT NULL,
            date DATE NOT NULL DEFAULT CURRENT_DATE,
            white_elo INTEGER NOT NULL,
            black_elo INTEGER NOT NULL,
            white_elo_change INTEGER NOT NULL,
            black_elo_change INTEGER NOT NULL,
            verified BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        console.log('Database tables created successfully');
      } else {
        console.error('Error checking database tables:', error);
        throw error;
      }
    }
    
    console.log('Database initialization complete');
    
    // Check if sample data should be initialized
    const withSampleData = process.argv.includes('--with-sample-data');
    console.log('Checking if sample data needs to be initialized...');
    
    if (withSampleData) {
      // Check if sample data already exists
      const players = await db.select().from(schema.players);
      
      if (players.length > 0) {
        console.log('Sample data already exists, skipping initialization');
        return;
      }
      
      console.log('Initializing sample data...');
      
      // Create admin user
      const adminPinHash = await bcrypt.hash('1234', 10);
      const [admin] = await db.insert(schema.players).values({
        name: 'Admin',
        pin: adminPinHash,
        elo: 1200,
        is_admin: true
      }).returning();
      
      // Create sample players
      const samplePlayers = [
        { name: 'Alice', pin: await bcrypt.hash('5678', 10), elo: 1250 },
        { name: 'Bob', pin: await bcrypt.hash('5678', 10), elo: 1180 },
        { name: 'Charlie', pin: await bcrypt.hash('5678', 10), elo: 1300 },
        { name: 'Diana', pin: await bcrypt.hash('5678', 10), elo: 1220 }
      ];
      
      for (const player of samplePlayers) {
        await db.insert(schema.players).values(player);
      }
      
      // Get all players for game creation
      const allPlayers = await db.select().from(schema.players);
      
      // Create sample games
      const sampleGames = [
        {
          white_player_id: allPlayers[1].id, // Alice
          black_player_id: allPlayers[2].id, // Bob
          result: '1-0',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          white_elo: 1250,
          black_elo: 1180,
          white_elo_change: 10,
          black_elo_change: -10,
          verified: true
        },
        {
          white_player_id: allPlayers[3].id, // Charlie
          black_player_id: allPlayers[4].id, // Diana
          result: '0-1',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          white_elo: 1300,
          black_elo: 1220,
          white_elo_change: -12,
          black_elo_change: 12,
          verified: true
        },
        {
          white_player_id: allPlayers[2].id, // Bob
          black_player_id: allPlayers[3].id, // Charlie
          result: '1/2-1/2',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          white_elo: 1170,
          black_elo: 1288,
          white_elo_change: 6,
          black_elo_change: -6,
          verified: true
        },
        {
          white_player_id: allPlayers[1].id, // Alice
          black_player_id: allPlayers[4].id, // Diana
          result: '1-0',
          date: new Date(), // Today
          white_elo: 1260,
          black_elo: 1232,
          white_elo_change: 8,
          black_elo_change: -8,
          verified: true
        }
      ];
      
      for (const game of sampleGames) {
        await db.insert(schema.games).values(game);
      }
      
      console.log('Sample data initialized successfully');
    } else {
      console.log('Sample data already exists, skipping initialization');
    }
  } catch (error) {
    console.error('Error pushing database changes:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

pushDatabaseChanges();