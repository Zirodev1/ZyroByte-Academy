// src/components/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>ZyroByte Academy</h3>
            <p className="footer-description">
              Your journey to becoming a professional developer starts here. 
              Learn programming, web development, and more through our comprehensive courses.
            </p>
          </div>
          
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/courses">Courses</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Learning Paths</h3>
            <ul className="footer-links">
              <li><Link to="/courses/frontend">Frontend Development</Link></li>
              <li><Link to="/courses/backend">Backend Development</Link></li>
              <li><Link to="/courses/fullstack">Full Stack Development</Link></li>
              <li><Link to="/courses/cybersecurity">Cybersecurity</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Contact Us</h3>
            <ul className="footer-contact">
              <li><i className="email-icon">✉️</i> support@zyrobyteacademy.com</li>
              <li><i className="phone-icon">📱</i> +1 (123) 456-7890</li>
              <li><i className="location-icon">📍</i> 123 Tech Street, Silicon Valley, CA</li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="copyright">
            &copy; {currentYear} ZyroByte Academy. All rights reserved.
          </div>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <i className="facebook-icon">Facebook</i>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <i className="twitter-icon">Twitter</i>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <i className="linkedin-icon">LinkedIn</i>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <i className="instagram-icon">Instagram</i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;