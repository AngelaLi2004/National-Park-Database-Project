import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './SpeciesDetail.css';

function SpeciesDetail() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const species = state?.species;

  if (!species) {
    return (
      <div className="species-detail-page">
        <div className="species-detail-empty">
          <h2>No species data found.</h2>
          <button onClick={() => navigate('/species')}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="species-detail-page">
      <button className="detail-back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="species-detail-content">
        <div className="species-detail-left">
          <div className="species-pill">{species.CommonName}</div>

          <div className="species-main-image">
            {species.Image ? (
              <img src={species.Image} alt={species.CommonName} />
            ) : (
              <div className="image-placeholder">Image</div>
            )}
          </div>

          <div className="species-text-block">
            <h2>{species.CommonName}</h2>
            <p className="species-scientific-name">{species.ScientificName}</p>
            <p><strong>Category:</strong> {species.Category}</p>
            {species.OrderName && <p><strong>Order:</strong> {species.OrderName}</p>}
            <p className="species-description">
              The <strong>{species.CommonName}</strong> ({species.ScientificName}) is a species in the category <strong>{species.Category}</strong>.
            </p>
          </div>
        </div>

        <div className="species-detail-right">
          <div className="detail-info-row">
            <span className="detail-label">Most Recent Sighting:</span>
            <div className="detail-box">Coming soon</div>
          </div>

          <div className="detail-info-row">
            <span className="detail-label">Last Observed Location:</span>
            <div className="detail-box">Coming soon</div>
          </div>

          <div className="detail-info-row">
            <span className="detail-label">Best Time of Year to Spot:</span>
            <div className="detail-blank-box"></div>
          </div>

          <div className="detail-info-row">
            <span className="detail-label">Time of Day:</span>
            <div className="detail-blank-box"></div>
          </div>

          <div className="detail-info-row map-row">
            <span className="detail-label">Geographic Distribution:</span>
            <div className="map-placeholder">Map area coming soon</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SpeciesDetail;