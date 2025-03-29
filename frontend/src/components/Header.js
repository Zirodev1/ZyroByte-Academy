// src/components/Header.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (token && user) {
      setIsLoggedIn(true);
      setUserName(user.name);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/login');
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">
            <span className="logo-text">ZyroByte<span className="highlight">Academy</span></span>
          </Link>
        </div>
        
        <div className="menu-toggle" onClick={toggleMenu}>
          <div className={`hamburger ${menuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        
        <nav className={`navigation ${menuOpen ? 'open' : ''}`}>
          <ul className="nav-links">
            <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
            <li><Link to="/courses" onClick={() => setMenuOpen(false)}>Courses</Link></li>
            {isLoggedIn ? (
              <>
                <li className="dropdown">
                  <button 
                    className="dropdown-toggle" 
                    onClick={toggleDropdown}
                    type="button"
                    aria-haspopup="true"
                    aria-expanded={dropdownOpen}
                  >
                    {userName} <i className="arrow down"></i>
                  </button>
                  <ul className={`dropdown-menu ${dropdownOpen ? 'active' : ''}`}>
                    <li><Link to="/dashboard" onClick={() => { setMenuOpen(false); setDropdownOpen(false); }}>Dashboard</Link></li>
                    <li><Link to="/profile" onClick={() => { setMenuOpen(false); setDropdownOpen(false); }}>Profile</Link></li>
                    <li>
                      <button 
                        className="logout-button" 
                        onClick={() => { handleLogout(); setMenuOpen(false); setDropdownOpen(false); }}
                        type="button"
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li><Link to="/login" onClick={() => setMenuOpen(false)} className="login-button">Login</Link></li>
                <li><Link to="/register" onClick={() => setMenuOpen(false)} className="register-button">Register</Link></li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
