import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import MobileNav from './components/MobileNav';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Rankings from './pages/Rankings';
import Profile from './pages/Profile';
import SubmitGame from './pages/SubmitGame';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

function App() {
  const { currentUser } = useAuth();
  
  // Check if device is mobile
  const isMobile = window.innerWidth <= 768;

  return (
    <Router>
      {currentUser && !isMobile && <Navbar />}
      
      <div className="app-container" style={{ 
        width: '100%', 
        padding: isMobile ? '12px' : '20px',
        paddingBottom: isMobile ? '70px' : '20px'  // Add padding for mobile nav
      }}>
        <Routes>
          {/* Public routes */}
          <Route 
            path="/login" 
            element={currentUser ? <Navigate to="/dashboard" /> : <Login />} 
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
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/rankings" 
            element={
              <ProtectedRoute>
                <Rankings />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/submit-game" 
            element={
              <ProtectedRoute>
                <SubmitGame />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <Admin />
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
  );
}

export default App;