import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import ApiClient from '../services/api';
import { Target, Trophy, Percent, Save, Check, ArrowDown, Sparkles } from 'lucide-react';

export default function GoalCard({ currentEmission = 0, baselineAvg = 340, onGoalUpdated }) {
  const [targetKg, setTargetKg] = useState('');
  const [targetPct, setTargetPct] = useState('10');
  const [activeGoal, setActiveGoal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function loadGoal() {
      try {
        const res = await ApiClient.getGoals();
        if (res.success && res.data?.length > 0) {
          const latest = res.data[0];
          setActiveGoal(latest);
          setTargetKg(latest.targetEmission);
          const base = baselineAvg > 0 ? baselineAvg : 340;
          setTargetPct(Math.round((1 - latest.targetEmission / base) * 100));
        } else {
          // Default: 10% reduction from baseline
          const defaultTarget = Math.round(baselineAvg * 0.9);
          setTargetKg(defaultTarget);
        }
      } catch (err) {
        console.warn('Could not load goal:', err);
      }
    }
    loadGoal();
  }, [baselineAvg]);

  const handleKgChange = (e) => {
    const kg = parseFloat(e.target.value);
    setTargetKg(e.target.value);
    const base = baselineAvg > 0 ? baselineAvg : 340;
    if (!isNaN(kg) && kg > 0) {
      setTargetPct(Math.round((1 - kg / base) * 100));
    }
  };

  const handlePctChange = (e) => {
    const pct = parseFloat(e.target.value);
    setTargetPct(e.target.value);
    const base = baselineAvg > 0 ? baselineAvg : 340;
    if (!isNaN(pct) && pct >= 0 && pct < 100) {
      setTargetKg(Math.round(base * (1 - pct / 100)));
    }
  };

  const handleSaveGoal = async () => {
    const kg = parseFloat(targetKg);
    if (!kg || kg <= 0) return;

    setSaving(true);
    try {
      let res;
      if (activeGoal?.id) {
        res = await ApiClient.updateGoal(activeGoal.id, {
          title: `Monthly Carbon Target (${kg} kg)`,
          targetEmission: kg
        });
      } else {
        res = await ApiClient.createGoal({
          title: `Monthly Carbon Target (${kg} kg)`,
          targetEmission: kg
        });
      }

      if (res.success) {
        setActiveGoal(res.data);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
        if (onGoalUpdated) onGoalUpdated(res.data);

        // Check if achieved already and celebrate
        if (currentEmission > 0 && currentEmission <= kg) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      }
    } catch (err) {
      console.error('Error saving goal:', err);
    } finally {
      setSaving(false);
    }
  };

  const target = parseFloat(targetKg) || (baselineAvg * 0.9);
  const isAchieved = currentEmission > 0 && currentEmission <= target;
  const remaining = Math.max(0, currentEmission - target);

  let progressPct = 0;
  if (currentEmission > 0) {
    if (isAchieved) {
      progressPct = 100;
    } else {
      const reductionNeeded = currentEmission - target;
      const totalSpan = baselineAvg - target;
      progressPct = totalSpan > 0 ? Math.max(10, Math.min(90, Math.round(((baselineAvg - currentEmission) / totalSpan) * 100))) : 20;
    }
  }

  return (
    <div className="card goal-card margin-top">
      <div className="goal-header">
        <div className="goal-title-row" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Target size={22} style={{ color: 'var(--primary)' }} />
          <h3 style={{ margin: 0 }}>Monthly Reduction Goal</h3>
          <span
            id="goal-status-badge"
            className={`badge ${isAchieved ? 'success' : ''}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: isAchieved ? 'rgba(34,197,94,0.18)' : 'rgba(59,130,246,0.15)',
              color: isAchieved ? 'var(--success)' : 'var(--secondary)',
              border: isAchieved ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(59,130,246,0.2)'
            }}
          >
            {isAchieved ? <Trophy size={14} /> : <Target size={14} />}
            <span>{isAchieved ? 'Goal Achieved!' : 'In Progress'}</span>
          </span>
        </div>

        <div className="goal-setter">
          <span className="goal-setter-label">Target:</span>
          <div className="goal-input-group">
            <input
              type="number"
              id="goal-target-input"
              min="1"
              value={targetKg}
              onChange={handleKgChange}
              placeholder="e.g. 250"
            />
            <span className="goal-unit-label">kg CO₂/mo</span>
          </div>
          <span className="goal-or">or</span>
          <div className="goal-input-group">
            <input
              type="number"
              id="goal-pct-input"
              min="1"
              max="90"
              value={targetPct}
              onChange={handlePctChange}
              placeholder="e.g. 15"
            />
            <span className="goal-unit-label">% cut</span>
          </div>
          <button
            id="save-goal-btn"
            className="btn btn-sm btn-primary"
            onClick={handleSaveGoal}
            disabled={saving}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            {saving ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : savedSuccess ? (
              <><Check size={15} /> Saved!</>
            ) : (
              <><Save size={15} /> Set Goal</>
            )}
          </button>
        </div>
      </div>

      <div className="goal-progress-info">
        <span id="goal-progress-text" className="text-muted text-sm">
          {currentEmission === 0 ? (
            'Log your monthly consumption to start measuring goal progress.'
          ) : isAchieved ? (
            <span style={{ color: 'var(--success)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <Trophy size={16} /> Outstanding! You are {(target - currentEmission).toFixed(1)} kg below your target ceiling of {target.toFixed(0)} kg CO₂!
            </span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <ArrowDown size={15} className="text-info" /> Need to reduce <strong>{remaining.toFixed(1)} more kg</strong> to reach target limit of {target.toFixed(0)} kg CO₂.
            </span>
          )}
        </span>
        <span id="goal-target-display" className="goal-target-pill">
          Target: {target.toFixed(0)} kg CO₂ ({targetPct > 0 ? `−${targetPct}%` : 'custom'})
        </span>
      </div>

      <div className="progress-bar-container">
        <div
          className="progress-bar"
          id="goal-progress-bar"
          style={{
            width: `${progressPct}%`,
            backgroundColor: isAchieved ? 'var(--success)' : 'var(--secondary)',
            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        ></div>
      </div>
    </div>
  );
}
