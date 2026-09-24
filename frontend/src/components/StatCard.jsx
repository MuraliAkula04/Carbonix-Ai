import React from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';

export default function StatCard({
  title,
  value,
  unit,
  icon: IconComponent,
  iconClass,
  colorClass,
  gradient,
  trendText,
  trendPositive
}) {
  return (
    <div className={`card stat-card ${gradient ? 'primary-gradient' : ''}`}>
      <div className={`stat-icon ${colorClass || ''}`}>
        {IconComponent ? (
          <IconComponent size={24} strokeWidth={2.2} />
        ) : (
          <i className={`fas ${iconClass || 'fa-chart-bar'}`}></i>
        )}
      </div>
      <div className="stat-content">
        <h3>{title}</h3>
        <h2>
          {value} {unit && <span className="unit">{unit}</span>}
        </h2>
        {trendText && (
          <p className={`trend ${trendPositive ? 'positive' : 'negative'}`}>
            {trendPositive ? <ArrowDown size={14} /> : <ArrowUp size={14} />} {trendText}
          </p>
        )}
      </div>
    </div>
  );
}
