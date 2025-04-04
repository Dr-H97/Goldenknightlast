const express = require('express');
const router = express.Router();
const { authenticatePlayer, getPlayerById } = require('../services/playerService');
const bcrypt = require('bcrypt');

// Login route
router.post('/login', async (req, res) => {
  try {
    const { name, pin } = req.body;
    
    if (!name || !pin) {
      return res.status(400).json({
        success: false,
        message: 'Name and PIN are required'
      });
    }
    
    const player = await authenticatePlayer(name, pin);
    
    if (!player) {
      return res.status(401).json({
        success: false,
        message: 'Invalid name or PIN'
      });
    }
    
    // Remove PIN from the response for security
    const { pin: _, ...playerData } = player;
    
    res.json({
      success: true,
      player: playerData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login'
    });
  }
});

// Verify PIN route (for game submission, etc.)
router.post('/verify-pin', async (req, res) => {
  try {
    const { playerId, pin } = req.body;
    
    if (!playerId || !pin) {
      return res.status(400).json({
        success: false,
        message: 'Player ID and PIN are required'
      });
    }
    
    // Get player by ID
    const player = await getPlayerById(playerId);
    
    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found'
      });
    }
    
    // Compare PIN
    const isMatch = await bcrypt.compare(pin, player.pin);
    
    res.json({
      success: isMatch
    });
  } catch (error) {
    console.error('PIN verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during PIN verification'
    });
  }
});

module.exports = router;
