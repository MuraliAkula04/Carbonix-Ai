import React, { useState } from 'react';

export default function TravelEstimator({ onApplyTravel }) {
  const [selectedCity, setSelectedCity] = useState('London');

  const cityDistances = {
    London: 300,
    NewYork: 450,
    Tokyo: 200,
    Rural: 800,
    Berlin: 280,
    Sydney: 520
  };

  const handleApply = () => {
    const km = cityDistances[selectedCity] || 300;
    onApplyTravel(km);
  };

  return (
    <div className="card margin-top drop-in" id="travel-simulation">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Estimate Travel by Metro / Region</h3>
        <span className="badge" style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--secondary)' }}>Regional Norms</span>
      </div>
      <p className="text-sm text-muted">Select your metropolitan region to auto-populate representative monthly commute and travel distance.</p>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1rem' }}>
        <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
          <select
            id="user-city"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
          >
            <option value="London">London (Avg 300 km/mo)</option>
            <option value="NewYork">New York (Avg 450 km/mo)</option>
            <option value="Tokyo">Tokyo (Avg 200 km/mo)</option>
            <option value="Berlin">Berlin (Avg 280 km/mo)</option>
            <option value="Sydney">Sydney (Avg 520 km/mo)</option>
            <option value="Rural">Rural / Suburb (Avg 800 km/mo)</option>
          </select>
        </div>
        <button
          type="button"
          className="btn btn-sm btn-outline"
          id="apply-travel"
          onClick={handleApply}
        >
          <i className="fas fa-check"></i> Apply Distance
        </button>
      </div>
    </div>
  );
}
