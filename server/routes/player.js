const express = require('express');
const router = express.Router();
const {
  getAllPlayers,
  getPlayerById,
  createPlayer,
  updatePlayer,
  deletePlayer
} = require('../services/playerService');
const bcrypt = require('bcrypt');

// Get all players
router.get('/', async (req, res) => {
  try {
    const { sortBy, order } = req.query;
    const players = await getAllPlayers(sortBy, order);
    
    // Remove sensitive data from response
    const filteredPlayers = players.map(player => {
      const { pin, ...playerData } = player;
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
    const { pin, ...playerData } = player;
    
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
    const { name, pin, isAdmin, initialElo, currentElo } = req.body;
    
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
      isAdmin: isAdmin || false,
      initialElo: initialElo || 1200,
      currentElo: currentElo || initialElo || 1200
    };
    
    const newPlayer = await createPlayer(playerData);
    
    // Remove PIN from response
    const { pin: _, ...newPlayerData } = newPlayer;
    
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
    const { name, pin, isAdmin, currentElo } = req.body;
    
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
    if (isAdmin !== undefined) updateData.isAdmin = isAdmin;
    if (currentElo) updateData.currentElo = currentElo;
    
    // If PIN is being updated, hash it
    if (pin) {
      const saltRounds = 10;
      updateData.pin = await bcrypt.hash(pin, saltRounds);
    }
    
    const updatedPlayer = await updatePlayer(playerId, updateData);
    
    // Remove PIN from response
    const { pin: _, ...updatedPlayerData } = updatedPlayer;
    
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
