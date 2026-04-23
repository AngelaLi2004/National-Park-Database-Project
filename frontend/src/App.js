import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Species from './pages/Species';
import NationalParks from './pages/NationalParks';
import Sightings from './pages/Sightings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import './App.css';
import SpeciesDetail from './pages/SpeciesDetail';

function App() {
  const [user, setUser] = useState(null);

  return (
    <BrowserRouter basename={process.env.REACT_APP_BASE_URL || "/"}>
      <div className="App">
        <Navbar user={user} setUser={setUser} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/species" element={<Species />} />
          <Route path="/parks" element={<NationalParks />} />
          <Route path="/sightings" element={<Sightings user={user} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/signup" element={<Signup setUser={setUser} />} /> 
          <Route path="/species/:speciesId" element={<SpeciesDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;