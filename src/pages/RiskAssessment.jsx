import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import useStore from '../engine/store';
import RiskGauge from '../components/RiskGauge';
import StatusBadge from '../components/StatusBadge';
import MetricCard from '../components/MetricCard';
import Icon from '../components/Icon';
import PipelineBreadcrumb from '../components/PipelineBreadcrumb';
import { previousActions, sensorThresholds } from '../data/mockData';

export default function RiskAssessment() {
    const navigate = useNavigate();
    const {
        riskResults, revenueAtRisk, currentSnapshot, fields, activeFieldId, activeScenario,
        simulationData,
    } = useStore();
    const field = fields[activeFieldId];
    const sensors = currentSnapshot?.sensors || {};
    const pests = currentSnapshot?.pests || {};
    const actions = previousActions[activeFieldId] || {};
    const now = new Date().toLocaleString('en-US', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

    const chartData = riskResults.map(r => ({
        name: r.name.length > 14 ? r.name.slice(0, 12) + '...' : r.name,
        score: r.score,
        color: r.score >= 70 ? '#ef4444' : r.score >= 50 ? '#f59e0b' : r.score >= 30 ? '#3dabf5' : '#10b981',
    }));

    // Build evidence from actual sensor data
    const evidence = [
        { source: 'Temperature', value: `${sensors.temp_C?.toFixed(1) || '—'}°C`, impact: sensors.temp_C > 25 ? 'high' : sensors.temp_C > 20 ? 'medium' : 'low', points: sensors.temp_C > 25 ? 12 : sensors.temp_C > 20 ? 6 : 2, detail: `Threshold: ${sensorThresholds.temperature?.max || 28}°C` },
        { source: 'Humidity', value: `${sensors.humidity_pct?.toFixed(1) || '—'}%`, impact: sensors.humidity_pct > 85 ? 'high' : sensors.humidity_pct > 70 ? 'medium' : 'low', points: sensors.humidity_pct > 85 ? 15 : sensors.humidity_pct > 70 ? 8 : 3, detail: `Threshold: ${sensorThresholds.humidity?.max || 85}%` },
        { source: 'Leaf Wetness', value: `${sensors.leaf_wetness_h?.toFixed(2) || '—'}h`, impact: sensors.leaf_wetness_h > 3 ? 'high' : sensors.leaf_wetness_h > 2 ? 'medium' : 'low', points: sensors.leaf_wetness_h > 3 ? 12 : sensors.leaf_wetness_h > 2 ? 8 : 2, detail: `Threshold: ${sensorThresholds.leafWetness?.max || 3}h` },
        { source: 'Wind Speed', value: `${sensors.wind_speed_ms?.toFixed(1) || '—'} m/s`, impact: sensors.wind_speed_ms > 3 ? 'high' : 'low', points: sensors.wind_speed_ms > 3 ? 10 : 1, detail: 'Spray constraint: <3 m/s' },
        { source: 'Pest Trap Count', value: `${pests.sticky_trap_daily || pests.aphids_per_leaf || '—'}`, impact: (pests.sticky_trap_daily || 0) > 15 ? 'high' : (pests.sticky_trap_daily || 0) > 8 ? 'medium' : 'low', points: (pests.sticky_trap_daily || 0) > 15 ? 10 : 4, detail: 'Aphids + sticky traps' },
        { source: 'Growth Stage', value: currentSnapshot?.stageName || 'Flowering', impact: 'medium', points: 10, detail: 'Flowering = high susceptibility window' },
        { source: 'Days to Harvest', value: `${activeScenario?.daysToHarvest || 30}d`, impact: (activeScenario?.daysToHarvest || 30) < 14 ? 'high' : 'low', points: (activeScenario?.daysToHarvest || 30) < 14 ? 15 : 3, detail: 'PHI constraints apply <14d' },
        { source: 'Last Spray', value: actions.last_spray || '—', impact: 'low', points: 2, detail: `Chemical: ${actions.last_spray_chemical || '—'}` },
        { source: 'Historical Outbreaks', value: '3 events (2025)', impact: 'medium', points: 8, detail: 'Same period last year: 2 botrytis, 1 aphid' },
        { source: 'Weather Forecast', value: 'Rain in 48h', impact: 'high', points: 12, detail: '15mm rain expected, humidity will rise further' },
        { source: 'Market Price', value: '¥45/kg (premium)', impact: 'low', points: 0, detail: 'High value crop — loss impact amplified' },
        { source: 'Soil Moisture', value: `${sensors.soil_moist_pct?.toFixed(1) || '—'}%`, impact: sensors.soil_moist_pct > 40 ? 'medium' : 'low', points: sensors.soil_moist_pct > 40 ? 5 : 1, detail: `Threshold: ${sensorThresholds.soilMoisture?.max || 45}%` },
    ];

    // Risk trend from simulation data (7-day window)
    const simArray = Array.isArray(simulationData) ? simulationData : Object.values(simulationData || {});
    const fieldSim = simArray.length > 0 ? simArray : (simulationData?.[activeFieldId] || []);
    const riskTrend = (Array.isArray(fieldSim) ? fieldSim : []).slice(-7).map((d, i) => ({
        day: `D${(d?.day || i + 1)}`,
        botrytis: d?.threats?.grayMold?.score || 5 + Math.random() * 20,
        anthracnose: d?.threats?.anthracnose?.score || 3 + Math.random() * 15,
        aphids: d?.threats?.aphids?.score || 2 + Math.random() * 10,
    }));

    return (
        <div className="page">
            <PipelineBreadcrumb />

            <div className="page-header">
                <div>
                    <h1 className="page-title">Risk Assessment Engine</h1>
                    <p className="page-subtitle">Stage 3: AI Reasoning — {field?.name} | {now}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-primary" onClick={() => navigate('/prescription')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        Generate Prescription <Icon name="chevron-right" size={14} />
                    </button>
                </div>
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

            {/* Evidence Board — All Contributing Data Sources */}
            <div className="card" style={{ marginTop: 16 }}>
                <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon name="layers" size={16} color="#38bdf8" /> Multimodal Evidence Board — {evidence.length} Data Sources Evaluated
                </h3>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: 12 }}>
                    Decision OS analyzed ALL sources below — not a single-trigger decision
                </div>
                <div className="evidence-board">
                    {evidence.map((e, i) => (
                        <div key={i} className={`evidence-card ${e.impact}`}>
                            <div className="evidence-source">{e.source}</div>
                            <div className="evidence-value">{e.value}</div>
                            <div style={{ fontSize: '0.65rem', color: '#475569', marginTop: 2 }}>{e.detail}</div>
                            {e.points > 0 && <div className="evidence-impact">+{e.points} pts contribution</div>}
                        </div>
                    ))}
                </div>
            </div>

            {/* Risk Gauges Grid */}
            <div className="card" style={{ marginTop: 16 }}>
                <h3 className="card-title">Threat Assessment — Risk Gauges</h3>
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

            {/* Dynamic Contributing Factors with Point Breakdown */}
            <div className="card" style={{ marginTop: 16 }}>
                <h3 className="card-title">Contributing Factors — Score Breakdown</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {riskResults.filter(r => r.score >= 20).map(r => {
                        const factors = r.factors || [];
                        const perFactor = r.score > 0 && factors.length > 0 ? Math.round(r.score / factors.length) : 0;
                        return (
                            <div key={r.threatId} style={{ padding: 14, background: '#111827', borderRadius: 10, borderLeft: `3px solid ${r.score >= 70 ? '#ef4444' : r.score >= 50 ? '#f59e0b' : '#3dabf5'}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.88rem' }}>{r.name}</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: '1rem', fontWeight: 800, color: r.score >= 70 ? '#ef4444' : r.score >= 50 ? '#f59e0b' : '#3dabf5' }}>{r.score}/100</span>
                                        <StatusBadge status={r.status} />
                                    </div>
                                </div>
                                {/* Score bar */}
                                <div style={{ height: 6, background: 'rgba(51,65,85,0.4)', borderRadius: 3, marginBottom: 10, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${r.score}%`, background: `linear-gradient(90deg, ${r.score >= 70 ? '#ef4444' : r.score >= 50 ? '#f59e0b' : '#3dabf5'}, ${r.score >= 70 ? '#dc2626' : r.score >= 50 ? '#d97706' : '#2563eb'})`, borderRadius: 3, transition: 'width 0.5s ease' }} />
                                </div>
                                {factors.map((f, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', color: '#94a3b8', paddingLeft: 8, lineHeight: 1.8 }}>
                                        <span style={{ color: r.score >= 70 ? '#ef4444' : '#f59e0b', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.65rem', minWidth: 40 }}>+{perFactor}pts</span>
                                        <span>• {f}</span>
                                    </div>
                                ))}
                                {factors.length === 0 && (
                                    <div style={{ fontSize: '0.72rem', color: '#475569', fontStyle: 'italic' }}>Below action threshold — monitoring only</div>
                                )}
                            </div>
                        );
                    })}
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

            {/* 7-Day Risk Trend */}
            {riskTrend.length > 0 && (
                <div className="card" style={{ marginTop: 16 }}>
                    <h3 className="card-title">7-Day Risk Trend</h3>
                    <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={riskTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="day" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} />
                            <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} domain={[0, 100]} />
                            <Tooltip contentStyle={{ background: '#1a2235', border: '1px solid #1e293b', borderRadius: 8, fontSize: '0.7rem' }} />
                            <Line type="monotone" dataKey="botrytis" stroke="#ef4444" dot={false} name="Gray Mold" />
                            <Line type="monotone" dataKey="anthracnose" stroke="#f59e0b" dot={false} name="Anthracnose" />
                            <Line type="monotone" dataKey="aphids" stroke="#34d399" dot={false} name="Aphids" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

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
