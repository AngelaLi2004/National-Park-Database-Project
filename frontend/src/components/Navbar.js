import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar({ user, setUser }) {
  const location = useLocation();

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo-container">
        <h2> WildTrack</h2>
      </Link>
      
      <div className="nav-toggle">
        <Link 
          to="/sightings" 
          className={location.pathname === '/sightings' ? 'nav-link active' : 'nav-link'}
        >
          Sightings
        </Link>
        <Link 
          to="/species" 
          className={location.pathname === '/species' ? 'nav-link active' : 'nav-link'}
        >
          Species
        </Link>
        <Link 
          to="/parks" 
          className={location.pathname === '/parks' ? 'nav-link active' : 'nav-link'}
        >
          National Parks
        </Link>
      </div>

      {user ? (
        <button onClick={handleLogout} className="login-btn">Logout ({user.username})</button>
      ) : (
        <div className="auth-buttons">
          <Link to="/login" className="login-btn">Login</Link>
          <Link to="/signup" className="signup-btn">Sign Up</Link>
        </div>
      )}
    </nav>
  );
}

export default Navbar;