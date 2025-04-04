const express = require('express');
const router = express.Router();
const {
  getAllGames,
  getGameById,
  getGamesForPlayer,
  createGame,
  verifyGame,
  deleteGame
} = require('../services/gameService');

// Get all games with optional filters
router.get('/', async (req, res) => {
  try {
    const { sortBy, order, verified, playerId } = req.query;
    
    let games;
    if (playerId) {
      // If playerId is provided, get games for that player
      games = await getGamesForPlayer(
        parseInt(playerId),
        sortBy,
        order
      );
    } else {
      // Otherwise get all games
      games = await getAllGames(
        sortBy,
        order,
        verified !== undefined ? verified === 'true' : null
      );
    }
    
    res.json({
      success: true,
      games
    });
  } catch (error) {
    console.error('Error getting games:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving games'
    });
  }
});

// Get game by ID
router.get('/:id', async (req, res) => {
  try {
    const game = await getGameById(parseInt(req.params.id));
    
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }
    
    res.json({
      success: true,
      game
    });
  } catch (error) {
    console.error('Error getting game:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving game'
    });
  }
});

// Create new game
router.post('/', async (req, res) => {
  try {
    const { whitePlayerId, blackPlayerId, result, date, verified } = req.body;
    
    if (!whitePlayerId || !blackPlayerId || !result) {
      return res.status(400).json({
        success: false,
        message: 'White player, black player, and result are required'
      });
    }
    
    const gameData = {
      whitePlayerId,
      blackPlayerId,
      result,
      date: date || new Date(),
      verified: verified || false
    };
    
    const newGame = await createGame(gameData);
    
    res.status(201).json({
      success: true,
      game: newGame
    });
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating game'
    });
  }
});

// Verify game
router.put('/:id/verify', async (req, res) => {
  try {
    const gameId = parseInt(req.params.id);
    
    const updatedGame = await verifyGame(gameId);
    
    if (!updatedGame) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }
    
    res.json({
      success: true,
      game: updatedGame
    });
  } catch (error) {
    console.error('Error verifying game:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying game'
    });
  }
});

// Delete game
router.delete('/:id', async (req, res) => {
  try {
    const gameId = parseInt(req.params.id);
    
    const result = await deleteGame(gameId);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Game deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting game:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting game'
    });
  }
});

module.exports = router;
