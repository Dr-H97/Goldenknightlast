const bcrypt = require('bcrypt');
const { db } = require('./db');
const { players, games } = require('./schema');
const { eq } = require('drizzle-orm');

/**
 * Initialize sample data for development
 */
const initializeSampleData = async () => {
  try {
    // Check if we already have players
    const existingPlayers = await db.select().from(players);
    
    if (existingPlayers.length > 0) {
      console.log('Database already has data, skipping initialization');
      return;
    }
    
    console.log('Initializing database with sample data...');
    
    // Create some players
    const adminPin = await bcrypt.hash('1234', 10);
    const player1Pin = await bcrypt.hash('5678', 10);
    const player2Pin = await bcrypt.hash('9012', 10);
    
    const [admin] = await db.insert(players).values({
      name: 'Admin',
      pin: adminPin,
      isAdmin: true,
      initialElo: 1200,
      currentElo: 1200
    }).returning();
    
    const [player1] = await db.insert(players).values({
      name: 'John Doe',
      pin: player1Pin,
      isAdmin: false,
      initialElo: 1000,
      currentElo: 1000
    }).returning();
    
    const [player2] = await db.insert(players).values({
      name: 'Jane Smith',
      pin: player2Pin,
      isAdmin: false,
      initialElo: 1100,
      currentElo: 1100
    }).returning();
    
    console.log('Sample players created');
    
    // Create some games (but we won't update player ratings yet)
    await db.insert(games).values({
      whitePlayerId: admin.id,
      blackPlayerId: player1.id,
      result: '1-0',
      date: new Date('2023-01-15'),
      whiteEloChange: 8,
      blackEloChange: -8,
      verified: true
    });
    
    await db.insert(games).values({
      whitePlayerId: player2.id,
      blackPlayerId: admin.id,
      result: '0-1',
      date: new Date('2023-01-20'),
      whiteEloChange: -7,
      blackEloChange: 7,
      verified: true
    });
    
    await db.insert(games).values({
      whitePlayerId: player1.id,
      blackPlayerId: player2.id,
      result: '1/2-1/2',
      date: new Date('2023-01-25'),
      whiteEloChange: 5,
      blackEloChange: 5,
      verified: true
    });
    
    console.log('Sample games created');
    
    // Update player ratings based on games
    await db.update(players)
      .set({ currentElo: 1215 })
      .where(eq(players.id, admin.id));
    
    await db.update(players)
      .set({ currentElo: 997 })
      .where(eq(players.id, player1.id));
    
    await db.update(players)
      .set({ currentElo: 1098 })
      .where(eq(players.id, player2.id));
    
    console.log('Player ratings updated');
    console.log('Database initialization complete!');
  } catch (error) {
    console.error('Error initializing sample data:', error);
    throw error;
  }
};

module.exports = {
  initializeSampleData
};