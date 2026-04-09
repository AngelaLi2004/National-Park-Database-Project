import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { loginUser } from '../services/api'; // Import the API

function Login({ setUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const data = await loginUser(username, password);
      setError('');
      setUser({ username: data.user.username, id: data.user.id }); 
      navigate('/sightings'); 
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-box">
        <h2>Login to WildTrack</h2>
        
        {error && <p className="error-text">{error}</p>}
        
        <form onSubmit={handleLogin} className="login-form">
          <label>Username</label>
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          
          <label>Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <button type="submit" className="submit-login-btn">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;