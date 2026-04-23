import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Sightings.css';
import { getUserSightings, addSightingDB, deleteSightingDB, searchSpeciesDB, searchLocationsDB } from '../services/api';

function Sightings({ user }) {
  const [sightings, setSightings] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const [species, setSpecies] = useState('');
  const [description, setDescription] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const [selectedValidSpecies, setSelectedValidSpecies] = useState('');
  const [selectedValidLocation, setSelectedValidLocation] = useState('');

  const [filteredSpecies, setFilteredSpecies] = useState([]);
  const [showSpeciesDropdown, setShowSpeciesDropdown] = useState(false);

  const [filteredLocations, setFilteredLocations] = useState([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  const [selectedSpeciesId, setSelectedSpeciesId] = useState(null);
  const [selectedLocationId, setSelectedLocationId] = useState(null);

  useEffect(() => {
    const fetchSightings = async () => {
      if (user) {
        const userSightings = await getUserSightings(user.id);
        setSightings(userSightings);
      }
    };
    fetchSightings();
  }, [user]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (species.trim().length > 0 && species !== selectedValidSpecies) {
        try {
          const results = await searchSpeciesDB(species, 'common', 'ALL', 'ALL', 'ASC');
          const uniqueResults = Array.from(
            new Map(results.map(item => [item.SpeciesID, item])).values()
          );
          setFilteredSpecies(uniqueResults.slice(0, 6));
          setShowSpeciesDropdown(true);
        } catch (error) {
          setFilteredSpecies([]);
          setShowSpeciesDropdown(false);
        }
      } else {
        setShowSpeciesDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [species, selectedValidSpecies]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (locationSearch.trim().length > 0 && locationSearch !== selectedValidLocation) {
        try {
          const results = await searchLocationsDB(locationSearch);
          const uniqueResults = Array.from(
            new Map(results.map(item => [item.LocationID, item])).values()
          );
          setFilteredLocations(uniqueResults.slice(0, 6));
          setShowLocationDropdown(true);
        } catch (error) {
          setFilteredLocations([]);
          setShowLocationDropdown(false);
        }
      } else {
        setShowLocationDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [locationSearch, selectedValidLocation]);

  const handleSelectSpecies = (item) => {
    setSpecies(item.CommonName);
    setSelectedValidSpecies(item.CommonName);
    setSelectedSpeciesId(item.SpeciesID);
    setShowSpeciesDropdown(false);
  };

  const handleLocationChange = (e) => {
    setLocationSearch(e.target.value);
    setSelectedValidLocation('');
    setSelectedLocationId(null);
  };

  const handleSelectLocation = (item) => {
    setLocationSearch(item.Name);
    setSelectedValidLocation(item.Name);
    setSelectedLocationId(item.LocationID);
    setShowLocationDropdown(false);
  };

  const handleSelectCard = (id) => {
    setSelectedId(id);
    const s = sightings.find(item => item.SightingID === id || item.id === id);

    const spName = s?.species || s?.SpeciesName || '';
    setSpecies(spName);
    setSelectedValidSpecies(spName);

    const locName = s?.location || s?.LocationName || '';
    setLocationSearch(locName);
    setSelectedValidLocation(locName);

    setDescription(s?.description || '');
    setDate(s?.date || '');
    setTime(s?.time || '');
  };

  const clearForm = () => {
    setSelectedId(null);
    setSpecies('');
    setSelectedValidSpecies('');
    setDescription('');
    setLocationSearch('');
    setSelectedValidLocation('');
    setDate('');
    setTime('');
    setImageFile(null);
    setFilteredSpecies([]);
    setShowSpeciesDropdown(false);
    setFilteredLocations([]);
    setShowLocationDropdown(false);
  };

  const handleSubmitSighting = async (e) => {
    e.preventDefault();

    if (!species || !locationSearch || !date || !time) {
      alert('Please fill out all required fields marked with *');
      return;
    }

    if (species !== selectedValidSpecies) {
      alert('Invalid Species. Please search and select an exact species from the dropdown list.');
      return;
    }

    if (locationSearch !== selectedValidLocation) {
      alert('Invalid Location. Please search and select an exact location from the dropdown list.');
      return;
    }

    const newSighting = {
      UserID: user.id,
      SpeciesID: selectedSpeciesId,
      LocationID: selectedLocationId,
      SightingDate: `${date}T${time}:00`,
      Description: description,
      ImageURL: null
    };

    try {
      if (selectedId) {
        alert('Updating existing sightings coming soon!');
      } else {
        await addSightingDB(newSighting);
        const updatedList = await getUserSightings(user.id);
        setSightings(updatedList);
      }
      clearForm();
    } catch (err) {
      alert('Failed to save to database: ' + err.message);
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
        alert('Failed to delete from database');
      }
    }
  };

  return (
    <div className="sightings-container">
      <div className="left-panel">
        <div className="header-row">
          <h3>Your Sightings</h3>
          {user && selectedId && (
            <button className="sm-btn delete-btn" onClick={handleDelete}>
              Delete Selected
            </button>
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
              <label
                key={item.id || item.SightingID}
                className={`list-card ${selectedId === (item.id || item.SightingID) ? 'selected-card' : ''}`}
              >
                <div className="card-selector">
                  <input
                    type="radio"
                    name="sighting_selection"
                    checked={selectedId === (item.id || item.SightingID)}
                    onChange={() => handleSelectCard(item.id || item.SightingID)}
                  />
                </div>
                <div className="img-box">Image</div>
                <div className="card-info">
                  <h4>{item.species || item.SpeciesName}</h4>
                  <div className="pill-info">{item.time} {item.date}</div>
                  <div className="location-text">📍 {item.location || item.LocationName}</div>
                  {item.description && <div className="description-text">"{item.description}"</div>}
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="right-panel">
        <div className="header-row">
          <h3>{selectedId ? 'Update Sighting' : 'New Sighting'}</h3>
          {selectedId && (
            <button className="sm-btn cancel-btn" onClick={clearForm}>
              Clear Selection
            </button>
          )}
        </div>

        {!user ? (
          <div className="login-hint-box">
            <p>Log in to record a new sighting.</p>
          </div>
        ) : (
          <form className="add-form" onSubmit={handleSubmitSighting}>
            <div className="form-group autocomplete-group">
              <label>Species <span className="required-asterisk">*</span></label>
              <div className="autocomplete-wrapper">
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={species}
                    onChange={(e) => {
                      setSpecies(e.target.value);
                      setSelectedValidSpecies('');
                      setSelectedSpeciesId(null);
                    }}
                    placeholder="Search from DB..."
                    style={{ paddingRight: '35px' }}
                  />
                  <span style={{ position: 'absolute', right: '10px', fontSize: '14px' }}>
                    {species && species === selectedValidSpecies ? '✅' : (species ? '❌' : '')}
                  </span>
                </div>

                {showSpeciesDropdown && (
                  <ul className="location-dropdown">
                    {filteredSpecies.length > 0 ? (
                      filteredSpecies.map((item, idx) => (
                        <li key={idx} onClick={() => handleSelectSpecies(item)}>
                          {item.CommonName} <span style={{ fontSize: '11px', color: '#888' }}>({item.ScientificName})</span>
                        </li>
                      ))
                    ) : (
                      <li className="no-results">No species found in database</li>
                    )}
                  </ul>
                )}
              </div>
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
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={locationSearch}
                    onChange={handleLocationChange}
                    placeholder="Search from DB..."
                    style={{ paddingRight: '35px' }}
                  />
                  <span style={{ position: 'absolute', right: '10px', fontSize: '14px' }}>
                    {locationSearch && locationSearch === selectedValidLocation ? '✅' : (locationSearch ? '❌' : '')}
                  </span>
                </div>

                {showLocationDropdown && (
                  <ul className="location-dropdown">
                    {filteredLocations.length > 0 ? (
                      filteredLocations.map((item, idx) => (
                        <li key={idx} onClick={() => handleSelectLocation(item)}>
                          {item.Name} <span style={{ fontSize: '11px', color: '#888' }}>({item.Type})</span>
                        </li>
                      ))
                    ) : (
                      <li className="no-results">No location found in database</li>
                    )}
                  </ul>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Date <span className="required-asterisk">*</span><span className="format-hint">(YYYY-MM-DD)</span></label>
              <div className="autocomplete-wrapper">
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label>Time <span className="required-asterisk">*</span><span className="format-hint">(HH:MM AM/PM)</span></label>
              <div className="autocomplete-wrapper">
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label>Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
              />
            </div>

            <button type="submit" className="submit-btn">
              {selectedId ? 'Save Changes' : 'Add Sighting'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Sightings;