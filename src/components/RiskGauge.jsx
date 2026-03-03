import React from 'react';

export default function RiskGauge({ score, size = 120, label, threat }) {
    const radius = (size - 16) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (score / 100) * circumference * 0.75; // 270 degree arc

    const getColor = (s) => {
        if (s >= 70) return '#ef4444';
        if (s >= 50) return '#f59e0b';
        if (s >= 30) return '#3dabf5';
        return '#10b981';
    };

    const color = getColor(score);
    const cx = size / 2;
    const cy = size / 2;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* Background arc */}
                <circle
                    cx={cx} cy={cy} r={radius}
                    fill="none" stroke="#1e293b" strokeWidth={8}
                    strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
                    strokeDashoffset={0}
                    transform={`rotate(135 ${cx} ${cy})`}
                    strokeLinecap="round"
                />
                {/* Progress arc */}
                <circle
                    cx={cx} cy={cy} r={radius}
                    fill="none" stroke={color} strokeWidth={8}
                    strokeDasharray={`${progress} ${circumference - progress}`}
                    strokeDashoffset={0}
                    transform={`rotate(135 ${cx} ${cy})`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 0.6s ease, stroke 0.3s ease' }}
                />
                {/* Score text */}
                <text x={cx} y={cy - 4} textAnchor="middle" fill={color} fontSize={size * 0.28} fontWeight="700">{score}</text>
                <text x={cx} y={cy + size * 0.14} textAnchor="middle" fill="#94a3b8" fontSize={size * 0.1}>/100</text>
            </svg>
            {threat && <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0', textAlign: 'center' }}>{threat}</div>}
            {label && <div style={{ fontSize: '0.7rem', color: '#94a3b8', textAlign: 'center' }}>{label}</div>}
        </div>
    );
}
