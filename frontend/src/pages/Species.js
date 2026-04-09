import React, { useState, useEffect } from 'react';
import './Species.css';
import { searchSpeciesDB } from '../services/api';

function Species() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedPark, setSelectedPark] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [searchType, setSearchType] = useState('common');
  
  const [hasSearched, setHasSearched] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [searchResults, setSearchResults] = useState([]);
  
  const [selectedSpecies, setSelectedSpecies] = useState(null);

  useEffect(() => {
    // debounce
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length > 0) {
        const results = await searchSpeciesDB(searchTerm, searchType, selectedCategory, selectedPark, sortOrder);
        const uniqueResults = Array.from(new Map(results.map(item => [item.CommonName, item])).values());
        
        setSearchResults(uniqueResults);
        setHasSearched(true);
        setSelectedSpecies(null);
      } else {
        // if clears search box, reset everything
        setSearchResults([]);
        setHasSearched(false);
      }}, 400); 

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, searchType, selectedCategory, selectedPark]);

  // auto sort
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

  // search button
  const handleSearch = async () => {
    if (searchTerm.trim().length > 0) {
      console.log("Searching DB...");
      const results = await searchSpeciesDB(searchTerm, searchType, selectedCategory, selectedPark, sortOrder);
      const uniqueResults = Array.from(new Map(results.map(item => [item.CommonName, item])).values());
      
      setSearchResults(uniqueResults);
      setHasSearched(true);
      setSelectedSpecies(null); 
    }
  };

  const handleCardClick = (species) => {
    setSelectedSpecies(species);
  };

  const carouselImages = ["/animal/1.jpg", "/animal/2.jpg", "/animal/3.png", "/animal/4.jpg", "/animal/5.jpg"];
  const categories = ["Algae", "Bird", "Crab/Lobster/Shrimp", "Fish", "Fungi", "Insect", "Invertebrate", "Mammal", "Nonvascular Plant", "Reptile", "Slug/Snail", "Spider/Scorpion", "Vascular Plant"];
  const nationalParks = ["Acadia", "Arches", "Badlands", "Big Bend", "Biscayne", "Bryce Canyon", "Canyonlands", "Capitol Reef", "Carlsbad Caverns", "Channel Islands", "Death Valley", "Denali", "Everglades", "Glacier", "Grand Canyon", "Grand Teton", "Great Smoky Mountains", "Joshua Tree", "Olympic", "Rocky Mountain", "Yellowstone", "Yosemite", "Zion"];

  useEffect(() => {
    if (!hasSearched && !selectedSpecies) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % carouselImages.length); 
      }, 3000); 
      return () => clearInterval(interval); 
    } 
  }, [hasSearched, selectedSpecies, carouselImages.length]);

  return (
    <div className="page-container">
      <div className="search-section">
        <div className="search-type-toggle">
          <button className={searchType === 'common' ? 'active' : ''} onClick={() => setSearchType('common')}>Common Name</button>
          <button className={searchType === 'scientific' ? 'active' : ''} onClick={() => setSearchType('scientific')}>Scientific Name</button>
        </div>
        
        <div className="main-search-row">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder={searchType === 'common' ? "e.g. Elk" : "e.g. Cervus canadensis"} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <div className="sort-toggle">
            <button className={sortOrder === 'ASC' ? 'active' : ''} onClick={() => setSortOrder('ASC')}>A-Z</button>
            <button className={sortOrder === 'DESC' ? 'active' : ''} onClick={() => setSortOrder('DESC')}>Z-A</button>
          </div>

          <button onClick={handleSearch} className="search-submit-btn">Search</button>
        </div>

        <div className="filters-row">
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="ALL">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>

          <select value={selectedPark} onChange={(e) => setSelectedPark(e.target.value)}>
            <option value="ALL">At All Parks</option>
            {nationalParks.map(park => <option key={park} value={park}>{park} NP</option>)}
          </select>
        </div>
      </div>
      
      {selectedSpecies ? (
        <div className="detail-view-container">
          <button className="back-btn" onClick={() => setSelectedSpecies(null)}>← Back to Results</button>
          <div className="detail-content">
            <div className="detail-left">
              <span className="detail-pill">{selectedSpecies.CommonName}</span>
              <div className="detail-main-img">Image</div>
              <p className="detail-description">
                The <strong>{selectedSpecies.CommonName.toLowerCase()}</strong> ({selectedSpecies.ScientificName}) 
                is a fascinating species categorized under <strong>{selectedSpecies.Category}</strong>.
              </p>
            </div>
            <div className="detail-right">
              <h3>Parks where it can be found:</h3>
              <div className="detail-parks-grid">
                <div className="park-mock-card">Olympic NP</div>
                <div className="park-mock-card">Grand Teton NP</div>
                <div className="park-mock-card">Glacier NP</div>
                <div className="park-mock-card">Arches NP</div>
              </div>
            </div>
          </div>
        </div>
      ) : !hasSearched ? (
        <div className="carousel-container">
          {carouselImages.map((imgUrl, index) => (
            <img key={index} src={imgUrl} alt={`Slide ${index + 1}`} className={`carousel-image ${index === currentImageIndex ? 'active' : ''}`} />
          ))}
          <div className="carousel-indicators">
            {carouselImages.map((_, index) => (
              <span key={index} className={`indicator-dot ${index === currentImageIndex ? 'active-dot' : ''}`}></span>
            ))}
          </div>
        </div>
      ) : (
        <div className="content-split">
          {searchResults.length > 0 ? (
            <div className="grid-panel">
              {searchResults.map((animal, index) => (
                <div key={index} className="grid-card" onClick={() => handleCardClick(animal)}>
                  <div className="card-img-placeholder">Image</div>
                  <h3>{animal.CommonName}</h3>
                  <p className="scientific-name">{animal.ScientificName}</p>
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