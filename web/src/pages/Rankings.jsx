import React, { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import { Link } from 'react-router-dom';
import '../styles/animations.css';
import '../styles/leaderboard.css';
import '../styles/responsive-tables.css';
import logo from '../assets/logo.svg';
import PlayerSilhouette from '../assets/player-silhouette';

// Chess piece SVG icons
const ChessPiece = ({ rank }) => {
  // Different piece based on rank tier
  if (rank === 0) return <KnightPiece />;
  if (rank === 1) return <QueenPiece />;
  if (rank === 2) return <RookPiece />;
  if (rank < 10) return <BishopPiece />;
  return <PawnPiece />;
};

const KnightPiece = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="chess-piece-icon">
    <path d="M11.4 3C9.6 3 8.4 4.05 8.4 5.7C8.4 6.45 8.7 7.05 9.3 7.5C8.7 7.8 8.1 8.25 7.5 8.7C6.9 9.15 6.3 9.75 5.7 10.5C4.8 11.7 3.9 13.35 3 15.5C2.7 16.5 2.85 17.4 3.6 18C4.35 18.6 5.1 18.75 6 18.75H18.3V17.25H6C5.7 17.25 5.4 17.2 5.1 17.05C4.8 16.9 4.5 16.55 4.5 16.1C5.4 14 6 12.5 6.9 11.5C7.2 11.05 7.5 10.65 7.8 10.35C8.4 9.75 9 9.15 9.6 8.85C9.9 9.45 10.2 9.9 10.5 10.35C10.8 10.8 11.1 11.25 11.4 11.8C11.1 11.95 10.8 12.25 10.65 12.55C10.5 12.85 10.5 13.15 10.5 13.5C10.5 14 10.75 14.5 11 14.8C11.25 15.1 11.65 15.4 12.3 15.4C12.95 15.4 13.4 15.2 13.7 14.8C14 14.4 14.1 13.9 14.1 13.5C14.1 13.1 14 12.75 13.8 12.5C13.5 12.2 13.2 12 12.9 11.85C12.6 11.25 12.3 10.8 12 10.35C11.7 9.9 11.4 9.45 11.1 8.85H12.3C12.6 8.85 12.9 8.8 13.2 8.75C13.8 8.6 14.4 8.4 15 8.1C15.9 7.8 16.5 7.2 16.8 6.45C17.1 5.7 17.1 4.9 17.1 4.25V4.2C17.1 3.75 16.8 3.4 16.5 3.4H11.4V3ZM11.4 4.5H16.5C16.5 5.05 16.35 5.5 16.2 5.8C16.05 6.1 15.9 6.25 15.3 6.4C14.7 6.6 14.25 6.75 13.8 6.85C13.35 6.95 13.05 7 13.2 7H12.3C11.55 7 10.95 6.8 10.5 6.65C10.2 6.5 10.2 6.2 10.2 5.75C10.2 5 10.8 4.5 11.7 4.5H11.4ZM12.3 13.5C12.3 13.65 12.3 13.8 12.3 13.8C12.3 13.8 12.3 14.1 12.3 14.1C12.3 14.1 12.3 14.1 12.3 14.1C12.3 14.1 12.3 14.1 12.3 14.1C12.3 14.1 12.3 14.1 12.3 14.1C12.3 14.1 12.3 14.1 12.3 14.1C12.3 14.1 12.3 14.1 12.3 13.5Z" fill="currentColor"/>
  </svg>
);

const QueenPiece = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="chess-piece-icon">
    <path d="M12 3C11.175 3 10.5 3.675 10.5 4.5C10.5 4.98 10.74 5.4 11.07 5.655C10.545 6.06 10.08 6.525 9.705 7.035C9.36 7.155 9.06 7.38 8.88 7.695L7.38 10.695L4.38 9.195C4.005 9.015 3.57 9.075 3.255 9.3C2.925 9.54 2.775 9.945 2.85 10.32L4.35 18.825C4.41 19.125 4.575 19.38 4.83 19.56C5.07 19.74 5.385 19.8 5.685 19.77L12 19.05L18.315 19.77C18.615 19.8 18.93 19.74 19.17 19.56C19.425 19.38 19.59 19.125 19.65 18.825L21.15 10.32C21.225 9.945 21.075 9.54 20.745 9.3C20.43 9.075 19.995 9.015 19.62 9.195L16.62 10.695L15.12 7.695C14.94 7.38 14.64 7.155 14.295 7.035C13.92 6.525 13.455 6.06 12.93 5.655C13.26 5.4 13.5 4.98 13.5 4.5C13.5 3.675 12.825 3 12 3ZM6 6C5.175 6 4.5 6.675 4.5 7.5C4.5 8.325 5.175 9 6 9C6.825 9 7.5 8.325 7.5 7.5C7.5 6.675 6.825 6 6 6ZM18 6C17.175 6 16.5 6.675 16.5 7.5C16.5 8.325 17.175 9 18 9C18.825 9 19.5 8.325 19.5 7.5C19.5 6.675 18.825 6 18 6ZM12 6.75C12.315 7.095 12.615 7.455 12.885 7.845L12 10.5L11.115 7.845C11.385 7.455 11.685 7.095 12 6.75ZM9.63 9.51L10.5 12.15L7.245 11.265L8.745 8.265C9.06 8.595 9.345 9.045 9.63 9.51ZM14.37 9.51C14.655 9.045 14.94 8.595 15.255 8.265L16.755 11.265L13.5 12.15L14.37 9.51ZM12 12.75L17.265 11.265L16.005 18.27L12 17.79V12.75ZM12 12.75L6.735 11.265L7.995 18.27L12 17.79V12.75Z" fill="currentColor"/>
  </svg>
);

const RookPiece = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="chess-piece-icon">
    <path d="M8 2V5H5V8H8V11H5V14H8V18H5V21H19V18H16V14H19V11H16V8H19V5H16V2H13V5H11V2H8ZM10 7H14V11H10V7ZM10 14H14V18H10V14Z" fill="currentColor"/>
  </svg>
);

const BishopPiece = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="chess-piece-icon">
    <path d="M12 3C10.9 3 10 3.9 10 5C10 5.74 10.4 6.39 11 6.73V7H10C9.45 7 9 7.45 9 8C9 8.55 9.45 9 10 9H11V10H10C9.45 10 9 10.45 9 11C9 11.55 9.45 12 10 12H11V13H10C9.45 13 9 13.45 9 14C9 14.55 9.45 15 10 15H11V16H10C9.45 16 9 16.45 9 17C9 17.55 9.45 18 10 18H11.1C10.5 18.5 10.1 19.2 10 20H14C13.9 19.2 13.5 18.5 12.9 18H14C14.55 18 15 17.55 15 17C15 16.45 14.55 16 14 16H13V15H14C14.55 15 15 14.55 15 14C15 13.45 14.55 13 14 13H13V12H14C14.55 12 15 11.55 15 11C15 10.45 14.55 10 14 10H13V9H14C14.55 9 15 8.55 15 8C15 7.45 14.55 7 14 7H13V6.73C13.6 6.39 14 5.74 14 5C14 3.9 13.1 3 12 3Z" fill="currentColor"/>
  </svg>
);

const PawnPiece = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="chess-piece-icon">
    <path d="M12 3C10.34 3 9 4.34 9 6C9 7.08 9.58 8 10.39 8.5L8.97 14H15.03L13.61 8.5C14.42 8 15 7.08 15 6C15 4.34 13.66 3 12 3ZM8 16L9 21H15L16 16H8Z" fill="currentColor"/>
  </svg>
);

const getRankClass = (index) => {
  if (index === 0) return 'rank-1';
  if (index === 1) return 'rank-2';
  if (index === 2) return 'rank-3';
  return '';
};

const getRankBadge = (index) => {
  if (index === 0) return (
    <>
      <span className="crown-icon trophy-icon">👑</span>
      <span className="rank-badge">1</span>
    </>
  );
  if (index === 1) return <span className="rank-badge">2</span>;
  if (index === 2) return <span className="rank-badge">3</span>;
  return <span>{index + 1}</span>;
};

const Rankings = () => {
  const { addMessageListener } = useWebSocket();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('currentElo');
  const [order, setOrder] = useState('desc'); // Always default to descending for rankings
  const [timeFilter, setTimeFilter] = useState('all'); // Default to all time
  
  const fetchPlayers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/players?sortBy=${sortBy}&order=${order}&timeFilter=${timeFilter}`);
      const data = await response.json();
      
      if (data.success) {
        console.log('Players from API:', data.players);
        // Make sure we always sort by rating (higher first)
        const sortedPlayers = [...data.players].sort((a, b) => {
          if (sortBy === 'performance') {
            return (b.performanceRating || b.currentElo) - (a.performanceRating || a.currentElo);
          } else {
            return b.currentElo - a.currentElo;
          }
        });
        console.log('Players after sorting:', sortedPlayers);
        setPlayers(sortedPlayers);
      } else {
        setError(data.message || 'Failed to load players');
      }
    } catch (error) {
      console.error('Error fetching players:', error);
      setError('Failed to load players. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [sortBy, order, timeFilter]);
  
  // Initial data load when filters change
  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);
  
  // WebSocket listener for real-time updates
  useEffect(() => {
    // Add WebSocket listener
    const removeListener = addMessageListener((message) => {
      if (message.type === 'player' || message.type === 'game') {
        // Any player or game change might affect the rankings
        console.log('WebSocket: Rankings update needed due to', message.type, 'change');
        fetchPlayers();
      }
    });
    
    return () => {
      // Clean up listener when component unmounts
      removeListener();
    };
  }, [addMessageListener, fetchPlayers]);
  
  const resetFilters = () => {
    setTimeFilter('all');
    setSortBy('currentElo');
    setOrder('desc');
  };
  
  const handleSort = (field) => {
    if (sortBy === field) {
      // If already sorting by this field, toggle the order
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      // If sorting by a new field, set it and default to descending for ELO/performance, ascending for names
      setSortBy(field);
      setOrder(field === 'name' ? 'asc' : 'desc');
    }
  };
  
  const getSortIcon = (field) => {
    if (sortBy !== field) return <span className="sort-icon">↕️</span>;
    return <span className="sort-icon">{order === 'asc' ? '↑' : '↓'}</span>;
  };
  
  const handleTimeFilterChange = (value) => {
    setTimeFilter(value);
    if (value !== 'all' && sortBy !== 'performance') {
      setSortBy('performance');
    }
  };
  
  if (loading) {
    return (
      <div className="leaderboard-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70vh' }}>
        <div className="loading-knight"></div>
        <p style={{ marginTop: '20px' }}>Loading rankings...</p>
      </div>
    );
  }
  
  if (error) {
    return <div className="leaderboard-container error">{error}</div>;
  }
  
  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header fade-in">
        <div className="leaderboard-logo">
          <svg width="32" height="32" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="leaderboard-logo-icon">
            <path d="M80.5 25C77.5 21 71.5 20 65.5 24C59.5 28 55.5 33 54.5 37L52.5 33C52.5 33 47.5 23 39.5 29C31.5 35 34.5 47 34.5 47L30.5 49C30.5 49 14.5 55 19.5 66C24.5 77 36.5 71 36.5 71C36.5 71 44.5 81 59.5 81C74.5 81 77.5 69 77.5 69L82.5 49L80.5 39V25Z" 
                  fill="none" stroke="var(--primary-accent, #c9a96a)" strokeWidth="2.5"/>
            <path d="M40.5 42C40.5 42 44.5 39 47.5 39C50.5 39 46.5 42 46.5 42" 
                  fill="none" stroke="var(--primary-accent, #c9a96a)" strokeWidth="1.5"/>
            <path d="M69.5 35C69.5 35 63.5 38 60.5 38" 
                  fill="none" stroke="var(--primary-accent, #c9a96a)" strokeWidth="1.5"/>
            <path d="M90.5 95H10" 
                  fill="none" stroke="var(--primary-accent, #c9a96a)" strokeWidth="3"/>
          </svg>
          <h1 className="leaderboard-title">Club Rankings</h1>
        </div>
      </div>
      
      <div className="leaderboard-filters slide-up">
        <div className="filter-controls">
          <div className="filter-item">
            <label className="filter-label" htmlFor="rankingType">Ranking Type</label>
            <select 
              id="rankingType" 
              className="filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="currentElo">ELO Rating</option>
              <option value="performance">Performance Rating</option>
            </select>
          </div>
          
          <div className="filter-item">
            <label className="filter-label" htmlFor="timeRange">Time Period</label>
            <select 
              id="timeRange" 
              className="filter-select"
              value={timeFilter}
              onChange={(e) => handleTimeFilterChange(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
            </select>
          </div>
          
          <button 
            onClick={resetFilters}
            className="btn-primary filter-button chess-piece-hover"
          >
            Reset Filters
          </button>
        </div>
      </div>
      
      {/* For accessibility - hidden table with data */}
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th>{sortBy === 'performance' ? 'Performance' : 'ELO'}</th>
            <th>Games</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, index) => (
            <tr key={player.id}>
              <td>{index + 1}</td>
              <td>{player.name}</td>
              <td>{sortBy === 'performance' && player.performanceRating ? player.performanceRating : player.currentElo}</td>
              <td>{player.gamesPlayed || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Visual Leaderboard with Cards */}
      <div className="leaderboard-card-container slide-up">
        <div className="total-players">
          <span>Total Players: {players.length}</span>
        </div>
        
        {players.map((player, index) => (
          <div 
            key={player.id} 
            className={`leaderboard-player-card staggered-item ${getRankClass(index)}`}
            style={{ 
              animationDelay: `${index * 0.1}s`,
              zIndex: players.length - index  /* Ensure cards have decreasing z-index */
            }}
          >
            {index === 0 && (
              <div className="rank-badge-container">
                <span className="crown-icon trophy-icon">👑</span>
                <div className="rank-badge">{index + 1}</div>
              </div>
            )}
            
            {(index === 1 || index === 2) && (
              <div className="rank-badge-container">
                <div className="rank-badge">{index + 1}</div>
              </div>
            )}
            
            {index > 2 && (
              <div className="rank-badge-container">
                <div style={{ 
                  fontSize: '1.1rem', 
                  fontWeight: '600', 
                  color: 'var(--text-secondary)',
                  marginBottom: '0.25rem' 
                }}>
                  #{index + 1}
                </div>
              </div>
            )}
            
            <div className="player-info">
              <div className="player-piece" aria-hidden="true">
                <PlayerSilhouette size={28} />
              </div>
              <div className="player-details">
                <span className="player-name">{player.name}</span>
                <span className="player-stats">
                  Win rate: {player.winRate ? Math.round(player.winRate * 100) : 0}%
                  <span className="games-badge">{player.gamesPlayed || 0} games</span>
                </span>
                {player.winRate && (
                  <div className="win-percentage-bar">
                    <div 
                      className="win-percentage-progress" 
                      style={{ width: `${Math.round(player.winRate * 100)}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="rating-container">
              <div className="rating-label">
                {sortBy === 'performance' ? 'Performance Rating' : 'ELO Rating'}
              </div>
              <div className="rating-value">
                {sortBy === 'performance' && player.performanceRating 
                  ? player.performanceRating 
                  : player.currentElo}
              </div>
            </div>
          </div>
        ))}
        
        {players.length === 0 && (
          <div className="no-players">
            <p>No players found for the selected time period.</p>
          </div>
        )}
      </div>
      
      {/* Floating Action Button Removed */}
    </div>
  );
};

export default Rankings;