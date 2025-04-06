import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useWebSocket } from '../context/WebSocketContext';
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
import '../styles/animations.css';

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
  const { t } = useLanguage();
  const { addMessageListener } = useWebSocket();
  const [recentGames, setRecentGames] = useState([]);
  const [allGames, setAllGames] = useState([]);
  const [playerStats, setPlayerStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [eloChartData, setEloChartData] = useState(null);
  const [chartTimeRange, setChartTimeRange] = useState('all'); // all, month, threeMonths, sixMonths, year
  
  // Function to format the date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Build ELO history data for chart - using the formatDate function defined earlier
  const buildEloHistoryData = useCallback((games, timeRange) => {
    if (!games || games.length === 0 || !currentUser) return null;
    
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
          borderColor: '#d6b26d',
          backgroundColor: 'rgba(214, 178, 109, 0.2)',
          tension: 0.3,
          pointBackgroundColor: '#d6b26d',
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    };
  }, [currentUser]);
  
  // Update chart data when time range changes
  useEffect(() => {
    if (allGames.length > 0) {
      setEloChartData(buildEloHistoryData(allGames, chartTimeRange));
    }
  }, [chartTimeRange, allGames, currentUser]);
  
  // This useEffect was replaced by the combination of fetchDashboardData as a useCallback
  // and the WebSocket listener effect above. The initial data fetch is now done
  // in a separate useEffect that depends on the fetchDashboardData callback.
  
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
  
  // Function to fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      // Fetch player's games
      const gamesResponse = await fetch(`/api/games?playerId=${currentUser.id}&sortBy=date&order=asc`, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!gamesResponse.ok) {
        throw new Error(`HTTP error! Status: ${gamesResponse.status}`);
      }
      
      const gamesData = await gamesResponse.json();
      
      if (gamesData.success) {
        // Set all games sorted by date (ascending)
        const sortedGames = gamesData.games.sort((a, b) => new Date(a.date) - new Date(b.date));
        setAllGames(sortedGames);
        
        // Set recent games (most recent 5 games)
        setRecentGames(sortedGames.slice(-5).reverse());
        
        // Build chart data
        setEloChartData(buildEloHistoryData(sortedGames, chartTimeRange));
        
        // Calculate most played opponent
        const opponentCounts = {};
        sortedGames.forEach(game => {
          const opponentId = game.whitePlayerId === currentUser.id ? game.blackPlayerId : game.whitePlayerId;
          const opponentName = game.whitePlayerId === currentUser.id ? game.blackPlayer?.name : game.whitePlayer?.name;
          
          if (opponentId && opponentName) {
            const key = `${opponentId}-${opponentName}`;
            opponentCounts[key] = (opponentCounts[key] || 0) + 1;
          }
        });
        
        // Find the most played opponent
        let mostPlayedOpponent = null;
        let highestCount = 0;
        
        Object.entries(opponentCounts).forEach(([key, count]) => {
          if (count > highestCount) {
            highestCount = count;
            mostPlayedOpponent = key.split('-')[1]; // Get the opponent name
          }
        });
        
        // Calculate win rates with white and black
        const gamesAsWhite = sortedGames.filter(game => game.whitePlayerId === currentUser.id);
        const winsAsWhite = gamesAsWhite.filter(game => game.result === '1-0').length;
        const winRateAsWhite = gamesAsWhite.length > 0 
          ? Math.round((winsAsWhite / gamesAsWhite.length) * 100) 
          : 0;
          
        const gamesAsBlack = sortedGames.filter(game => game.blackPlayerId === currentUser.id);
        const winsAsBlack = gamesAsBlack.filter(game => game.result === '0-1').length;
        const winRateAsBlack = gamesAsBlack.length > 0 
          ? Math.round((winsAsBlack / gamesAsBlack.length) * 100) 
          : 0;
        
        // Set player statistics
        setPlayerStats({
          totalGames: sortedGames.length,
          currentElo: currentUser.currentElo || currentUser.initialElo,
          wins: sortedGames.filter(game => 
            (game.whitePlayerId === currentUser.id && game.result === '1-0') || 
            (game.blackPlayerId === currentUser.id && game.result === '0-1')
          ).length,
          losses: sortedGames.filter(game => 
            (game.whitePlayerId === currentUser.id && game.result === '0-1') || 
            (game.blackPlayerId === currentUser.id && game.result === '1-0')
          ).length,
          draws: sortedGames.filter(game => game.result === '1/2-1/2').length,
          mostPlayedOpponent,
          gamesWithMostPlayed: mostPlayedOpponent ? highestCount : 0,
          winRateAsWhite,
          winRateAsBlack,
          gamesAsWhite: gamesAsWhite.length,
          gamesAsBlack: gamesAsBlack.length
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(`Failed to load dashboard data: ${error.message || 'Unknown error'}. Please try again later.`);
      setLoading(false);
    }
  }, [currentUser, chartTimeRange]);
  
  // Set up WebSocket listener for real-time updates
  useEffect(() => {
    // Listen for WebSocket messages
    const removeListener = addMessageListener((message) => {
      if (message.type === 'game' && (
          message.data.whitePlayerId === currentUser.id || 
          message.data.blackPlayerId === currentUser.id
        )) {
        console.log('WebSocket: Game update affecting current user', message);
        fetchDashboardData();
      } else if (message.type === 'player' && message.data.id === currentUser.id) {
        console.log('WebSocket: Player update for current user', message);
        fetchDashboardData();
      }
    });
    
    return () => {
      // Clean up the listener when component unmounts
      removeListener();
    };
  }, [currentUser, addMessageListener, fetchDashboardData]);
  
  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);
  
  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70vh' }}>
        <div className="loading-knight"></div>
        <p style={{ marginTop: '20px' }}>{t('loading')}</p>
      </div>
    );
  }
  
  if (error) {
    return <div className="container error">{error}</div>;
  }
  
  return (
    <div className="container">
      <h1 className="fade-in">{t('welcomeBack')}, <span className="highlight">{currentUser.name}</span>!</h1>
      
      <div className="dashboard-grid">
        {/* Player Stats Section */}
        <div className="card slide-up">
          <h2>{t('Statistics')}</h2>
          {playerStats && (
            <div>
              <p><strong>{t('currentElo')}:</strong> {playerStats.currentElo}</p>
              <p><strong>{t('totalGames')}:</strong> {playerStats.totalGames}</p>
              <p><strong>{t('record')}:</strong> {playerStats.wins}W - {playerStats.losses}L - {playerStats.draws}D</p>
              
              <div style={{ marginTop: '1rem' }}>
                <Link to="/profile">
                  <button className="button">{t('viewProfile')}</button>
                </Link>
              </div>
            </div>
          )}
        </div>
        
        {/* Recent Games Section */}
        <div className="card slide-up" style={{ animationDelay: '0.1s' }}>
          <h2>{t('Recent Games')}</h2>
          {recentGames.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>{t('Date')}</th>
                  <th>{t('Opponent')}</th>
                  <th>{t('Result')}</th>
                  <th>{t('ELO Change')}</th>
                </tr>
              </thead>
              <tbody>
                {recentGames.map((game, index) => (
                  <tr key={game.id} className="staggered-item">
                    <td>{formatDate(game.date)}</td>
                    <td className="highlight">{renderOpponent(game)}</td>
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
            <p className="text-secondary">{t('noGamesYet')}</p>
          )}
          
          <div style={{ marginTop: '1rem' }}>
            <Link to="/submit-game">
              <button className="button chess-piece-hover">{t('Submit New Game')}</button>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="section-divider"></div>
      
      {/* Detailed Statistics Section */}
      {playerStats && playerStats.totalGames > 0 && (
        <div className="card slide-up" style={{ animationDelay: '0.2s' }}>
          <h2>{t('statisticsDetailed')}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {/* Most Played Opponent */}
            <div className="stat-card staggered-item">
              <h3>{t('mostPlayedOpponent')}</h3>
              {playerStats.mostPlayedOpponent ? (
                <div>
                  <p className="stat-highlight">{playerStats.mostPlayedOpponent}</p>
                  <p className="text-secondary">{t('playedXGames').replace('X', playerStats.gamesWithMostPlayed)}</p>
                </div>
              ) : (
                <p className="text-secondary">No games played yet</p>
              )}
            </div>
            
            {/* Win Rate with White */}
            <div className="stat-card staggered-item">
              <h3>{t('winRateWhite')}</h3>
              {playerStats.gamesAsWhite > 0 ? (
                <div>
                  <p className="stat-highlight">{playerStats.winRateAsWhite}%</p>
                  <p className="text-secondary">{t('fromXGames').replace('X', playerStats.gamesAsWhite)}</p>
                </div>
              ) : (
                <p className="text-secondary">No games played as White</p>
              )}
            </div>
            
            {/* Win Rate with Black */}
            <div className="stat-card staggered-item">
              <h3>{t('winRateBlack')}</h3>
              {playerStats.gamesAsBlack > 0 ? (
                <div>
                  <p className="stat-highlight">{playerStats.winRateAsBlack}%</p>
                  <p className="text-secondary">{t('fromXGames').replace('X', playerStats.gamesAsBlack)}</p>
                </div>
              ) : (
                <p className="text-secondary">No games played as Black</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* ELO Rating History Chart */}
      <div className="card slide-up" style={{ animationDelay: '0.3s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>{t('ELO History')}</h2>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              className={`btn-sm ${chartTimeRange === 'all' ? 'button' : 'button-neutral'}`}
              onClick={() => setChartTimeRange('all')}
            >
              {t('All Time')}
            </button>
            <button 
              className={`btn-sm ${chartTimeRange === 'year' ? 'button' : 'button-neutral'}`}
              onClick={() => setChartTimeRange('year')}
            >
              {t('One Year')}
            </button>
            <button 
              className={`btn-sm ${chartTimeRange === 'sixMonths' ? 'button' : 'button-neutral'}`}
              onClick={() => setChartTimeRange('sixMonths')}
            >
              {t('Six Months')}
            </button>
            <button 
              className={`btn-sm ${chartTimeRange === 'threeMonths' ? 'button' : 'button-neutral'}`}
              onClick={() => setChartTimeRange('threeMonths')}
            >
              {t('Three Months')}
            </button>
            <button 
              className={`btn-sm ${chartTimeRange === 'month' ? 'button' : 'button-neutral'}`}
              onClick={() => setChartTimeRange('month')}
            >
              {t('One Month')}
            </button>
          </div>
        </div>
        
        {eloChartData ? (
          <div style={{ height: '300px', marginTop: '1.5rem' }} className="fade-in chart-container">
            <Line 
              data={eloChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                  duration: 1000,
                  easing: 'easeInOutQuart'
                },
                scales: {
                  y: {
                    beginAtZero: false,
                    title: {
                      display: true,
                      text: 'ELO Rating',
                      font: {
                        size: 14
                      }
                    },
                    ticks: {
                      font: {
                        size: 12
                      }
                    }
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Date',
                      font: {
                        size: 14
                      }
                    },
                    ticks: {
                      font: {
                        size: 12
                      }
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
          <p className="text-secondary" style={{ margin: '2.5rem 0', textAlign: 'center' }}>
            {allGames.length === 0 
              ? t('No games available for the chart')
              : t('No games in the selected time range')}
          </p>
        )}
      </div>
      
      {/* View All Games Button */}
      <div className="card slide-up" style={{ animationDelay: '0.4s' }}>
        <h2>{t('All Games')}</h2>
        <p className="text-secondary">{t('gamesDescription') || 'Browse all games played in the club. Filter games by time period or by player.'}</p>
        <Link to="/games">
          <button className="button-neutral chess-piece-hover">{t('View All Games')}</button>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;