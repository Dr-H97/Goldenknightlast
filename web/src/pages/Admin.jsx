import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import { applyDataLabels, formatDate } from '../helpers/tableHelpers';
import '../styles/admin.css';
import '../styles/responsive-tables.css';

const Admin = () => {
  const { user, isLoggedIn } = useAuth();
  const { addMessageListener } = useWebSocket();
  const navigate = useNavigate();
  
  // Refs for table elements
  const gamesTableRef = useRef(null);
  const playersTableRef = useRef(null);
  
  const [activeTab, setActiveTab] = useState('games');
  const [games, setGames] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Game management states
  const [showAddGameForm, setShowAddGameForm] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [gameFilter, setGameFilter] = useState({
    playerName: '',
    dateFrom: '',
    dateTo: '',
    result: ''
  });
  
  // Player management states
  const [showAddPlayerForm, setShowAddPlayerForm] = useState(false);
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    pin: '',
    isAdmin: false,
    initialElo: 1000
  });
  
  // Edit states
  const [editingGame, setEditingGame] = useState(null);
  const [editingPlayer, setEditingPlayer] = useState(null);
  
  // Apply data labels when tab changes
  useEffect(() => {
    if (activeTab === 'games') {
      setTimeout(() => {
        applyDataLabels('games-table');
      }, 300);
    } else if (activeTab === 'players') {
      setTimeout(() => {
        applyDataLabels('players-table');
      }, 300);
    }
  }, [activeTab]);
  
  // Apply data labels when data changes
  useEffect(() => {
    if (games.length > 0 && activeTab === 'games') {
      setTimeout(() => {
        applyDataLabels('games-table');
      }, 300);
    }
  }, [games, activeTab]);
  
  useEffect(() => {
    if (players.length > 0 && activeTab === 'players') {
      setTimeout(() => {
        applyDataLabels('players-table');
      }, 300);
    }
  }, [players, activeTab]);
  
  // Fetch initial data
  useEffect(() => {
    if (!isLoggedIn || !user?.isAdmin) {
      navigate('/login');
      return;
    }
    
    fetchGames();
    fetchPlayers();
    
    // Listen for updates from WebSocket
    const removeGameListener = addMessageListener((data) => {
      if (data.type === 'game_update') {
        fetchGames();
      }
    });
    
    const removePlayerListener = addMessageListener((data) => {
      if (data.type === 'player_update') {
        fetchPlayers();
      }
    });
    
    return () => {
      removeGameListener();
      removePlayerListener();
    };

    // Apply data-labels to tables for responsive design
    if (activeTab === 'games') {
      setTimeout(() => {
        applyDataLabels('games-table');
      }, 300);
    } else if (activeTab === 'players') {
      setTimeout(() => {
        applyDataLabels('players-table');
      }, 300);
    }
  }, [isLoggedIn, user, navigate, addMessageListener]);
  
  // Fetch games with optional filtering
  const fetchGames = async () => {
    try {
      setLoading(true);
      
      let url = '/api/games';
      const queryParams = [];
      
      if (gameFilter.playerName) {
        queryParams.push(`playerName=${encodeURIComponent(gameFilter.playerName)}`);
      }
      
      if (gameFilter.dateFrom) {
        queryParams.push(`dateFrom=${encodeURIComponent(gameFilter.dateFrom)}`);
      }
      
      if (gameFilter.dateTo) {
        queryParams.push(`dateTo=${encodeURIComponent(gameFilter.dateTo)}`);
      }
      
      if (gameFilter.result) {
        queryParams.push(`result=${encodeURIComponent(gameFilter.result)}`);
      }
      
      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error fetching games: ${response.statusText}`);
      }
      
      const data = await response.json();
      setGames(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching games:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch all players
  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/players');
      
      if (!response.ok) {
        throw new Error(`Error fetching players: ${response.statusText}`);
      }
      
      const data = await response.json();
      setPlayers(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching players:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle game deletion
  const handleDeleteGame = async (gameId) => {
    if (!window.confirm('Are you sure you want to delete this game? This will revert any ELO changes.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/games/${gameId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Error deleting game: ${response.statusText}`);
      }
      
      // Remove game from state
      setGames(games.filter(game => game.id !== gameId));
    } catch (err) {
      setError(err.message);
      console.error('Error deleting game:', err);
    }
  };
  
  // Handle player deletion
  const handleDeletePlayer = async (playerId) => {
    if (!window.confirm('Are you sure you want to delete this player? This will also delete all of their games.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/players/${playerId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Error deleting player: ${response.statusText}`);
      }
      
      // Remove player from state
      setPlayers(players.filter(player => player.id !== playerId));
    } catch (err) {
      setError(err.message);
      console.error('Error deleting player:', err);
    }
  };
  
  // Handle player creation
  const handleCreatePlayer = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPlayer),
      });
      
      if (!response.ok) {
        throw new Error(`Error creating player: ${response.statusText}`);
      }
      
      const createdPlayer = await response.json();
      setPlayers([...players, createdPlayer]);
      setNewPlayer({
        name: '',
        pin: '',
        isAdmin: false,
        initialElo: 1000
      });
      setShowAddPlayerForm(false);
    } catch (err) {
      setError(err.message);
      console.error('Error creating player:', err);
    }
  };
  
  // Handle player update
  const handleUpdatePlayer = async (e) => {
    e.preventDefault();
    
    if (!editingPlayer) return;
    
    try {
      const response = await fetch(`/api/players/${editingPlayer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingPlayer),
      });
      
      if (!response.ok) {
        throw new Error(`Error updating player: ${response.statusText}`);
      }
      
      const updatedPlayer = await response.json();
      
      // Update player in state
      setPlayers(players.map(player => 
        player.id === updatedPlayer.id ? updatedPlayer : player
      ));
      
      setEditingPlayer(null);
    } catch (err) {
      setError(err.message);
      console.error('Error updating player:', err);
    }
  };
  
  // Apply filters
  const applyFilters = () => {
    fetchGames();
  };
  
  // Reset filters
  const resetFilters = () => {
    setGameFilter({
      playerName: '',
      dateFrom: '',
      dateTo: '',
      result: ''
    });
    fetchGames();
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Render Game Management tab
  const renderGameManagement = () => {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Game Management</h2>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="btn-admin"
              onClick={() => setShowFilterPanel(!showFilterPanel)}
            >
              {showFilterPanel ? 'Hide Filters' : 'Show Filters'}
            </button>
            
            <button 
              className="btn-admin"
              onClick={() => navigate('/submit-game')}
            >
              Add New Game
            </button>
          </div>
        </div>
        
        {showFilterPanel && (
          <div className="filter-panel card">
            <h3>Filter Games</h3>
            <div className="filter-grid">
              <div className="form-group">
                <label>Player Name:</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={gameFilter.playerName}
                  onChange={(e) => setGameFilter({...gameFilter, playerName: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Date From:</label>
                <input 
                  type="date" 
                  className="form-control"
                  value={gameFilter.dateFrom}
                  onChange={(e) => setGameFilter({...gameFilter, dateFrom: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Date To:</label>
                <input 
                  type="date" 
                  className="form-control"
                  value={gameFilter.dateTo}
                  onChange={(e) => setGameFilter({...gameFilter, dateTo: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Result:</label>
                <select 
                  className="form-control"
                  value={gameFilter.result}
                  onChange={(e) => setGameFilter({...gameFilter, result: e.target.value})}
                >
                  <option value="">All Results</option>
                  <option value="1-0">White Win</option>
                  <option value="0-1">Black Win</option>
                  <option value="1/2-1/2">Draw</option>
                </select>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button className="btn-primary" onClick={applyFilters}>Apply Filters</button>
              <button className="btn-secondary" onClick={resetFilters}>Reset</button>
            </div>
          </div>
        )}
        
        <div className="responsive-table-container">
          <table id="games-table" className="responsive-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>White Player</th>
                <th>Black Player</th>
                <th>Result</th>
                <th>White Elo Δ</th>
                <th>Black Elo Δ</th>
                <th>Verified</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {games.length > 0 &&
                games.map((game) => (
                  <tr key={game.id}>
                    <td data-label="Date">{formatDate(game.date)}</td>
                    <td data-label="White Player">{game.white_player_name}</td>
                    <td data-label="Black Player">{game.black_player_name}</td>
                    <td data-label="Result">{game.result}</td>
                    <td data-label="White Elo Δ">
                      {game.white_elo_change > 0 ? '+' : ''}{game.white_elo_change}
                    </td>
                    <td data-label="Black Elo Δ">
                      {game.black_elo_change > 0 ? '+' : ''}{game.black_elo_change}
                    </td>
                    <td data-label="Verified">{game.verified ? 'Yes' : 'No'}</td>
                    <td data-label="Actions">
                      <button 
                        className="btn-sm btn-danger"
                        onClick={() => handleDeleteGame(game.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          
          {games.length === 0 && (
            <p className="text-center">No games found.</p>
          )}
        </div>
      </div>
    );
  };
  
  // Render Player Management tab
  const renderPlayerManagement = () => {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Player Management</h2>
          
          <button 
            className="btn-admin"
            onClick={() => setShowAddPlayerForm(!showAddPlayerForm)}
          >
            {showAddPlayerForm ? 'Cancel' : 'Add New Player'}
          </button>
        </div>
        
        {showAddPlayerForm && (
          <div className="card">
            <h3>Add New Player</h3>
            <form onSubmit={handleCreatePlayer}>
              <div className="form-group">
                <label>Name:</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={newPlayer.name}
                  onChange={(e) => setNewPlayer({...newPlayer, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>PIN:</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={newPlayer.pin}
                  onChange={(e) => setNewPlayer({...newPlayer, pin: e.target.value})}
                  required
                  pattern="[0-9]{4}"
                  title="PIN must be 4 digits"
                  maxLength={4}
                />
              </div>
              
              <div className="form-group">
                <label>Initial Elo:</label>
                <input 
                  type="number" 
                  className="form-control"
                  value={newPlayer.initialElo}
                  onChange={(e) => setNewPlayer({...newPlayer, initialElo: parseInt(e.target.value, 10)})}
                  required
                  min={100}
                  max={3000}
                />
              </div>
              
              <div className="form-group">
                <label>
                  <input 
                    type="checkbox"
                    checked={newPlayer.isAdmin}
                    onChange={(e) => setNewPlayer({...newPlayer, isAdmin: e.target.checked})}
                  />
                  Administrator
                </label>
              </div>
              
              <button type="submit" className="btn-primary">Create Player</button>
            </form>
          </div>
        )}
        
        {editingPlayer && (
          <div className="card">
            <h3>Edit Player</h3>
            <form onSubmit={handleUpdatePlayer}>
              <div className="form-group">
                <label>Name:</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={editingPlayer.name}
                  onChange={(e) => setEditingPlayer({...editingPlayer, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>PIN:</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={editingPlayer.pin}
                  onChange={(e) => setEditingPlayer({...editingPlayer, pin: e.target.value})}
                  required
                  pattern="[0-9]{4}"
                  title="PIN must be 4 digits"
                  maxLength={4}
                />
              </div>
              
              <div className="form-group">
                <label>Current Elo:</label>
                <input 
                  type="number" 
                  className="form-control"
                  value={editingPlayer.elo}
                  onChange={(e) => setEditingPlayer({...editingPlayer, elo: parseInt(e.target.value, 10)})}
                  required
                  min={100}
                  max={3000}
                />
              </div>
              
              <div className="form-group">
                <label>
                  <input 
                    type="checkbox"
                    checked={editingPlayer.is_admin}
                    onChange={(e) => setEditingPlayer({...editingPlayer, is_admin: e.target.checked})}
                  />
                  Administrator
                </label>
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn-primary">Update Player</button>
                <button type="button" className="btn-secondary" onClick={() => setEditingPlayer(null)}>Cancel</button>
              </div>
            </form>
          </div>
        )}
        
        <div className="responsive-table-container">
          <table id="players-table" className="responsive-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Elo Rating</th>
                <th>Games Played</th>
                <th>Admin</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {players.length > 0 &&
                players.map((player) => (
                  <tr key={player.id}>
                    <td data-label="Name">{player.name}</td>
                    <td data-label="Elo Rating">{player.elo}</td>
                    <td data-label="Games Played">{player.games_played || 0}</td>
                    <td data-label="Admin">{player.is_admin ? 'Yes' : 'No'}</td>
                    <td data-label="Actions">
                      <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn-sm btn-primary"
                          onClick={() => setEditingPlayer(player)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn-sm btn-danger"
                          onClick={() => handleDeletePlayer(player.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          
          {players.length === 0 && (
            <p className="text-center">No players found.</p>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div>
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        
        <div className="admin-tabs">
          <button 
            className={`btn-tab ${activeTab === 'games' ? 'active' : ''}`}
            onClick={() => setActiveTab('games')}
          >
            Game Management
          </button>
          <button 
            className={`btn-tab ${activeTab === 'players' ? 'active' : ''}`}
            onClick={() => setActiveTab('players')}
          >
            Player Management
          </button>
        </div>
      </div>
      
      {error && (
        <div className="error">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {activeTab === 'games' && renderGameManagement()}
          {activeTab === 'players' && renderPlayerManagement()}
        </>
      )}
    </div>
  );
};

export default Admin;
