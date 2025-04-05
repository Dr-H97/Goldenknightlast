const { db } = require('../db');
const { players } = require('../schema');
const { eq } = require('drizzle-orm');
const bcrypt = require('bcrypt');

/**
 * Get all players with optional sorting
 */
const getAllPlayers = async (sortBy = 'currentElo', order = 'desc', timeFilter = 'all') => {
  try {
    // Build sorting parameters
    const orderMap = {
      'asc': 'asc',
      'desc': 'desc'
    };
    
    const sortDirection = orderMap[order.toLowerCase()] || 'desc';
    
    // Execute query based on sort parameters
    let query = db.select().from(players);
    
    if (sortBy === 'name') {
      query = sortDirection === 'asc' 
        ? query.orderBy(players.name)
        : query.orderBy(players.name, { direction: 'desc' });
    } else if (sortBy === 'id') {
      query = sortDirection === 'asc'
        ? query.orderBy(players.id)
        : query.orderBy(players.id, { direction: 'desc' });
    } else {
      // Sort by currentElo respecting the requested sort direction
      query = sortDirection === 'asc'
        ? query.orderBy(players.currentElo)
        : query.orderBy(players.currentElo, { direction: 'desc' });
    }
    
    const allPlayers = await query;
    
    // We'll need to fetch all games for both performance and win rate calculations
    const { games } = require('../schema');
    const { and, gte } = require('drizzle-orm');
    
    // Calculate the date range based on the timeFilter
    const currentDate = new Date();
    let filterDate = new Date();
    let allGames;
    
    switch(timeFilter) {
      case 'week':
        filterDate.setDate(currentDate.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(currentDate.getMonth() - 1);
        break;
      case 'year':
        filterDate.setFullYear(currentDate.getFullYear() - 1);
        break;
      default:
        // All time - get all games
        allGames = await db.select().from(games);
        break;
    }
    
    // If we're using a time filter, get games for that period
    if (timeFilter !== 'all') {
      // Format date for database query
      const formattedDate = filterDate.toISOString().split('T')[0];
      
      // Get all games within the timeframe
      allGames = await db
        .select()
        .from(games)
        .where(gte(games.date, new Date(formattedDate)));
    }
    
    // Enhance players with stats (games played and win rate)
    const enhancedPlayers = allPlayers.map(player => {
      // Find all games for this player
      const playerGames = allGames.filter(game => 
        game.whitePlayerId === player.id || game.blackPlayerId === player.id
      );
      
      // Calculate games played
      const gamesPlayed = playerGames.length;
      
      // Calculate win rate
      let wins = 0;
      let draws = 0;
      
      playerGames.forEach(game => {
        if (game.whitePlayerId === player.id) {
          if (game.result === '1-0') wins += 1;
          else if (game.result === '1/2-1/2') draws += 0.5;
        } else {
          if (game.result === '0-1') wins += 1;
          else if (game.result === '1/2-1/2') draws += 0.5;
        }
      });
      
      const winRate = gamesPlayed > 0 ? (wins + draws) / gamesPlayed : 0;
      
      // Add stats to player object
      return { 
        ...player, 
        gamesPlayed,
        winRate,
        wins,
        draws,
        losses: gamesPlayed - wins - draws
      };
    });
    
    // If we need to calculate performance ratings
    if (sortBy === 'performance') {
      // Calculate performance ratings for each player
      const playerPerformance = enhancedPlayers.map(player => {
        const playerGames = allGames.filter(game => 
          game.whitePlayerId === player.id || game.blackPlayerId === player.id
        );
        
        if (playerGames.length === 0) {
          return { ...player, performanceRating: player.currentElo };
        }
        
        let totalScore = 0;
        const opponentRatings = [];
        
        playerGames.forEach(game => {
          let score = 0;
          let opponentId;
          let opponentRating;
          
          if (game.whitePlayerId === player.id) {
            if (game.result === '1-0') score = 1;
            else if (game.result === '0-1') score = 0;
            else score = 0.5; // Draw
            
            opponentId = game.blackPlayerId;
            opponentRating = allPlayers.find(p => p.id === opponentId)?.currentElo || 1500;
          } else {
            if (game.result === '0-1') score = 1;
            else if (game.result === '1-0') score = 0;
            else score = 0.5; // Draw
            
            opponentId = game.whitePlayerId;
            opponentRating = allPlayers.find(p => p.id === opponentId)?.currentElo || 1500;
          }
          
          totalScore += score;
          opponentRatings.push(opponentRating);
        });
        
        // Calculate performance rating using the formula
        // R_avg + D where D = -400 * log10((1 - P) / P)
        const R_avg = opponentRatings.reduce((sum, rating) => sum + rating, 0) / opponentRatings.length;
        const P = totalScore / playerGames.length;
        
        let D;
        if (P === 1) {
          D = 800; // Maximum bonus for 100% score
        } else if (P === 0) {
          D = -800; // Maximum penalty for 0% score
        } else {
          D = -400 * Math.log10((1 - P) / P);
        }
        
        const performanceRating = Math.round(R_avg + D);
        
        return { ...player, performanceRating };
      });
      
      // Sort by performance rating respecting the requested sort direction
      return sortDirection === 'asc'
        ? playerPerformance.sort((a, b) => a.performanceRating - b.performanceRating)
        : playerPerformance.sort((a, b) => b.performanceRating - a.performanceRating);
    }
    
    return enhancedPlayers;
  } catch (error) {
    console.error('Error in getAllPlayers:', error);
    throw error;
  }
};

/**
 * Get a player by ID
 */
const getPlayerById = async (id) => {
  try {
    const [player] = await db
      .select()
      .from(players)
      .where(eq(players.id, id));
    
    return player || null;
  } catch (error) {
    console.error(`Error in getPlayerById (${id}):`, error);
    throw error;
  }
};

/**
 * Create a new player
 */
const createPlayer = async (playerData) => {
  try {
    const [newPlayer] = await db
      .insert(players)
      .values(playerData)
      .returning();
    
    return newPlayer;
  } catch (error) {
    console.error('Error in createPlayer:', error);
    throw error;
  }
};

/**
 * Update a player by ID
 */
const updatePlayer = async (id, updateData) => {
  try {
    const [updatedPlayer] = await db
      .update(players)
      .set(updateData)
      .where(eq(players.id, id))
      .returning();
    
    return updatedPlayer || null;
  } catch (error) {
    console.error(`Error in updatePlayer (${id}):`, error);
    throw error;
  }
};

/**
 * Delete a player by ID
 */
const deletePlayer = async (id) => {
  try {
    const [deletedPlayer] = await db
      .delete(players)
      .where(eq(players.id, id))
      .returning();
    
    return deletedPlayer ? true : false;
  } catch (error) {
    console.error(`Error in deletePlayer (${id}):`, error);
    throw error;
  }
};

/**
 * Authenticate a player by name and PIN
 */
const authenticatePlayer = async (name, pin) => {
  try {
    // Find player by name
    const [player] = await db
      .select()
      .from(players)
      .where(eq(players.name, name));
    
    if (!player) {
      return null;
    }
    
    // Compare PIN
    const isMatch = await bcrypt.compare(pin, player.pin);
    
    return isMatch ? player : null;
  } catch (error) {
    console.error(`Error in authenticatePlayer (${name}):`, error);
    throw error;
  }
};

module.exports = {
  getAllPlayers,
  getPlayerById,
  createPlayer,
  updatePlayer,
  deletePlayer,
  authenticatePlayer
};
