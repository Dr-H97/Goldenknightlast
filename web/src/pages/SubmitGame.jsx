import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SubmitGame = () => {
  const { currentUser, verifyPin } = useAuth();
  const navigate = useNavigate();
  
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    whitePlayerId: '',
    blackPlayerId: '',
    result: '',
    date: new Date().toISOString().split('T')[0],
    pin: '',
    otherPlayerId: ''
  });
  
  // Set the current user as one of the players by default
  useEffect(() => {
    if (currentUser && formData.whitePlayerId === '') {
      setFormData(prev => ({
        ...prev,
        whitePlayerId: currentUser.id.toString()
      }));
    }
  }, [currentUser]);
  
  // Fetch all players
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/players');
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
    
    fetchPlayers();
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'whitePlayerId' || name === 'blackPlayerId') {
      // If selecting the same player for both white and black, reset the other one
      if (name === 'whitePlayerId' && value === formData.blackPlayerId) {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          blackPlayerId: ''
        }));
      } else if (name === 'blackPlayerId' && value === formData.whitePlayerId) {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          whitePlayerId: ''
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset messages
    setError('');
    setSuccess('');
    
    // Validate form data
    if (!formData.whitePlayerId || !formData.blackPlayerId || !formData.result) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (formData.whitePlayerId === formData.blackPlayerId) {
      setError('White and Black players cannot be the same');
      return;
    }
    
    if (!formData.pin) {
      setError('Please enter your PIN to submit the game');
      return;
    }
    
    try {
      // Verify the PIN first
      const isVerified = await verifyPin(currentUser.id, formData.pin);
      
      if (!isVerified) {
        setError('Invalid PIN');
        return;
      }
      
      // Format the date as a proper date string
      const formattedDate = new Date(formData.date).toISOString();
      
      // Submit the game
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          whitePlayerId: parseInt(formData.whitePlayerId),
          blackPlayerId: parseInt(formData.blackPlayerId),
          result: formData.result,
          date: formattedDate,
          verified: false // Games should be verified by admin
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Game submitted successfully! It will be verified by an admin.');
        
        // Reset form data
        setFormData({
          whitePlayerId: currentUser.id.toString(),
          blackPlayerId: '',
          result: '',
          date: new Date().toISOString().split('T')[0],
          pin: ''
        });
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setError(data.message || 'Failed to submit game');
      }
    } catch (error) {
      console.error('Error submitting game:', error);
      setError('An error occurred while submitting the game');
    }
  };
  
  if (loading) {
    return <div className="container">Loading...</div>;
  }
  
  return (
    <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1>Submit Game Result</h1>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="whitePlayerId">White Player</label>
            <select
              id="whitePlayerId"
              name="whitePlayerId"
              className="form-control"
              value={formData.whitePlayerId}
              onChange={handleInputChange}
              required
            >
              <option value="">Select White Player</option>
              {players.map(player => (
                <option 
                  key={`white-${player.id}`} 
                  value={player.id}
                >
                  {player.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="blackPlayerId">Black Player</label>
            <select
              id="blackPlayerId"
              name="blackPlayerId"
              className="form-control"
              value={formData.blackPlayerId}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Black Player</option>
              {players
                .filter(player => player.id.toString() !== formData.whitePlayerId)
                .map(player => (
                  <option 
                    key={`black-${player.id}`} 
                    value={player.id}
                  >
                    {player.name}
                  </option>
                ))
              }
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="result">Result</label>
            <select
              id="result"
              name="result"
              className="form-control"
              value={formData.result}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Result</option>
              <option value="1-0">White Wins (1-0)</option>
              <option value="0-1">Black Wins (0-1)</option>
              <option value="1/2-1/2">Draw (1/2-1/2)</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              className="form-control"
              value={formData.date}
              onChange={handleInputChange}
              max={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="pin">Your PIN (to confirm submission)</label>
            <input
              type="password"
              id="pin"
              name="pin"
              className="form-control"
              value={formData.pin}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn-primary"
            style={{ width: '100%', marginTop: '10px' }}
          >
            Submit Game
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitGame;