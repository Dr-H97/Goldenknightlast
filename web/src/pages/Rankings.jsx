import React, { useState, useEffect } from 'react';

const Rankings = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('currentElo');
  const [order, setOrder] = useState('desc');
  
  useEffect(() => {
    fetchPlayers();
  }, [sortBy, order]);
  
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
      
      <div className="card">
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
            {players.map((player, index) => (
              <tr key={player.id}>
                <td>{index + 1}</td>
                <td>{player.name}</td>
                <td>{player.currentElo}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {players.length === 0 && (
          <p>No players found.</p>
        )}
      </div>
    </div>
  );
};

export default Rankings;