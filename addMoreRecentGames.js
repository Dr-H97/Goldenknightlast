/**
 * Script to add more recent games to the database
 */
const { db } = require('./server/db');
const { games, players } = require('./server/schema');
const { eq } = require('drizzle-orm');

async function addMoreRecentGames() {
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
    
    console.log('Adding even more recent games...');
    
    // Create today's date and set hours for better visibility when debugging
    const now = new Date();
    
    // Games from 2 days ago
    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(now.getDate() - 2);
    twoDaysAgo.setHours(14, 30, 0, 0);
    
    // Games from 3 days ago
    const threeDaysAgo = new Date(now);
    threeDaysAgo.setDate(now.getDate() - 3);
    threeDaysAgo.setHours(16, 0, 0, 0);
    
    // Games from 5 days ago
    const fiveDaysAgo = new Date(now);
    fiveDaysAgo.setDate(now.getDate() - 5);
    fiveDaysAgo.setHours(10, 15, 0, 0);
    
    // Add games from different days within the last week
    await db.insert(games).values([
      {
        whitePlayerId: admin.id,
        blackPlayerId: hamza.id,
        result: '1-0',
        whiteEloChange: 10,
        blackEloChange: -10,
        verified: true,
        date: twoDaysAgo
      },
      {
        whitePlayerId: mehdi.id,
        blackPlayerId: abla.id,
        result: '0-1',
        whiteEloChange: -12,
        blackEloChange: 12,
        verified: true,
        date: threeDaysAgo
      },
      {
        whitePlayerId: yassmine.id,
        blackPlayerId: admin.id,
        result: '1/2-1/2',
        whiteEloChange: 5,
        blackEloChange: 5,
        verified: true,
        date: fiveDaysAgo
      }
    ]);
    
    console.log('Recent games added successfully');
    console.log('Two days ago:', twoDaysAgo.toISOString());
    console.log('Three days ago:', threeDaysAgo.toISOString());
    console.log('Five days ago:', fiveDaysAgo.toISOString());
    
    process.exit(0);
  } catch (error) {
    console.error('Error adding recent games:', error);
    process.exit(1);
  }
}

addMoreRecentGames();