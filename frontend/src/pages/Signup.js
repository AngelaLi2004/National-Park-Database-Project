import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css'; 
import { signupUser } from '../services/api'; // Import the API

function Signup({ setUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }
    
    if (username.trim() === '' || password.trim() === '') {
      setError('Please fill out all fields.');
      return;
    }

    try {
      const data = await signupUser(username, password);
      
      setError('');
      setUser({ username: username, id: data.userId });
      navigate('/sightings'); 

    } catch (err) {
      setError(err.message);
    }
  };


  return (
    <div className="login-page-container">
      <div className="login-box">
        <h2>Join WildTrack</h2>
        
        {error && <p className="error-text">{error}</p>}
        
        <form onSubmit={handleSignup} className="login-form">
          <label>Username</label>
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a username"
          />
          
          <label>Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
          />

          <label>Confirm Password</label>
          <input 
            type="password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Type it again"
          />
          <button type="submit" className="submit-login-btn">Sign Up</button></form>
        <p className="hint-text"> Already have an account? <Link to="/login">Login here</Link></p>
      </div>
    </div>
  );
}

export default Signup;