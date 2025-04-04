import React, { useState, useEffect } from 'react';

const Rankings = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('currentElo');
  const [order, setOrder] = useState('desc');
  const [filters, setFilters] = useState({
    minRating: '',
    maxRating: '',
    nameSearch: ''
  });
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  
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
      // If already sorting by this field, toggle the order
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      // If sorting by a new field, set it and default to descending
      setSortBy(field);
      setOrder('desc');
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
      <h1>Club Rankings</h1>
      
      <div className="card" style={{ marginBottom: '20px' }}>
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
            className="btn-secondary"
            style={{ marginLeft: 'auto', alignSelf: 'flex-end' }}
          >
            Clear Filters
          </button>
        </div>
      </div>
      
      <div className="card">
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
              <tr key={player.id}>
                <td>{index + 1}</td>
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