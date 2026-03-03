import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import useStore from '../engine/store';
import RiskGauge from '../components/RiskGauge';
import StatusBadge from '../components/StatusBadge';
import MetricCard from '../components/MetricCard';
import Icon from '../components/Icon';

export default function RiskAssessment() {
    const navigate = useNavigate();
    const { riskResults, revenueAtRisk, currentSnapshot, fields, activeFieldId, activeScenario } = useStore();
    const field = fields[activeFieldId];

    const chartData = riskResults.map(r => ({
        name: r.name.length > 14 ? r.name.slice(0, 12) + '...' : r.name,
        score: r.score,
        color: r.score >= 70 ? '#ef4444' : r.score >= 50 ? '#f59e0b' : r.score >= 30 ? '#3dabf5' : '#10b981',
    }));

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Risk Assessment Engine</h1>
                    <p className="page-subtitle">Stage 2: Reasoning — {field?.name} | Day {currentSnapshot?.day || '—'}</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/prescription')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    Generate Prescription <Icon name="chevron-right" size={14} />
                </button>
            </div>

            {/* Top Risk + Revenue at Risk Summary */}
            <div className="grid grid-3">
                <MetricCard
                    label="Highest Threat"
                    value={riskResults[0]?.score || 0}
                    unit="/100"
                    status={riskResults[0]?.status || 'low'}
                    subtitle={riskResults[0]?.name || 'None'}
                />
                <MetricCard
                    label="Revenue at Risk"
                    value={revenueAtRisk ? `¥${(revenueAtRisk.total / 1000).toFixed(1)}k` : '¥0'}
                    status={revenueAtRisk?.total > 30000 ? 'critical' : revenueAtRisk?.total > 10000 ? 'elevated' : 'low'}
                    subtitle={revenueAtRisk ? `Grade ${revenueAtRisk.currentGrade} → ${field?.gradeClass === 'A' ? 'B' : 'C'} (${revenueAtRisk.downgradeProbability}% prob.)` : '—'}
                />
                <MetricCard
                    label="Decision Window"
                    value={activeScenario ? `${activeScenario.daysToHarvest}d` : '30d'}
                    subtitle="to harvest"
                    status={activeScenario?.daysToHarvest < 7 ? 'critical' : 'low'}
                />
            </div>

            {/* Risk Gauges Grid */}
            <div className="card" style={{ marginTop: 16 }}>
                <h3 className="card-title">Threat Assessment</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center', padding: '16px 0' }}>
                    {riskResults.map(r => (
                        <div key={r.threatId} style={{ textAlign: 'center' }}>
                            <RiskGauge score={r.score} size={110} threat={r.name} />
                            <div style={{ marginTop: 4 }}>
                                <StatusBadge status={r.status} />
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 4 }}>Trend: {r.trend}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bar Chart */}
            <div className="card" style={{ marginTop: 16 }}>
                <h3 className="card-title">Risk Score Comparison</h3>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={chartData} layout="vertical">
                        <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#1e293b' }} />
                        <YAxis type="category" dataKey="name" width={120} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#1e293b' }} />
                        <Tooltip contentStyle={{ background: '#1a2235', border: '1px solid #1e293b', borderRadius: 8, color: '#e2e8f0' }} />
                        <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                            {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Contributing Factors */}
            <div className="card" style={{ marginTop: 16 }}>
                <h3 className="card-title">Contributing Factors</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {riskResults.filter(r => r.factors?.length > 0).map(r => (
                        <div key={r.threatId} style={{ padding: 12, background: '#111827', borderRadius: 8, borderLeft: `3px solid ${r.score >= 70 ? '#ef4444' : r.score >= 50 ? '#f59e0b' : '#3dabf5'}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.85rem' }}>{r.name}</span>
                                <StatusBadge status={r.status} />
                            </div>
                            {r.factors.map((f, i) => (
                                <div key={i} style={{ fontSize: '0.75rem', color: '#94a3b8', paddingLeft: 8, lineHeight: 1.8 }}>• {f}</div>
                            ))}
                        </div>
                    ))}
                    {riskResults.filter(r => r.factors?.length > 0).length === 0 && (
                        <div style={{ color: '#64748b', fontSize: '0.85rem' }}>No active contributing factors at current thresholds.</div>
                    )}
                </div>
            </div>

            {/* Revenue Breakdown */}
            {revenueAtRisk?.breakdown?.length > 0 && (
                <div className="card" style={{ marginTop: 16 }}>
                    <h3 className="card-title">Structural Revenue Leakage</h3>
                    <table className="data-table">
                        <thead><tr><th>Threat</th><th>Revenue Contribution (¥)</th></tr></thead>
                        <tbody>
                            {revenueAtRisk.breakdown.map((b, i) => (
                                <tr key={i}><td>{b.threat}</td><td style={{ fontFamily: 'monospace' }}>¥{b.contribution.toLocaleString()}</td></tr>
                            ))}
                            <tr style={{ fontWeight: 700 }}><td>Total at Risk</td><td style={{ fontFamily: 'monospace', color: '#ef4444' }}>¥{revenueAtRisk.total.toLocaleString()}</td></tr>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
