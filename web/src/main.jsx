import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './styles/tailwind-colors.css';
import './styles/themes.css';
import './styles/chessTheme.css';
import './styles/chess-animations.css';
import './styles/buttonFixes.css';
import './styles/mobile-nav-fixes.css';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';
import { initializeFirebase } from './firebase/initFirebase';

// Initialize Firebase when the app starts
initializeFirebase();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <LanguageProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </LanguageProvider>
    </AuthProvider>
  </React.StrictMode>,
);