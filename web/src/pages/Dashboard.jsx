import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [recentGames, setRecentGames] = useState([]);
  const [allGames, setAllGames] = useState([]);
  const [playerStats, setPlayerStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [eloChartData, setEloChartData] = useState(null);
  const [chartTimeRange, setChartTimeRange] = useState('all'); // all, month, threeMonths, sixMonths, year
  
  // Build ELO history data for chart
  const buildEloHistoryData = (games, timeRange) => {
    if (!games || games.length === 0) return null;
    
    // Sort games by date (ascending)
    let sortedGames = [...games].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Filter based on time range
    const now = new Date();
    if (timeRange === 'month') {
      const lastMonth = new Date(now);
      lastMonth.setMonth(now.getMonth() - 1);
      sortedGames = sortedGames.filter(game => new Date(game.date) >= lastMonth);
    } else if (timeRange === 'threeMonths') {
      const lastThreeMonths = new Date(now);
      lastThreeMonths.setMonth(now.getMonth() - 3);
      sortedGames = sortedGames.filter(game => new Date(game.date) >= lastThreeMonths);
    } else if (timeRange === 'sixMonths') {
      const lastSixMonths = new Date(now);
      lastSixMonths.setMonth(now.getMonth() - 6);
      sortedGames = sortedGames.filter(game => new Date(game.date) >= lastSixMonths);
    } else if (timeRange === 'year') {
      const lastYear = new Date(now);
      lastYear.setFullYear(now.getFullYear() - 1);
      sortedGames = sortedGames.filter(game => new Date(game.date) >= lastYear);
    }
    
    // If after filtering there are no games, return null
    if (sortedGames.length === 0) return null;
    
    // Start with initial ELO rating
    let initialElo = currentUser.initialElo || 1200;
    const initialDate = new Date(sortedGames[0].date);
    initialDate.setDate(initialDate.getDate() - 1); // Set one day before first game
    
    // Create data points starting with initial rating
    const labels = [formatDate(initialDate)];
    const data = [initialElo];
    
    // Add a data point for each game
    let currentElo = initialElo;
    sortedGames.forEach(game => {
      // Calculate new ELO based on the game
      const eloChange = game.whitePlayerId === currentUser.id ? game.whiteEloChange : game.blackEloChange;
      currentElo += eloChange;
      
      // Add data point
      labels.push(formatDate(game.date));
      data.push(currentElo);
    });
    
    return {
      labels,
      datasets: [
        {
          label: 'ELO Rating',
          data,
          borderColor: '#646cff',
          backgroundColor: 'rgba(100, 108, 255, 0.2)',
          tension: 0.3,
          pointBackgroundColor: '#646cff',
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    };
  };
  
  // Update chart data when time range changes
  useEffect(() => {
    if (allGames.length > 0) {
      setEloChartData(buildEloHistoryData(allGames, chartTimeRange));
    }
  }, [chartTimeRange, allGames, currentUser]);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch player's games
        const gamesResponse = await fetch(`/api/games?playerId=${currentUser.id}&sortBy=date&order=asc`);
        const gamesData = await gamesResponse.json();
        
        if (gamesData.success) {
          // Set all games sorted by date (ascending)
          const sortedGames = gamesData.games.sort((a, b) => new Date(a.date) - new Date(b.date));
          setAllGames(sortedGames);
          
          // Set recent games (most recent 5 games)
          setRecentGames(sortedGames.slice(-5).reverse());
          
          // Build chart data
          setEloChartData(buildEloHistoryData(sortedGames, chartTimeRange));
          
          // Set player statistics
          setPlayerStats({
            totalGames: sortedGames.length,
            currentElo: currentUser.currentElo,
            wins: sortedGames.filter(game => 
              (game.whitePlayerId === currentUser.id && game.result === '1-0') || 
              (game.blackPlayerId === currentUser.id && game.result === '0-1')
            ).length,
            losses: sortedGames.filter(game => 
              (game.whitePlayerId === currentUser.id && game.result === '0-1') || 
              (game.blackPlayerId === currentUser.id && game.result === '1-0')
            ).length,
            draws: sortedGames.filter(game => game.result === '1/2-1/2').length
          });
        }
        
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
                      {/* Correctly prefix + sign when positive */}
                      {(game.whitePlayerId === currentUser.id ? game.whiteEloChange : game.blackEloChange) > 0 ? '+' : ''}
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
      
      {/* ELO Rating History Chart */}
      <div className="card" style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>ELO Rating History</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className={`btn-sm ${chartTimeRange === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setChartTimeRange('all')}
              style={{ padding: '4px 8px', fontSize: '0.8rem' }}
            >
              All Time
            </button>
            <button 
              className={`btn-sm ${chartTimeRange === 'year' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setChartTimeRange('year')}
              style={{ padding: '4px 8px', fontSize: '0.8rem' }}
            >
              1 Year
            </button>
            <button 
              className={`btn-sm ${chartTimeRange === 'sixMonths' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setChartTimeRange('sixMonths')}
              style={{ padding: '4px 8px', fontSize: '0.8rem' }}
            >
              6 Months
            </button>
            <button 
              className={`btn-sm ${chartTimeRange === 'threeMonths' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setChartTimeRange('threeMonths')}
              style={{ padding: '4px 8px', fontSize: '0.8rem' }}
            >
              3 Months
            </button>
            <button 
              className={`btn-sm ${chartTimeRange === 'month' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setChartTimeRange('month')}
              style={{ padding: '4px 8px', fontSize: '0.8rem' }}
            >
              1 Month
            </button>
          </div>
        </div>
        
        {eloChartData ? (
          <div style={{ height: '300px', marginTop: '20px' }}>
            <Line 
              data={eloChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: false,
                    title: {
                      display: true,
                      text: 'ELO Rating'
                    }
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Date'
                    }
                  }
                },
                plugins: {
                  tooltip: {
                    callbacks: {
                      title: (context) => {
                        return `Date: ${context[0].label}`;
                      },
                      label: (context) => {
                        return `ELO: ${context.parsed.y}`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        ) : (
          <p style={{ margin: '40px 0', textAlign: 'center' }}>
            {allGames.length === 0 
              ? 'No games played yet to build ELO history chart.'
              : 'No games found in the selected time range.'}
          </p>
        )}
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