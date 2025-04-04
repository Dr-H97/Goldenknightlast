import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

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
  
  // Fetch players
  useEffect(() => {
    fetchPlayers();
  }, []);
  
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
    return <div>Loading players...</div>;
  }
  
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Player Management</h2>
        <button 
          className="btn-primary"
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
            
            <button type="submit" className="btn-primary">
              Add Player
            </button>
          </form>
        </div>
      )}
      
      {/* Player List */}
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Current ELO</th>
              <th>Admin</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {players.map(player => (
              <tr key={player.id}>
                <td>{player.id}</td>
                <td>{player.name}</td>
                <td>{player.currentElo}</td>
                <td>{player.isAdmin ? 'Yes' : 'No'}</td>
                <td>
                  <button 
                    onClick={() => handleDeletePlayer(player.id, player.name)}
                    className="btn-danger"
                    style={{ padding: '5px 10px' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {players.length === 0 && (
          <p>No players found.</p>
        )}
      </div>
    </div>
  );
};

// Game Management Component
const GameManagement = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('all'); // all, verified, unverified
  
  // Fetch games
  useEffect(() => {
    fetchGames();
  }, [filter]);
  
  const fetchGames = async () => {
    try {
      setLoading(true);
      
      let url = '/api/games?sortBy=date&order=desc';
      if (filter === 'verified') {
        url += '&verified=true';
      } else if (filter === 'unverified') {
        url += '&verified=false';
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setGames(data.games);
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
  
  // Verify game
  const handleVerifyGame = async (gameId) => {
    try {
      const response = await fetch(`/api/games/${gameId}/verify`, {
        method: 'PUT',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Game verified successfully');
        fetchGames(); // Refresh game list
      } else {
        setError(data.message || 'Failed to verify game');
      }
    } catch (error) {
      console.error('Error verifying game:', error);
      setError('An error occurred while verifying the game');
    }
  };
  
  // Delete game
  const handleDeleteGame = async (gameId) => {
    if (!window.confirm('Are you sure you want to delete this game?')) {
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
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  if (loading && !games.length) {
    return <div>Loading games...</div>;
  }
  
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Game Management</h2>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className={`btn-secondary ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
            style={{ backgroundColor: filter === 'all' ? '#646cff' : '#868e96' }}
          >
            All Games
          </button>
          <button 
            className={`btn-secondary ${filter === 'verified' ? 'active' : ''}`}
            onClick={() => setFilter('verified')}
            style={{ backgroundColor: filter === 'verified' ? '#646cff' : '#868e96' }}
          >
            Verified
          </button>
          <button 
            className={`btn-secondary ${filter === 'unverified' ? 'active' : ''}`}
            onClick={() => setFilter('unverified')}
            style={{ backgroundColor: filter === 'unverified' ? '#646cff' : '#868e96' }}
          >
            Unverified
          </button>
        </div>
      </div>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      {/* Game List */}
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>White</th>
              <th>Black</th>
              <th>Result</th>
              <th>ELO Changes</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {games.map(game => (
              <tr key={game.id}>
                <td>{formatDate(game.date)}</td>
                <td>{game.whitePlayer?.name || 'Unknown'}</td>
                <td>{game.blackPlayer?.name || 'Unknown'}</td>
                <td>{game.result}</td>
                <td>
                  {game.whitePlayer?.name}: {game.whiteEloChange > 0 ? '+' : ''}{game.whiteEloChange}<br />
                  {game.blackPlayer?.name}: {game.blackEloChange > 0 ? '+' : ''}{game.blackEloChange}
                </td>
                <td>{game.verified ? 'Verified' : 'Pending'}</td>
                <td style={{ display: 'flex', gap: '5px' }}>
                  {!game.verified && (
                    <button 
                      onClick={() => handleVerifyGame(game.id)}
                      className="btn-success"
                      style={{ padding: '5px 10px' }}
                    >
                      Verify
                    </button>
                  )}
                  <button 
                    onClick={() => handleDeleteGame(game.id)}
                    className="btn-danger"
                    style={{ padding: '5px 10px' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {games.length === 0 && (
          <p>No games found.</p>
        )}
      </div>
    </div>
  );
};

export default Admin;