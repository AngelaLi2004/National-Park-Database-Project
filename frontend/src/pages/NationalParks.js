import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './NationParks.css';
import { searchByParkDB } from '../services/api';

function NationalParks() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('ASC');

  const [hasSearched, setHasSearched] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length > 0) {
        const results = await searchByParkDB(searchTerm, selectedCategory, sortOrder);
        const uniqueResults = Array.from(
          new Map(results.map(item => [item.SpeciesID, item])).values()
        );

        setSearchResults(uniqueResults);
        setHasSearched(true);
      } else {
        setSearchResults([]);
        setHasSearched(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedCategory, sortOrder]);

  useEffect(() => {
    if (searchResults.length > 0) {
      const sortedArray = [...searchResults].sort((a, b) => {
        return sortOrder === 'ASC'
          ? a.CommonName.localeCompare(b.CommonName)
          : b.CommonName.localeCompare(a.CommonName);
      });
      setSearchResults(sortedArray);
    }
  }, [sortOrder]);

  const handleSearch = async () => {
    if (searchTerm.trim().length > 0) {
      const results = await searchByParkDB(searchTerm, selectedCategory, sortOrder);
      const uniqueResults = Array.from(
        new Map(results.map(item => [item.SpeciesID, item])).values()
      );

      setSearchResults(uniqueResults);
      setHasSearched(true);
    }
  };

  const handleCardClick = (species) => {
    navigate(`/species/${species.SpeciesID}`, {
      state: { species }
    });
  };

  const carouselImages = [
    "/park/1.jpg",
    "/park/2.jpg",
    "/park/3.jpg",
    "/park/4.webp",
    "/park/5.webp"
  ];

  const usStates = [
    "AK", "AR", "AZ", "CA", "CO", "FL", "HI", "ID", "IN", "KY",
    "ME", "MI", "MN", "MO", "MT", "NC", "ND", "NM", "NV", "OH",
    "OR", "SC", "SD", "TN", "TX", "UT", "VA", "VI", "WA", "WY"
  ];

  const categories = [
    "Algae",
    "Bird",
    "Crab/Lobster/Shrimp",
    "Fish",
    "Fungi",
    "Insect",
    "Invertebrate",
    "Mammal",
    "Nonvascular Plant",
    "Reptile",
    "Slug/Snail",
    "Spider/Scorpion",
    "Vascular Plant"
  ];

  useEffect(() => {
    if (!hasSearched) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % carouselImages.length);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [hasSearched, carouselImages.length]);

  return (
    <div className="page-container">
      <div className="search-section">
        <div className="main-search-row">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by park name (e.g. Yellowstone)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="sort-toggle">
            <button
              className={sortOrder === 'ASC' ? 'active' : ''}
              onClick={() => setSortOrder('ASC')}
            >
              A-Z
            </button>
            <button
              className={sortOrder === 'DESC' ? 'active' : ''}
              onClick={() => setSortOrder('DESC')}
            >
              Z-A
            </button>
          </div>

          <button onClick={handleSearch} className="search-submit-btn">
            Search
          </button>
        </div>

        <div className="filters-row">
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="ALL">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)}>
            <option value="ALL">All States</option>
            {usStates.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
      </div>

      {!hasSearched ? (
        <div className="carousel-container">
          {carouselImages.map((imgUrl, index) => (
            <img
              key={index}
              src={imgUrl}
              alt={`Slide ${index + 1}`}
              className={`carousel-image ${index === currentImageIndex ? 'active' : ''}`}
            />
          ))}
          <div className="carousel-indicators">
            {carouselImages.map((_, index) => (
              <span
                key={index}
                className={`indicator-dot ${index === currentImageIndex ? 'active-dot' : ''}`}
              ></span>
            ))}
          </div>
        </div>
      ) : (
        <div className="content-split">
          {searchResults.length > 0 ? (
            <div className="grid-panel">
              {searchResults.map((species) => (
                <div
                  key={species.SpeciesID}
                  className="grid-card"
                  onClick={() => handleCardClick(species)}
                >
                  <div className="card-img-placeholder">
                    {species.Image ? (
                      <img
                        src={species.Image}
                        alt={species.CommonName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                      />
                    ) : (
                      'Image'
                    )}
                  </div>
                  <h3>{species.CommonName}</h3>
                  <p className="scientific-name">{species.ScientificName}</p>
                  <p className="category-text">Category: {species.Category}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="results-placeholder">
              <p>No species found matching this criteria.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NationalParks;