const express = require('express');
const router = express.Router();
const { WebSocket } = require('ws');
const {
  getAllPlayers,
  getPlayerById,
  createPlayer,
  updatePlayer,
  deletePlayer
} = require('../services/playerService');
const bcrypt = require('bcrypt');

// Function to broadcast player updates via WebSocket
const broadcastPlayerUpdate = (data) => {
  const { server } = require('../index');
  const wss = server.wss;
  
  if (wss) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'player_update',
          data
        }));
      }
    });
  }
};

// Get all players
router.get('/', async (req, res) => {
  try {
    const { sortBy, order, timeFilter = 'all' } = req.query;
    const players = await getAllPlayers(sortBy, order, timeFilter);
    
    // Remove sensitive data from response
    const filteredPlayers = players.map(player => {
      const { pin, isAdmin, ...playerData } = player;
      return playerData;
    });
    
    res.json({
      success: true,
      players: filteredPlayers
    });
  } catch (error) {
    console.error('Error getting players:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving players'
    });
  }
});

// Get player by ID
router.get('/:id', async (req, res) => {
  try {
    const player = await getPlayerById(parseInt(req.params.id));
    
    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found'
      });
    }
    
    // Remove sensitive data from response
    const { pin, isAdmin, ...playerData } = player;
    
    res.json({
      success: true,
      player: playerData
    });
  } catch (error) {
    console.error('Error getting player:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving player'
    });
  }
});

// Create new player
router.post('/', async (req, res) => {
  try {
    const { name, pin, isAdmin: adminFlag, initialElo, currentElo } = req.body;
    
    if (!name || !pin) {
      return res.status(400).json({
        success: false,
        message: 'Name and PIN are required'
      });
    }
    
    // Hash the PIN
    const saltRounds = 10;
    const hashedPin = await bcrypt.hash(pin, saltRounds);
    
    const playerData = {
      name,
      pin: hashedPin,
      isAdmin: adminFlag || false,
      initialElo: initialElo || 1200,
      currentElo: currentElo || initialElo || 1200
    };
    
    const newPlayer = await createPlayer(playerData);
    
    // Remove sensitive data from response
    const { pin: _, isAdmin: _admin, ...newPlayerData } = newPlayer;
    
    // Broadcast the new player to all connected clients
    broadcastPlayerUpdate({
      action: 'create',
      player: newPlayerData
    });
    
    res.status(201).json({
      success: true,
      player: newPlayerData
    });
  } catch (error) {
    console.error('Error creating player:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating player'
    });
  }
});

// Update player
router.put('/:id', async (req, res) => {
  try {
    const playerId = parseInt(req.params.id);
    const { name, pin, isAdmin: adminFlag, currentElo } = req.body;
    
    // Get current player
    const currentPlayer = await getPlayerById(playerId);
    
    if (!currentPlayer) {
      return res.status(404).json({
        success: false,
        message: 'Player not found'
      });
    }
    
    // Build update data
    const updateData = {};
    
    if (name) updateData.name = name;
    if (adminFlag !== undefined) updateData.isAdmin = adminFlag;
    if (currentElo) updateData.currentElo = currentElo;
    
    // If PIN is being updated, hash it
    if (pin) {
      const saltRounds = 10;
      updateData.pin = await bcrypt.hash(pin, saltRounds);
    }
    
    const updatedPlayer = await updatePlayer(playerId, updateData);
    
    // Remove sensitive data from response
    const { pin: _, isAdmin: _admin, ...updatedPlayerData } = updatedPlayer;
    
    // Broadcast the updated player to all connected clients
    broadcastPlayerUpdate({
      action: 'update',
      player: updatedPlayerData
    });
    
    res.json({
      success: true,
      player: updatedPlayerData
    });
  } catch (error) {
    console.error('Error updating player:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating player'
    });
  }
});

// Delete player
router.delete('/:id', async (req, res) => {
  try {
    const playerId = parseInt(req.params.id);
    
    const result = await deletePlayer(playerId);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Player not found'
      });
    }
    
    // Broadcast the deleted player to all connected clients
    broadcastPlayerUpdate({
      action: 'delete',
      playerId
    });
    
    res.json({
      success: true,
      message: 'Player deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting player:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting player'
    });
  }
});

module.exports = router;
