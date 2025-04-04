const { db } = require('../db');
const { players } = require('../schema');
const { eq } = require('drizzle-orm');
const bcrypt = require('bcrypt');

/**
 * Get all players with optional sorting
 */
const getAllPlayers = async (sortBy = 'currentElo', order = 'desc') => {
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
      // Default to sorting by currentElo
      query = sortDirection === 'asc'
        ? query.orderBy(players.currentElo)
        : query.orderBy(players.currentElo, { direction: 'desc' });
    }
    
    return await query;
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
