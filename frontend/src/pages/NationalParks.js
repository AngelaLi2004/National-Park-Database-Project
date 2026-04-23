import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './NationParks.css';
import { searchByParkDB, getAllNationalParks } from '../services/api';

function NationalParks() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('ASC');

  const [hasSearched, setHasSearched] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [searchResults, setSearchResults] = useState([]);
  const [parkOptions, setParkOptions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [parkLoadError, setParkLoadError] = useState('');
  const [selectedPark, setSelectedPark] = useState('');

  useEffect(() => {
    const fetchParks = async () => {
      try {
        const parks = await getAllNationalParks();
        setParkOptions(parks);
        setParkLoadError('');
      } catch (error) {
        console.error('Failed to fetch park list:', error);
        setParkLoadError('Park suggestions are unavailable right now, but you can still search by typing a park name.');
      }
    };

    fetchParks();
  }, []);

  useEffect(() => {
    if (searchResults.length > 0) {
      setSearchResults((prevResults) => {
        const sortedArray = [...prevResults].sort((a, b) => {
          return sortOrder === 'ASC'
            ? a.ScientificName.localeCompare(b.ScientificName)
            : b.ScientificName.localeCompare(a.ScientificName);
        });

        return sortedArray;
      });
    }
  }, [sortOrder]);

  const filteredParkOptions = parkOptions
    .filter((park) => park.toLowerCase().includes(searchTerm.trim().toLowerCase()))
    .slice(0, 100);

  const handleSearch = async () => {
    const trimmed = searchTerm.trim();

    if (!trimmed) return;

    if (!selectedPark || selectedPark !== trimmed) {
      alert('Please select a national park from the dropdown list before searching.');
      return;
    }

    try {
      const results = await searchByParkDB(selectedPark, selectedCategory, sortOrder);

      const uniqueResults = Array.from(
        new Map(results.map(item => [item.SpeciesID, item])).values()
      );

      setSearchResults(uniqueResults);
      setHasSearched(true);
      setShowSuggestions(false);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const handleSuggestionClick = (park) => {
    setSearchTerm(park);
    setSelectedPark(park);
    setShowSuggestions(false);
  };

  const handleCardClick = (species) => {
    navigate(`/species/${species.SpeciesID}`, {
      state: {
        species,
        selectedPark,
      }
    });
  };

  const carouselImages = [
    '/park/1.jpg',
    '/park/2.jpg',
    '/park/3.jpg',
    '/park/4.webp',
    '/park/5.webp'
  ];

  const categories = [
    'Algae',
    'Bird',
    'Crab/Lobster/Shrimp',
    'Fish',
    'Fungi',
    'Insect',
    'Invertebrate',
    'Mammal',
    'Nonvascular Plant',
    'Reptile',
    'Slug/Snail',
    'Spider/Scorpion',
    'Vascular Plant'
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

          <div className="park-search-input-wrap">
            <input
              type="text"
              placeholder="Search a national park..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSelectedPark('');
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => {
                setTimeout(() => setShowSuggestions(false), 150);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />

            {showSuggestions && filteredParkOptions.length > 0 && (
              <div className="park-suggestions">
                {filteredParkOptions.map((park) => (
                  <button
                    key={park}
                    type="button"
                    className="park-suggestion-item"
                    onMouseDown={() => handleSuggestionClick(park)}
                  >
                    {park}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="sort-toggle">
            <button
              type="button"
              className={sortOrder === 'ASC' ? 'active' : ''}
              onClick={() => setSortOrder('ASC')}
            >
              A-Z
            </button>
            <button
              type="button"
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

        {parkLoadError && <p className="park-search-message">{parkLoadError}</p>}

        <div className="filters-row">
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="ALL">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
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
                        className="card-real-img"
                      />
                    ) : (
                      'Image'
                    )}
                  </div>
                  <h3>{species.ScientificName}</h3>
                  <p className="scientific-name">{species.CommonName}</p>
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
