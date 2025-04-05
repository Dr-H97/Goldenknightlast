import React, { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import { Link } from 'react-router-dom';
import '../styles/animations.css';
import '../styles/leaderboard.css';
import logo from '../assets/logo.svg';
import kingIcon from '../assets/chess-king.svg';
import queenIcon from '../assets/chess-queen.svg';
import knightIcon from '../assets/chess-knight.svg';
import plusCircleIcon from '../assets/plus-circle.svg';
import ThemeToggle from '../components/ThemeToggle';

const getInitials = (name) => {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase();
};

const getRankClass = (index) => {
  if (index === 0) return 'rank-1';
  if (index === 1) return 'rank-2';
  if (index === 2) return 'rank-3';
  return '';
};

const getRankBadge = (index) => {
  if (index === 0) return (
    <>
      <span className="crown-icon">👑</span>
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
          <img src={logo} alt="Chess Club Logo" className="leaderboard-logo-icon" />
          <h1 className="leaderboard-title">Club Rankings</h1>
        </div>
        <ThemeToggle large showText />
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
      
      <div className="leaderboard-table-container slide-up">
        <div className="total-players">
          <span>Total Players: {players.length}</span>
        </div>
        
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th style={{ width: '15%' }}>Rank</th>
              <th 
                onClick={() => handleSort('name')}
                className="sortable"
                style={{ width: '50%' }}
              >
                Player {getSortIcon('name')}
              </th>
              <th 
                onClick={() => handleSort(sortBy === 'performance' ? 'performance' : 'currentElo')}
                className="sortable"
                style={{ width: '20%' }}
              >
                {sortBy === 'performance' ? 'Performance' : 'ELO'} {getSortIcon(sortBy)}
              </th>
              <th style={{ width: '15%' }}>Games</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => (
              <tr 
                key={player.id} 
                className={`staggered-item ${getRankClass(index)}`}
              >
                <td>
                  {getRankBadge(index)}
                </td>
                <td>
                  <div className="player-info">
                    <div className="player-avatar">
                      {getInitials(player.name)}
                    </div>
                    <div className="player-details">
                      <span className="player-name">{player.name}</span>
                      <span className="player-stats">
                        Win rate: {player.winRate ? Math.round(player.winRate * 100) : 0}%
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
                </td>
                <td className="rating-cell">
                  {sortBy === 'performance' && player.performanceRating 
                    ? player.performanceRating 
                    : player.currentElo}
                </td>
                <td>
                  {player.gamesPlayed || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {players.length === 0 && (
          <p className="text-center">No players found for the selected time period.</p>
        )}
      </div>
      
      <Link to="/submit-game" className="submit-game-button">
        <img src={plusCircleIcon} alt="Submit Game" />
      </Link>
    </div>
  );
};

export default Rankings;