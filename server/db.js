const { Pool } = require('pg');
const { drizzle } = require('drizzle-orm/node-postgres');
const schema = require('./schema');

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create Drizzle instance
const db = drizzle(pool, { schema });

/**
 * Initialize the database
 */
const initializeDatabase = async () => {
  try {
    console.log('Initializing database...');
    
    // Check if the tables exist
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'players'
      );
    `);
    
    const tablesExist = tableCheck.rows[0].exists;
    
    if (!tablesExist) {
      console.log('Creating database tables...');
      
      // Create the enum type for game results
      await pool.query(`
        DO $$ 
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'game_result') THEN
            CREATE TYPE game_result AS ENUM ('1-0', '0-1', '1/2-1/2');
          END IF;
        END $$;
      `);
      
      // Create players table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS players (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          pin TEXT NOT NULL,
          is_admin BOOLEAN NOT NULL DEFAULT FALSE,
          initial_elo INTEGER NOT NULL DEFAULT 1200,
          current_elo INTEGER NOT NULL DEFAULT 1200,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
      
      // Create games table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS games (
          id SERIAL PRIMARY KEY,
          white_player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
          black_player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
          result game_result NOT NULL,
          date TIMESTAMP NOT NULL DEFAULT NOW(),
          white_elo_change INTEGER NOT NULL DEFAULT 0,
          black_elo_change INTEGER NOT NULL DEFAULT 0,
          verified BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
      
      console.log('Database tables created successfully');
    } else {
      console.log('Database tables already exist');
    }
    
    console.log('Database initialization complete');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

module.exports = {
  pool,
  db,
  initializeDatabase
};
