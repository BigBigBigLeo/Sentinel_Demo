import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, AreaChart, Area } from 'recharts';
import useStore from '../engine/store';
import Icon from '../components/Icon';
import StatusBadge from '../components/StatusBadge';
import MultimodalGallery from '../components/MultimodalGallery';
import { currentSensors, sensorTimeSeries, sensorForecasts, sensorThresholds, pestMonitoring, thresholdBreaches, trendAlerts } from '../data/mockData';

const SENSOR_CONFIG = [
    { key: 'temperature', label: 'Temperature', unit: '°C', color: '#ef4444', sensorKey: 'temp_C', trend: 'stable' },
    { key: 'humidity', label: 'Humidity', unit: '%', color: '#38bdf8', sensorKey: 'humidity_pct', trend: 'rising' },
    { key: 'soilMoisture', label: 'Soil Moisture', unit: '%', color: '#34d399', sensorKey: 'soil_moist_pct', trend: 'stable' },
    { key: 'leafWetness', label: 'Leaf Wetness', unit: 'h', color: '#a78bfa', sensorKey: 'leaf_wetness_h', trend: 'rising' },
    { key: 'wind', label: 'Wind Speed', unit: 'm/s', color: '#f59e0b', sensorKey: 'wind_speed_ms', trend: 'stable' },
    { key: 'light', label: 'Light Intensity', unit: 'Lux', color: '#06b6d4', sensorKey: 'light_Lux', trend: 'falling' },
];

export default function SensorData() {
    const { fields, activeFieldId } = useStore();
    const field = fields[activeFieldId];
    const fieldId = activeFieldId || 'BS-B3';
    const sensors = currentSensors[fieldId] || {};
    const timeSeries = sensorTimeSeries[fieldId] || {};
    const forecasts = sensorForecasts[fieldId] || {};
    const pest = pestMonitoring[fieldId] || {};
    const alerts = trendAlerts[fieldId] || [];
    const fieldZonePrefix = fieldId?.split('-')[1] || '';
    const breaches = thresholdBreaches.filter(b => b.zone?.includes(fieldZonePrefix) || b.zone === 'All');

    const formatNow = () => new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Sensor Telemetry</h1>
                    <p className="page-subtitle">Stage 1: Perception — {field?.name} | Updated: {formatNow()}</p>
                </div>
            </div>

            {/* Sensor Grid — 24h chart + 12h AI forecast per sensor */}
            <div className="sensor-grid">
                {SENSOR_CONFIG.map(s => {
                    const value = sensors[s.sensorKey] || 0;
                    const series = timeSeries[s.key] || [];
                    const forecast = forecasts[s.key] || [];
                    const threshold = sensorThresholds[s.key];
                    const isAbove = threshold && value > threshold.max;

                    const chartData = [
                        ...series.slice(-18).map(d => ({ time: d.time, actual: d.value })),
                        ...forecast.slice(0, 8).map(d => ({ time: d.time, forecast: d.value })),
                    ];

                    return (
                        <div key={s.key} className="sensor-sparkline-card" style={isAbove ? { borderLeft: `3px solid ${s.color}` } : {}}>
                            <div className="sensor-card-header">
                                <div>
                                    <div className="sensor-card-name">{s.label}</div>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                                        <span className="sensor-card-reading" style={{ color: isAbove ? '#ef4444' : s.color }}>
                                            {s.key === 'light' ? `${(value / 1000).toFixed(1)}k` : (typeof value === 'number' ? value.toFixed(1) : value)}
                                        </span>
                                        <span className="sensor-card-unit">{s.unit}</span>
                                    </div>
                                </div>
                                <span className={`sensor-card-trend ${s.trend}`}>
                                    {s.trend === 'rising' ? '↑' : s.trend === 'falling' ? '↓' : '→'} {s.trend}
                                </span>
                            </div>
                            <ResponsiveContainer width="100%" height={70}>
                                <LineChart data={chartData}>
                                    <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 8 }} axisLine={false} tickLine={false} interval={3} />
                                    <YAxis hide domain={['auto', 'auto']} />
                                    <Tooltip contentStyle={{ background: '#1a2235', border: '1px solid #1e293b', borderRadius: 8, color: '#e2e8f0', fontSize: 12 }} />
                                    <Line type="monotone" dataKey="actual" stroke={s.color} strokeWidth={2} dot={false} name="Actual" />
                                    <Line type="monotone" dataKey="forecast" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="4 4" name="AI Forecast" />
                                    {threshold && <ReferenceLine y={threshold.max} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={0.8} />}
                                    {threshold && <ReferenceLine y={threshold.min} stroke="#34d399" strokeDasharray="3 3" strokeWidth={0.8} />}
                                </LineChart>
                            </ResponsiveContainer>
                            {threshold && <div className="sensor-card-threshold">Threshold: {threshold.min}–{threshold.max} {s.unit}</div>}
                            {forecast.length > 0 && (
                                <div className="sensor-card-forecast">
                                    AI 12h forecast: {forecast[forecast.length - 1]?.value?.toFixed(1)} {s.unit} ({forecast[0]?.confidence}% conf.)
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Multimodal Sensor Imagery */}
            <MultimodalGallery />

            {/* Trend Alerts */}
            {alerts.length > 0 && (
                <div className="card" style={{ marginBottom: 16 }}>
                    <h3 className="card-title">AI Trend Alerts — Proactive Monitoring</h3>
                    <div className="trend-alerts" style={{ marginBottom: 0 }}>
                        {alerts.map(alert => (
                            <div key={alert.id} className={`trend-alert-card severity-${alert.severity}`}>
                                <div className="trend-alert-header">
                                    <div className="trend-alert-title">
                                        <Icon name={alert.icon} size={16} /> {alert.title}
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <span className="timestamp-full">{new Date(alert.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                                        <StatusBadge status={alert.status} />
                                    </div>
                                </div>
                                <div className="trend-alert-detail">{alert.detail}</div>
                                <div className="trend-alert-prediction"><Icon name="bolt" size={10} color="#f59e0b" /> {alert.prediction}</div>
                                <div className="trend-alert-action"><Icon name="play" size={10} /> {alert.recommended}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Threshold Breach Log */}
            <div className="card" style={{ marginBottom: 16 }}>
                <h3 className="card-title">Threshold Breach Log — {breaches.length} Events</h3>
                <table className="data-table">
                    <thead>
                        <tr><th>Date / Time</th><th>Sensor</th><th>Value</th><th>Threshold</th><th>Zone</th><th>Action Taken</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                        {breaches.map((b, i) => (
                            <tr key={i}>
                                <td className="timestamp-full">{new Date(b.time).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}</td>
                                <td style={{ fontWeight: 600, color: '#e2e8f0' }}>{b.sensor}</td>
                                <td style={{ fontFamily: 'JetBrains Mono, monospace', color: '#ef4444', fontWeight: 700 }}>{b.value}</td>
                                <td style={{ fontFamily: 'JetBrains Mono, monospace', color: '#64748b' }}>{b.threshold}</td>
                                <td><span className="zone-badge">{b.zone}</span></td>
                                <td style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{b.action}</td>
                                <td><StatusBadge status={b.status} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pest Monitoring */}
            <div className="card">
                <h3 className="card-title">Pest Monitoring — IoT Trap Data</h3>
                <div className="grid grid-3" style={{ gap: 12, marginTop: 8 }}>
                    {Object.entries(pest).map(([key, value]) => (
                        <div key={key} style={{ padding: 12, background: '#0c1322', borderRadius: 8, textAlign: 'center' }}>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: value > 5 ? '#f59e0b' : '#34d399', fontFamily: 'JetBrains Mono, monospace' }}>
                                {value}
                            </div>
                            <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', marginTop: 4 }}>
                                {key.replace(/_/g, ' ')}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
