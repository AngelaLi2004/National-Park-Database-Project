import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login({ setUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    
    if (username === '111' && password === '123') {
      setError('');
      setUser({ username: '111', id: 1 });
      navigate('/sightings'); 
    } else {
      setError('Invalid username or password');
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
        
        <p className="hint-text">Hint:111 / p123</p>
      </div>
    </div>
  );
}

export default Login;