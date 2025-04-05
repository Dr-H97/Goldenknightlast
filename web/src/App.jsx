import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import MobileNav from './components/MobileNav';
import PageTransition from './components/PageTransition';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Rankings from './pages/Rankings';
import Profile from './pages/Profile';
import SubmitGame from './pages/SubmitGame';
import Games from './pages/Games';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

// Styles for chess-themed transitions
import './styles/chessLoader.css';

function App() {
  const { currentUser } = useAuth();
  
  // Check if device is mobile
  const isMobile = window.innerWidth <= 768;

  return (
    <ThemeProvider>
      <LanguageProvider>
        <Router>
          {currentUser && !isMobile && <Navbar />}
          
          <div className="app-container" style={{ 
            width: '100%', 
            padding: isMobile ? '12px' : '20px',
            paddingBottom: isMobile ? '70px' : '20px',  // Add padding for mobile nav
            backgroundColor: 'var(--background)',
            color: 'var(--text)',
            minHeight: '100vh',
            transition: 'background-color 0.3s ease, color 0.3s ease'
          }}>
            <Routes>
              {/* Public routes */}
              <Route 
                path="/login" 
                element={currentUser ? <Navigate to="/dashboard" /> : 
                  <PageTransition loaderType="simple">
                    <Login />
                  </PageTransition>
                } 
              />
              
              {/* Protected routes */}
              <Route 
                path="/" 
                element={<Navigate to={currentUser ? "/dashboard" : "/login"} />} 
              />
              
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <PageTransition loaderType="simple">
                      <Dashboard />
                    </PageTransition>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/rankings" 
                element={
                  <ProtectedRoute>
                    <PageTransition loaderType="chess">
                      <Rankings />
                    </PageTransition>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <PageTransition loaderType="knight">
                      <Profile />
                    </PageTransition>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/submit-game" 
                element={
                  <ProtectedRoute>
                    <PageTransition loaderType="chess">
                      <SubmitGame />
                    </PageTransition>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/games" 
                element={
                  <ProtectedRoute>
                    <PageTransition loaderType="simple">
                      <Games />
                    </PageTransition>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <PageTransition loaderType="knight">
                      <Admin />
                    </PageTransition>
                  </ProtectedRoute>
                } 
              />
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          
          {/* Show mobile navigation on mobile devices */}
          {currentUser && isMobile && <MobileNav />}
        </Router>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;