import React from 'react';
import Icon from './Icon';

export default function MetricCard({ label, value, unit, icon, trend, status, subtitle, onClick }) {
    const statusColors = {
        critical: '#ef4444',
        elevated: '#f59e0b',
        monitoring: '#3dabf5',
        low: '#10b981',
        normal: '#94a3b8',
    };

    // Map text trends to geometric SVG names
    const trendIcons = { rising: 'trending-up', falling: 'arrow-right', stable: 'arrow-right' };
    const trendColors = { rising: '#ef4444', falling: '#10b981', stable: '#94a3b8' };

    return (
        <div className="metric-card" onClick={onClick} style={onClick ? { cursor: 'pointer' } : {}}>
            {icon && <div className="metric-icon" style={{ color: status ? statusColors[status] : 'var(--text-muted)' }}>
                {typeof icon === 'string' && icon.length > 2 ? <Icon name={icon} size={20} /> : icon}
            </div>}
            {status && <span className="metric-status-dot" style={{ background: statusColors[status] || statusColors.normal }} />}
            <div className="metric-value" style={status && statusColors[status] ? { color: statusColors[status] } : {}}>
                {value}{unit && <span className="metric-unit">{unit}</span>}
            </div>
            <div className="metric-label">{label}</div>
            {trend && (
                <div className="metric-trend" style={{ color: trendColors[trend] || '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Icon name={trendIcons[trend] || 'arrow-right'} size={14} /> {subtitle || trend}
                </div>
            )}
            {!trend && subtitle && <div className="metric-subtitle">{subtitle}</div>}
        </div>
    );
}
