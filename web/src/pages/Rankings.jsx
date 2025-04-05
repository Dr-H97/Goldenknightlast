import React, { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import '../styles/animations.css';


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
    if (sortBy !== field) return '↕️';
    return order === 'asc' ? '↑' : '↓';
  };
  
  const handleTimeFilterChange = (value) => {
    setTimeFilter(value);
    if (value !== 'all' && sortBy !== 'performance') {
      setSortBy('performance');
    }
  };
  
  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70vh' }}>
        <div className="loading-knight"></div>
        <p style={{ marginTop: '20px' }}>Loading rankings...</p>
      </div>
    );
  }
  
  if (error) {
    return <div className="container error">{error}</div>;
  }
  
  return (
    <div className="container">
      <h1 className="fade-in">Club Rankings</h1>
      
      <div className="card slide-up" style={{ marginBottom: '20px' }}>
        <h3>Ranking Options</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div>
              <label htmlFor="rankingType">Ranking Type: </label>
              <select 
                id="rankingType" 
                className="form-control"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ minWidth: '180px' }}
              >
                <option value="currentElo">ELO Rating</option>
                <option value="performance">Performance Rating</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="timeRange">Time Period: </label>
              <select 
                id="timeRange" 
                className="form-control"
                value={timeFilter}
                onChange={(e) => handleTimeFilterChange(e.target.value)}
                style={{ minWidth: '180px' }}
              >
                <option value="all">All Time</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="year">Last Year</option>
              </select>
            </div>
          </div>
          
          <button 
            onClick={resetFilters}
            className="btn-reset chess-piece-hover"
          >
            Reset
          </button>
        </div>
      </div>
      
      <div className="card slide-up" style={{ marginTop: '20px', animationDelay: '0.2s' }}>
        <div style={{ textAlign: 'right', marginBottom: '10px' }}>
          <small>Total Players: {players.length}</small>
        </div>
        
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th style={{ width: '15%' }}>Rank</th>
                <th 
                  onClick={() => handleSort('name')}
                  style={{ cursor: 'pointer', width: '50%' }}
                >
                  Name {getSortIcon('name')}
                </th>
                <th 
                  onClick={() => handleSort(sortBy === 'performance' ? 'performance' : 'currentElo')}
                  style={{ cursor: 'pointer', width: '35%' }}
                >
                  {sortBy === 'performance' ? 'Performance' : 'ELO'} Rating {getSortIcon(sortBy)}
                </th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, index) => (
                <tr 
                  key={player.id} 
                  className={`staggered-item ${index < 3 ? 'podium-position' : ''}`} 
                  style={{ 
                    backgroundColor: index < 3 ? 'rgba(100, 108, 255, 0.1)' : 'inherit',
                    transition: 'background-color 0.3s ease'
                  }}
                >
                  <td style={{ fontWeight: index < 3 ? 'bold' : 'normal' }}>
                    {index + 1}
                  </td>
                  <td>{player.name}</td>
                  <td>
                    {sortBy === 'performance' && player.performanceRating 
                      ? player.performanceRating 
                      : player.currentElo}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {players.length === 0 && (
          <p className="text-center">No players found for the selected time period.</p>
        )}
      </div>
    </div>
  );
};

export default Rankings;