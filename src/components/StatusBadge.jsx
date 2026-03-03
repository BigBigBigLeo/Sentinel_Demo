import React from 'react';

export default function StatusBadge({ status, label, size = 'sm' }) {
    const config = {
        critical: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', dot: '#ef4444', text: label || 'ACTION REQUIRED' },
        elevated: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', dot: '#f59e0b', text: label || 'ELEVATED' },
        monitoring: { bg: 'rgba(61,171,245,0.15)', color: '#3dabf5', dot: '#3dabf5', text: label || 'MONITORING' },
        low: { bg: 'rgba(16,185,129,0.15)', color: '#10b981', dot: '#10b981', text: label || 'LOW' },
        pass: { bg: 'rgba(16,185,129,0.15)', color: '#10b981', dot: '#10b981', text: label || 'PASS' },
        fail: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', dot: '#ef4444', text: label || 'FAIL' },
        pending: { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8', dot: '#94a3b8', text: label || 'PENDING' },
        completed: { bg: 'rgba(16,185,129,0.15)', color: '#10b981', dot: '#10b981', text: label || 'COMPLETED' },
        failed: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', dot: '#ef4444', text: label || 'FAILED' },
        match: { bg: 'rgba(16,185,129,0.15)', color: '#10b981', dot: '#10b981', text: label || 'MATCH' },
        mismatch: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', dot: '#ef4444', text: label || 'MISMATCH' },
        warning: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', dot: '#f59e0b', text: label || 'WARNING' },
        system: { bg: 'rgba(61,171,245,0.15)', color: '#3dabf5', dot: '#3dabf5', text: label || 'SYSTEM' },
        operator: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', dot: '#f59e0b', text: label || 'OPERATOR' },
    };

    const c = config[status] || config.pending;
    const fontSize = size === 'lg' ? '0.85rem' : '0.7rem';
    const padding = size === 'lg' ? '6px 14px' : '3px 10px';

    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: c.bg, color: c.color, borderRadius: 20,
            fontSize, fontWeight: 600, padding, letterSpacing: '0.03em',
            textTransform: 'uppercase', whiteSpace: 'nowrap',
        }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
            {c.text}
        </span>
    );
}
