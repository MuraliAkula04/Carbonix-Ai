import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ApiClient from '../services/api';
import {
  User, Mail, MapPin, BarChart2, TrendingUp,
  Zap, Activity, Shield
} from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [profRes, sumRes] = await Promise.all([
          ApiClient.getProfile(),
          ApiClient.getSummary()
        ]);
        if (profRes.success) setProfile(profRes.data);
        if (sumRes.success) setSummary(sumRes.data);
      } catch (e) {
        console.warn('Profile load err:', e);
      }
    }
    loadData();
  }, []);

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  const stats = [
    {
      label: 'Total Emissions Logged',
      value: `${summary?.totalEmission || 0} kg CO₂`,
      Icon: BarChart2,
      color: 'var(--primary)'
    },
    {
      label: 'Active Behavioral Trend',
      value: profile?.trend || 'Stable',
      Icon: TrendingUp,
      color: 'var(--secondary)'
    },
    {
      label: 'Dominant Emission Source',
      value: summary?.highestCategory || 'Electricity',
      Icon: Zap,
      color: 'var(--warning)'
    },
    {
      label: 'Lifetime Activity Records',
      value: summary?.activityCount || 0,
      Icon: Activity,
      color: 'var(--success)'
    }
  ];

  return (
    <div className="fade-in">
      <div className="card">
        {/* Avatar & identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'var(--gradient)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', fontWeight: 700, color: 'white',
            boxShadow: 'var(--glow)', flexShrink: 0
          }}>
            {initial}
          </div>
          <div>
            <h2 style={{ margin: '0 0 0.2rem 0' }}>{user?.name || 'Sustainability Advocate'}</h2>
            <p style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              className="text-muted">
              <Mail size={14} /> {user?.email}
            </p>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                background: 'rgba(16,185,129,0.15)', color: 'var(--primary)',
                padding: '0.22rem 0.6rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700
              }}>
                <Shield size={13} /> {user?.role || 'USER'}
              </span>
              {user?.location && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                  background: 'rgba(59,130,246,0.15)', color: 'var(--secondary)',
                  padding: '0.22rem 0.6rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700
                }}>
                  <MapPin size={13} /> {user.location}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
          {stats.map(({ label, value, Icon, color }) => (
            <div key={label} style={{
              padding: '1rem 1.1rem', background: 'var(--bg-secondary)',
              borderRadius: '14px', border: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                <Icon size={15} style={{ color }} />
                <div className="text-sm text-muted">{label}</div>
              </div>
              <h3 style={{ fontSize: '1.35rem', marginTop: '0.3rem', textTransform: 'capitalize' }}>{value}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
