import React, { useState, useEffect } from 'react';
import '../styles/animations.css';

const Rankings = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('currentElo');
  const [order, setOrder] = useState('desc'); // Always default to descending for rankings
  const [filters, setFilters] = useState({
    minRating: '',
    maxRating: '',
    nameSearch: ''
  });
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  
  // Crown icons for the podium
  const crownIcons = {
    1: '👑', // Gold crown for 1st place
    2: '🥈', // Silver medal for 2nd place
    3: '🥉', // Bronze medal for 3rd place
  };
  
  useEffect(() => {
    fetchPlayers();
  }, [sortBy, order]);
  
  // Apply filters whenever players or filters change
  useEffect(() => {
    applyFilters();
  }, [players, filters]);
  
  const applyFilters = () => {
    let result = [...players];
    
    // Apply name filter
    if (filters.nameSearch) {
      const search = filters.nameSearch.toLowerCase();
      result = result.filter(player => 
        player.name.toLowerCase().includes(search)
      );
    }
    
    // Apply min rating filter
    if (filters.minRating) {
      const minRating = parseInt(filters.minRating);
      if (!isNaN(minRating)) {
        result = result.filter(player => player.currentElo >= minRating);
      }
    }
    
    // Apply max rating filter
    if (filters.maxRating) {
      const maxRating = parseInt(filters.maxRating);
      if (!isNaN(maxRating)) {
        result = result.filter(player => player.currentElo <= maxRating);
      }
    }
    
    setFilteredPlayers(result);
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const clearFilters = () => {
    setFilters({
      minRating: '',
      maxRating: '',
      nameSearch: ''
    });
  };
  
  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/players?sortBy=${sortBy}&order=${order}`);
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
  
  const handleSort = (field) => {
    if (sortBy === field) {
      // If already sorting by this field, toggle the order, but always keep ELO in descending order
      if (field === 'currentElo') {
        setOrder('desc'); // Keep ELO sorting in descending (high to low) for rankings
      } else {
        setOrder(order === 'asc' ? 'desc' : 'asc');
      }
    } else {
      // If sorting by a new field, set it and default to descending for ELO, ascending for names
      setSortBy(field);
      setOrder(field === 'currentElo' ? 'desc' : 'asc');
    }
  };
  
  const getSortIcon = (field) => {
    if (sortBy !== field) return '↕️';
    return order === 'asc' ? '↑' : '↓';
  };
  
  if (loading) {
    return <div className="container">Loading rankings...</div>;
  }
  
  if (error) {
    return <div className="container error">{error}</div>;
  }
  
  return (
    <div className="container">
      <h1 className="fade-in">Club Rankings</h1>
      
      <div className="card slide-up" style={{ marginBottom: '20px' }}>
        <h3>Filters</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '10px' }}>
          <div>
            <label htmlFor="nameSearch">Player Name: </label>
            <input
              type="text"
              id="nameSearch"
              name="nameSearch"
              value={filters.nameSearch}
              onChange={handleFilterChange}
              placeholder="Search by name"
              className="form-control"
            />
          </div>
          
          <div>
            <label htmlFor="minRating">Min Rating: </label>
            <input
              type="number"
              id="minRating"
              name="minRating"
              value={filters.minRating}
              onChange={handleFilterChange}
              placeholder="Min rating"
              className="form-control"
              min="0"
              max="3000"
            />
          </div>
          
          <div>
            <label htmlFor="maxRating">Max Rating: </label>
            <input
              type="number"
              id="maxRating"
              name="maxRating"
              value={filters.maxRating}
              onChange={handleFilterChange}
              placeholder="Max rating"
              className="form-control"
              min="0"
              max="3000"
            />
          </div>
          
          <button 
            onClick={clearFilters}
            className="btn-secondary chess-piece-hover"
            style={{ marginLeft: 'auto', alignSelf: 'flex-end' }}
          >
            Clear Filters
          </button>
        </div>
      </div>
      
      <div className="card slide-up" style={{ marginTop: '20px', animationDelay: '0.2s' }}>
        <div style={{ textAlign: 'right', marginBottom: '10px' }}>
          <small>Showing {filteredPlayers.length} of {players.length} players</small>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th 
                onClick={() => handleSort('name')}
                style={{ cursor: 'pointer' }}
              >
                Name {getSortIcon('name')}
              </th>
              <th 
                onClick={() => handleSort('currentElo')}
                style={{ cursor: 'pointer' }}
              >
                ELO Rating {getSortIcon('currentElo')}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.map((player, index) => (
              <tr 
                key={player.id} 
                className={`staggered-item ${index < 3 ? 'podium-position' : ''}`} 
                style={{ 
                  backgroundColor: index < 3 ? 'rgba(100, 108, 255, 0.1)' : 'inherit',
                  transition: 'background-color 0.3s ease'
                }}
              >
                <td style={{ fontWeight: index < 3 ? 'bold' : 'normal' }}>
                  {index < 3 && <span style={{ marginRight: '5px', fontSize: '1.2rem' }}>{crownIcons[index + 1]}</span>}
                  {index + 1}
                </td>
                <td>{player.name}</td>
                <td>{player.currentElo}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredPlayers.length === 0 && (
          <p className="text-center">No players match the current filters.</p>
        )}
      </div>
    </div>
  );
};

export default Rankings;