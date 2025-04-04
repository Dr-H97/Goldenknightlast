import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [recentGames, setRecentGames] = useState([]);
  const [playerStats, setPlayerStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch player's recent games
        const gamesResponse = await fetch(`/api/games?playerId=${currentUser.id}&sortBy=date&order=desc`);
        const gamesData = await gamesResponse.json();
        
        if (gamesData.success) {
          setRecentGames(gamesData.games.slice(0, 5)); // Get only the 5 most recent games
        }
        
        // Fetch player statistics (just using the player data for now)
        setPlayerStats({
          totalGames: gamesData.games.length,
          currentElo: currentUser.currentElo,
          wins: gamesData.games.filter(game => 
            (game.whitePlayerId === currentUser.id && game.result === '1-0') || 
            (game.blackPlayerId === currentUser.id && game.result === '0-1')
          ).length,
          losses: gamesData.games.filter(game => 
            (game.whitePlayerId === currentUser.id && game.result === '0-1') || 
            (game.blackPlayerId === currentUser.id && game.result === '1-0')
          ).length,
          draws: gamesData.games.filter(game => game.result === '1/2-1/2').length
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [currentUser]);
  
  // Function to format the date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Function to render game result from player's perspective
  const renderPlayerResult = (game) => {
    if (game.whitePlayerId === currentUser.id) {
      // Current player played as White
      if (game.result === '1-0') return 'Win';
      if (game.result === '0-1') return 'Loss';
      return 'Draw';
    } else {
      // Current player played as Black
      if (game.result === '1-0') return 'Loss';
      if (game.result === '0-1') return 'Win';
      return 'Draw';
    }
  };
  
  // Function to render opponent name
  const renderOpponent = (game) => {
    return game.whitePlayerId === currentUser.id ? game.blackPlayer?.name : game.whitePlayer?.name;
  };
  
  if (loading) {
    return <div className="container">Loading dashboard data...</div>;
  }
  
  if (error) {
    return <div className="container error">{error}</div>;
  }
  
  return (
    <div className="container">
      <h1>Welcome, {currentUser.name}!</h1>
      
      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Player Stats Section */}
        <div className="card">
          <h2>Your Statistics</h2>
          {playerStats && (
            <div>
              <p><strong>Current ELO Rating:</strong> {playerStats.currentElo}</p>
              <p><strong>Total Games:</strong> {playerStats.totalGames}</p>
              <p><strong>Record:</strong> {playerStats.wins}W - {playerStats.losses}L - {playerStats.draws}D</p>
              
              <div style={{ marginTop: '10px' }}>
                <Link to="/profile">
                  <button className="btn-primary">View Full Profile</button>
                </Link>
              </div>
            </div>
          )}
        </div>
        
        {/* Recent Games Section */}
        <div className="card">
          <h2>Recent Games</h2>
          {recentGames.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Opponent</th>
                  <th>Result</th>
                  <th>ELO Change</th>
                </tr>
              </thead>
              <tbody>
                {recentGames.map(game => (
                  <tr key={game.id}>
                    <td>{formatDate(game.date)}</td>
                    <td>{renderOpponent(game)}</td>
                    <td>{renderPlayerResult(game)}</td>
                    <td style={{ 
                      color: (game.whitePlayerId === currentUser.id ? game.whiteEloChange : game.blackEloChange) > 0 
                        ? '#51cf66' 
                        : (game.whitePlayerId === currentUser.id ? game.whiteEloChange : game.blackEloChange) < 0 
                          ? '#ff6b6b' 
                          : 'inherit'
                    }}>
                      {game.whitePlayerId === currentUser.id ? game.whiteEloChange : game.blackEloChange > 0 ? '+' : ''}
                      {game.whitePlayerId === currentUser.id ? game.whiteEloChange : game.blackEloChange}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No games played yet.</p>
          )}
          
          <div style={{ marginTop: '10px' }}>
            <Link to="/submit-game">
              <button className="btn-primary">Submit New Game</button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Club Rankings Preview */}
      <div className="card" style={{ marginTop: '20px' }}>
        <h2>Club Rankings</h2>
        <p>View the current rankings of all club members and see where you stand.</p>
        <Link to="/rankings">
          <button className="btn-secondary">View Rankings</button>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;