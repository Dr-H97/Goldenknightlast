import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useWebSocket } from '../context/WebSocketContext';
import '../styles/animations.css';
import '../styles/responsive-tables.css';
import '../styles/gamespage-fix.css';

const Games = () => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const { addMessageListener } = useWebSocket();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState('all');
  
  // Create a reusable fetchPlayers function with useCallback
  const fetchPlayers = useCallback(async () => {
    try {
      const response = await fetch('/api/players', {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setPlayers(data.players);
      } else {
        throw new Error(data.message || 'Failed to load players');
      }
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  }, []);
  
  // Create a reusable fetchGames function with useCallback
  const fetchGames = useCallback(async () => {
    try {
      setLoading(true);
      
      // Build query params
      const params = new URLSearchParams();
      params.append('sortBy', 'date');
      params.append('order', 'desc');
      
      // Add time filter
      if (timeFilter !== 'all') {
        // Log to debug filter value
        console.log(`Applying date filter: ${timeFilter}`);
        params.append('dateRange', timeFilter);
      }
      
      // Add player filter
      if (selectedPlayer !== 'all') {
        params.append('playerId', selectedPlayer);
      }
      
      const queryString = params.toString();
      console.log(`Fetching games with query: ${queryString}`);
      
      const response = await fetch(`/api/games?${queryString}`, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setGames(data.games);
        setError(''); // Clear any previous errors
      } else {
        throw new Error(data.message || 'Failed to load games');
      }
    } catch (error) {
      console.error('Error fetching games:', error);
      setError('Failed to load games. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [timeFilter, selectedPlayer]);
  
  // Initial fetch of players
  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);
  
  // Initial fetch of games when filters change
  useEffect(() => {
    fetchGames();
  }, [fetchGames]);
  
  // WebSocket listener for real-time updates
  useEffect(() => {
    // Add WebSocket listener
    const removeListener = addMessageListener((message) => {
      if (message.type === 'game') {
        // Game created, updated, or deleted
        console.log('WebSocket: Game list update needed due to game change', message);
        fetchGames();
      } else if (message.type === 'player') {
        // Player updated (might need to update the player list for filter)
        console.log('WebSocket: Player list update needed due to player change', message);
        fetchPlayers();
      }
    });
    
    return () => {
      // Clean up listener when component unmounts
      removeListener();
    };
  }, [addMessageListener, fetchGames, fetchPlayers]);
  
  const handleTimeFilterChange = (e) => {
    setTimeFilter(e.target.value);
  };
  
  const handlePlayerChange = (e) => {
    setSelectedPlayer(e.target.value);
  };
  
  const resetFilters = () => {
    setTimeFilter('all');
    setSelectedPlayer('all');
    console.log('Filters reset');
  };
  
  // Function to format the date with time
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const dateOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit' };
    
    return `${date.toLocaleDateString(undefined, dateOptions)} ${date.toLocaleTimeString(undefined, timeOptions)}`;
  };
  
  // Function to get player name by ID
  const getPlayerName = (playerId) => {
    const player = players.find(p => p.id === playerId);
    return player ? player.name : 'Unknown Player';
  };
  
  // Function to render game result
  const renderGameResult = (game) => {
    switch (game.result) {
      case '1-0':
        return 'White Win';
      case '0-1':
        return 'Black Win';
      case '1/2-1/2':
        return 'Draw';
      default:
        return game.result;
    }
  };
  
  // Function to render game result from player's perspective
  const renderPlayerResult = (game) => {
    // If player filter is active and not "all", show result from that player's perspective
    if (selectedPlayer !== 'all') {
      const playerId = parseInt(selectedPlayer);
      if (game.whitePlayerId === playerId) {
        // Current filter player played as White
        if (game.result === '1-0') return 'Win';
        if (game.result === '0-1') return 'Loss';
        return 'Draw';
      } else if (game.blackPlayerId === playerId) {
        // Current filter player played as Black
        if (game.result === '1-0') return 'Loss';
        if (game.result === '0-1') return 'Win';
        return 'Draw';
      }
    }
    
    // If no player filter or player not found in game, show raw result
    return renderGameResult(game);
  };
  
  if (loading) {
    return <div className="container">{t('loading')}</div>;
  }
  
  if (error) {
    return <div className="container error">{error}</div>;
  }
  
  return (
    <div className="container" style={{ paddingBottom: '100px' }}>
      <div style={{ marginBottom: '100px' }}>
        <h1 className="fade-in">{t('allGames') || 'All Games'}</h1>
        
        <div className="card slide-up" style={{ marginBottom: '20px' }}>
          <h3>{t('filterOptions') || 'Filter Options'}</h3>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '15px'
          }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '15px'
            }}>
              <div>
                <label htmlFor="timeRange">{t('timeRange') || 'Time Period'}: </label>
                <select 
                  id="timeRange" 
                  className="form-control"
                  value={timeFilter}
                  onChange={handleTimeFilterChange}
                  style={{ width: '100%' }}
                >
                  <option value="all">{t('allTime') || 'All Time'}</option>
                  <option value="last-week">{t('lastWeek') || 'Last Week'}</option>
                  <option value="last-month">{t('lastMonth') || 'Last Month'}</option>
                  <option value="last-year">{t('lastYear') || 'Last Year'}</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="playerFilter">{t('player') || 'Player'}: </label>
                <select 
                  id="playerFilter" 
                  className="form-control"
                  value={selectedPlayer}
                  onChange={handlePlayerChange}
                  style={{ width: '100%' }}
                >
                  <option value="all">{t('allPlayers') || 'All Players'}</option>
                  {players.map(player => (
                    <option key={player.id} value={player.id}>{player.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={resetFilters}
                className="btn-games chess-piece-hover"
              >
                {t('reset') || 'Reset'}
              </button>
            </div>
          </div>
        </div>
        
        <div className="card slide-up" style={{ marginTop: '20px', animationDelay: '0.2s', marginBottom: '100px' }}>
          <div style={{ textAlign: 'right', marginBottom: '10px' }}>
            <small>{t('totalGames') || 'Total Games'}: {games.length}</small>
          </div>
          
          <div className="table-responsive mobile-responsive-table" style={{ overflow: 'visible' }}>
            <table style={{ tableLayout: 'fixed', width: '100%', marginBottom: '50px' }}>
              <thead>
                <tr>
                  <th style={{ width: '30%' }}>{t('date') || 'Date'}</th>
                  <th style={{ width: '20%' }}>{t('white') || 'White'}</th>
                  <th style={{ width: '20%' }}>{t('black') || 'Black'}</th>
                  <th style={{ width: '15%' }}>{t('result') || 'Result'}</th>
                  {selectedPlayer !== 'all' && (
                    <th style={{ width: '15%' }}>{t('eloChange') || 'ELO Change'}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {games.map((game) => (
                  <tr key={game.id} className="staggered-item">
                    <td data-label={t('date') || 'Date'}>{formatDate(game.date)}</td>
                    <td data-label={t('white') || 'White'}>{getPlayerName(game.whitePlayerId)}</td>
                    <td data-label={t('black') || 'Black'}>{getPlayerName(game.blackPlayerId)}</td>
                    <td data-label={t('result') || 'Result'}>{renderPlayerResult(game)}</td>
                    {selectedPlayer !== 'all' && (
                      <td 
                        data-label={t('eloChange') || 'ELO Change'}
                        style={{ 
                          color: (() => {
                            const playerId = parseInt(selectedPlayer);
                            const eloChange = game.whitePlayerId === playerId 
                              ? game.whiteEloChange 
                              : game.blackPlayerId === playerId 
                                ? game.blackEloChange 
                                : 0;
                                
                            return eloChange > 0 
                              ? '#51cf66' 
                              : eloChange < 0 
                                ? '#ff6b6b' 
                                : 'inherit';
                          })()
                        }}>
                        {(() => {
                          const playerId = parseInt(selectedPlayer);
                          const eloChange = game.whitePlayerId === playerId 
                            ? game.whiteEloChange 
                            : game.blackPlayerId === playerId 
                              ? game.blackEloChange 
                              : 0;
                              
                          return eloChange > 0 ? `+${eloChange}` : eloChange;
                        })()}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {games.length === 0 && (
            <p className="text-center">{t('noGamesFound') || 'No games found with the selected filters.'}</p>
          )}
        </div>
        
        {/* Empty div to provide extra scroll space */}
        <div style={{ height: '100px' }}></div>
      </div>
    </div>
  );
};

export default Games;