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
    
    // Create players
    const adminPin = await bcrypt.hash('1234', 10);
    const player1Pin = await bcrypt.hash('5678', 10);
    const player2Pin = await bcrypt.hash('9012', 10);
    const player3Pin = await bcrypt.hash('3456', 10);
    const player4Pin = await bcrypt.hash('7890', 10);
    const player5Pin = await bcrypt.hash('2345', 10);
    const player6Pin = await bcrypt.hash('6789', 10);
    
    const [admin] = await db.insert(players).values({
      name: 'Admin',
      pin: adminPin,
      isAdmin: true,
      initialElo: 1500,
      currentElo: 1500
    }).returning();
    
    const [player1] = await db.insert(players).values({
      name: 'John Doe',
      pin: player1Pin,
      isAdmin: false,
      initialElo: 1400,
      currentElo: 1400
    }).returning();
    
    const [player2] = await db.insert(players).values({
      name: 'Jane Smith',
      pin: player2Pin,
      isAdmin: false,
      initialElo: 1450,
      currentElo: 1450
    }).returning();
    
    const [player3] = await db.insert(players).values({
      name: 'Robert Johnson',
      pin: player3Pin,
      isAdmin: false,
      initialElo: 1350,
      currentElo: 1350
    }).returning();
    
    const [player4] = await db.insert(players).values({
      name: 'Emily Wilson',
      pin: player4Pin,
      isAdmin: false,
      initialElo: 1600,
      currentElo: 1600
    }).returning();
    
    const [player5] = await db.insert(players).values({
      name: 'Michael Chen',
      pin: player5Pin,
      isAdmin: false,
      initialElo: 1550,
      currentElo: 1550
    }).returning();
    
    const [player6] = await db.insert(players).values({
      name: 'Sophia Garcia',
      pin: player6Pin,
      isAdmin: false,
      initialElo: 1500,
      currentElo: 1500
    }).returning();
    
    console.log('Sample players created');
    
    // Create recent games first
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const fourDaysAgo = new Date(today);
    fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
    const fiveDaysAgo = new Date(today);
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    
    // Recent games
    await db.insert(games).values({
      whitePlayerId: player1.id,
      blackPlayerId: player2.id,
      result: '0-1',
      date: yesterday,
      whiteEloChange: -12,
      blackEloChange: 12,
      verified: true
    });
    
    await db.insert(games).values({
      whitePlayerId: player3.id,
      blackPlayerId: player4.id,
      result: '0-1',
      date: yesterday,
      whiteEloChange: -8,
      blackEloChange: 8,
      verified: true
    });
    
    await db.insert(games).values({
      whitePlayerId: player5.id,
      blackPlayerId: player6.id,
      result: '1/2-1/2',
      date: twoDaysAgo,
      whiteEloChange: 2,
      blackEloChange: 2,
      verified: true
    });
    
    await db.insert(games).values({
      whitePlayerId: admin.id,
      blackPlayerId: player1.id,
      result: '1-0',
      date: twoDaysAgo,
      whiteEloChange: 10,
      blackEloChange: -10,
      verified: true
    });
    
    await db.insert(games).values({
      whitePlayerId: player2.id,
      blackPlayerId: player3.id,
      result: '1-0',
      date: threeDaysAgo,
      whiteEloChange: 14,
      blackEloChange: -14,
      verified: true
    });
    
    await db.insert(games).values({
      whitePlayerId: player4.id,
      blackPlayerId: player5.id,
      result: '0-1',
      date: threeDaysAgo,
      whiteEloChange: -12,
      blackEloChange: 12,
      verified: true
    });
    
    await db.insert(games).values({
      whitePlayerId: player6.id,
      blackPlayerId: admin.id,
      result: '0-1',
      date: fourDaysAgo,
      whiteEloChange: -9,
      blackEloChange: 9,
      verified: true
    });
    
    await db.insert(games).values({
      whitePlayerId: player1.id,
      blackPlayerId: player4.id,
      result: '0-1',
      date: fourDaysAgo,
      whiteEloChange: -8,
      blackEloChange: 8,
      verified: true
    });
    
    await db.insert(games).values({
      whitePlayerId: player2.id,
      blackPlayerId: player5.id,
      result: '1/2-1/2',
      date: fiveDaysAgo,
      whiteEloChange: 3,
      blackEloChange: 3,
      verified: true
    });
    
    await db.insert(games).values({
      whitePlayerId: player3.id,
      blackPlayerId: player6.id,
      result: '1-0',
      date: fiveDaysAgo,
      whiteEloChange: 15,
      blackEloChange: -15,
      verified: true
    });
    
    // Create one unverified game (pending approval)
    await db.insert(games).values({
      whitePlayerId: player1.id,
      blackPlayerId: player3.id,
      result: '1-0',
      date: today,
      whiteEloChange: 0,
      blackEloChange: 0,
      verified: false
    });
    
    console.log('Sample games created');
    
    // Update player ratings based on games
    await db.update(players)
      .set({ currentElo: 1519 })
      .where(eq(players.id, admin.id));
    
    await db.update(players)
      .set({ currentElo: 1370 })
      .where(eq(players.id, player1.id));
    
    await db.update(players)
      .set({ currentElo: 1479 })
      .where(eq(players.id, player2.id));
    
    await db.update(players)
      .set({ currentElo: 1343 })
      .where(eq(players.id, player3.id));
    
    await db.update(players)
      .set({ currentElo: 1604 })
      .where(eq(players.id, player4.id));
    
    await db.update(players)
      .set({ currentElo: 1567 })
      .where(eq(players.id, player5.id));
    
    await db.update(players)
      .set({ currentElo: 1478 })
      .where(eq(players.id, player6.id));
    
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