import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './SpeciesDetail.css';

function SpeciesDetail() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { speciesId } = useParams();

  const species = state?.species;
  const selectedPark = state?.selectedPark || '';
  const initialPark = state?.park || null;

  const [resolvedPark, setResolvedPark] = useState(initialPark);
  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const normalizeParkName = (name) => {
    if (!name) return '';
    return name
      .toLowerCase()
      .replace(/\s+national\s+park/g, '')
      .replace(/\s+np/g, '')
      .replace(/[^\w\s]/g, '')
      .trim();
  };

  useEffect(() => {
    const resolveParkInfo = async () => {
      if (!species || !speciesId) {
        setError('Missing species information.');
        setLoading(false);
        return;
      }

      if (initialPark?.ParkCode) {
        setResolvedPark(initialPark);
        return;
      }

      if (!selectedPark) {
        setError('Missing species or park information.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:3007/api/species/${speciesId}/parks`);

        if (!response.ok) {
          throw new Error('Failed to fetch park list for species');
        }

        const parks = await response.json();

        const normalizedSelected = normalizeParkName(selectedPark);

        const matchedPark =
          parks.find(
            (park) => normalizeParkName(park.ParkName) === normalizedSelected
          ) ||
          parks.find(
            (park) =>
              normalizeParkName(park.ParkName).includes(normalizedSelected) ||
              normalizedSelected.includes(normalizeParkName(park.ParkName))
          );

        if (!matchedPark) {
          setError('Could not match the selected park to this species.');
          setLoading(false);
          return;
        }

        setResolvedPark(matchedPark);
      } catch (err) {
        setError('Failed to resolve park information.');
        setLoading(false);
      }
    };

    resolveParkInfo();
  }, [species, speciesId, initialPark, selectedPark]);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!species || !speciesId || !resolvedPark?.ParkCode) {
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:3007/api/species/detail?speciesId=${speciesId}&parkCode=${resolvedPark.ParkCode}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch species detail');
        }

        const data = await response.json();
        setDetailData(data);
        setError('');
      } catch (err) {
        setError('Failed to load species detail.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [species, speciesId, resolvedPark]);

  const formattedRecentTime = useMemo(() => {
    const raw = detailData?.mostRecentSighting?.SightingDate;
    if (!raw) return 'Coming soon';

    const dateObj = new Date(raw);
    if (Number.isNaN(dateObj.getTime())) return 'Coming soon';

    const timeText = dateObj.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit'
    });

    const dateText = dateObj.toLocaleDateString();
    return `${timeText} ${dateText}`;
  }, [detailData]);

  const formattedLocation = useMemo(() => {
    const recent = detailData?.mostRecentSighting;
    if (!recent) return 'Coming soon';

    if (recent.LocationName && recent.ParkName) {
      return `${recent.LocationName} @ ${recent.ParkName}`;
    }

    if (recent.LocationName) return recent.LocationName;
    if (recent.ParkName) return recent.ParkName;

    return 'Coming soon';
  }, [detailData]);

  const monthlyBars = useMemo(() => {
    const source = detailData?.monthlyDistribution || [];
    const monthMap = new Map(
      source.map((item) => [Number(item.Month), Number(item.SightingCount)])
    );

    const fullMonths = Array.from({ length: 12 }, (_, i) => ({
      label: String(i + 1),
      value: monthMap.get(i + 1) || 0
    }));

    const maxValue = Math.max(...fullMonths.map((item) => item.value), 1);

    return fullMonths.map((item) => ({
      ...item,
      heightPercent: item.value > 0 ? (item.value / maxValue) * 100 : 0
    }));
  }, [detailData]);

  const hourlyBars = useMemo(() => {
    const source = detailData?.hourlyDistribution || [];
    const hourMap = new Map(
      source.map((item) => [Number(item.Hour), Number(item.SightingCount)])
    );

    const fullHours = Array.from({ length: 24 }, (_, i) => ({
      label: String(i),
      value: hourMap.get(i) || 0
    }));

    const maxValue = Math.max(...fullHours.map((item) => item.value), 1);

    return fullHours.map((item) => ({
      ...item,
      heightPercent: item.value > 0 ? (item.value / maxValue) * 100 : 0
    }));
  }, [detailData]);

  const hasMonthlyData = monthlyBars.some((item) => item.value > 0);
  const hasHourlyData = hourlyBars.some((item) => item.value > 0);

  if (!species) {
    return (
      <div className="species-detail-page">
        <div className="species-detail-empty">
          <h2>No species data found.</h2>
          <button className="detail-back-btn" onClick={() => navigate('/species')}>
            Back to Species
          </button>
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
          <div className="detail-pill">{species.CommonName}</div>

          <div className="detail-main-img-box">
            {species.Image ? (
              <img
                src={species.Image}
                alt={species.CommonName}
                className="detail-main-img"
              />
            ) : (
              <div className="detail-main-img-placeholder">Image</div>
            )}
          </div>

          <div className="detail-text-block">
            <h2>{species.ScientificName}</h2>
            <p className="detail-subtitle">{species.CommonName}</p>
            <p><strong>Category:</strong> {species.Category}</p>
            {species.OrderName && <p><strong>Order:</strong> {species.OrderName}</p>}
            <p className="detail-description">
              The <strong>{species.ScientificName}</strong> ({species.CommonName}) is a species in the category <strong>{species.Category}</strong>.
            </p>
            {(resolvedPark?.ParkName || selectedPark) && (
              <p className="detail-park-label">
                <strong>Park:</strong> {resolvedPark?.ParkName || selectedPark}
              </p>
            )}
          </div>
        </div>

        <div className="species-detail-right">
          {loading ? (
            <p className="detail-message">Loading detail data...</p>
          ) : error ? (
            <p className="detail-message">{error}</p>
          ) : (
            <>
              <div className="detail-info-row">
                <div className="detail-label">Most Recent Sighting:</div>
                <div className="detail-info-box">{formattedRecentTime}</div>
              </div>

              <div className="detail-info-row">
                <div className="detail-label">Last Observed Location:</div>
                <div className="detail-info-box">{formattedLocation}</div>
              </div>

              <div className="detail-chart-row">
                <div className="detail-label">Best Time of Year to Spot:</div>
                <div className="detail-chart-box">
                  {hasMonthlyData ? (
                    <div className="mini-chart">
                      {monthlyBars.map((item) => (
                        <div key={item.label} className="mini-bar-group">
                          <div className="mini-bar-track">
                            <div
                              className="mini-bar-fill"
                              style={{ height: `${item.heightPercent}%` }}
                              title={`Month ${item.label}: ${item.value}`}
                            ></div>
                          </div>
                          <div className="mini-bar-label">{item.label}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="chart-empty-state">No sighting data yet</div>
                  )}
                </div>
              </div>

              <div className="detail-chart-row">
                <div className="detail-label">Time of Day:</div>
                <div className="detail-chart-box">
                  {hasHourlyData ? (
                    <div className="mini-chart mini-chart-hourly">
                      {hourlyBars.map((item) => (
                        <div key={item.label} className="mini-bar-group">
                          <div className="mini-bar-track">
                            <div
                              className="mini-bar-fill"
                              style={{ height: `${item.heightPercent}%` }}
                              title={`${item.label}:00 - ${item.value}`}
                            ></div>
                          </div>
                          <div className="mini-bar-label small-hour-label">{item.label}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="chart-empty-state">No sighting data yet</div>
                  )}
                </div>
              </div>

              <div className="detail-map-row">
                <div className="detail-label">Geographic Distribution:</div>
                <div className="detail-map-box">
                  <div className="detail-map-placeholder">Map area coming soon</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SpeciesDetail;