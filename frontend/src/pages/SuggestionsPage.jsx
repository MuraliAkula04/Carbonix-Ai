import React, { useState, useEffect } from 'react';
import ApiClient from '../services/api';
import {
  Cpu, Lightbulb, Zap, Car, Utensils, CheckCircle,
  ArrowRight, Star, TrendingDown, Sparkles
} from 'lucide-react';

function getStrategyIcon(s) {
  const elec = s.electricityReductionPct || 0;
  const trans = s.transportReductionPct || 0;
  const food = s.foodReductionPct || 0;
  if (elec >= trans && elec >= food) return { Icon: Zap, color: 'var(--warning)', bg: 'rgba(234,179,8,0.12)' };
  if (trans >= food) return { Icon: Car, color: 'var(--secondary)', bg: 'rgba(59,130,246,0.12)' };
  return { Icon: Utensils, color: 'var(--success)', bg: 'rgba(34,197,94,0.12)' };
}

function getPriorityStyle(impact) {
  if (impact === 'high') return { bg: 'rgba(239,68,68,0.12)', color: '#EF4444' };
  if (impact === 'medium') return { bg: 'rgba(234,179,8,0.12)', color: 'var(--warning)' };
  return { bg: 'rgba(34,197,94,0.12)', color: 'var(--success)' };
}

export default function SuggestionsPage() {
  const [scenarios, setScenarios] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [optRes, recRes] = await Promise.all([
          ApiClient.getOptimizationScenarios(4),
          ApiClient.getRecommendations()
        ]);
        if (optRes.success) setScenarios(optRes.data);
        if (recRes.success) setRecommendations(recRes.data);
      } catch (err) {
        console.error('Error loading suggestions:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="fade-in">
      {/* Optimization Engine Card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '0.4rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
              <Cpu size={22} style={{ color: 'var(--primary)' }} />
              <h2 style={{ margin: 0 }}>Optimization Engine</h2>
            </div>
            <p className="subtitle" style={{ margin: 0 }}>
              Algorithmic brute-force analysis of 216 reduction combinations weighted by your lifestyle profile and feasibility cost.
            </p>
          </div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            background: 'rgba(16,185,129,0.12)', color: 'var(--primary)',
            padding: '0.4rem 0.9rem', borderRadius: '10px', fontWeight: 600, fontSize: '0.85rem'
          }}>
            <Sparkles size={14} /> 216 Combos Analyzed
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <i className="fas fa-spinner fa-spin fa-2x text-primary"></i>
            <p className="text-muted margin-top-sm">Running optimization algorithm...</p>
          </div>
        ) : !scenarios || scenarios.topStrategies?.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem', textAlign: 'center' }}>
            <Lightbulb size={40} style={{ margin: '0 auto 0.8rem auto', display: 'block', color: 'var(--text-muted)' }} />
            <p>Log your activities to generate personalized reduction pathways.</p>
          </div>
        ) : (
          <div className="suggestions-container margin-top" id="suggestions-list">
            <p className="margin-bottom-sm" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Current monthly footprint baseline:{' '}
              <strong style={{ color: 'var(--text)' }}>{scenarios.currentEmissions?.total?.toFixed(1)} kg CO₂</strong>.{' '}
              Here are the highest net-benefit pathways:
            </p>

            {scenarios.topStrategies.map((s, idx) => {
              const { Icon, color, bg } = getStrategyIcon(s);
              const feasColor = s.feasibility >= 70 ? 'var(--success)' : s.feasibility >= 40 ? 'var(--warning)' : '#EF4444';
              return (
                <div key={idx} className="suggestion-item drop-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <div className="suggestion-icon" style={{ background: bg, color }}>
                    <Icon size={22} />
                  </div>
                  <div className="suggestion-content">
                    <div className="suggestion-meta">
                      <span className="badge">{s.badge}</span>
                      <span className="savings-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <TrendingDown size={13} /> Save {s.savedKg} kg CO₂
                      </span>
                      <span className="feasibility-badge" style={{ color: feasColor }}>
                        Feasibility: {s.feasibility}%
                      </span>
                    </div>
                    <p className="suggestion-strategy">{s.label}</p>
                    {s.tips && s.tips.length > 0 && (
                      <ul className="tips-list text-sm">
                        {s.tips.map((t, i) => (
                          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                            <ArrowRight size={13} style={{ color: 'var(--primary)', marginTop: '2px', flexShrink: 0 }} />{t}
                          </li>
                        ))}
                      </ul>
                    )}
                    <p className="text-sm text-muted">
                      Projected Footprint: <strong>{s.newTotal} kg</strong> vs baseline {scenarios.currentEmissions?.total?.toFixed(1)} kg
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Actionable Recommendations Card */}
      <div className="card margin-top">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
          <Lightbulb size={20} style={{ color: 'var(--warning)' }} />
          <h2 style={{ margin: 0 }}>Personalized AI Recommendations</h2>
        </div>
        <p className="subtitle">
          Rule-based &amp; pattern-driven recommendations targeted at your highest emitting sectors.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem', marginTop: '1.2rem' }}>
          {recommendations.map(r => {
            const { bg, color } = getPriorityStyle(r.impact);
            return (
              <div key={r.id} style={{
                padding: '1.2rem',
                borderRadius: '14px',
                border: '1px solid var(--border)',
                background: 'var(--card)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                      background: bg, color,
                      padding: '0.22rem 0.6rem', borderRadius: '8px',
                      fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase'
                    }}>
                      <Star size={11} /> {r.impact} Priority
                    </span>
                    <span className="savings-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <TrendingDown size={12} /> -{r.potentialReduction} kg
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.05rem', margin: '0.4rem 0' }}>{r.title}</h3>
                  <p className="text-sm text-muted" style={{ lineHeight: '1.5' }}>{r.description}</p>
                </div>

                {r.tips && (
                  <div style={{ marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px solid var(--border)' }}>
                    <div className="text-sm" style={{ fontWeight: 600, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <CheckCircle size={13} style={{ color: 'var(--primary)' }} /> Action Step:
                    </div>
                    <div className="text-sm text-muted">{r.tips[0]}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
