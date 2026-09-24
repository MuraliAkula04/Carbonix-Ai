import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ChatbotWidget from '../components/ChatbotWidget';
import {
  LayoutDashboard,
  Activity,
  TrendingUp,
  Sparkles,
  Target,
  User,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  Leaf,
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function MainLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard': return { title: 'Carbon Intelligence Dashboard', subtitle: 'Real-time overview of personal emissions & reduction progress' };
      case '/activities': return { title: 'Activity Tracking & Logs', subtitle: 'Record electricity, travel, and dietary lifestyle factors' };
      case '/predictions': return { title: 'Predictive Emission Forecaster', subtitle: 'Simulate scenario impact on next month\'s footprint' };
      case '/suggestions': return { title: 'AI Optimization Engine', subtitle: '216-scenario algorithmic reduction pathways' };
      case '/goals': return { title: 'Carbon Reduction Goals', subtitle: 'Set ceilings and monitor milestone achievements' };
      case '/profile': return { title: 'User Account & Profile', subtitle: 'Manage identity, location, and sustainability metrics' };
      default: return { title: 'Carbonix AI', subtitle: 'Personal carbon intelligence platform' };
    }
  };

  const pageInfo = getPageTitle();
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="dashboard-body">
      {/* Sidebar Navigation */}
      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #10B981, #06B6D4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
            flexShrink: 0
          }}>
            <Leaf size={22} strokeWidth={2.4} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
              Carbonix <span style={{ color: 'var(--primary-color)' }}>AI</span>
            </h2>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Eco Intelligence
            </span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-category">Main Menu</div>
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink
            to="/activities"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Activity size={18} />
            <span>Activities</span>
          </NavLink>
          <NavLink
            to="/predictions"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <TrendingUp size={18} />
            <span>Predictions</span>
          </NavLink>

          <div className="nav-category">AI & Strategy</div>
          <NavLink
            to="/suggestions"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Sparkles size={18} />
            <span>Optimization & AI</span>
          </NavLink>
          <NavLink
            to="/goals"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Target size={18} />
            <span>Goals & Targets</span>
          </NavLink>

          <div className="nav-category">Preferences</div>
          <NavLink
            to="/profile"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <User size={18} />
            <span>Profile</span>
          </NavLink>

          <button id="theme-toggle" className="nav-item" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={18} className="text-yellow" /> : <Moon size={18} />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <button id="logout-btn" className="nav-item logout" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </nav>

        {/* User Card */}
        <div className="sidebar-user-block">
          <div className="user-avatar-small" id="sidebar-avatar-initial">{initial}</div>
          <div className="user-info-mini">
            <h4 id="sidebar-user-name">{user?.name || 'Eco User'}</h4>
            <p id="sidebar-user-email" title={user?.email}>{user?.email || 'Active'}</p>
          </div>
        </div>
      </aside>

      {mobileMenuOpen && (
        <div
          id="sidebar-overlay"
          className="sidebar-overlay active"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      {/* Main Content Area */}
      <main className="main-content">
        <header className="topbar">
          <div className="topbar-title-group">
            <button
              id="mobile-menu-btn"
              className="btn-icon mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div>
              <h1 id="page-title" style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                {pageInfo.title}
              </h1>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                {pageInfo.subtitle}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span
              className="badge"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: 'rgba(16,185,129,0.12)',
                color: 'var(--primary)',
                border: '1px solid rgba(16,185,129,0.25)',
                padding: '0.4rem 0.85rem',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 600
              }}
            >
              <ShieldCheck size={14} />
              <span>PostgreSQL Connected</span>
            </span>

            <button
              onClick={toggleTheme}
              className="btn-icon"
              title="Toggle color mode"
              style={{ width: '38px', height: '38px', borderRadius: '10px', border: '1px solid var(--border)' }}
            >
              {theme === 'dark' ? <Sun size={17} className="text-yellow" /> : <Moon size={17} />}
            </button>
          </div>
        </header>

        <div className="sections-container" style={{ padding: '1.75rem', maxWidth: '1440px', margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>

      {/* Global AI Chatbot Assistant */}
      <ChatbotWidget />
    </div>
  );
}
