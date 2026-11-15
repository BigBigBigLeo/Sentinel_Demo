import React from 'react';
import Icon from './Icon';

export default function MetricCard({ label, value, unit, icon, trend, status, subtitle, onClick, children, style = {} }) {
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
        <div
            className="metric-card"
            onClick={onClick}
            style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxSizing: 'border-box',
                width: '100%',
                ...(onClick ? { cursor: 'pointer' } : {}),
                ...style
            }}
        >
            <div className="metric-card-main" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', minHeight: 24, marginBottom: 4 }}>
                    {icon && (
                        <div className="metric-icon" style={{ margin: 0, color: status ? statusColors[status] : 'var(--text-muted)' }}>
                            {typeof icon === 'string' && icon.length > 2 ? <Icon name={icon} size={18} /> : icon}
                        </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
                        {onClick && (
                            <span
                                style={{
                                    fontSize: '0.6rem',
                                    color: '#38bdf8',
                                    padding: '1px 5px',
                                    background: 'rgba(56, 189, 248, 0.08)',
                                    borderRadius: 3,
                                    border: '1px solid rgba(56, 189, 248, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 3,
                                    letterSpacing: '0.2px',
                                    fontWeight: 700
                                }}
                            >
                                <Icon name="layers" size={9} color="#38bdf8" />
                                <span>下钻</span>
                            </span>
                        )}
                        {status && (
                            <span
                                className="metric-status-dot"
                                style={{
                                    position: 'static',
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    background: statusColors[status] || statusColors.normal,
                                }}
                            />
                        )}
                    </div>
                </div>

                <div className="metric-value" style={status && statusColors[status] ? { color: statusColors[status], fontSize: '1.45rem', lineHeight: 1.1 } : { fontSize: '1.45rem', lineHeight: 1.1 }}>
                    {value}{unit && <span className="metric-unit">{unit}</span>}
                </div>
                <div className="metric-label" style={{ marginTop: 4, fontSize: '0.72rem', letterSpacing: '0.3px', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {label}
                </div>
                {trend && (
                    <div className="metric-trend" style={{ color: trendColors[trend] || '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', marginTop: 3 }}>
                        <Icon name={trendIcons[trend] || 'arrow-right'} size={13} /> {subtitle || trend}
                    </div>
                )}
                {!trend && subtitle && (
                    <div className="metric-subtitle" style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {subtitle}
                    </div>
                )}
            </div>

            {children && (
                <div className="metric-card-footer" style={{ marginTop: 'auto', width: '100%' }}>
                    {children}
                </div>
            )}
        </div>
    );
}
