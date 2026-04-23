import React, { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import { GeoJSON, MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import './SpeciesDetail.css';
import { getParksBySpeciesId, getSpeciesDetailByPark } from '../services/api';

function MapViewportController({ parkGeometry, sightingPins }) {
  const map = useMap();

  useEffect(() => {
    const pinCoordinates = (sightingPins || [])
      .map((pin) => [Number(pin.Latitude), Number(pin.Longitude)])
      .filter(([lat, lng]) => !Number.isNaN(lat) && !Number.isNaN(lng));

    if (pinCoordinates.length > 0) {
      map.fitBounds(pinCoordinates, { padding: [24, 24] });
      return;
    }

    if (parkGeometry) {
      const bounds = L.geoJSON(parkGeometry).getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [24, 24] });
      }
    }
  }, [map, parkGeometry, sightingPins]);

  return null;
}

function SpeciesDetail() {
  const navigate = useNavigate();
  const { speciesId } = useParams();
  const { state } = useLocation();

  const species = state?.species;
  const [park, setPark] = useState(state?.park || null);
  const [detail, setDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(species && speciesId));
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSelectedPark = async () => {
      if (!speciesId || park) {
        return;
      }

      const parks = await getParksBySpeciesId(speciesId);
      const matchedPark = parks.find((parkOption) => {
        if (state?.selectedPark) {
          return parkOption.ParkName === state.selectedPark;
        }

        return false;
      });

      if (matchedPark) {
        setPark(matchedPark);
      }
    };

    fetchSelectedPark();
  }, [park, speciesId, state]);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!speciesId || !park?.ParkCode) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');

      const response = await getSpeciesDetailByPark(speciesId, park.ParkCode);

      if (!response) {
        setError('Failed to load species park details.');
      } else {
        setDetail(response);
      }

      setIsLoading(false);
    };

    fetchDetail();
  }, [speciesId, park]);

  const parkGeometry = useMemo(() => {
    if (!detail?.parkInfo?.Geometry) {
      return null;
    }

    try {
      return JSON.parse(detail.parkInfo.Geometry);
    } catch (parseError) {
      console.error('Failed to parse park geometry:', parseError);
      return null;
    }
  }, [detail?.parkInfo?.Geometry]);

  const sightingPins = useMemo(() => {
    return (detail?.sightingPins || []).filter((pin) => {
      const latitude = Number(pin.Latitude);
      const longitude = Number(pin.Longitude);
      return !Number.isNaN(latitude) && !Number.isNaN(longitude);
    });
  }, [detail?.sightingPins]);

  const mapCenter = useMemo(() => {
    if (sightingPins.length > 0) {
      const totals = sightingPins.reduce(
        (accumulator, pin) => ({
          latitude: accumulator.latitude + Number(pin.Latitude),
          longitude: accumulator.longitude + Number(pin.Longitude),
        }),
        { latitude: 0, longitude: 0 }
      );

      return [
        totals.latitude / sightingPins.length,
        totals.longitude / sightingPins.length,
      ];
    }

    if (parkGeometry) {
      const bounds = L.geoJSON(parkGeometry).getBounds();
      if (bounds.isValid()) {
        const center = bounds.getCenter();
        return [center.lat, center.lng];
      }
    }

    return [39.8283, -98.5795];
  }, [parkGeometry, sightingPins]);

  const hasMapData = Boolean(parkGeometry || sightingPins.length > 0);

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

  const mostRecentSightingText = detail?.mostRecentSighting?.SightingDate
    ? new Date(detail.mostRecentSighting.SightingDate).toLocaleString()
    : 'No sighting data available';

  const lastObservedLocationText = detail?.mostRecentSighting?.LocationName
    ? `${detail.mostRecentSighting.LocationName}${detail?.mostRecentSighting?.ParkName ? `, ${detail.mostRecentSighting.ParkName}` : ''}`
    : 'No sighting data available';

  const selectedParkLabel = park?.ParkName || state?.selectedPark || 'No park selected';

  return (
    <div className="species-detail-page">
      <button className="detail-back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="species-detail-content">
        <div className="species-detail-left">
          <div className="species-pill">{species.CommonName}</div>
          <div className="species-selected-park">{selectedParkLabel}</div>

          <div className="species-main-image">
            {species.Image ? (
              <img src={species.Image} alt={species.CommonName} />
            ) : (
              <div className="image-placeholder">Image</div>
            )}
          </div>

          <div className="species-text-block">
            <h2>{species.ScientificName}</h2>
            <p className="species-scientific-name">{species.CommonName}</p>
            <p><strong>Category:</strong> {species.Category}</p>
            {species.OrderName && <p><strong>Order:</strong> {species.OrderName}</p>}
            <p className="species-description">
              The <strong>{species.ScientificName}</strong> ({species.CommonName}) is a species in the category <strong>{species.Category}</strong>.
            </p>
          </div>
        </div>

        <div className="species-detail-right">
          <div className="detail-info-row">
            <span className="detail-label">Most Recent Sighting:</span>
            <div className="detail-box">{mostRecentSightingText}</div>
          </div>

          <div className="detail-info-row">
            <span className="detail-label">Last Observed Location:</span>
            <div className="detail-box">{lastObservedLocationText}</div>
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
            <div className="map-placeholder">
              {isLoading ? (
                <div className="map-status">Loading map...</div>
              ) : error ? (
                <div className="map-status">{error}</div>
              ) : !park ? (
                <div className="map-status">Select a park to view map data.</div>
              ) : (
                <>
                  {!hasMapData && (
                    <div className="map-overlay-message">
                      No geometry data available for this species in this park.
                    </div>
                  )}
                  <MapContainer
                    center={mapCenter}
                    zoom={hasMapData ? 10 : 4}
                    scrollWheelZoom={true}
                    className="species-leaflet-map"
                  >
                    <MapViewportController
                      parkGeometry={parkGeometry}
                      sightingPins={sightingPins}
                    />

                    <TileLayer
                      attribution='&copy; OpenStreetMap contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {parkGeometry && (
                      <GeoJSON
                        data={parkGeometry}
                        style={() => ({
                          color: '#556b44',
                          weight: 2,
                          fillColor: '#899c75',
                          fillOpacity: 0.2,
                        })}
                      />
                    )}

                    {sightingPins.map((pin) => (
                      <CircleMarker
                        key={pin.LocationID}
                        center={[Number(pin.Latitude), Number(pin.Longitude)]}
                        radius={8}
                        pathOptions={{
                          color: '#2b3a20',
                          fillColor: '#899c75',
                          fillOpacity: 0.9,
                          weight: 2,
                        }}
                      >
                        <Popup>
                          <div className="map-popup">
                            <strong>{pin.LocationName}</strong>
                            <div>{pin.LocationType}</div>
                            <div>Sightings: {pin.SightingCount}</div>
                          </div>
                        </Popup>
                      </CircleMarker>
                    ))}
                  </MapContainer>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SpeciesDetail;
