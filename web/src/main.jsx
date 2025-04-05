import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './styles/tailwind-colors.css';
import './styles/themes.css';
import { AuthProvider } from './context/AuthContext.jsx';
import { WebSocketProvider } from './context/WebSocketContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <LanguageProvider>
        <ThemeProvider>
          <WebSocketProvider>
            <App />
          </WebSocketProvider>
        </ThemeProvider>
      </LanguageProvider>
    </AuthProvider>
  </React.StrictMode>,
);