import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import '../styles/animations.css';

const Games = () => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState('all');
  
  useEffect(() => {
    // Fetch players for the filter dropdown
    const fetchPlayers = async () => {
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
    };
    
    fetchPlayers();
  }, []);
  
  useEffect(() => {
    fetchGames();
  }, [timeFilter, selectedPlayer]);
  
  const fetchGames = async () => {
    try {
      setLoading(true);
      
      // Build query params
      const params = new URLSearchParams();
      params.append('sortBy', 'date');
      params.append('order', 'desc');
      
      // Add time filter
      if (timeFilter !== 'all') {
        params.append('dateRange', timeFilter);
      }
      
      // Add player filter
      if (selectedPlayer !== 'all') {
        params.append('playerId', selectedPlayer);
      }
      
      const response = await fetch(`/api/games?${params.toString()}`, {
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
  };
  
  const handleTimeFilterChange = (e) => {
    setTimeFilter(e.target.value);
  };
  
  const handlePlayerChange = (e) => {
    setSelectedPlayer(e.target.value);
  };
  
  const resetFilters = () => {
    setTimeFilter('all');
    setSelectedPlayer('all');
  };
  
  // Function to format the date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
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
    <div className="container">
      <h1 className="fade-in">{t('allGames') || 'All Games'}</h1>
      
      <div className="card slide-up" style={{ marginBottom: '20px' }}>
        <h3>{t('filterOptions') || 'Filter Options'}</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div>
              <label htmlFor="timeRange">{t('timeRange') || 'Time Period'}: </label>
              <select 
                id="timeRange" 
                className="form-control"
                value={timeFilter}
                onChange={handleTimeFilterChange}
                style={{ minWidth: '180px' }}
              >
                <option value="all">{t('allTime') || 'All Time'}</option>
                <option value="week">{t('lastWeek') || 'Last Week'}</option>
                <option value="month">{t('lastMonth') || 'Last Month'}</option>
                <option value="year">{t('lastYear') || 'Last Year'}</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="playerFilter">{t('player') || 'Player'}: </label>
              <select 
                id="playerFilter" 
                className="form-control"
                value={selectedPlayer}
                onChange={handlePlayerChange}
                style={{ minWidth: '180px' }}
              >
                <option value="all">{t('allPlayers') || 'All Players'}</option>
                {players.map(player => (
                  <option key={player.id} value={player.id}>{player.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <button 
            onClick={resetFilters}
            className="btn-secondary chess-piece-hover"
          >
            {t('reset') || 'Reset'}
          </button>
        </div>
      </div>
      
      <div className="card slide-up" style={{ marginTop: '20px', animationDelay: '0.2s' }}>
        <div style={{ textAlign: 'right', marginBottom: '10px' }}>
          <small>{t('totalGames') || 'Total Games'}: {games.length}</small>
        </div>
        
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>{t('date') || 'Date'}</th>
                <th>{t('white') || 'White'}</th>
                <th>{t('black') || 'Black'}</th>
                <th>{t('result') || 'Result'}</th>
                {selectedPlayer !== 'all' && (
                  <th>{t('eloChange') || 'ELO Change'}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {games.map((game) => (
                <tr key={game.id} className="staggered-item">
                  <td>{formatDate(game.date)}</td>
                  <td>{getPlayerName(game.whitePlayerId)}</td>
                  <td>{getPlayerName(game.blackPlayerId)}</td>
                  <td>{renderPlayerResult(game)}</td>
                  {selectedPlayer !== 'all' && (
                    <td style={{ 
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
    </div>
  );
};

export default Games;