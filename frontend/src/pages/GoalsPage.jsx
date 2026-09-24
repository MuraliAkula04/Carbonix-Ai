import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import ApiClient from '../services/api';
import {
  Target, Plus, Trash2, Trophy, CheckCircle,
  ArrowDown, Loader2, Medal
} from 'lucide-react';

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [title, setTitle] = useState('');
  const [targetEmission, setTargetEmission] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.getGoals();
      if (res.success && Array.isArray(res.data)) {
        setGoals(res.data);
      }
    } catch (err) {
      console.error('Error fetching goals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadGoals(); }, []);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    const target = parseFloat(targetEmission);
    if (!title.trim() || !target || target <= 0) return;

    setCreating(true);
    try {
      const res = await ApiClient.createGoal({ title, targetEmission: target });
      if (res.success) {
        setTitle('');
        setTargetEmission('');
        loadGoals();
        confetti({ particleCount: 80, spread: 60 });
      }
    } catch (err) {
      alert(err.message || 'Failed to create goal');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!window.confirm('Delete this goal target?')) return;
    try {
      await ApiClient.deleteGoal(id);
      setGoals(prev => prev.filter(g => g.id !== id));
    } catch {
      alert('Could not delete goal');
    }
  };

  return (
    <div className="fade-in">
      {/* Create Goal Card */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
          <Target size={22} style={{ color: 'var(--primary)' }} />
          <h2 style={{ margin: 0 }}>Carbon Reduction Targets</h2>
        </div>
        <p className="subtitle">
          Define measurable emission limits. Goals help benchmark your habits against international climate targets.
        </p>

        <form onSubmit={handleCreateGoal} className="form-grid margin-top">
          <div className="input-group">
            <label htmlFor="goal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Target size={14} style={{ color: 'var(--primary)' }} /> Goal Title
            </label>
            <div className="input-wrapper">
              <i className="fas fa-bullseye"></i>
              <input
                type="text" id="goal-title" required
                placeholder="e.g. Under 220kg CO₂ Challenge"
                value={title} onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="goal-target" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ArrowDown size={14} style={{ color: 'var(--secondary)' }} /> Target Limit (kg CO₂/month)
            </label>
            <div className="input-wrapper">
              <i className="fas fa-tachometer-alt"></i>
              <input
                type="number" id="goal-target" min="1" step="1" required
                placeholder="e.g. 200"
                value={targetEmission} onChange={(e) => setTargetEmission(e.target.value)}
              />
            </div>
          </div>

          <div className="form-actions" style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="btn btn-primary" disabled={creating}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              {creating
                ? <><Loader2 size={16} className="spin" /> Setting Target...</>
                : <><Plus size={16} /> Create Target Goal</>}
            </button>
          </div>
        </form>
      </div>

      {/* Goals List */}
      <div className="card margin-top">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Medal size={18} style={{ color: 'var(--warning)' }} />
          <h3 style={{ margin: 0 }}>Active &amp; Historical Goals</h3>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <Loader2 size={32} style={{ color: 'var(--primary)', margin: '0 auto', display: 'block' }} className="spin" />
          </div>
        ) : goals.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem', textAlign: 'center' }}>
            <Medal size={40} style={{ margin: '0 auto 0.8rem auto', display: 'block', color: 'var(--text-muted)' }} />
            <p>No goals defined yet. Set your first monthly ceiling above!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.2rem', marginTop: '1.2rem' }}>
            {goals.map(g => {
              const current = g.currentMonthEmission || 0;
              const target = g.targetEmission;
              const isAchieved = g.achieved;
              const remaining = g.remainingKgToCut;

              return (
                <div key={g.id} style={{
                  padding: '1.2rem',
                  borderRadius: '14px',
                  border: `1px solid ${isAchieved ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
                  background: isAchieved ? 'rgba(34,197,94,0.04)' : 'var(--bg-secondary)',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0, fontSize: '1.05rem' }}>{g.title}</h4>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                        background: isAchieved ? 'rgba(34,197,94,0.15)' : 'rgba(59,130,246,0.15)',
                        color: isAchieved ? 'var(--success)' : 'var(--secondary)',
                        padding: '0.22rem 0.6rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700
                      }}>
                        {isAchieved ? <><Trophy size={13} /> Achieved</> : 'In Progress'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', margin: '1rem 0 0.5rem 0', fontSize: '0.9rem' }}>
                      <span>Current: <strong>{current} kg</strong></span>
                      <span>Target Ceiling: <strong>{target} kg</strong></span>
                    </div>

                    <div className="progress-bar-container" style={{ margin: '0.5rem 0' }}>
                      <div className="progress-bar" style={{
                        width: `${Math.min(100, Math.round((current / (target || 1)) * 100))}%`,
                        backgroundColor: isAchieved ? 'var(--success)' : 'var(--secondary)'
                      }}></div>
                    </div>

                    <div className="text-sm text-muted">
                      {isAchieved ? (
                        <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <CheckCircle size={14} /> On track! Emission is within goal.
                        </span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <ArrowDown size={14} style={{ color: 'var(--secondary)' }} />
                          Need to cut {remaining?.toFixed(1)} kg CO₂ this month.
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button className="btn-icon" title="Delete goal"
                      onClick={() => handleDeleteGoal(g.id)}
                      style={{ color: 'var(--danger)' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
