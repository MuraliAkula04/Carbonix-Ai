import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';
import ChartDoughnut from '../components/ChartDoughnut';
import ChartTrend from '../components/ChartTrend';
import GoalCard from '../components/GoalCard';
import ApiClient from '../services/api';
import {
  Globe,
  Zap,
  Car,
  Utensils,
  Plus,
  Sparkles,
  ArrowRight,
  TrendingDown,
  PieChart,
  LineChart,
  Calendar,
  Layers,
  Award,
  CheckCircle2
} from 'lucide-react';

export default function DashboardPage() {
  const [summary, setSummary] = useState({
    totalEmission: 0,
    currentMonth: 0,
    previousMonth: 0,
    previousMonthComparison: 0,
    highestCategory: 'none'
  });
  const [categoryData, setCategoryData] = useState({ electricity: 0, transport: 0, food: 0 });
  const [monthlyTrends, setMonthlyTrends] = useState({ labels: [], totals: [] });
  const [recentActivities, setRecentActivities] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [sumRes, catRes, trendRes, actRes, recRes] = await Promise.all([
        ApiClient.getSummary(),
        ApiClient.getCategories(),
        ApiClient.getMonthlyTrends(6),
        ApiClient.getActivities({ limit: 4 }),
        ApiClient.getRecommendations()
      ]);

      if (sumRes.success) setSummary(sumRes.data);

      if (catRes.success && Array.isArray(catRes.data)) {
        const catMap = { electricity: 0, transport: 0, food: 0 };
        catRes.data.forEach(c => {
          if (c.category in catMap) catMap[c.category] = c.emission;
        });
        setCategoryData(catMap);
      }

      if (trendRes.success && Array.isArray(trendRes.data)) {
        setMonthlyTrends({
          labels: trendRes.data.map(t => t.label),
          totals: trendRes.data.map(t => t.total)
        });
      }

      if (actRes.success && actRes.data?.activities) {
        setRecentActivities(actRes.data.activities);
      }

      if (recRes.success && Array.isArray(recRes.data)) {
        setRecommendations(recRes.data.slice(0, 2));
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="dashboard-content fade-in">
      {/* 4 Stat Cards */}
      <div className="cards-grid">
        <StatCard
          title="Total Emissions (Month)"
          value={summary.currentMonth.toFixed(1)}
          unit="kg CO₂"
          icon={Globe}
          gradient={true}
          trendText={
            summary.previousMonthComparison !== 0
              ? `${summary.previousMonthComparison > 0 ? '+' : ''}${summary.previousMonthComparison}% vs last mo`
              : 'Consistent footprint'
          }
          trendPositive={summary.previousMonthComparison <= 0}
        />
        <StatCard
          title="Electricity"
          value={categoryData.electricity.toFixed(1)}
          unit="kg"
          icon={Zap}
          colorClass="text-yellow"
        />
        <StatCard
          title="Travel & Transport"
          value={categoryData.transport.toFixed(1)}
          unit="kg"
          icon={Car}
          colorClass="text-blue"
        />
        <StatCard
          title="Food & Diet"
          value={categoryData.food.toFixed(1)}
          unit="kg"
          icon={Utensils}
          colorClass="text-green"
        />
      </div>

      {/* Goal Card */}
      <GoalCard
        currentEmission={summary.currentMonth}
        baselineAvg={340}
        onGoalUpdated={fetchDashboardData}
      />

      {/* Charts Grid */}
      <div className="charts-grid margin-top">
        <div className="card chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PieChart size={18} style={{ color: 'var(--primary)' }} />
              <h3>Emission Sources</h3>
            </div>
            <span className="badge" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--primary)', textTransform: 'capitalize' }}>
              Top: {summary.highestCategory}
            </span>
          </div>
          <div className="chart-container" style={{ marginTop: '1rem' }}>
            <ChartDoughnut
              data={[categoryData.electricity, categoryData.transport, categoryData.food]}
            />
          </div>
        </div>

        <div className="card chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LineChart size={18} style={{ color: 'var(--secondary)' }} />
              <h3>Monthly Trajectory</h3>
            </div>
            <span className="badge" style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--secondary)' }}>
              Past 6 Months
            </span>
          </div>
          <div className="chart-container" style={{ marginTop: '1rem' }}>
            <ChartTrend
              labels={monthlyTrends.labels}
              data={monthlyTrends.totals}
            />
          </div>
        </div>
      </div>

      {/* Quick Action & Recent Activities preview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
        {/* Recent Activities */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} style={{ color: 'var(--primary)' }} />
              <h3>Recent Activity Records</h3>
            </div>
            <Link to="/activities" className="btn btn-sm btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <Plus size={14} /> Add Data
            </Link>
          </div>

          {recentActivities.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem 1rem', textAlign: 'center' }}>
              <Layers size={36} className="text-muted" style={{ margin: '0 auto 0.8rem auto', display: 'block' }} />
              <p>No activity logs recorded yet this month.</p>
              <Link to="/activities" className="btn btn-sm btn-primary margin-top-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <Plus size={14} /> Record First Activity
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentActivities.map(a => {
                const isElec = a.category === 'electricity';
                const isFood = a.category === 'food';
                return (
                  <div
                    key={a.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 1rem',
                      background: 'var(--bg-secondary)',
                      borderRadius: '12px',
                      border: '1px solid var(--border)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isElec ? 'rgba(234,179,8,0.15)' : isFood ? 'rgba(34,197,94,0.15)' : 'rgba(59,130,246,0.15)',
                        color: isElec ? 'var(--warning)' : isFood ? 'var(--success)' : 'var(--secondary)'
                      }}>
                        {isElec ? <Zap size={18} /> : isFood ? <Utensils size={18} /> : <Car size={18} />}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, textTransform: 'capitalize', fontSize: '0.92rem' }}>
                          {a.activityType} ({a.category})
                        </div>
                        <div className="text-sm text-muted">
                          {new Date(a.date).toLocaleDateString()} · {a.quantity} {a.unit}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.98rem' }}>
                        {a.carbonEmission} kg
                      </div>
                      <div className="text-sm text-muted">CO₂e</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* AI Recommendations Highlight */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} style={{ color: 'var(--warning)' }} />
              <h3>High Impact Opportunities</h3>
            </div>
            <Link to="/suggestions" className="btn btn-sm btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>Optimization</span> <ArrowRight size={14} />
            </Link>
          </div>

          {recommendations.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem 1rem', textAlign: 'center' }}>
              <Award size={36} className="text-muted" style={{ margin: '0 auto 0.8rem auto', display: 'block' }} />
              <p>Add data to unlock custom intelligence recommendations.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {recommendations.map(r => (
                <div
                  key={r.id}
                  style={{
                    padding: '1.1rem',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    background: 'var(--card)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <CheckCircle2 size={16} className="text-green" />
                      {r.title}
                    </h4>
                    <span className="savings-badge" style={{ whiteSpace: 'nowrap' }}>
                      Save ~{r.potentialReduction} kg
                    </span>
                  </div>
                  <p className="text-sm text-muted" style={{ margin: 0, lineHeight: 1.5 }}>
                    {r.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
