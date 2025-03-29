import React, { useState, useEffect } from "react";
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import api from '../../services/api';

function PrivateRoute() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      
      try {
        // Set the auth token for API calls
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Verify the token by making a request to the user profile
        await api.get('/users/profile');
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Authentication error:', error);
        // If the token is invalid, clear it from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  if (isLoading) {
    return (
      <div className="auth-container">
        <div className="loading-spinner">
          Authenticating...
        </div>
      </div>
    );
  }

  return isAuthenticated ? 
    <Outlet /> : 
    <Navigate to="/login" state={{ from: location }} replace />;
}

export default PrivateRoute;