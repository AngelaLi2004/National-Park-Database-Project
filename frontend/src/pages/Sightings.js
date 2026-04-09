import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Sightings.css';
import { getUserSightings, addSightingDB, deleteSightingDB } from '../services/api';

function Sightings({ user }) {
  const [sightings, setSightings] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [species, setSpecies] = useState('');
  const [description, setDescription] = useState(''); 
  const [locationSearch, setLocationSearch] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const [filteredLocations, setFilteredLocations] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const locationDB = [
    "Running Eagle Falls Nature Trail @ Glacier NP"
  ];

  useEffect(() => {
    const fetchSightings = async () => {
      if (user) {
        const userSightings = await getUserSightings(user.id);
        setSightings(userSightings);
      }
    };
    fetchSightings();
  }, [user]);

  const handleLocationChange = (e) => {
    const input = e.target.value;
    setLocationSearch(input);
    
    if (input.length > 0) {
      const matches = locationDB.filter(loc => 
        loc.toLowerCase().includes(input.toLowerCase())
      );
      setFilteredLocations(matches);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const handleSelectLocation = (loc) => {
    setLocationSearch(loc);
    setShowDropdown(false);
  };

  const handleSelectCard = (id) => {
    setSelectedId(id);
    const s = sightings.find(item => item.SightingID === id);
    setSpecies(s.species);
    setDescription(s.description || ''); 
    setLocationSearch(s.location);
    setDate(s.date);
    setTime(s.time);
  };

  const clearForm = () => {
    setSelectedId(null);
    setSpecies('');
    setDescription('');
    setLocationSearch('');
    setDate('');
    setTime('');
    setImageFile(null);
  };

  const handleSubmitSighting = async (e) => {
    e.preventDefault();

    if (!species || !locationSearch || !date || !time) {
      alert("Please fill out all required fields marked with *");
      return;
    }

    const newSighting = {
      userId: user.id, 
      species: species,
      description: description,
      location: locationSearch,
      date: date,
      time: time
    };

    try {
      if (selectedId) {
        alert("Updating existing sightings coming soon!");
      } else {
        await addSightingDB(newSighting);
        const updatedList = await getUserSightings(user.id);
        setSightings(updatedList);
      }
      clearForm();
    } catch (err) {
      alert("Failed to save to database: " + err.message);
    }
  };

  const handleDelete = async () => {
    if (selectedId) {
      try {
        await deleteSightingDB(selectedId);
        const updatedList = await getUserSightings(user.id);
        setSightings(updatedList);
        clearForm();
      } catch (err) {
        alert("Failed to delete from database");
      }
    }
  };

  return (
    <div className="sightings-container">
      <div className="left-panel">
        <div className="header-row">
          <h3>Your Sightings</h3>
          {user && selectedId && (
             <button className="sm-btn delete-btn" onClick={handleDelete}>Delete Selected</button>
          )}
        </div>

        {!user ? (
          <div className="login-hint-box">
            <p>Please log in to see the wildlife you have spotted!</p>
            <Link to="/login" className="sm-btn login-link-btn">Go to Login</Link>
          </div>
        ) : (
          <div className="list-wrapper">
            {sightings.map((item) => (
              <label key={item.id} className={`list-card ${selectedId === item.id ? 'selected-card' : ''}`}>
                <div className="card-selector">
                  <input 
                    type="radio" 
                    name="sighting_selection"
                    checked={selectedId === item.id}
                    onChange={() => handleSelectCard(item.id)}
                  />
                </div>
                <div className="img-box">Image</div>
                <div className="card-info">
                  <h4>{item.species}</h4>
                  <div className="pill-info">{item.time} {item.date}</div>
                  <div className="location-text">📍 {item.location}</div>
                  {item.description && (
                    <div className="description-text">"{item.description}"</div>
                  )}
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="right-panel">
        <div className="header-row">
          <h3>{selectedId ? "Update Sighting" : "New Sighting"}</h3>
          {selectedId && (
            <button className="sm-btn cancel-btn" onClick={clearForm}>Clear Selection</button>
          )}
        </div>
        
        {!user ? (
          <div className="login-hint-box">
            <p>Log in to record a new sighting.</p>
          </div>
        ) : (
          <form className="add-form" onSubmit={handleSubmitSighting}>
            <div className="form-group">
              <label>Species <span className="required-asterisk">*</span></label>
              <input type="text" value={species} onChange={(e) => setSpecies(e.target.value)} />
            </div>
            
            <div className="form-group align-top">
              <label>Description</label>
              <div className="textarea-wrapper">
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  rows="3"
                  maxLength="500"
                  placeholder="Optional details..."
                  className="form-textarea"
                />
                <div className="char-counter">{description.length} / 500 characters</div>
              </div>
            </div>
            
            <div className="form-group autocomplete-group">
              <label>Location <span className="required-asterisk">*</span></label>
              <div className="autocomplete-wrapper">
                <input 
                  type="text" 
                  value={locationSearch} 
                  onChange={handleLocationChange} 
                  placeholder="Start typing to search..."
                />
                {showDropdown && (
                  <ul className="location-dropdown">
                    {filteredLocations.length > 0 ? (
                      filteredLocations.map((loc, idx) => (
                        <li key={idx} onClick={() => handleSelectLocation(loc)}>{loc}</li>
                      ))
                    ) : (
                      <li className="no-results">No locations found</li>
                    )}
                  </ul>
                )}
              </div>
            </div>
            
            <div className="form-group">
              <label>
                Date <span className="required-asterisk">*</span>
                <span className="format-hint">(YYYY-MM-DD)</span>
              </label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            
            <div className="form-group">
              <label>
                Time <span className="required-asterisk">*</span>
                <span className="format-hint">(HH:MM AM/PM)</span>
              </label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
            
            <div className="form-group">
              <label>Image</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="file-input-native"
              />
            </div>
            
            <button type="submit" className="submit-btn">
              {selectedId ? "Save Changes" : "Add Sighting"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Sightings;