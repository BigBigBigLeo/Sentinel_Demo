import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import useStore from '../engine/store';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import RiskGauge from '../components/RiskGauge';
import Icon from '../components/Icon';

export default function Dashboard() {
    const navigate = useNavigate();
    const {
        currentSnapshot, riskResults, revenueAtRisk, fields, activeFieldId,
        prescriptions, auditRecords, activeScenario, simulationData, currentDay,
    } = useStore();

    const field = fields[activeFieldId];
    const topRisk = riskResults[0];
    const sensors = currentSnapshot?.sensors;

    // Generate 30-day risk trend from simulation data
    const simData = simulationData[activeFieldId] || [];
    const riskTrend = simData.slice(Math.max(0, currentDay - 30), currentDay).map(d => ({
        day: d.day,
        risk: Math.round(20 + d.pests.botrytis_spore_index * 0.6 + (d.daily.humidity_pct > 85 ? 15 : 0)),
        humidity: d.daily.humidity_pct,
    }));

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Mission Control</h1>
                    <p className="page-subtitle">{field?.name} — {field?.nameZh} | Stage: {currentSnapshot?.stageName || '—'}</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/prescription')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    Generate Rx <Icon name="chevron-right" size={14} />
                </button>
            </div>

            {/* Alert Banner */}
            {topRisk && topRisk.score >= 50 && (
                <div className={`alert-banner ${topRisk.score >= 70 ? 'alert-critical' : 'alert-warning'}`}>
                    <div className="alert-content">
                        <span className="alert-icon"><Icon name={topRisk.score >= 70 ? 'alert-triangle' : 'alert-triangle'} size={24} /></span>
                        <div>
                            <div className="alert-title">{topRisk.name} — Risk Score {topRisk.score}/100</div>
                            <div className="alert-body">
                                {topRisk.factors?.join(' | ') || 'Elevated risk detected. Review recommended.'}
                                {activeScenario && ` | Scenario ${activeScenario.id} active`}
                            </div>
                        </div>
                    </div>
                    <button className="btn btn-sm" onClick={() => navigate('/risk')}>View Risk <Icon name="arrow-right" size={14} /></button>
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-4">
                <MetricCard
                    label="Active Threats"
                    value={riskResults.filter(r => r.score >= 50).length}
                    unit={`/${riskResults.length}`}
                    status={riskResults.filter(r => r.score >= 70).length > 0 ? 'critical' : 'low'}
                    icon="alert-triangle"
                    onClick={() => navigate('/risk')}
                />
                <MetricCard
                    label="Grade Class"
                    value={field?.gradeClass || 'A'}
                    status={field?.gradeClass === 'A' ? 'low' : 'elevated'}
                    icon="star"
                    subtitle={field?.crop === 'blueberry' ? '¥180/kg export' : '¥8.5/stem'}
                />
                <MetricCard
                    label="Revenue at Risk"
                    value={revenueAtRisk ? `¥${(revenueAtRisk.total / 1000).toFixed(1)}k` : '¥0'}
                    status={revenueAtRisk?.total > 30000 ? 'critical' : revenueAtRisk?.total > 10000 ? 'elevated' : 'low'}
                    icon="dollar"
                    subtitle={revenueAtRisk ? `${revenueAtRisk.downgradeProbability}% downgrade prob.` : ''}
                />
                <MetricCard
                    label="Decisions"
                    value={prescriptions.length}
                    icon="box"
                    status="monitoring"
                    subtitle={`${auditRecords.length} audited`}
                />
            </div>

            {/* Risk Gauges + Sensor Summary */}
            <div className="grid grid-2" style={{ marginTop: 16 }}>
                {/* Risk Gauges */}
                <div className="card">
                    <h3 className="card-title">Biological Threats</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', padding: '12px 0' }}>
                        {riskResults.slice(0, 4).map(r => (
                            <div key={r.threatId} style={{ cursor: 'pointer' }} onClick={() => navigate('/risk')}>
                                <RiskGauge score={r.score} size={100} threat={r.name} label={r.nameZh} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sensor Summary */}
                <div className="card">
                    <h3 className="card-title">Environment Snapshot</h3>
                    {sensors ? (
                        <div className="grid grid-3" style={{ gap: 8 }}>
                            <MetricCard label="Temperature" value={sensors.temp_C} unit="°C" trend={sensors.temp_C > 28 ? 'rising' : 'stable'} />
                            <MetricCard label="Humidity" value={sensors.humidity_pct} unit="%" status={sensors.humidity_pct > 85 ? 'critical' : 'low'} />
                            <MetricCard label="Soil Moisture" value={sensors.soil_moist_pct} unit="%" />
                            <MetricCard label="Wind" value={sensors.wind_speed_ms} unit="m/s" status={sensors.wind_speed_ms > 3 ? 'elevated' : 'low'} />
                            <MetricCard label="Leaf Wetness" value={sensors.leaf_wetness_hrs} unit="h" status={sensors.leaf_wetness_hrs > 6 ? 'critical' : 'low'} />
                            <MetricCard label="pH" value={sensors.soil_ph} />
                        </div>
                    ) : <div style={{ color: '#94a3b8', padding: 20 }}>Loading sensors...</div>}
                </div>
            </div>

            {/* 30-Day Risk Profile */}
            <div className="card" style={{ marginTop: 16 }}>
                <h3 className="card-title">30-Day Risk Profile</h3>
                <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={riskTrend}>
                        <defs>
                            <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#1e293b' }} />
                        <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#1e293b' }} />
                        <Tooltip contentStyle={{ background: '#1a2235', border: '1px solid #1e293b', borderRadius: 8, color: '#e2e8f0' }} />
                        <Area type="monotone" dataKey="risk" stroke="#ef4444" fill="url(#riskGrad)" strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Growth Stage Timeline */}
            <div className="card" style={{ marginTop: 16 }}>
                <h3 className="card-title">Growth Stage — {field?.crop === 'blueberry' ? 'Blueberry' : 'Rose'}</h3>
                <div className="growth-timeline">
                    {(field?.crop === 'blueberry'
                        ? ['Dormancy', 'Bud Break', 'Flowering', 'Fruit Set', 'Harvest']
                        : ['Planting', 'Vegetative', 'Bud Formation', 'Bloom', 'Rest']
                    ).map((stage, i) => {
                        const isCurrent = currentSnapshot?.stageName === stage;
                        const isPast = currentSnapshot?.stage && i < ['dormancy', 'bud_break', 'flowering', 'fruit_set', 'harvest'].indexOf(currentSnapshot.stage);
                        return (
                            <div key={stage} className={`growth-stage ${isCurrent ? 'current' : isPast ? 'completed' : ''}`}>
                                <div className="growth-dot" />
                                <div className="growth-label">{stage}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
