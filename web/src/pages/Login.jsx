import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import LanguageToggle from '../components/LanguageToggle';
import ThemeToggle from '../components/ThemeToggle';

const Login = () => {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError(t('allFieldsRequired'));
      return;
    }
    
    if (!pin.trim()) {
      setError(t('allFieldsRequired'));
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      // Make sure URL includes http:// or https:// and uses proper JSON content type
      const user = await login(name, pin);
      navigate('/dashboard');
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || t('incorrectPin'));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="login-container" style={{ 
      maxWidth: '400px', 
      margin: '0 auto', 
      paddingTop: '50px',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 'calc(100vh - 100px)',
    }}>
      <div className="card" style={{ marginBottom: '20px', flex: '1' }}>
        <div className="logo-container" style={{ textAlign: 'center', marginBottom: '25px' }}>
          {language === 'fr' ? (
            // French logo
            theme === 'dark' ? (
              <img 
                src="/images/cavalier-d-or-logo-dark.svg" 
                alt="Le Cavalier d'Or Logo" 
                style={{ maxWidth: '280px', margin: '0 auto 10px' }}
              />
            ) : (
              <img 
                src="/images/cavalier-d-or-logo-light.svg" 
                alt="Le Cavalier d'Or Logo" 
                style={{ maxWidth: '280px', margin: '0 auto 10px' }}
              />
            )
          ) : (
            // English logo
            theme === 'dark' ? (
              <img 
                src="/images/golden-knight-logo-dark.svg" 
                alt="The Golden Knight Chess Club Logo" 
                style={{ maxWidth: '280px', margin: '0 auto 10px' }}
              />
            ) : (
              <img 
                src="/images/golden-knight-logo-light.svg" 
                alt="The Golden Knight Chess Club Logo" 
                style={{ maxWidth: '280px', margin: '0 auto 10px' }}
              />
            )
          )}
        </div>
        
        {error && <div className="error" style={{ marginBottom: '15px' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">{t('playerName')}</label>
            <input
              type="text"
              id="name"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('playerName')}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="pin">{t('pin')}</label>
            <input
              type="password"
              id="pin"
              className="form-control"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder={t('enterPin')}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? t('loading') : t('loginButton')}
          </button>
        </form>
      </div>
      
      {/* Settings at the bottom */}
      <div className="settings-container" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: '10px', 
        marginBottom: '20px', 
        gap: '20px',
        flexWrap: 'wrap', 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>{t('language')}</span>
          <LanguageToggle large={true} showText={true} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>{t('theme')}</span>
          <ThemeToggle large={true} showText={true} />
        </div>
      </div>
    </div>
  );
};

export default Login;