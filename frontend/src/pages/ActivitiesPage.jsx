import React, { useState, useEffect } from 'react';
import ApiClient from '../services/api';
import BillOcrSimulator from '../components/BillOcrSimulator';
import TravelEstimator from '../components/TravelEstimator';
import {
  Zap, Car, Utensils, FileText, MapPin, Save, Plus, Filter,
  Trash2, ChevronDown, ClipboardList, Layers, X, Database
} from 'lucide-react';

export default function ActivitiesPage() {
  const [electricity, setElectricity] = useState('');
  const [travel, setTravel] = useState('');
  const [food, setFood] = useState('mixed');
  const [preview, setPreview] = useState(null);

  const [showOcr, setShowOcr] = useState(false);
  const [showTravelSim, setShowTravelSim] = useState(false);
  const [showSingleModal, setShowSingleModal] = useState(false);
  const [singleCategory, setSingleCategory] = useState('transport');
  const [singleType, setSingleType] = useState('car');
  const [singleQuantity, setSingleQuantity] = useState('');
  const [singleUnit, setSingleUnit] = useState('km');

  const [activities, setActivities] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const loadActivities = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.getActivities({
        ...(categoryFilter && { category: categoryFilter }),
        limit: 50
      });
      if (res.success && res.data?.activities) {
        setActivities(res.data.activities);
      }
    } catch (err) {
      console.error('Error loading activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadActivities(); }, [categoryFilter]);

  useEffect(() => {
    const kwh = parseFloat(electricity) || 0;
    const km = parseFloat(travel) || 0;
    if (kwh > 0 || km > 0 || food) {
      ApiClient.previewBatch({ electricity: kwh, travel: km, food })
        .then(res => { if (res.success) setPreview(res.data); })
        .catch(() => {});
    } else {
      setPreview(null);
    }
  }, [electricity, travel, food]);

  const handleBatchSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');
    try {
      const res = await ApiClient.recordBatch({
        electricity: parseFloat(electricity) || 0,
        travel: parseFloat(travel) || 0,
        food
      });
      if (res.success) {
        setSuccessMsg('Activities recorded successfully!');
        setElectricity('');
        setTravel('');
        loadActivities();
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      alert(err.message || 'Failed to record activity');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    const qty = parseFloat(singleQuantity);
    if (!qty || qty <= 0) return;
    try {
      const res = await ApiClient.createActivity({
        category: singleCategory,
        activityType: singleType,
        quantity: qty,
        unit: singleUnit
      });
      if (res.success) {
        setShowSingleModal(false);
        setSingleQuantity('');
        loadActivities();
      }
    } catch (err) {
      alert(err.message || 'Failed to create activity');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this activity record?')) return;
    try {
      await ApiClient.deleteActivity(id);
      setActivities(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      alert('Could not delete activity');
    }
  };

  const getCatIcon = (cat) => {
    if (cat === 'electricity') return { Icon: Zap, bg: 'rgba(234,179,8,0.15)', color: 'var(--warning)' };
    if (cat === 'food') return { Icon: Utensils, bg: 'rgba(34,197,94,0.15)', color: 'var(--success)' };
    return { Icon: Car, bg: 'rgba(59,130,246,0.15)', color: 'var(--secondary)' };
  };

  return (
    <div className="fade-in">
      {/* Batch Entry Card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
              <Database size={20} style={{ color: 'var(--primary)' }} />
              <h2 style={{ margin: 0 }}>Record Lifestyle Activities</h2>
            </div>
            <p className="subtitle" style={{ margin: 0 }}>
              Log monthly consumption or single events. Emissions are calculated server-side with stored IPCC factors.
            </p>
          </div>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setShowSingleModal(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
          >
            <Plus size={15} /> Specific Activity
          </button>
        </div>

        <form onSubmit={handleBatchSubmit} className="data-form form-grid">
          {/* Electricity */}
          <div className="input-group">
            <label htmlFor="electricity" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Zap size={14} style={{ color: 'var(--warning)' }} /> Electricity Usage (kWh)
            </label>
            <div className="input-wrapper">
              <i className="fas fa-bolt"></i>
              <input type="number" id="electricity" min="0" step="0.1" placeholder="e.g. 240"
                value={electricity} onChange={(e) => setElectricity(e.target.value)} />
              <button type="button" className="btn-icon small tool-btn" title="Simulate Bill Upload (OCR)"
                onClick={() => { setShowOcr(!showOcr); setShowTravelSim(false); }}>
                <FileText size={15} />
              </button>
            </div>
          </div>

          {/* Travel */}
          <div className="input-group">
            <label htmlFor="travel" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Car size={14} style={{ color: 'var(--secondary)' }} /> Travel Distance (km)
            </label>
            <div className="input-wrapper">
              <i className="fas fa-car"></i>
              <input type="number" id="travel" min="0" step="0.1" placeholder="e.g. 350"
                value={travel} onChange={(e) => setTravel(e.target.value)} />
              <button type="button" className="btn-icon small tool-btn" title="Estimate Transport by Region"
                onClick={() => { setShowTravelSim(!showTravelSim); setShowOcr(false); }}>
                <MapPin size={15} />
              </button>
            </div>
          </div>

          {/* Food */}
          <div className="input-group">
            <label htmlFor="food" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Utensils size={14} style={{ color: 'var(--success)' }} /> Dietary Profile
            </label>
            <div className="input-wrapper">
              <i className="fas fa-utensils"></i>
              <select id="food" value={food} onChange={(e) => setFood(e.target.value)}>
                <option value="vegetarian">🥗 Vegetarian (20 kg CO₂ est.)</option>
                <option value="vegan">🌱 Fully Vegan (15 kg CO₂ est.)</option>
                <option value="mixed">🍽️ Mixed Diet (40 kg CO₂ est.)</option>
                <option value="meat">🥩 Heavy Meat (70 kg CO₂ est.)</option>
              </select>
            </div>
          </div>

          {/* Live Preview */}
          {preview && preview.total > 0 && (
            <div style={{
              gridColumn: '1 / -1',
              padding: '0.9rem 1.2rem',
              background: 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(6,182,212,0.06))',
              borderRadius: '12px',
              border: '1px solid rgba(16,185,129,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.6rem'
            }}>
              <div style={{ display: 'flex', gap: '1.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span className="text-sm text-muted" style={{ fontWeight: 600 }}>Real-time Preview:</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                  <Zap size={14} style={{ color: 'var(--warning)' }} />{preview.electricity} kg
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                  <Car size={14} style={{ color: 'var(--secondary)' }} />{preview.travel} kg
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                  <Utensils size={14} style={{ color: 'var(--success)' }} />{preview.food} kg
                </span>
              </div>
              <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.15rem' }}>
                Total: {preview.total} kg CO₂
              </div>
            </div>
          )}

          <div className="form-actions" style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="btn btn-primary" disabled={submitting || (!electricity && !travel)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              {submitting
                ? <><i className="fas fa-spinner fa-spin"></i> Saving...</>
                : <><Save size={16} /> Save & Calculate</>}
            </button>
            {successMsg && (
              <span className="text-success" style={{ marginLeft: '1rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <i className="fas fa-check-circle"></i> {successMsg}
              </span>
            )}
          </div>
        </form>
      </div>

      {showOcr && <BillOcrSimulator onApplyValue={(kwh) => { setElectricity(kwh); setShowOcr(false); }} />}
      {showTravelSim && <TravelEstimator onApplyTravel={(km) => { setTravel(km); setShowTravelSim(false); }} />}

      {/* Activity History Table */}
      <div className="card margin-top">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ClipboardList size={18} style={{ color: 'var(--primary)' }} />
            <h3 style={{ margin: 0 }}>Activity Records & Emission Factors</h3>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <Filter size={14} style={{ color: 'var(--text-muted)' }} />
            {['', 'electricity', 'transport', 'food'].map(cat => (
              <button key={cat}
                className={`btn btn-sm ${categoryFilter === cat ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setCategoryFilter(cat)}
                style={{ textTransform: 'capitalize', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                {cat === 'electricity' && <Zap size={13} />}
                {cat === 'transport' && <Car size={13} />}
                {cat === 'food' && <Utensils size={13} />}
                {cat || 'All'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <i className="fas fa-spinner fa-spin fa-2x text-primary"></i>
          </div>
        ) : activities.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem', textAlign: 'center' }}>
            <Layers size={40} style={{ margin: '0 auto 0.8rem auto', display: 'block', color: 'var(--text-muted)' }} />
            <p>No activity records found.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.83rem', fontWeight: 600 }}>
                  <th style={{ padding: '0.75rem 0.6rem' }}>Date</th>
                  <th style={{ padding: '0.75rem 0.6rem' }}>Category</th>
                  <th style={{ padding: '0.75rem 0.6rem' }}>Type</th>
                  <th style={{ padding: '0.75rem 0.6rem' }}>Quantity</th>
                  <th style={{ padding: '0.75rem 0.6rem' }}>Stored Factor</th>
                  <th style={{ padding: '0.75rem 0.6rem' }}>Emission</th>
                  <th style={{ padding: '0.75rem 0.6rem', textAlign: 'right' }}>Delete</th>
                </tr>
              </thead>
              <tbody>
                {activities.map(a => {
                  const { Icon, bg, color } = getCatIcon(a.category);
                  return (
                    <tr key={a.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.75rem 0.6rem', fontSize: '0.88rem' }}>
                        {new Date(a.date).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '0.75rem 0.6rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                          background: bg, color, borderRadius: '8px', padding: '0.25rem 0.6rem', fontSize: '0.82rem', fontWeight: 600 }}>
                          <Icon size={13} /> {a.category}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.6rem', fontWeight: 500, textTransform: 'capitalize' }}>{a.activityType}</td>
                      <td style={{ padding: '0.75rem 0.6rem' }}>{a.quantity} {a.unit}</td>
                      <td style={{ padding: '0.75rem 0.6rem', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                        {a.emissionFactor} kg/{a.unit}
                      </td>
                      <td style={{ padding: '0.75rem 0.6rem', fontWeight: 800, color: 'var(--primary)' }}>
                        {a.carbonEmission} kg CO₂
                      </td>
                      <td style={{ padding: '0.75rem 0.6rem', textAlign: 'right' }}>
                        <button className="btn-icon" title="Delete" onClick={() => handleDelete(a.id)}
                          style={{ color: 'var(--danger)' }}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Single Activity Modal */}
      {showSingleModal && (
        <div className="sidebar-overlay active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="card drop-in" style={{ maxWidth: '460px', width: '92%', margin: 'auto', position: 'relative', zIndex: 201 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={20} style={{ color: 'var(--primary)' }} />
                <h3 style={{ margin: 0 }}>Log Specific Activity</h3>
              </div>
              <button className="btn-icon" onClick={() => setShowSingleModal(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleSingleSubmit}>
              <div className="input-group">
                <label>Category</label>
                <select value={singleCategory} onChange={(e) => {
                  const cat = e.target.value;
                  setSingleCategory(cat);
                  if (cat === 'transport') { setSingleType('car'); setSingleUnit('km'); }
                  else if (cat === 'electricity') { setSingleType('grid'); setSingleUnit('kWh'); }
                  else if (cat === 'food') { setSingleType('vegetarian'); setSingleUnit('days'); }
                }}>
                  <option value="transport">🚗 Transport</option>
                  <option value="electricity">⚡ Electricity</option>
                  <option value="food">🥗 Food & Diet</option>
                </select>
              </div>

              <div className="input-group">
                <label>Activity Sub-Type</label>
                {singleCategory === 'transport' && (
                  <select value={singleType} onChange={(e) => setSingleType(e.target.value)}>
                    <option value="car">🚗 Car (Petrol/Diesel)</option>
                    <option value="motorcycle">🏍️ Motorcycle</option>
                    <option value="bus">🚌 Public Bus</option>
                    <option value="train">🚆 Train / Metro</option>
                    <option value="flight">✈️ Flight (Domestic)</option>
                    <option value="walking">🚶 Walking (0 kg CO₂)</option>
                    <option value="cycling">🚴 Cycling (0 kg CO₂)</option>
                  </select>
                )}
                {singleCategory === 'electricity' && (
                  <select value={singleType} onChange={(e) => setSingleType(e.target.value)}>
                    <option value="grid">🔌 Grid Electricity</option>
                    <option value="solar">☀️ Rooftop Solar</option>
                    <option value="wind">💨 Wind Power</option>
                  </select>
                )}
                {singleCategory === 'food' && (
                  <select value={singleType} onChange={(e) => setSingleType(e.target.value)}>
                    <option value="vegetarian">🥗 Vegetarian</option>
                    <option value="vegan">🌱 Vegan</option>
                    <option value="mixed">🍽️ Mixed Omnivore</option>
                    <option value="heavy_meat">🥩 Heavy Red Meat</option>
                  </select>
                )}
              </div>

              <div className="input-group">
                <label>Quantity ({singleUnit})</label>
                <input type="number" min="0.1" step="0.1" required
                  placeholder={`Amount in ${singleUnit}`}
                  value={singleQuantity} onChange={(e) => setSingleQuantity(e.target.value)} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1.2rem' }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowSingleModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Save size={15} /> Record Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
