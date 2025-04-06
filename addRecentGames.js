/**
 * Script to add recent games to the database
 */
const { db } = require('./server/db');
const { games, players } = require('./server/schema');
const { eq } = require('drizzle-orm');

async function addRecentGames() {
  try {
    console.log('Fetching existing players...');
    const existingPlayers = await db.select().from(players);
    
    if (existingPlayers.length === 0) {
      console.error('No players found in database');
      process.exit(1);
    }
    
    // Get player IDs - using actual players from our database
    const admin = existingPlayers.find(p => p.name === 'Admin');
    const hamza = existingPlayers.find(p => p.name === 'Hamza');
    const mehdi = existingPlayers.find(p => p.name === 'Mehdi');
    const abla = existingPlayers.find(p => p.name === 'Abla');
    const yassmine = existingPlayers.find(p => p.name === 'Yassmine');
    
    console.log('Adding recent games...');
    // Add games from the last week
    await db.insert(games).values([
      {
        whitePlayerId: hamza.id,
        blackPlayerId: mehdi.id,
        result: '0-1',
        whiteEloChange: -6,
        blackEloChange: 6,
        verified: true,
        date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) // 6 days ago
      },
      {
        whitePlayerId: abla.id,
        blackPlayerId: yassmine.id,
        result: '1-0',
        whiteEloChange: 7,
        blackEloChange: -7,
        verified: true,
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
      },
      {
        whitePlayerId: admin.id,
        blackPlayerId: mehdi.id,
        result: '1-0',
        whiteEloChange: 8,
        blackEloChange: -8,
        verified: true,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        whitePlayerId: yassmine.id,
        blackPlayerId: hamza.id,
        result: '1/2-1/2',
        whiteEloChange: 2,
        blackEloChange: 2,
        verified: true,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      }
    ]);
    
    console.log('Recent games added successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error adding recent games:', error);
    process.exit(1);
  }
}

addRecentGames();