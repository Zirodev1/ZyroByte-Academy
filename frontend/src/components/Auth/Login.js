import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from '../../services/api';
import Header from '../Header';
import Footer from '../Footer';
import './Auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (token && user) {
      // Redirect admin users to admin dashboard
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/users/login', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Small delay for user experience
      setTimeout(() => {
        setLoading(false);
        
        // Redirect admin users to admin dashboard
        if (response.data.user && response.data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }, 500);
    } catch (error) {
      setLoading(false);
      if (error.response && error.response.data) {
        setError(error.response.data.message || 'Login failed. Please check your credentials.');
      } else {
        setError('Login failed. Please try again later.');
      }
    }
  };

  return (
    <>
      <Header />
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Log in to your ZyroByte Academy account</p>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <form className="auth-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                className="form-control"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="auth-button" 
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
          
          <div className="auth-footer">
            Don't have an account? <Link to="/register" className="auth-link">Sign up</Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Login;
