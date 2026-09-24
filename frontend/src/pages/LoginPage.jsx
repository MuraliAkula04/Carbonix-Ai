import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, User, MapPin, Mail, Lock, Zap, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!fullname.trim()) throw new Error('Please enter your full name');
        await register(fullname, email, password, location);
      } else {
        await login(email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      // Use standard demo account
      await login('ecotester@carbonix.ai', 'password123');
      navigate('/dashboard');
    } catch (err) {
      // Fallback register if not yet created
      try {
        await register('Demo Eco Explorer', 'ecotester@carbonix.ai', 'password123', 'San Francisco');
        navigate('/dashboard');
      } catch (regErr) {
        setError(regErr.message || 'Could not launch demo');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-body">
      <div className="theme-toggle-container">
        <button id="theme-toggle" className="btn-icon" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <div className="login-split-container">
        {/* Left Side: Brand Promo */}
        <div className="login-promo">
          <div className="promo-content">
            <div className="brand-logo">
              <img src="/logo.png" alt="Carbonix AI" className="brand-logo-img" />
              <span>Carbonix AI</span>
            </div>

            <h1 className="promo-heading">Track.<br />Analyse.<br />Reduce.</h1>

            <p className="promo-text">
              Your intelligent sustainability assistant. Measure your personal carbon footprint, discover insights powered by AI, and take action toward a greener future.
            </p>

            <div className="promo-stats">
              <div className="stat-item">
                <h3>2.4M</h3>
                <p>CO₂ KG SAVED</p>
              </div>
              <div className="stat-item">
                <h3>12K+</h3>
                <p>ACTIVE USERS</p>
              </div>
              <div className="stat-item">
                <h3>30%</h3>
                <p>AVG REDUCTION</p>
              </div>
            </div>
          </div>

          <div className="promo-circle circle-1"></div>
          <div className="promo-circle circle-2"></div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="login-form-area">
          <div className="login-form-wrapper drop-in">
            <div className="login-header text-left">
              <h1>{isSignUp ? 'Create your account 🚀' : 'Welcome back 👋'}</h1>
              <p>
                {isSignUp
                  ? 'Start measuring and cutting your emissions with '
                  : 'Sign in to your '}
                <strong style={{ color: 'var(--primary-color)' }}>Carbonix AI</strong> platform
              </p>
            </div>

            <div className="auth-tabs">
              <button
                type="button"
                className={`tab-btn ${!isSignUp ? 'active' : ''}`}
                onClick={() => { setIsSignUp(false); setError(''); }}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`tab-btn ${isSignUp ? 'active' : ''}`}
                onClick={() => { setIsSignUp(true); setError(''); }}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleSubmit} id="login-form">
              {error && <div id="auth-error" className="error-msg">{error}</div>}

              {isSignUp && (
                <>
                  <div className="input-group">
                    <label htmlFor="fullname">Full Name</label>
                    <div className="input-wrapper">
                      <User size={15} />
                      <input
                        type="text"
                        id="fullname"
                        placeholder="Alex Morgan"
                        value={fullname}
                        onChange={(e) => setFullname(e.target.value)}
                        required={isSignUp}
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label htmlFor="location">City / Location (Optional)</label>
                    <div className="input-wrapper">
                      <MapPin size={15} />
                      <input
                        type="text"
                        id="location"
                        placeholder="London, UK"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="input-group">
                <label htmlFor="email">Email address</label>
                <div className="input-wrapper">
                  <Mail size={15} />
                  <input
                    type="email"
                    id="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <Lock size={15} />
                  <input
                    type="password"
                    id="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block margin-top-sm"
                disabled={loading}
              >
                {loading ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}><Loader2 size={16} className="spin" /> Processing...</span>
                ) : (
                  <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                )}
              </button>

              <div className="divider">
                <span>or explore instantly</span>
              </div>

              <button
                type="button"
                className="btn btn-outline btn-block"
                onClick={handleDemoLogin}
                disabled={loading}
              >
                <Zap size={16} style={{ marginRight: '0.4rem', color: 'var(--warning)' }} />
                Continue with Demo Account
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
