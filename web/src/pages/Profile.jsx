import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { currentUser } = useAuth();
  const [gameHistory, setGameHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showChangePinForm, setShowChangePinForm] = useState(false);
  const [pinData, setPinData] = useState({
    currentPin: '',
    newPin: '',
    confirmPin: ''
  });
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState('');
  
  useEffect(() => {
    fetchGameHistory();
  }, [currentUser]);
  
  const fetchGameHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/games?playerId=${currentUser.id}&sortBy=date&order=desc`);
      const data = await response.json();
      
      if (data.success) {
        setGameHistory(data.games);
      } else {
        setError(data.message || 'Failed to load game history');
      }
    } catch (error) {
      console.error('Error fetching game history:', error);
      setError('Failed to load game history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePinChange = (e) => {
    const { name, value } = e.target;
    setPinData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmitPinChange = async (e) => {
    e.preventDefault();
    
    // Reset messages
    setPinError('');
    setPinSuccess('');
    
    // Validate inputs
    if (!pinData.currentPin || !pinData.newPin || !pinData.confirmPin) {
      setPinError('All fields are required');
      return;
    }
    
    if (pinData.newPin !== pinData.confirmPin) {
      setPinError('New PIN and Confirm PIN must match');
      return;
    }
    
    if (pinData.newPin.length < 4) {
      setPinError('PIN must be at least 4 characters long');
      return;
    }
    
    try {
      // First verify the current PIN
      const verifyResponse = await fetch('/api/auth/verify-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId: currentUser.id,
          pin: pinData.currentPin
        }),
      });
      
      const verifyData = await verifyResponse.json();
      
      if (!verifyData.success) {
        setPinError('Current PIN is incorrect');
        return;
      }
      
      // Then update the PIN
      const updateResponse = await fetch(`/api/players/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pin: pinData.newPin
        }),
      });
      
      const updateData = await updateResponse.json();
      
      if (updateData.success) {
        setPinSuccess('PIN updated successfully');
        setPinData({
          currentPin: '',
          newPin: '',
          confirmPin: ''
        });
        setShowChangePinForm(false);
      } else {
        setPinError(updateData.message || 'Failed to update PIN');
      }
    } catch (error) {
      console.error('Error updating PIN:', error);
      setPinError('An error occurred while updating PIN');
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Determine result from player's perspective
  const getGameResult = (game) => {
    if (game.whitePlayerId === currentUser.id) {
      if (game.result === '1-0') return 'Win';
      if (game.result === '0-1') return 'Loss';
      return 'Draw';
    } else {
      if (game.result === '1-0') return 'Loss';
      if (game.result === '0-1') return 'Win';
      return 'Draw';
    }
  };
  
  // Get opponent name
  const getOpponentName = (game) => {
    return game.whitePlayerId === currentUser.id ? 
      game.blackPlayer?.name : game.whitePlayer?.name;
  };
  
  // Get ELO change from player's perspective
  const getEloChange = (game) => {
    return game.whitePlayerId === currentUser.id ? 
      game.whiteEloChange : game.blackEloChange;
  };
  
  // Calculate stats
  const calculateStats = () => {
    if (!gameHistory.length) return { wins: 0, losses: 0, draws: 0, totalGames: 0, winRate: 0 };
    
    const wins = gameHistory.filter(game => getGameResult(game) === 'Win').length;
    const draws = gameHistory.filter(game => getGameResult(game) === 'Draw').length;
    const totalGames = gameHistory.length;
    
    return {
      wins,
      losses: totalGames - wins - draws,
      draws,
      totalGames,
      winRate: totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0
    };
  };
  
  const stats = calculateStats();
  
  if (loading && !gameHistory.length) {
    return <div className="container">Loading profile...</div>;
  }
  
  return (
    <div className="container">
      <h1>Player Profile</h1>
      
      {error && <div className="error">{error}</div>}
      {pinSuccess && <div className="success">{pinSuccess}</div>}
      
      <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
        {/* Player Info */}
        <div className="card">
          <h2>Player Information</h2>
          
          <p><strong>Name:</strong> {currentUser.name}</p>
          <p><strong>Current ELO:</strong> {currentUser.currentElo}</p>
          <p><strong>Account Type:</strong> {currentUser.isAdmin ? 'Admin' : 'Player'}</p>
          
          <button 
            onClick={() => setShowChangePinForm(!showChangePinForm)}
            className="btn-secondary"
            style={{ marginTop: '10px' }}
          >
            {showChangePinForm ? 'Cancel' : 'Change PIN'}
          </button>
          
          {showChangePinForm && (
            <form onSubmit={handleSubmitPinChange} style={{ marginTop: '15px' }}>
              {pinError && <div className="error">{pinError}</div>}
              
              <div className="form-group">
                <label htmlFor="currentPin">Current PIN</label>
                <input
                  type="password"
                  id="currentPin"
                  name="currentPin"
                  className="form-control"
                  value={pinData.currentPin}
                  onChange={handlePinChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="newPin">New PIN</label>
                <input
                  type="password"
                  id="newPin"
                  name="newPin"
                  className="form-control"
                  value={pinData.newPin}
                  onChange={handlePinChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPin">Confirm New PIN</label>
                <input
                  type="password"
                  id="confirmPin"
                  name="confirmPin"
                  className="form-control"
                  value={pinData.confirmPin}
                  onChange={handlePinChange}
                  required
                />
              </div>
              
              <button type="submit" className="btn-primary">
                Update PIN
              </button>
            </form>
          )}
        </div>
        
        {/* Player Stats */}
        <div className="card">
          <h2>Statistics</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
            <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#1a1a1a', borderRadius: '5px' }}>
              <h3 style={{ margin: '0 0 5px 0' }}>{stats.wins}</h3>
              <p style={{ margin: 0 }}>Wins</p>
            </div>
            
            <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#1a1a1a', borderRadius: '5px' }}>
              <h3 style={{ margin: '0 0 5px 0' }}>{stats.losses}</h3>
              <p style={{ margin: 0 }}>Losses</p>
            </div>
            
            <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#1a1a1a', borderRadius: '5px' }}>
              <h3 style={{ margin: '0 0 5px 0' }}>{stats.draws}</h3>
              <p style={{ margin: 0 }}>Draws</p>
            </div>
          </div>
          
          <p><strong>Total Games:</strong> {stats.totalGames}</p>
          <p><strong>Win Rate:</strong> {stats.winRate}%</p>
        </div>
      </div>
      
      {/* Game History */}
      <div className="card" style={{ marginTop: '20px' }}>
        <h2>Game History</h2>
        
        {gameHistory.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Opponent</th>
                <th>Color</th>
                <th>Result</th>
                <th>ELO Change</th>
              </tr>
            </thead>
            <tbody>
              {gameHistory.map(game => (
                <tr key={game.id}>
                  <td>{formatDate(game.date)}</td>
                  <td>{getOpponentName(game)}</td>
                  <td>{game.whitePlayerId === currentUser.id ? 'White' : 'Black'}</td>
                  <td>{getGameResult(game)}</td>
                  <td style={{ 
                    color: getEloChange(game) > 0 
                      ? '#51cf66' 
                      : getEloChange(game) < 0 
                        ? '#ff6b6b' 
                        : 'inherit'
                  }}>
                    {getEloChange(game) > 0 ? '+' : ''}
                    {getEloChange(game)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No game history found.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;