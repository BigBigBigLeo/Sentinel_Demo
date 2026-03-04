import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, ReferenceLine, ReferenceArea } from 'recharts';
import useStore from '../engine/store';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import RiskGauge from '../components/RiskGauge';
import Icon from '../components/Icon';
import AIThinkingPanel from '../components/AIThinkingPanel';
import DataIngestionPanel from '../components/DataIngestionPanel';
import FinancialKPI from '../components/FinancialKPI';
import MultimodalGallery from '../components/MultimodalGallery';
import PipelineBreadcrumb from '../components/PipelineBreadcrumb';
import { sensorTimeSeries, sensorForecasts, trendAlerts, aiWatchdog, seasonFinancials, currentSensors, sensorThresholds, zoneIntervals } from '../data/mockData';

export default function Dashboard() {
    const navigate = useNavigate();
    const {
        currentSnapshot, riskResults, revenueAtRisk, fields, activeFieldId,
        prescriptions, auditRecords, activeScenario, simulationData, currentDay,
        thinkingChain, isThinking, thinkingContext, startRiskThinking, stopThinking,
    } = useStore();
    const field = fields[activeFieldId];
    const topRisk = riskResults.reduce((max, r) => r.score > (max?.score || 0) ? r : max, null);

    const fieldId = activeFieldId || 'BS-B3';
    const sensors = currentSensors[fieldId] || {};
    const timeSeries = sensorTimeSeries[fieldId] || {};
    const forecasts = sensorForecasts[fieldId] || {};
    const alerts = trendAlerts[fieldId] || [];
    const financials = seasonFinancials[fieldId];
    const activeAlerts = alerts.filter(a => a.status === 'active');

    const simArray = Array.isArray(simulationData) ? simulationData : Object.values(simulationData || {});
    const riskTrend = simArray.map(d => ({
        day: d.day,
        grayMold: d.threats?.grayMold?.score || 5,
        anthracnose: d.threats?.anthracnose?.score || 5,
        spiderMites: d.threats?.spiderMites?.score || 5,
        aphids: d.threats?.aphids?.score || 5,
    }));

    const handleRunAnalysis = () => {
        startRiskThinking();
        setTimeout(() => {
            aiRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    };

    const aiRef = useRef(null);

    // Sensor display config
    const sensorCards = [
        { key: 'temperature', label: 'Temperature', value: sensors.temp_C, unit: '°C', threshold: sensorThresholds.temperature, trend: 'stable' },
        { key: 'humidity', label: 'Humidity', value: sensors.humidity_pct, unit: '%', threshold: sensorThresholds.humidity, trend: 'rising' },
        { key: 'soilMoisture', label: 'Soil Moisture', value: sensors.soil_moist_pct, unit: '%', threshold: sensorThresholds.soilMoisture, trend: 'stable' },
        { key: 'leafWetness', label: 'Leaf Wetness', value: sensors.leaf_wetness_h || 2.62, unit: 'h', threshold: sensorThresholds.leafWetness, trend: 'rising' },
        { key: 'wind', label: 'Wind Speed', value: sensors.wind_speed_ms, unit: 'm/s', threshold: sensorThresholds.wind, trend: 'stable' },
        { key: 'light', label: 'Light', value: sensors.light_Lux, unit: 'Lux', threshold: sensorThresholds.light, trend: 'falling' },
    ];

    const formatNow = () => new Date().toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

    return (
        <div className="page">
            <PipelineBreadcrumb />
            <div className="page-header">
                <div>
                    <h1 className="page-title">Mission Control</h1>
                    <p className="page-subtitle">{field?.name} — {field?.nameZh} | Stage: {currentSnapshot?.stageName || '—'}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary" onClick={handleRunAnalysis} disabled={isThinking} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Icon name="reasoning" size={14} /> Run AI Analysis
                    </button>
                    <button className="btn btn-primary" onClick={() => navigate('/prescription')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        Generate Rx <Icon name="chevron-right" size={14} />
                    </button>
                </div>
            </div>

            {/* AI Watchdog Status Bar */}
            <div className="ai-watchdog-bar">
                <div className="watchdog-dot" />
                <span className="watchdog-label">AI Monitoring: Active 24×7</span>
                <div className="watchdog-divider" />
                <span className="watchdog-stat">Last scan: <strong>{new Date(aiWatchdog.lastScan).toLocaleString('en-US', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</strong></span>
                <div className="watchdog-divider" />
                <span className="watchdog-stat">Scans today: <strong>{aiWatchdog.totalScansToday.toLocaleString()}</strong></span>
                <div className="watchdog-divider" />
                <span className="watchdog-stat">Anomalies: <strong style={{ color: aiWatchdog.anomaliesDetected > 0 ? '#f59e0b' : '#34d399' }}>{aiWatchdog.anomaliesDetected}</strong></span>
                <div className="watchdog-divider" />
                <span className="watchdog-stat">Proactive alerts: <strong style={{ color: '#38bdf8' }}>{aiWatchdog.proactiveAlerts}</strong></span>
                <div className="watchdog-divider" />
                <span className="watchdog-stat">Uptime: <strong>{aiWatchdog.uptime}</strong></span>
                <div style={{ flex: 1 }} />
                <span className="watchdog-stat" style={{ color: '#475569' }}>{aiWatchdog.modelVersion}</span>
            </div>

            {/* Financial KPIs — Compact */}
            {financials && <FinancialKPI financials={financials} compact />}

            {/* Trend Alerts (Proactive) */}
            {activeAlerts.length > 0 && (
                <div className="trend-alerts">
                    {activeAlerts.map(alert => (
                        <div key={alert.id} className={`trend-alert-card severity-${alert.severity}`}>
                            <div className="trend-alert-header">
                                <div className="trend-alert-title">
                                    <Icon name={alert.icon} size={16} />
                                    {alert.title}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span className="timestamp-label">{new Date(alert.timestamp).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                                    <StatusBadge status={alert.severity} />
                                </div>
                            </div>
                            <div className="trend-alert-detail">{alert.detail}</div>
                            <div className="trend-alert-prediction">⚡ Prediction: {alert.prediction}</div>
                            <div className="trend-alert-action">
                                <Icon name="play" size={10} />
                                Recommended: {alert.recommended}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Live Environment Strip — Sensor Sparkline Cards */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0', margin: 0 }}>Live Environment — Real-Time Sensors</h3>
                <span className="section-timestamp">Updated: {formatNow()}</span>
            </div>
            <div className="sensor-grid">
                {sensorCards.map(s => {
                    const series = timeSeries[s.key];
                    const forecast = forecasts[s.key];
                    const isAboveMax = s.threshold && s.value > s.threshold.max;
                    const chartData = series ? [...series.slice(-12).map(d => ({ time: d.time, actual: d.value })), ...(forecast ? forecast.slice(0, 6).map(d => ({ time: d.time, forecast: d.value })) : [])] : [];

                    return (
                        <div key={s.key} className="sensor-sparkline-card" style={{ borderLeftColor: isAboveMax ? '#ef4444' : undefined, borderLeft: isAboveMax ? '3px solid #ef4444' : undefined }} onClick={() => navigate('/sensors')}>
                            <div className="sensor-card-header">
                                <div>
                                    <div className="sensor-card-name">{s.label}</div>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                                        <span className="sensor-card-reading" style={{ color: isAboveMax ? '#ef4444' : undefined }}>{s.key === 'light' ? `${(s.value / 1000).toFixed(1)}k` : s.value}</span>
                                        <span className="sensor-card-unit">{s.unit}</span>
                                    </div>
                                </div>
                                <span className={`sensor-card-trend ${s.trend}`}>
                                    {s.trend === 'rising' ? '↑' : s.trend === 'falling' ? '↓' : '→'} {s.trend}
                                </span>
                            </div>
                            {chartData.length > 0 && (
                                <ResponsiveContainer width="100%" height={50}>
                                    <LineChart data={chartData}>
                                        {(() => {
                                            const zi = zoneIntervals[s.key]; return zi ? <>
                                                {zi.normal && <ReferenceArea y1={zi.normal[0]} y2={zi.normal[1]} fill="#34d399" fillOpacity={0.06} />}
                                                {zi.risky && <ReferenceArea y1={zi.risky[0]} y2={zi.risky[1]} fill="#f59e0b" fillOpacity={0.08} />}
                                                {zi.riskyHigh && <ReferenceArea y1={zi.riskyHigh[0]} y2={zi.riskyHigh[1]} fill="#f59e0b" fillOpacity={0.08} />}
                                                {zi.critical && <ReferenceArea y1={zi.critical[0]} y2={zi.critical[1]} fill="#ef4444" fillOpacity={0.08} />}
                                                {zi.criticalHigh && <ReferenceArea y1={zi.criticalHigh[0]} y2={zi.criticalHigh[1]} fill="#ef4444" fillOpacity={0.08} />}
                                            </> : null;
                                        })()}
                                        <Line type="monotone" dataKey="actual" stroke="#38bdf8" strokeWidth={1.5} dot={false} />
                                        <Line type="monotone" dataKey="forecast" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
                                        {s.threshold && <ReferenceLine y={s.threshold.max} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={0.8} />}
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                            {s.threshold && <div className="sensor-card-threshold">Threshold: {s.threshold.max}{s.unit}</div>}
                            {forecast && <div className="sensor-card-forecast">AI Forecast: {s.trend === 'rising' ? 'Expected to breach in ~2h' : 'Within safe range'}</div>}
                        </div>
                    );
                })}
            </div>

            {/* Multimodal Data Ingestion */}
            <DataIngestionPanel isActive={true} />

            {/* Multimodal Sensor Feed — Compact Strip */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, marginTop: 8 }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0', margin: 0 }}>Multimodal Sensor Imagery</h3>
                <button className="btn btn-sm" onClick={() => navigate('/sensors')} style={{ fontSize: '0.65rem', padding: '3px 10px' }}>View All →</button>
            </div>
            <MultimodalGallery compact />

            {/* AI Thinking Panel */}
            <div ref={aiRef}>
                {(thinkingChain.length > 0 && thinkingContext === 'risk') && (
                    <AIThinkingPanel
                        chain={thinkingChain}
                        isThinking={isThinking}
                        onComplete={stopThinking}
                    />
                )}
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
                    subtitle={`¥${field?.gradeClass === 'A' ? '180' : '120'}/kg export`}
                    icon="star"
                />
                <MetricCard
                    label="Revenue at Risk"
                    value={revenueAtRisk ? `¥${(revenueAtRisk.total / 1000).toFixed(1)}k` : '¥0.0k'}
                    status={revenueAtRisk?.total > 30000 ? 'critical' : 'low'}
                    subtitle={revenueAtRisk ? `${revenueAtRisk.downgradeProbability}% downgrade prob.` : '—'}
                    icon="dollar"
                />
                <MetricCard
                    label="Decisions"
                    value={prescriptions.length}
                    subtitle={`${auditRecords.length} audited`}
                    icon="box"
                />
            </div>

            {/* Biological Threats + Environment */}
            <div className="grid grid-2" style={{ marginTop: 16 }}>
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="card-title">Biological Threats</h3>
                        <span className="section-timestamp">{formatNow()}</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', padding: '8px 0' }}>
                        {riskResults.map(r => (
                            <div key={r.threatId} style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/risk')}>
                                <RiskGauge score={r.score} size={90} threat={r.name} />
                                <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: 2 }}>{r.nameZh || r.name?.slice(0, 8)}</div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="card-title">Environment Snapshot</h3>
                        <span className="section-timestamp">{formatNow()}</span>
                    </div>
                    <div className="grid grid-3" style={{ gap: 12, marginTop: 8 }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#e2e8f0' }}>{currentSnapshot?.temperature?.toFixed(1) || '—'}<span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>°C</span></div>
                            <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>Temperature</div>
                            <div style={{ fontSize: '0.55rem', color: '#475569' }}>→ {currentSnapshot?.temperatureTrend || 'stable'}</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: sensors.humidity_pct > 85 ? '#ef4444' : '#e2e8f0' }}>{currentSnapshot?.humidity?.toFixed(1) || '—'}<span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>%</span></div>
                            <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>Humidity</div>
                            <div style={{ fontSize: '0.55rem', color: '#ef4444', fontWeight: 600 }}>↑ rising</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#e2e8f0' }}>{currentSnapshot?.soilMoisture?.toFixed(1) || '—'}<span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>%</span></div>
                            <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>Soil Moisture</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#e2e8f0' }}>{sensors.wind_speed_ms}<span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>m/s</span></div>
                            <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>Wind</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: sensors.leaf_wetness_h > 3 ? '#ef4444' : '#e2e8f0' }}>{sensors.leaf_wetness_h || 2.62}<span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>h</span></div>
                            <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>Leaf Wetness</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#e2e8f0' }}>{sensors.soil_ph || 4.79}</div>
                            <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>pH</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 30-Day Risk Profile */}
            <div className="card" style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="card-title">30-Day Risk Profile — AI Predicted Trend</h3>
                    <span className="section-timestamp">{formatNow()}</span>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={riskTrend.slice(-30)}>
                        <defs>
                            <linearGradient id="grayMold" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} /></linearGradient>
                            <linearGradient id="anthracnose" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} /><stop offset="95%" stopColor="#f59e0b" stopOpacity={0} /></linearGradient>
                        </defs>
                        <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={{ stroke: '#1e293b' }} label={{ value: 'Simulation Day', position: 'insideBottom', offset: -2, fill: '#475569', fontSize: 10 }} />
                        <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={{ stroke: '#1e293b' }} />
                        <Tooltip contentStyle={{ background: '#1a2235', border: '1px solid #1e293b', borderRadius: 8, color: '#e2e8f0' }} />
                        <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={0.8} label={{ value: 'Critical', position: 'right', fill: '#ef4444', fontSize: 10 }} />
                        <Area type="monotone" dataKey="grayMold" stroke="#ef4444" fillOpacity={1} fill="url(#grayMold)" strokeWidth={1.5} name="Gray Mold" />
                        <Area type="monotone" dataKey="anthracnose" stroke="#f59e0b" fillOpacity={1} fill="url(#anthracnose)" strokeWidth={1.5} name="Anthracnose" />
                        <Area type="monotone" dataKey="aphids" stroke="#3dabf5" fillOpacity={0} strokeWidth={1} name="Aphids" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* AI Watchdog Scan History (last 8) */}
            <div className="card" style={{ marginTop: 16 }}>
                <h3 className="card-title">AI Watchdog — Recent Scan Log</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {aiWatchdog.scanHistory.map((scan, i) => (
                        <div key={i} style={{ display: 'flex', gap: 12, padding: '4px 0', borderBottom: '1px solid rgba(148,163,184,0.04)', alignItems: 'center' }}>
                            <span className="timestamp-full">{scan.time}</span>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: scan.severity === 'ok' ? '#34d399' : scan.severity === 'warning' ? '#f59e0b' : scan.severity === 'critical' ? '#ef4444' : '#38bdf8', flexShrink: 0 }} />
                            <span style={{ fontSize: '0.72rem', color: scan.severity === 'ok' ? '#64748b' : '#e2e8f0', flex: 1 }}>{scan.result}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
