const bcrypt = require('bcrypt');
const { db } = require('./db');
const { players, games } = require('./schema');
const { eq } = require('drizzle-orm');

/**
 * Initialize sample data for development
 */
const initializeSampleData = async () => {
  try {
    console.log('Checking if sample data needs to be initialized...');
    
    // Check if we have any players in the database
    const existingPlayers = await db.select().from(players);
    
    if (existingPlayers.length === 0) {
      console.log('Creating sample data...');
      
      // Create admin user
      const adminPin = await bcrypt.hash('1234', 10);
      const [admin] = await db.insert(players).values({
        name: 'Admin',
        pin: adminPin,
        isAdmin: true,
        initialElo: 1500,
        currentElo: 1500
      }).returning();
      
      // Create some regular players
      const regularPin = await bcrypt.hash('0000', 10);
      const [player1] = await db.insert(players).values({
        name: 'Alex',
        pin: regularPin,
        initialElo: 1400,
        currentElo: 1400
      }).returning();
      
      const [player2] = await db.insert(players).values({
        name: 'Bob',
        pin: regularPin,
        initialElo: 1300,
        currentElo: 1300
      }).returning();
      
      const [player3] = await db.insert(players).values({
        name: 'Charlie',
        pin: regularPin,
        initialElo: 1600,
        currentElo: 1600
      }).returning();
      
      const [player4] = await db.insert(players).values({
        name: 'Diana',
        pin: regularPin,
        initialElo: 1200,
        currentElo: 1200
      }).returning();
      
      // Create some sample games
      await db.insert(games).values([
        {
          whitePlayerId: player1.id,
          blackPlayerId: player2.id,
          result: '1-0',
          whiteEloChange: 8,
          blackEloChange: -8,
          verified: true,
          date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000) // 25 days ago (last month)
        },
        {
          whitePlayerId: player3.id,
          blackPlayerId: player1.id,
          result: '1-0',
          whiteEloChange: 5,
          blackEloChange: -5,
          verified: true,
          date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) // 8 days ago (outside last week)
        },
        {
          whitePlayerId: player2.id,
          blackPlayerId: player4.id,
          result: '1/2-1/2',
          whiteEloChange: -2,
          blackEloChange: 2,
          verified: true,
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago (within last week)
        },
        {
          whitePlayerId: player4.id,
          blackPlayerId: player3.id,
          result: '0-1',
          whiteEloChange: -10,
          blackEloChange: 10,
          verified: true,
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago (within last week)
        },
        {
          whitePlayerId: player1.id,
          blackPlayerId: player4.id,
          result: '1-0',
          whiteEloChange: 4,
          blackEloChange: -4,
          verified: true,
          date: new Date() // Today (within last week)
        },
        {
          whitePlayerId: player3.id,
          blackPlayerId: player2.id,
          result: '1-0',
          whiteEloChange: 7,
          blackEloChange: -7,
          verified: true,
          date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) // 6 days ago (within last week)
        }
      ]);
      
      // Update player ratings based on the games
      await db.update(players)
        .set({ currentElo: 1400 + 8 - 5 + 4 })
        .where(eq(players.id, player1.id));
      
      await db.update(players)
        .set({ currentElo: 1300 - 8 - 2 - 7 })
        .where(eq(players.id, player2.id));
      
      await db.update(players)
        .set({ currentElo: 1600 + 5 + 10 + 7 })
        .where(eq(players.id, player3.id));
      
      await db.update(players)
        .set({ currentElo: 1200 + 2 - 10 - 4 })
        .where(eq(players.id, player4.id));
      
      console.log('Sample data created successfully');
    } else {
      console.log('Sample data already exists, skipping initialization');
    }
  } catch (error) {
    console.error('Error initializing sample data:', error);
    throw error;
  }
};

module.exports = {
  initializeSampleData
};