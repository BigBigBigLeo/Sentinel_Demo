import React from 'react';
import Icon from './Icon';

const MODEL_VERSIONS = [
    { version: 'v4.2', date: '2025-12-15', accuracy: 0.891, samples: 24800, status: 'current' },
    { version: 'v4.1', date: '2025-09-20', accuracy: 0.862, samples: 19200, status: 'old' },
    { version: 'v4.0', date: '2025-06-10', accuracy: 0.834, samples: 14500, status: 'old' },
    { version: 'v3.8', date: '2025-03-01', accuracy: 0.791, samples: 9800, status: 'old' },
];

const FEATURE_IMPORTANCE = [
    { feature: 'Leaf Wetness Duration', importance: 0.94, category: 'sensor' },
    { feature: 'Humidity Exceedance (>85%)', importance: 0.89, category: 'sensor' },
    { feature: 'Spore Pressure Index', importance: 0.85, category: 'pest' },
    { feature: 'Temperature Window (18-25°C)', importance: 0.78, category: 'sensor' },
    { feature: 'Drone Hyperspectral NDVI', importance: 0.76, category: 'imagery' },
    { feature: 'Historical Outbreak Proximity', importance: 0.71, category: 'historical' },
    { feature: 'Growth Stage Vulnerability', importance: 0.68, category: 'model' },
    { feature: 'Soil Moisture Level', importance: 0.62, category: 'sensor' },
];

const catColors = {
    sensor: '#38bdf8', pest: '#f472b6', imagery: '#a78bfa', historical: '#fbbf24', model: '#34d399',
};

export default function MLFeedbackPanel({ prediction, actual }) {
    const predReduction = prediction || 55;
    const actReduction = actual || 48;
    const calibrationError = Math.abs(predReduction - actReduction);
    const trainingPoints = 120 + Math.round((predReduction + actReduction) * 0.8);

    return (
        <div className="ml-feedback-panel">
            {/* Header */}
            <div className="ml-feedback-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, rgba(52,211,153,0.15), rgba(56,189,248,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
                        <Icon name="reasoning" size={18} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>ML Feedback & Model Enhancement</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>Continuous learning from decision outcomes</div>
                    </div>
                </div>
                <span className="ml-version-badge ml-version-current">Sentinel-Agri v4.2</span>
            </div>

            <div className="ml-feedback-body">
                {/* Outcome Recording */}
                <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>Outcome Recording</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                        <div style={{ padding: 12, background: '#111827', borderRadius: 8, borderLeft: '3px solid #38bdf8' }}>
                            <div style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase' }}>Predicted Reduction</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#38bdf8', fontFamily: 'JetBrains Mono, monospace' }}>{predReduction}%</div>
                        </div>
                        <div style={{ padding: 12, background: '#111827', borderRadius: 8, borderLeft: '3px solid #34d399' }}>
                            <div style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase' }}>Actual Reduction</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#34d399', fontFamily: 'JetBrains Mono, monospace' }}>{actReduction}%</div>
                        </div>
                        <div style={{ padding: 12, background: '#111827', borderRadius: 8, borderLeft: `3px solid ${calibrationError > 10 ? '#f59e0b' : '#34d399'}` }}>
                            <div style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase' }}>Calibration Error</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: calibrationError > 10 ? '#f59e0b' : '#34d399', fontFamily: 'JetBrains Mono, monospace' }}>{calibrationError}%</div>
                        </div>
                    </div>
                </div>

                {/* Training Data Generated */}
                <div className="ml-metric-row">
                    <span className="ml-metric-label">Training data generated this cycle</span>
                    <span className="ml-metric-value">{trainingPoints} labeled points</span>
                </div>
                <div className="ml-metric-row">
                    <span className="ml-metric-label">Verification checkpoints</span>
                    <span className="ml-metric-value">T+24h, T+72h, T+168h</span>
                </div>
                <div className="ml-metric-row">
                    <span className="ml-metric-label">Next model retrain batch</span>
                    <span className="ml-metric-value">v4.3 (queued)</span>
                </div>

                {/* Model Version History */}
                <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>Model Version History</div>
                    {MODEL_VERSIONS.map(v => (
                        <div key={v.version} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0', borderBottom: '1px solid rgba(148,163,184,0.04)' }}>
                            <span className={`ml-version-badge ${v.status === 'current' ? 'ml-version-current' : 'ml-version-old'}`}>{v.version}</span>
                            <span style={{ fontSize: '0.68rem', color: '#64748b', flex: 1 }}>{v.date}</span>
                            <div style={{ width: 120 }}>
                                <div className="ml-accuracy-bar">
                                    <div className="ml-accuracy-fill" style={{ width: `${v.accuracy * 100}%`, background: v.status === 'current' ? '#34d399' : '#475569' }} />
                                </div>
                            </div>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: v.status === 'current' ? '#34d399' : '#64748b', fontFamily: 'JetBrains Mono, monospace', minWidth: 50, textAlign: 'right' }}>{(v.accuracy * 100).toFixed(1)}%</span>
                            <span style={{ fontSize: '0.62rem', color: '#475569' }}>{v.samples.toLocaleString()} samples</span>
                        </div>
                    ))}
                </div>

                {/* Feature Importance */}
                <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>Feature Importance  - This Decision</div>
                    {FEATURE_IMPORTANCE.map(f => (
                        <div key={f.feature} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8', flex: 1 }}>{f.feature}</span>
                            <div style={{ width: 140, height: 5, borderRadius: 3, background: 'rgba(148,163,184,0.08)', overflow: 'hidden' }}>
                                <div style={{ width: `${f.importance * 100}%`, height: '100%', borderRadius: 3, background: catColors[f.category] || '#64748b' }} />
                            </div>
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: catColors[f.category], fontFamily: 'JetBrains Mono, monospace', minWidth: 35, textAlign: 'right' }}>{(f.importance * 100).toFixed(0)}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

