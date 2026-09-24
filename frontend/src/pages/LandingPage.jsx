import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Rocket, Zap, LineChart, Cpu, Bot } from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (!loading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    {
      Icon: Zap, color: 'var(--warning)',
      bg: 'rgba(234,179,8,0.12)',
      title: 'Backend Carbon Engine',
      desc: 'Configurable emissions factors for electricity, multi-modal transport, and dietary choices calculated securely on Express.'
    },
    {
      Icon: LineChart, color: 'var(--secondary)',
      bg: 'rgba(59,130,246,0.12)',
      title: 'Trend-Aware Prediction',
      desc: 'Forecast next month\'s footprint using moving averages and test reductions via interactive scenario sliders.'
    },
    {
      Icon: Cpu, color: 'var(--primary)',
      bg: 'rgba(16,185,129,0.12)',
      title: '216-Strategy Optimizer',
      desc: 'Brute-force optimization engine evaluates all reduction combinations and ranks them by feasibility and net CO₂ saved.'
    },
    {
      Icon: Bot, color: '#8B5CF6',
      bg: 'rgba(139,92,246,0.12)',
      title: 'AI Sustainability Bot',
      desc: 'Strict topic guard with real-time user context: gives custom tips based on your live activity records and reduction targets.'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Top Navbar */}
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1.2rem 2.5rem', borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <img src="/logo.png" alt="Carbonix AI" style={{ width: '38px', height: '38px', borderRadius: '8px' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Carbonix AI
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn-icon" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link to="/login" className="btn btn-outline btn-sm">Sign In</Link>
          <Link to="/login" className="btn btn-primary btn-sm">Get Started</Link>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="badge" style={{
          background: 'rgba(16,185,129,0.15)', color: 'var(--primary)',
          padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.9rem',
          marginBottom: '1.5rem', display: 'inline-block'
        }}>
          🌱 Next-Generation Personal Carbon Intelligence Platform
        </div>

        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, lineHeight: 1.15, margin: '0 auto 1.5rem auto', maxWidth: '850px' }}>
          Track. Predict. Optimize.<br />
          <span style={{ background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Cut Your Footprint with AI.
          </span>
        </h1>

        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '680px', margin: '0 auto 2.5rem auto', lineHeight: 1.6 }}>
          Convert electricity, transportation, and diet data into actionable emissions insights. Powered by our 216-scenario optimization engine and sustainability assistant.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/login" className="btn btn-primary btn-lg"
            style={{ padding: '0.85rem 2rem', fontSize: '1.05rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <Rocket size={18} /> Launch Dashboard
          </Link>
          <Link to="/login" className="btn btn-outline btn-lg"
            style={{ padding: '0.85rem 2rem', fontSize: '1.05rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={18} style={{ color: 'var(--warning)' }} /> Try Instant Demo
          </Link>
        </div>

        {/* Feature Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginTop: '4.5rem', textAlign: 'left' }}>
          {features.map(({ Icon, color, bg, title, desc }) => (
            <div key={title} className="card" style={{ padding: '1.8rem' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <Icon size={22} style={{ color }} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{title}</h3>
              <p className="text-sm text-muted">{desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
