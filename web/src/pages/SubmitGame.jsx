import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SubmitGame = () => {
  const { currentUser, verifyPin } = useAuth();
  const navigate = useNavigate();
  
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    whitePlayerId: '',
    blackPlayerId: '',
    result: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0].substring(0, 5), // Current time in HH:MM format
    whitePlayerPin: '',
    blackPlayerPin: ''
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
    setSubmitting(true);
    
    // Validate form data
    if (!formData.whitePlayerId || !formData.blackPlayerId || !formData.result) {
      setError('Please fill in all required fields');
      setSubmitting(false);
      return;
    }
    
    if (formData.whitePlayerId === formData.blackPlayerId) {
      setError('White and Black players cannot be the same');
      setSubmitting(false);
      return;
    }
    
    if (!formData.whitePlayerPin || !formData.blackPlayerPin) {
      setError('Please enter PINs for both players to confirm the game submission');
      setSubmitting(false);
      return;
    }
    
    try {
      // Verify both players' PINs
      const whitePlayerVerified = await verifyPin(parseInt(formData.whitePlayerId), formData.whitePlayerPin);
      const blackPlayerVerified = await verifyPin(parseInt(formData.blackPlayerId), formData.blackPlayerPin);
      
      if (!whitePlayerVerified) {
        setError('Invalid PIN for White player');
        setSubmitting(false);
        return;
      }
      
      if (!blackPlayerVerified) {
        setError('Invalid PIN for Black player');
        setSubmitting(false);
        return;
      }
      
      // Format the date with time as a proper date string
      const dateWithTime = `${formData.date}T${formData.time}:00`;
      const formattedDate = new Date(dateWithTime).toISOString();
      
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
          time: new Date().toTimeString().split(' ')[0].substring(0, 5), // Reset to current time
          whitePlayerPin: '',
          blackPlayerPin: ''
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
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70vh' }}>
        <div className="loading-knight"></div>
        <p style={{ marginTop: '20px' }}>Loading players...</p>
      </div>
    );
  }
  
  return (
    <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1>Submit Game Result</h1>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success success-checkmate">{success}</div>}
      
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="whitePlayerId">White Player</label>
            <select
              id="whitePlayerId"
              name="whitePlayerId"
              className="form-control form-control-animate"
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
              className="form-control form-control-animate"
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
              className="form-control form-control-animate"
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
              className="form-control form-control-animate"
              value={formData.date}
              onChange={handleInputChange}
              max={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="time">Time</label>
            <input
              type="time"
              id="time"
              name="time"
              className="form-control form-control-animate"
              value={formData.time}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div style={{ marginTop: '20px', borderTop: '1px solid #ddd', paddingTop: '15px' }}>
            <h3>Player Authentication</h3>
            <p className="small">Both players must confirm this game submission with their PINs</p>
          </div>

          <div className="form-group">
            <label htmlFor="whitePlayerPin">
              White Player PIN <small>({players.find(p => p.id.toString() === formData.whitePlayerId)?.name || 'Select player'})</small>
            </label>
            <input
              type="password"
              id="whitePlayerPin"
              name="whitePlayerPin"
              className="form-control form-control-animate"
              value={formData.whitePlayerPin}
              onChange={handleInputChange}
              required
              disabled={!formData.whitePlayerId}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="blackPlayerPin">
              Black Player PIN <small>({players.find(p => p.id.toString() === formData.blackPlayerId)?.name || 'Select player'})</small>
            </label>
            <input
              type="password"
              id="blackPlayerPin"
              name="blackPlayerPin"
              className="form-control form-control-animate"
              value={formData.blackPlayerPin}
              onChange={handleInputChange}
              required
              disabled={!formData.blackPlayerId}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn-games submit-game-btn btn-animate-queen chess-piece-hover"
            style={{ width: '100%', marginTop: '10px' }}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Game'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitGame;