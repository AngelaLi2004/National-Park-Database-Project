import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const navigate = useNavigate();

  const scrollToExplore = () => {
    const exploreSection = document.getElementById('explore-section');
    if (exploreSection) {
      exploreSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="home-page-wrapper">

      <section className="hero-section">
        <div className="hero-content">
          <h1>Discover the Wild.</h1>
          <p>
            Track, explore, and connect with nature's most incredible species across America's National Parks. 
            Whether you are a casual tourist or a serious wildlife enthusiast, your journey starts here!!!
          </p>
          <button className="hero-btn" onClick={scrollToExplore}>
            Start Exploring ↓
          </button>
        </div>
      </section>

      <section id="explore-section" className="selection-section">
        <h2>What would you like to discover today?</h2>
        
        <div className="choice-cards-container">
          
          <div className="choice-card" onClick={() => navigate('/species')}>
            <div className="card-image-placeholder species-bg">
              <span>🐻</span>
            </div>
            <div className="card-text">
              <h3>Search by Species</h3>
              <p>Know what animal you want to see? Find out exactly which National Parks they call home.</p>
              <button className="navigate-btn">Explore Species</button>
            </div>
          </div>

          <div className="choice-card" onClick={() => navigate('/parks')}>
            <div className="card-image-placeholder parks-bg">
              <span>🌲</span>
            </div>
            <div className="card-text">
              <h3>Search by National Park</h3>
              <p>Planning a trip? Discover the rich biodiversity and wildlife hotspots waiting for you.</p>
              <button className="navigate-btn">Explore Parks</button>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}

export default Home;