import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const LanguageToggle = ({ large = false, showText = false }) => {
  const { language, setLanguage, t } = useLanguage();
  
  const handleToggle = () => {
    setLanguage(prevLang => prevLang === 'en' ? 'fr' : 'en');
  };
  
  return (
    <div className="language-toggle" 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        cursor: 'pointer'
      }}
      onClick={handleToggle}
    >
      {showText && (
        <span style={{ marginRight: '10px' }}>
          {language === 'en' ? 'English' : 'Français'}
        </span>
      )}
      <div
        style={{
          width: large ? '60px' : '40px',
          height: large ? '30px' : '20px',
          backgroundColor: language === 'en' ? '#051937' : '#a8eb12',
          borderRadius: '15px',
          position: 'relative',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: language === 'en' ? 'flex-start' : 'flex-end',
          padding: '0 4px'
        }}
      >
        <div
          style={{
            width: large ? '22px' : '16px',
            height: large ? '22px' : '16px',
            backgroundColor: '#fff',
            borderRadius: '50%',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: large ? '12px' : '8px',
            fontWeight: 'bold'
          }}
        >
          {language === 'en' ? 'EN' : 'FR'}
        </div>
      </div>
    </div>
  );
};

export default LanguageToggle;