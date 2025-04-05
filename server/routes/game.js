const express = require('express');
const router = express.Router();
const { WebSocket } = require('ws');
const {
  getAllGames,
  getGameById,
  getGamesForPlayer,
  createGame,
  verifyGame,
  deleteGame,
  updateGame
} = require('../services/gameService');

// Function to broadcast game updates via WebSocket
const broadcastGameUpdate = (data) => {
  const { server } = require('../index');
  const wss = server.wss;
  
  if (wss) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'game_update',
          data
        }));
      }
    });
  }
};

// Get all games with optional filters
router.get('/', async (req, res) => {
  try {
    const { 
      sortBy, 
      order, 
      verified, 
      playerId, 
      dateRange, 
      specificDate,
      fromDate,
      toDate
    } = req.query;
    
    let games;
    if (playerId) {
      // If playerId is provided, get games for that player
      games = await getGamesForPlayer(
        parseInt(playerId),
        sortBy,
        order
      );
    } else {
      // Otherwise get all games with all filters
      games = await getAllGames(
        sortBy,
        order,
        verified !== undefined ? verified === 'true' : null,
        dateRange,
        specificDate,
        fromDate,
        toDate,
        playerId ? parseInt(playerId) : null
      );
    }
    
    // Remove verified field from each game object before sending to client
    const gamesWithoutVerified = games.map(game => {
      const { verified: _verified, ...gameData } = game;
      return gameData;
    });
    
    res.json({
      success: true,
      games: gamesWithoutVerified
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
    
    // Remove the verified field from the response for non-admin users
    const { verified: _verified, ...gameData } = game;
    
    res.json({
      success: true,
      game: gameData
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
    const { whitePlayerId, blackPlayerId, result, date } = req.body;
    
    if (!whitePlayerId || !blackPlayerId || !result) {
      return res.status(400).json({
        success: false,
        message: 'White player, black player, and result are required'
      });
    }
    
    // Handle date conversion properly
    let gameDate = new Date();
    if (date) {
      try {
        // Try to create a Date object from the provided date
        gameDate = new Date(date);
        // Check if the date is valid
        if (isNaN(gameDate.getTime())) {
          gameDate = new Date(); // Default to current date if invalid
        }
      } catch (e) {
        console.error('Error parsing date:', e);
        gameDate = new Date();
      }
    }
    
    const gameData = {
      whitePlayerId,
      blackPlayerId,
      result,
      date: gameDate,
      verified: true  // Auto-verify all games
    };
    
    const newGame = await createGame(gameData);
    
    // Remove the verified field from the response for public view
    const { verified: _verified, ...cleanGameData } = newGame;
    
    // Broadcast the new game to all connected clients
    broadcastGameUpdate({
      action: 'create',
      game: cleanGameData
    });
    
    res.status(201).json({
      success: true,
      game: cleanGameData
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
    
    // Remove the verified field from the response for public view
    const { verified: _verified, ...cleanGameData } = updatedGame;
    
    // Broadcast the verified game to all connected clients
    broadcastGameUpdate({
      action: 'update',
      game: cleanGameData
    });
    
    res.json({
      success: true,
      game: cleanGameData
    });
  } catch (error) {
    console.error('Error verifying game:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying game'
    });
  }
});

// Update game
router.put('/:id', async (req, res) => {
  try {
    const gameId = parseInt(req.params.id);
    const { result, verified: verificationStatus, date } = req.body;
    
    // Prepare update data
    const updateData = {};
    if (result !== undefined) updateData.result = result;
    if (verificationStatus !== undefined) updateData.verified = verificationStatus;
    if (date !== undefined) updateData.date = date;
    
    const updatedGame = await updateGame(gameId, updateData);
    
    if (!updatedGame) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }
    
    // Remove the verified field from the response for public view
    const { verified: _verified, ...cleanGameData } = updatedGame;
    
    // Broadcast the updated game to all connected clients
    broadcastGameUpdate({
      action: 'update',
      game: cleanGameData
    });
    
    res.json({
      success: true,
      game: cleanGameData,
      message: 'Game updated successfully'
    });
  } catch (error) {
    console.error('Error updating game:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating game'
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
    
    // Broadcast the deleted game to all connected clients
    broadcastGameUpdate({
      action: 'delete',
      gameId
    });
    
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
