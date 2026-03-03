import React from 'react';
import StatusBadge from './StatusBadge';
import Icon from './Icon';

export default function ExecutionFingerprint({ fingerprint, deviations = [] }) {
    if (!fingerprint) return null;

    return (
        <div className="card" style={{ borderLeft: `3px solid ${fingerprint.match ? '#10b981' : '#ef4444'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>Execution Fingerprint</span>
                <StatusBadge status={fingerprint.match ? 'match' : 'mismatch'} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: 2 }}>PRESCRIBED</div>
                    <code style={{ fontSize: '0.75rem', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '4px 8px', borderRadius: 4, wordBreak: 'break-all' }}>
                        {fingerprint.prescribed}
                    </code>
                </div>
                <div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: 2 }}>ACTUAL</div>
                    <code style={{ fontSize: '0.75rem', color: fingerprint.match ? '#10b981' : '#ef4444', background: fingerprint.match ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', padding: '4px 8px', borderRadius: 4, wordBreak: 'break-all' }}>
                        {fingerprint.actual}
                    </code>
                </div>
            </div>

            {deviations.length > 0 && (
                <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ef4444', marginBottom: 6 }}>DEVIATIONS DETECTED</div>
                    {deviations.map((d, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.75rem', borderBottom: '1px solid #1e293b' }}>
                            <span style={{ color: '#94a3b8' }}>{d.parameter}</span>
                            <span>
                                <span style={{ color: '#10b981' }}>{d.prescribed}</span>
                                <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', margin: '0 4px' }}><Icon name="arrow-right" size={14} /></span>
                                <span style={{ color: '#ef4444' }}>{d.actual}</span>
                                <span style={{ color: '#ef4444', marginLeft: 8 }}>({d.delta})</span>
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {!fingerprint.match && (
                <div style={{ marginTop: 10, padding: 8, background: 'rgba(239,68,68,0.08)', borderRadius: 6, fontSize: '0.75rem', color: '#f59e0b' }}>
                    Responsibility shifted to operator per terminal neutrality principle.
                </div>
            )}
        </div>
    );
}
