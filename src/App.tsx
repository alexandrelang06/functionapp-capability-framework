import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { FrameworkProvider } from './contexts/FrameworkContext';
import { UserProvider } from './contexts/UserContext';
import { AuthProvider } from './contexts/AuthContext';
import { CategoryScoresProvider } from './contexts/CategoryScoresContext';
import { AppRoutes } from './routes/AppRoutes';
import '@fontsource/bree-serif';
import './styles/din-font.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <UserProvider>
          <FrameworkProvider>
            <CategoryScoresProvider>
              <AppRoutes />
            </CategoryScoresProvider>
          </FrameworkProvider>
        </UserProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;