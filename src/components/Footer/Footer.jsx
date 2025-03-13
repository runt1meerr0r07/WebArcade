import React from 'react';
import './Footer.css';
import logo from './logo.png'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-logo">
        <img src={logo} alt="MiniGames Logo" className="footer-logo-img" />
        </div>

        <div className="footer-links">
          <a href="#" className="footer-link">Contact</a>
          <a href="#" className="footer-link">Privacy</a>
          <a href="#" className="footer-link">Blog</a>
          <a href="#" className="footer-link">Store</a>
          <a href="#" className="footer-link">Careers</a>
        </div>

        <div className="social-icons">
          <div className="social-icon">
            <i className="fab fa-twitter"></i>
          </div>
          <div className="social-icon">
            <i className="fab fa-youtube"></i>
          </div>
          <div className="social-icon">
            <i className="fab fa-instagram"></i>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;