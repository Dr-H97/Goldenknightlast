import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useWebSocket } from '../context/WebSocketContext';

import "../styles/button-styles.css";

const Admin = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('players'); // players or games
  
  // Redirect if not admin (though ProtectedRoute should prevent this)
  if (!currentUser?.isAdmin) {
    return (
      <div className="container">
        <h1>Access Denied</h1>
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }
  
  return (
    <div className="container">
      <h1>Admin Panel</h1>
      
      {/* Tabs */}
      <div className="nav-tabs">
        <button 
          className={`nav-tab ${activeTab === 'players' ? 'active' : ''}`}
          onClick={() => setActiveTab('players')}
        >
          Player Management
        </button>
        <button 
          className={`nav-tab ${activeTab === 'games' ? 'active' : ''}`}
          onClick={() => setActiveTab('games')}
        >
          Game Management
        </button>
      </div>
      
      {/* Content */}
      <div className="tab-content">
        {activeTab === 'players' ? (
          <PlayerManagement />
        ) : (
          <GameManagement />
        )}
      </div>
    </div>
  );
};

// Player Management Component
const PlayerManagement = () => {
  const { t } = useLanguage();
  const { addMessageListener } = useWebSocket();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    pin: '',
    isAdmin: false,
    initialElo: 1200
  });
  
  // For editing players
  const [editingPlayerId, setEditingPlayerId] = useState(null);
  const [editingPlayer, setEditingPlayer] = useState({
    name: '',
    currentElo: 0,
    isAdmin: false,
    pin: ''
  });
  
  // Fetch players
  useEffect(() => {
    fetchPlayers();
  }, []);
  
  // Set up WebSocket listener for real-time updates
  useEffect(() => {
    // Listen for WebSocket messages
    const removeListener = addMessageListener((message) => {
      if (message.type === 'player_update' || message.type === 'player') {
        console.log('WebSocket: Player update received', message);
        fetchPlayers();
      }
    });
    
    return () => {
      // Clean up the listener when component unmounts
      removeListener();
    };
  }, [addMessageListener]);
  
  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/players');
      const data = await response.json();
      
      if (data.success) {
        setPlayers(data.players);
      } else {
        setError(data.message || 'Failed to load players');
      }
    } catch (error) {
      console.error('Error fetching players:', error);
      setError('Failed to load players. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle new player form change
  const handleNewPlayerChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewPlayer(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Add new player
  const handleAddPlayer = async (e) => {
    e.preventDefault();
    
    // Reset messages
    setError('');
    setSuccess('');
    
    // Validate
    if (!newPlayer.name || !newPlayer.pin) {
      setError('Name and PIN are required');
      return;
    }
    
    if (newPlayer.pin.length < 4) {
      setError('PIN must be at least 4 characters long');
      return;
    }
    
    try {
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newPlayer.name,
          pin: newPlayer.pin,
          isAdmin: newPlayer.isAdmin,
          initialElo: parseInt(newPlayer.initialElo) || 1200,
          currentElo: parseInt(newPlayer.initialElo) || 1200
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess(`Player "${newPlayer.name}" added successfully`);
        setNewPlayer({
          name: '',
          pin: '',
          isAdmin: false,
          initialElo: 1200
        });
        setShowAddForm(false);
        fetchPlayers(); // Refresh player list
      } else {
        setError(data.message || 'Failed to add player');
      }
    } catch (error) {
      console.error('Error adding player:', error);
      setError('An error occurred while adding the player');
    }
  };
  
  // Start editing a player
  const handleEditPlayer = (player) => {
    setEditingPlayerId(player.id);
    setEditingPlayer({
      name: player.name,
      currentElo: player.currentElo,
      isAdmin: player.isAdmin,
      pin: '' // We don't receive the hashed PIN from the server
    });
  };
  
  // Handle edit form changes
  const handleEditingPlayerChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingPlayer(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Save edited player
  const handleSavePlayer = async (e) => {
    e.preventDefault();
    
    // Reset messages
    setError('');
    setSuccess('');
    
    // Validate
    if (!editingPlayer.name) {
      setError('Name is required');
      return;
    }
    
    if (editingPlayer.pin && editingPlayer.pin.length < 4) {
      setError('PIN must be at least 4 characters long');
      return;
    }
    
    try {
      // Build update data (only include fields with values)
      const updateData = {
        name: editingPlayer.name,
        currentElo: parseInt(editingPlayer.currentElo),
        isAdmin: editingPlayer.isAdmin
      };
      
      // Only include PIN if it was changed
      if (editingPlayer.pin) {
        updateData.pin = editingPlayer.pin;
      }
      
      const response = await fetch(`/api/players/${editingPlayerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess(`Player "${editingPlayer.name}" updated successfully`);
        setEditingPlayerId(null);
        fetchPlayers(); // Refresh player list
      } else {
        setError(data.message || 'Failed to update player');
      }
    } catch (error) {
      console.error('Error updating player:', error);
      setError('An error occurred while updating the player');
    }
  };
  
  // Cancel editing
  const handleCancelEdit = () => {
    setEditingPlayerId(null);
  };
  
  // Delete player
  const handleDeletePlayer = async (playerId, playerName) => {
    if (!window.confirm(`Are you sure you want to delete ${playerName}? This will also delete all their games.`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/players/${playerId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess(`Player "${playerName}" deleted successfully`);
        fetchPlayers(); // Refresh player list
      } else {
        setError(data.message || 'Failed to delete player');
      }
    } catch (error) {
      console.error('Error deleting player:', error);
      setError('An error occurred while deleting the player');
    }
  };
  
  if (loading && !players.length) {
    return (
      <div className="card" style={{ display: 'flex', justifyContent: 'center', padding: '30px' }}>
        <div className="loading-knight"></div>
        <p style={{ marginTop: '20px' }}>Loading players...</p>
      </div>
    );
  }
  
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Player Management</h2>
        <button 
          className="btn-admin chess-piece-hover"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : 'Add New Player'}
        </button>
      </div>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      {/* Add Player Form */}
      {showAddForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>Add New Player</h3>
          
          <form onSubmit={handleAddPlayer}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-control"
                value={newPlayer.name}
                onChange={handleNewPlayerChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="pin">PIN</label>
              <input
                type="password"
                id="pin"
                name="pin"
                className="form-control"
                value={newPlayer.pin}
                onChange={handleNewPlayerChange}
                minLength={4}
                required
              />
              <small>PIN must be at least 4 characters long</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="initialElo">Initial ELO Rating</label>
              <input
                type="number"
                id="initialElo"
                name="initialElo"
                className="form-control"
                value={newPlayer.initialElo}
                onChange={handleNewPlayerChange}
                min="100"
                max="3000"
              />
            </div>
            
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                id="isAdmin"
                name="isAdmin"
                checked={newPlayer.isAdmin}
                onChange={handleNewPlayerChange}
              />
              <label htmlFor="isAdmin">Admin Access</label>
            </div>
            
            <button type="submit" className="btn-admin chess-piece-hover">
              Add Player
            </button>
          </form>
        </div>
      )}
      
      {/* Edit Player Form */}
      {editingPlayerId && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>Edit Player</h3>
          
          <form onSubmit={handleSavePlayer}>
            <div className="form-group">
              <label htmlFor="editName">Name</label>
              <input
                type="text"
                id="editName"
                name="name"
                className="form-control"
                value={editingPlayer.name}
                onChange={handleEditingPlayerChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="editCurrentElo">Current ELO Rating</label>
              <input
                type="number"
                id="editCurrentElo"
                name="currentElo"
                className="form-control"
                value={editingPlayer.currentElo}
                onChange={handleEditingPlayerChange}
                min="100"
                max="3000"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="editPin">New PIN (leave blank to keep current)</label>
              <input
                type="password"
                id="editPin"
                name="pin"
                className="form-control"
                value={editingPlayer.pin}
                onChange={handleEditingPlayerChange}
                minLength={4}
              />
              <small>PIN must be at least 4 characters long if provided</small>
            </div>
            
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                id="editIsAdmin"
                name="isAdmin"
                checked={editingPlayer.isAdmin}
                onChange={handleEditingPlayerChange}
              />
              <label htmlFor="editIsAdmin">Admin Access</label>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn-admin chess-piece-hover">
                Save Changes
              </button>
              <button type="button" className="btn-admin chess-piece-hover" onClick={handleCancelEdit}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Player List */}
      <div className="card">
        <div className="player-management-list">
          {players.map(player => (
            <div key={player.id} className="player-card" style={{ 
              marginBottom: '15px', 
              padding: '15px', 
              backgroundColor: 'var(--card-bg-alt)',
              borderRadius: '10px',
              border: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0' }}>{player.name}</h3>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <p style={{ margin: '0' }}><strong>ELO:</strong> {player.currentElo || player.initialElo}</p>
                    <p style={{ margin: '0' }}><strong>Role:</strong> {player.isAdmin ? 'Admin' : 'Player'}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => handleEditPlayer(player)}
                    className="btn-admin chess-piece-hover"
                    style={{ padding: '8px 15px' }}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeletePlayer(player.id, player.name)}
                    className="btn-danger"
                    style={{ padding: '8px 15px' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {players.length === 0 && (
            <p style={{ textAlign: 'center', padding: '20px' }}>No players found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Game Management Component
const GameManagement = () => {
  const { t } = useLanguage();
  const { addMessageListener } = useWebSocket();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({
    dateRange: '',      // 'week', 'month', 'year'
    specificDate: '',   // For exact date selection
    playerFilter: ''    // For filtering by player ID
  });
  const [players, setPlayers] = useState([]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  
  // For editing games
  const [editingGameId, setEditingGameId] = useState(null);
  const [editingGame, setEditingGame] = useState({
    result: '1-0',
    verified: false,
    date: ''
  });
  
  // Fetch players for the player filter dropdown
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch('/api/players');
        const data = await response.json();
        
        if (data.success) {
          setPlayers(data.players);
        }
      } catch (error) {
        console.error('Error fetching players for filter:', error);
      }
    };
    
    fetchPlayers();
  }, []);
  
  // Fetch games initially and when filters change
  useEffect(() => {
    fetchGames();
  }, [filters]);
  
  // Set up WebSocket listener for real-time updates
  useEffect(() => {
    const removeListener = addMessageListener((message) => {
      if (message.type === 'game_update' || message.type === 'game') {
        console.log('WebSocket: Game update received', message);
        fetchGames();
      }
    });
    
    return () => {
      removeListener();
    };
  }, [addMessageListener, filters]);
  
  const fetchGames = async () => {
    try {
      setLoading(true);
      
      // Build query string from filters
      const queryParams = new URLSearchParams();
      
      if (filters.dateRange) {
        queryParams.append('dateRange', filters.dateRange);
      }
      
      if (filters.specificDate) {
        queryParams.append('specificDate', filters.specificDate);
      }
      
      if (filters.playerFilter) {
        queryParams.append('playerId', filters.playerFilter);
      }
      
      // Get games with filters
      const response = await fetch(`/api/games?${queryParams}`);
      const data = await response.json();
      
      if (data.success) {
        setGames(data.games || []);
      } else {
        setError(data.message || 'Failed to load games');
      }
    } catch (error) {
      console.error('Error fetching games:', error);
      setError('Failed to load games. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Apply filters
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      dateRange: '',
      specificDate: '',
      playerFilter: ''
    });
  };
  
  // Delete game
  const handleDeleteGame = async (gameId) => {
    if (!window.confirm('Are you sure you want to delete this game? This will also adjust player ratings.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/games/${gameId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Game deleted successfully');
        fetchGames(); // Refresh game list
      } else {
        setError(data.message || 'Failed to delete game');
      }
    } catch (error) {
      console.error('Error deleting game:', error);
      setError('An error occurred while deleting the game');
    }
  };
  
  // Edit game
  const handleEditGame = (game) => {
    setEditingGameId(game.id);
    setEditingGame({
      whiteId: game.whiteId,
      blackId: game.blackId,
      result: game.result,
      verified: game.verified,
      date: game.date.split('T')[0]  // Format date for the input
    });
  };
  
  // Handle editing game form changes
  const handleEditingGameChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingGame(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Save edited game
  const handleSaveGame = async (e) => {
    e.preventDefault();
    
    // Reset messages
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch(`/api/games/${editingGameId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingGame),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Game updated successfully');
        setEditingGameId(null);
        fetchGames(); // Refresh game list
      } else {
        setError(data.message || 'Failed to update game');
      }
    } catch (error) {
      console.error('Error updating game:', error);
      setError('An error occurred while updating the game');
    }
  };
  
  // Cancel editing
  const handleCancelEdit = () => {
    setEditingGameId(null);
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  if (loading && !games.length) {
    return (
      <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px' }}>
        <div className="loading-knight"></div>
        <p style={{ marginTop: '20px' }}>Loading games...</p>
      </div>
    );
  }
  
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Game Management</h2>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn-admin chess-piece-hover"
            onClick={() => setShowFilterPanel(!showFilterPanel)}
          >
            {showFilterPanel ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
      </div>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      {/* Filter Panel */}
      {showFilterPanel && (
        <div className="card" style={{ marginBottom: '20px', padding: '15px' }}>
          <h3>Filter Games</h3>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label htmlFor="dateRange">Date Range</label>
              <select
                id="dateRange"
                name="dateRange"
                className="form-control"
                value={filters.dateRange}
                onChange={handleFilterChange}
                style={{ minWidth: '150px' }}
              >
                <option value="">All Time</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="year">Last Year</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="specificDate">Specific Date</label>
              <input
                type="date"
                id="specificDate"
                name="specificDate"
                className="form-control"
                value={filters.specificDate}
                onChange={handleFilterChange}
              />
            </div>
            
            <div>
              <label htmlFor="playerFilter">Player</label>
              <select
                id="playerFilter"
                name="playerFilter"
                className="form-control"
                value={filters.playerFilter}
                onChange={handleFilterChange}
                style={{ minWidth: '150px' }}
              >
                <option value="">All Players</option>
                {players.map(player => (
                  <option key={player.id} value={player.id}>{player.name}</option>
                ))}
              </select>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button 
                onClick={handleResetFilters}
                className="btn-admin chess-piece-hover"
                style={{ padding: '8px 15px', marginBottom: '1px' }}
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Game Form */}
      {editingGameId && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>Edit Game</h3>
          
          <form onSubmit={handleSaveGame}>
            <div className="form-group">
              <label htmlFor="result">Result</label>
              <select
                id="result"
                name="result"
                className="form-control"
                value={editingGame.result}
                onChange={handleEditingGameChange}
              >
                <option value="1-0">White Wins (1-0)</option>
                <option value="0-1">Black Wins (0-1)</option>
                <option value="1/2-1/2">Draw (1/2-1/2)</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                type="date"
                id="date"
                name="date"
                className="form-control"
                value={editingGame.date}
                onChange={handleEditingGameChange}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn-admin chess-piece-hover">
                Save Changes
              </button>
              <button type="button" className="btn-admin chess-piece-hover" onClick={handleCancelEdit}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Game List */}
      <div className="card">
        <div className="table-responsive mobile-responsive-table">
          <table>
            <thead>
              <tr>
                <th>{t('date')}</th>
                <th>{t('white')}</th>
                <th>{t('black')}</th>
                <th>{t('result')}</th>
                <th>{t('eloChange')}</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {games.map(game => (
                <tr key={game.id}>
                  <td data-label={t('date')}>{formatDate(game.date)}</td>
                  <td data-label={t('white')}>{game.whitePlayer?.name || 'Unknown'}</td>
                  <td data-label={t('black')}>{game.blackPlayer?.name || 'Unknown'}</td>
                  <td data-label={t('result')}>{game.result}</td>
                  <td data-label={t('eloChange')}>
                    {game.whitePlayer?.name}: {game.whiteEloChange > 0 ? '+' : ''}{game.whiteEloChange}<br />
                    {game.blackPlayer?.name}: {game.blackEloChange > 0 ? '+' : ''}{game.blackEloChange}
                  </td>
                  <td data-label={t('actions')} style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <button 
                      onClick={() => handleEditGame(game)}
                      className="btn-admin chess-piece-hover"
                      style={{ padding: '5px 10px' }}
                    >
                      {t('edit')}
                    </button>
                    <button 
                      onClick={() => handleDeleteGame(game.id)}
                      className="btn-danger"
                      style={{ padding: '5px 10px' }}
                    >
                      {t('delete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {games.length === 0 && (
            <p>{t('noGamesFound')}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
