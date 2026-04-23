import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './SpeciesParkSelect.css';


function SpeciesParkSelect() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { speciesId } = useParams();

  const species = state?.species;

  const [parks, setParks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSpeciesParks = async () => {
      try {
        const response = await fetch(`http://localhost:3007/api/species/${speciesId}/parks`);

        if (!response.ok) {
          throw new Error('Failed to fetch parks for species');
        }

        const data = await response.json();
        setParks(data);
      } catch (err) {
        setError('Failed to load parks.');
      } finally {
        setLoading(false);
      }
    };

    fetchSpeciesParks();
  }, [speciesId]);

  const handleParkClick = (park) => {
    navigate(`/species/${speciesId}`, {
      state: {
        species,
        selectedPark: park.ParkName,
        park
      }
    });
  };

  if (!species) {
    return (
      <div className="species-park-page">
        <div className="species-park-empty">
          <h2>No species data found.</h2>
          <button className="species-park-back-btn" onClick={() => navigate('/species')}>
            Back to Species
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="species-park-page">
      <button className="species-park-back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="species-park-content">
        <div className="species-park-left">
          <div className="species-park-pill">{species.ScientificName}</div>

          <div className="species-park-image-box">
            {species.Image ? (
              <img
                src={species.Image}
                alt={species.CommonName}
                className="species-park-main-image"
              />
            ) : (
              <div className="species-park-image-placeholder">Image</div>
            )}
          </div>

          <div className="species-park-text">
            <h2>{species.ScientificName}</h2>
            <p className="species-park-subtitle">{species.CommonName}</p>
            <p className="species-park-description">
              The <strong>{species.CommonName}</strong> ({species.ScientificName}) is a species
              in the category <strong>{species.Category}</strong>.
            </p>
          </div>
        </div>

        <div className="species-park-right">
          <h3 className="species-park-title">Select a National Park</h3>

          {loading ? (
            <p className="species-park-message">Loading parks...</p>
          ) : error ? (
            <p className="species-park-message">{error}</p>
          ) : parks.length === 0 ? (
            <p className="species-park-message">No parks found for this species.</p>
          ) : (
            <div className="species-park-grid">
              {parks.map((park) => (
                <div
                  key={park.ParkCode}
                  className="park-select-card"
                  onClick={() => handleParkClick(park)}
                >
                  <div className="park-select-image-box">
                    {park.Image ? (
                      <img
                        src={park.Image}
                        alt={park.ParkName}
                        className="park-select-image"
                      />
                    ) : (
                      <div className="park-select-placeholder">Park Image</div>
                    )}
                  </div>

                  <div className="park-select-name">{park.ParkName}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SpeciesParkSelect;