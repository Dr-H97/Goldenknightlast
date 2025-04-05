import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import ThemeToggle from '../components/ThemeToggle';
import LanguageToggle from '../components/LanguageToggle';
import '../styles/animations.css';

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const { t } = useLanguage();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [gameHistory, setGameHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showChangePinForm, setShowChangePinForm] = useState(false);
  const [pinData, setPinData] = useState({
    currentPin: '',
    newPin: '',
    confirmPin: ''
  });
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState('');
  
  // Screen resize listener for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    fetchGameHistory();
  }, [currentUser]);
  
  const fetchGameHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/games?playerId=${currentUser.id}&sortBy=date&order=desc`);
      const data = await response.json();
      
      if (data.success) {
        setGameHistory(data.games);
      } else {
        setError(data.message || 'Failed to load game history');
      }
    } catch (error) {
      console.error('Error fetching game history:', error);
      setError('Failed to load game history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePinChange = (e) => {
    const { name, value } = e.target;
    setPinData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmitPinChange = async (e) => {
    e.preventDefault();
    
    // Reset messages
    setPinError('');
    setPinSuccess('');
    
    // Validate inputs
    if (!pinData.currentPin || !pinData.newPin || !pinData.confirmPin) {
      setPinError(t('allFieldsRequired'));
      return;
    }
    
    if (pinData.newPin !== pinData.confirmPin) {
      setPinError(t('pinMustMatch'));
      return;
    }
    
    if (pinData.newPin.length < 4) {
      setPinError(t('pinMinLength'));
      return;
    }
    
    try {
      // First verify the current PIN
      const verifyResponse = await fetch('/api/auth/verify-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId: currentUser.id,
          pin: pinData.currentPin
        }),
      });
      
      const verifyData = await verifyResponse.json();
      
      if (!verifyData.success) {
        setPinError(t('incorrectPin'));
        return;
      }
      
      // Then update the PIN
      const updateResponse = await fetch(`/api/players/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pin: pinData.newPin
        }),
      });
      
      const updateData = await updateResponse.json();
      
      if (updateData.success) {
        setPinSuccess(t('pinUpdateSuccess'));
        setPinData({
          currentPin: '',
          newPin: '',
          confirmPin: ''
        });
        setShowChangePinForm(false);
      } else {
        setPinError(updateData.message || t('failedToUpdatePin'));
      }
    } catch (error) {
      console.error('Error updating PIN:', error);
      setPinError(t('pinUpdateError'));
    }
  };
  
  // Format date with time
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };
  
  // Determine result from player's perspective
  const getGameResult = (game) => {
    if (game.whitePlayerId === currentUser.id) {
      if (game.result === '1-0') return 'Win';
      if (game.result === '0-1') return 'Loss';
      return 'Draw';
    } else {
      if (game.result === '1-0') return 'Loss';
      if (game.result === '0-1') return 'Win';
      return 'Draw';
    }
  };
  
  // Get opponent name
  const getOpponentName = (game) => {
    return game.whitePlayerId === currentUser.id ? 
      game.blackPlayer?.name : game.whitePlayer?.name;
  };
  
  // Get ELO change from player's perspective
  const getEloChange = (game) => {
    return game.whitePlayerId === currentUser.id ? 
      game.whiteEloChange : game.blackEloChange;
  };
  
  // Calculate stats
  const calculateStats = () => {
    if (!gameHistory.length) return { wins: 0, losses: 0, draws: 0, totalGames: 0, winRate: 0 };
    
    const wins = gameHistory.filter(game => getGameResult(game) === 'Win').length;
    const draws = gameHistory.filter(game => getGameResult(game) === 'Draw').length;
    const totalGames = gameHistory.length;
    
    return {
      wins,
      losses: totalGames - wins - draws,
      draws,
      totalGames,
      winRate: totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0
    };
  };
  
  const stats = calculateStats();
  
  if (loading && !gameHistory.length) {
    return <div className="container">{t('loadingProfile')}</div>;
  }
  
  // Add handleLogout function
  const handleLogout = () => {
    logout();
  };
  
  return (
    <div className="container fade-in">
      <h1 className="slide-up">{t('profileTitle')}</h1>
      
      {error && <div className="error slide-up">{error}</div>}
      {pinSuccess && <div className="success slide-up">{pinSuccess}</div>}
      
      <div className="profile-grid slide-up" style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr', 
        gap: '20px'
      }}>
        {/* Player Info */}
        <div className="card dashboard-card">
          <h2>{t('playerInfo')}</h2>
          
          <p><strong>{t('name')}:</strong> {currentUser.name}</p>
          <p><strong>{t('currentElo')}:</strong> {currentUser.currentElo || currentUser.initialElo}</p>
          <p><strong>{t('accountType')}:</strong> {currentUser.isAdmin ? t('admin') : t('player')}</p>
          
          {/* Theme Toggle */}
          <div style={{ 
            display: 'flex',
            alignItems: 'center', 
            marginTop: '15px',
            marginBottom: '10px'
          }}>
            <p style={{ marginRight: '10px', marginBottom: '0' }}><strong>{t('theme')}:</strong></p>
            <ThemeToggle large showText />
          </div>
          
          {/* Language Toggle */}
          <div style={{ 
            display: 'flex',
            alignItems: 'center', 
            marginBottom: '15px'
          }}>
            <p style={{ marginRight: '10px', marginBottom: '0' }}><strong>{t('language')}:</strong></p>
            <LanguageToggle large showText />
          </div>
          
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            marginTop: '10px',
            flexDirection: isMobile ? 'column' : 'row'
          }}>
            <button 
              onClick={() => setShowChangePinForm(!showChangePinForm)}
              className="btn-secondary chess-piece-hover"
            >
              {showChangePinForm ? t('cancel') : t('changePin')}
            </button>
            
            {isMobile && (
              <button 
                onClick={handleLogout}
                className="btn-danger chess-piece-hover"
              >
                {t('logout')}
              </button>
            )}
          </div>
          
          {showChangePinForm && (
            <form onSubmit={handleSubmitPinChange} style={{ marginTop: '15px' }}>
              {pinError && <div className="error">{pinError}</div>}
              
              <div className="form-group">
                <label htmlFor="currentPin">{t('currentPin')}</label>
                <input
                  type="password"
                  id="currentPin"
                  name="currentPin"
                  className="form-control"
                  value={pinData.currentPin}
                  onChange={handlePinChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="newPin">{t('newPin')}</label>
                <input
                  type="password"
                  id="newPin"
                  name="newPin"
                  className="form-control"
                  value={pinData.newPin}
                  onChange={handlePinChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPin">{t('confirmPin')}</label>
                <input
                  type="password"
                  id="confirmPin"
                  name="confirmPin"
                  className="form-control"
                  value={pinData.confirmPin}
                  onChange={handlePinChange}
                  required
                />
              </div>
              
              <button type="submit" className="btn-primary chess-piece-hover">
                {t('updatePin')}
              </button>
            </form>
          )}
        </div>
        
        {/* Player Stats */}
        <div className="card dashboard-card">
          <h2>{t('statistics')}</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
            <div className="stat-card" style={{ textAlign: 'center', padding: '10px', backgroundColor: 'var(--card-bg-alt)', borderRadius: '5px', border: '1px solid var(--border)' }}>
              <h3 style={{ margin: '0 0 5px 0' }}>{stats.wins}</h3>
              <p style={{ margin: 0 }}>{t('wins')}</p>
            </div>
            
            <div className="stat-card" style={{ textAlign: 'center', padding: '10px', backgroundColor: 'var(--card-bg-alt)', borderRadius: '5px', border: '1px solid var(--border)' }}>
              <h3 style={{ margin: '0 0 5px 0' }}>{stats.losses}</h3>
              <p style={{ margin: 0 }}>{t('losses')}</p>
            </div>
            
            <div className="stat-card" style={{ textAlign: 'center', padding: '10px', backgroundColor: 'var(--card-bg-alt)', borderRadius: '5px', border: '1px solid var(--border)' }}>
              <h3 style={{ margin: '0 0 5px 0' }}>{stats.draws}</h3>
              <p style={{ margin: 0 }}>{t('draws')}</p>
            </div>
          </div>
          
          <p><strong>{t('totalGames')}:</strong> {stats.totalGames}</p>
          <p><strong>{t('winRate')}:</strong> {stats.winRate}%</p>
        </div>
      </div>
      
      {/* Game History */}
      <div className="card dashboard-card slide-up" style={{ marginTop: '20px' }}>
        <h2>{t('gameHistory')}</h2>
        
        {gameHistory.length > 0 ? (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>{t('date')}</th>
                  <th>{t('opponent')}</th>
                  <th>{t('color')}</th>
                  <th>{t('result')}</th>
                  <th>{t('eloChange')}</th>
                </tr>
              </thead>
              <tbody>
                {gameHistory.map(game => (
                  <tr key={game.id}>
                    <td>{formatDate(game.date)}</td>
                    <td>{getOpponentName(game)}</td>
                    <td>{game.whitePlayerId === currentUser.id ? t('white') : t('black')}</td>
                    <td>{t(getGameResult(game).toLowerCase())}</td>
                    <td style={{ 
                      color: getEloChange(game) > 0 
                        ? '#51cf66' 
                        : getEloChange(game) < 0 
                          ? '#ff6b6b' 
                          : 'inherit'
                    }}>
                      {getEloChange(game) > 0 ? '+' : ''}
                      {getEloChange(game)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>{t('noGameHistory')}</p>
        )}
      </div>
    </div>
  );
};

export default Profile;