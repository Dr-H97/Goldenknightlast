import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';

const Login = () => {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const { t } = useLanguage();
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
      const user = await login(name, pin);
      navigate('/dashboard');
    } catch (error) {
      setError(error.message || t('incorrectPin'));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container" style={{ maxWidth: '400px', margin: '0 auto', paddingTop: '50px' }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ textAlign: 'center', margin: 0 }}>{t('loginTitle')}</h2>
          <LanguageToggle large={true} showText={true} />
        </div>
        
        {error && <div className="error">{error}</div>}
        
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
    </div>
  );
};

export default Login;