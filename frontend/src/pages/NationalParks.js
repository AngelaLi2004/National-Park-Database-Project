import React, { useState, useEffect } from 'react';
import './NationParks.css'; 

function NationalParks() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('ASC');

  const [hasSearched, setHasSearched] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // const [searchResults, setSearchResults] = useState([]);

  const carouselImages = ["/park/1.jpg", "/park/2.jpg", "/park/3.jpg", "/park/4.webp", "/park/5.webp"];

  const usStates = [
    "AK", "AR", "AZ", "CA", "CO", "FL", "HI", "ID", "IN", "KY", "ME", "MI", "MN", "MO", "MT", "NC", "ND", "NM", "NV", "OH", "OR", "SC", "SD", "TN", "TX", "UT", "VA", "VI", "WA", "WY"
  ];

  const categories = [
    "Algae", "Bird", "Crab/Lobster/Shrimp", "Fish", "Fungi", "Insect", 
    "Invertebrate", "Mammal", "Nonvascular Plant", "Reptile", 
    "Slug/Snail", "Spider/Scorpion", "Vascular Plant"];

  useEffect(() => {
    if (!hasSearched) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % carouselImages.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [hasSearched, carouselImages.length]);

  const handleSearch = () => {
    console.log("Ready to send to backend:", { searchTerm, selectedState, selectedCategory, sortOrder });
    setHasSearched(true);
  };

  return (
    <div className="page-container">
      <div className="search-section">
        <div className="main-search-row">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search by park name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <div className="sort-toggle">
            <button 
              className={sortOrder === 'ASC' ? 'active' : ''} 
              onClick={() => setSortOrder('ASC')}
            >A-Z</button>
            <button 
              className={sortOrder === 'DESC' ? 'active' : ''} 
              onClick={() => setSortOrder('DESC')}
            >Z-A</button>
          </div>

          <button onClick={handleSearch} className="search-submit-btn">Search</button>
        </div>

        <div className="filters-row">
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="ALL">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>

          <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)}>
            <option value="ALL">All States</option>
            {usStates.map(state => <option key={state} value={state}>{state}</option>)}
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
        <div className="results-placeholder"></div>
      )}
    </div>
  );
}

export default NationalParks;