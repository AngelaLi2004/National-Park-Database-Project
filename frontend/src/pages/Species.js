import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Species.css';
import { searchSpeciesDB } from '../services/api';

function Species() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedPark, setSelectedPark] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [searchType, setSearchType] = useState('common');

  const [hasSearched, setHasSearched] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length > 0) {
        const results = await searchSpeciesDB(
          searchTerm,
          searchType,
          selectedCategory,
          selectedPark,
          sortOrder
        );

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
  }, [searchTerm, searchType, selectedCategory, selectedPark, sortOrder]);

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

  const handleSearch = async () => {
    if (searchTerm.trim().length > 0) {
      const results = await searchSpeciesDB(
        searchTerm,
        searchType,
        selectedCategory,
        selectedPark,
        sortOrder
      );

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
    '/animal/1.jpg',
    '/animal/2.jpg',
    '/animal/3.png',
    '/animal/4.jpg',
    '/animal/5.jpg'
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

  const nationalParks = [
    'Acadia',
    'Arches',
    'Badlands',
    'Big Bend',
    'Biscayne',
    'Bryce Canyon',
    'Canyonlands',
    'Capitol Reef',
    'Carlsbad Caverns',
    'Channel Islands',
    'Death Valley',
    'Denali',
    'Everglades',
    'Glacier',
    'Grand Canyon',
    'Grand Teton',
    'Great Smoky Mountains',
    'Joshua Tree',
    'Olympic',
    'Rocky Mountain',
    'Yellowstone',
    'Yosemite',
    'Zion'
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
        <div className="search-type-toggle">
          <button
            className={searchType === 'common' ? 'active' : ''}
            onClick={() => setSearchType('common')}
          >
            Common Name
          </button>
          <button
            className={searchType === 'scientific' ? 'active' : ''}
            onClick={() => setSearchType('scientific')}
          >
            Scientific Name
          </button>
        </div>

        <div className="main-search-row">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder={searchType === 'common' ? 'e.g. Elk' : 'e.g. Cervus canadensis'}
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

          <select value={selectedPark} onChange={(e) => setSelectedPark(e.target.value)}>
            <option value="ALL">At All Parks</option>
            {nationalParks.map(park => (
              <option key={park} value={park}>{park} NP</option>
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
              {searchResults.map((animal) => (
                <div
                  key={animal.SpeciesID}
                  className="grid-card"
                  onClick={() => handleCardClick(animal)}
                >
                  <div className="card-img-placeholder">
                    {animal.Image ? (
                      <img
                        src={animal.Image}
                        alt={animal.CommonName}
                        className="card-real-img"
                      />
                    ) : (
                      'Image'
                    )}
                  </div>
                  <h3>{animal.ScientificName}</h3>
                  <p className="scientific-name">{animal.CommonName}</p>
                  <p className="category-text">Category: {animal.Category}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="results-placeholder">
              <p>No species found. Try adjusting your filters!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Species;
