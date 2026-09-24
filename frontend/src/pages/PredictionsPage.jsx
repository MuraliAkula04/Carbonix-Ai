import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import ApiClient from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { TrendingUp, Zap, Car, Leaf, ArrowDown, ArrowUp, Activity, ChevronRight, Info } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function PredictionsPage() {
  const [reduceElec, setReduceElec] = useState(0);
  const [reduceTransport, setReduceTransport] = useState(0);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  const fetchPrediction = async (elecVal = reduceElec, transVal = reduceTransport) => {
    try {
      setLoading(true);
      const res = await ApiClient.predict({ reduceElecPct: elecVal, reduceTransportPct: transVal });
      if (res.success) setPrediction(res.data);
    } catch (err) {
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPrediction(); }, []);

  const handleElecSlider = (e) => {
    const val = parseInt(e.target.value);
    setReduceElec(val);
    fetchPrediction(val, reduceTransport);
  };

  const handleTransportSlider = (e) => {
    const val = parseInt(e.target.value);
    setReduceTransport(val);
    fetchPrediction(reduceElec, val);
  };

  const currentTotal = prediction?.currentTotal || 0;
  const predictedTotal = prediction?.predictedTotal || 0;
  const isLower = predictedTotal < currentTotal;
  const savedDiff = Math.abs(currentTotal - predictedTotal).toFixed(1);

  const chartData = {
    labels: ['Current Month', 'Next Month Forecast'],
    datasets: [{
      label: 'kg CO₂',
      data: [currentTotal, predictedTotal],
      backgroundColor: ['#3B82F6', isLower ? '#22C55E' : '#EF4444'],
      borderRadius: 10,
      barThickness: 55
    }]
  };

  const textColor = theme === 'dark' ? '#94A3B8' : '#475569';
  const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => ` ${ctx.raw} kg CO₂` } }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor } },
      x: { grid: { display: false }, ticks: { color: textColor } }
    }
  };

  return (
    <div className="fade-in">
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
          <TrendingUp size={22} style={{ color: 'var(--primary)' }} />
          <h2 style={{ margin: 0 }}>Next Month Carbon Forecaster</h2>
        </div>
        <p className="subtitle">
          Trend-aware prediction engine. Slide to simulate how lifestyle changes alter next month's footprint.
        </p>

        <div className="prediction-grid" style={{ marginTop: '1.8rem' }}>
          {/* Controls */}
          <div className="prediction-controls">
            {/* Electricity Slider */}
            <div className="slider-group">
              <label htmlFor="reduce-elec" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Zap size={16} style={{ color: 'var(--warning)' }} /> Reduce Electricity
                </span>
                <span id="elec-val" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                  background: 'rgba(234,179,8,0.15)', color: 'var(--warning)',
                  padding: '0.2rem 0.6rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700
                }}>
                  {reduceElec}% <ChevronRight size={12} />
                </span>
              </label>
              <input type="range" id="reduce-elec" min="0" max="100" value={reduceElec} onChange={handleElecSlider} />
            </div>

            {/* Transport Slider */}
            <div className="slider-group margin-top-sm">
              <label htmlFor="reduce-travel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Car size={16} style={{ color: 'var(--secondary)' }} /> Reduce Transport
                </span>
                <span id="travel-val" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                  background: 'rgba(59,130,246,0.15)', color: 'var(--secondary)',
                  padding: '0.2rem 0.6rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700
                }}>
                  {reduceTransport}% <ChevronRight size={12} />
                </span>
              </label>
              <input type="range" id="reduce-travel" min="0" max="100" value={reduceTransport} onChange={handleTransportSlider} />
            </div>

            {/* Result Summary */}
            <div className="prediction-result margin-top" style={{
              padding: '1rem 1.2rem',
              borderRadius: '14px',
              background: isLower ? 'rgba(34,197,94,0.08)' : 'rgba(59,130,246,0.08)',
              border: `1px solid ${isLower ? 'rgba(34,197,94,0.25)' : 'rgba(59,130,246,0.2)'}`
            }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 0.5rem 0' }}>
                <Activity size={18} style={{ color: isLower ? 'var(--success)' : 'var(--secondary)' }} />
                Predicted CO₂: <span id="predicted-total" style={{ color: 'var(--primary)', fontWeight: 800 }}>{predictedTotal} kg</span>
              </h4>
              <p style={{ margin: '0 0 0.4rem 0', fontWeight: 600, fontSize: '0.9rem' }}>{prediction?.label}</p>
              <p className="text-sm text-muted" style={{ margin: 0 }}>
                {isLower ? (
                  <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <ArrowDown size={14} /> Saves {savedDiff} kg CO₂ next month!
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Info size={14} /> Estimated trajectory from your historical data.
                  </span>
                )}
              </p>
            </div>

            {/* Category Breakdown */}
            {prediction?.breakdown && (
              <div style={{ marginTop: '1rem', padding: '0.85rem 1rem', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
                <div className="text-sm" style={{ fontWeight: 700, marginBottom: '0.6rem', color: 'var(--text-muted)' }}>
                  PROJECTED BREAKDOWN:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {[
                    { label: 'Electricity', val: prediction.breakdown.electricity, Icon: Zap, color: 'var(--warning)' },
                    { label: 'Transport', val: prediction.breakdown.transport, Icon: Car, color: 'var(--secondary)' },
                    { label: 'Food', val: prediction.breakdown.food, Icon: Leaf, color: 'var(--success)' }
                  ].map(({ label, val, Icon, color }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color }}>
                        <Icon size={14} /> {label}
                      </span>
                      <strong>{val} kg</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bar Chart */}
          <div className="prediction-chart-container" style={{ minHeight: '300px' }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
