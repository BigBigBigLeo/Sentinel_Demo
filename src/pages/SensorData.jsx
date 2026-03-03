import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { fields, currentSensors, sensorTimeSeries, pestMonitoring } from '../data/mockData';
import Icon from '../components/Icon';
import StatusBadge from '../components/StatusBadge';

export default function SensorData({ selectedField }) {
    const [timeRange, setTimeRange] = useState('24H');
    const field = fields.find(f => f.id === selectedField);
    const sensors = currentSensors[selectedField];
    const timeSeries = sensorTimeSeries[selectedField];
    const pests = pestMonitoring[selectedField];

    const sensorCards = [
        { label: 'Temperature', value: sensors?.temp_C, unit: '°C', icon: 'thermostat', color: '#3dabf5', threshold: 28 },
        { label: 'Humidity', value: sensors?.humidity_pct, unit: '%', icon: 'water-drop', color: '#ef4444', threshold: field?.crop === 'blueberry' ? 65 : 90 },
        { label: 'Soil Moisture', value: sensors?.soil_moist_pct, unit: '%', icon: 'leaf', color: '#22d87a', threshold: 40 },
        { label: 'Light', value: sensors?.light_Lux, unit: 'Lux', icon: 'sun', color: '#f5a623', threshold: null },
        { label: 'Wind Speed', value: sensors?.wind_speed_ms, unit: 'm/s', icon: 'wind', color: '#a78bfa', threshold: 3 },
        { label: 'Rainfall', value: sensors?.rainfall_mm, unit: 'mm', icon: 'cloud-rain', color: '#3dabf5', threshold: null },
    ];

    const chartConfigs = [
        { key: 'temperature', label: 'Temperature (°C)', color: '#3dabf5', threshold: 28 },
        { key: 'humidity', label: 'Humidity (%)', color: '#ef4444', threshold: field?.crop === 'blueberry' ? 65 : 90 },
        { key: 'soilMoisture', label: 'Soil Moisture (%)', color: '#22d87a', threshold: 40 },
        { key: 'light', label: 'Light (Lux)', color: '#f5a623', threshold: null },
    ];

    return (
        <div className="animate-in">
            {/* Sensor Cards Grid */}
            <div className="grid-3 mb-24">
                {sensorCards.map((s, i) => {
                    const breached = s.threshold && (
                        s.label === 'Humidity' ? s.value > s.threshold :
                            s.label === 'Wind Speed' ? s.value > s.threshold :
                                s.value > s.threshold
                    );
                    return (
                        <div className={`sensor-card animate-in animate-in-delay-${i % 4 + 1}`} key={i}>
                            <div className="sensor-header">
                                <div className="sensor-icon" style={{ background: `${s.color}20`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon name={s.icon} size={28} />
                                </div>
                                {breached && <StatusBadge status="critical" label="BREACHED" />}
                            </div>
                            <div className="sensor-value" style={{ color: s.color }}>{s.value}</div>
                            <div className="sensor-unit">{s.label} ({s.unit})</div>
                            {s.threshold && (
                                <div className="sensor-change" style={{ color: breached ? '#ef4444' : '#94a3b8' }}>
                                    Threshold: {s.threshold}{s.unit}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Time-series Charts */}
            <div className="card mb-24">
                <div className="card-header">
                    <h3>Sensor Time Series</h3>
                    <div className="tab-group">
                        {['24H', '7D', '30D'].map(r => (
                            <button key={r} className={`tab-btn ${timeRange === r ? 'active' : ''}`} onClick={() => setTimeRange(r)}>
                                {r}
                            </button>
                        ))}
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    {chartConfigs.map(cfg => (
                        <div key={cfg.key} style={{ height: 200 }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>{cfg.label}</div>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={timeSeries?.[cfg.key] || []}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                                    <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} interval={3} />
                                    <YAxis tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ background: '#111827', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 8, fontSize: 11 }}
                                    />
                                    {cfg.threshold && (
                                        <ReferenceLine y={cfg.threshold} stroke="#ef4444" strokeDasharray="5 5" label={{ value: `Threshold: ${cfg.threshold}`, position: 'right', fontSize: 9, fill: '#ef4444' }} />
                                    )}
                                    <Line type="monotone" dataKey="value" stroke={cfg.color} strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pest Monitoring Manual Input */}
            <div className="grid-2" style={{ gap: 16 }}>
                <div className="card">
                    <div className="card-header">
                        <h3>Pest & Disease Monitoring</h3>
                        <StatusBadge status="monitoring" label="Latest readings" />
                    </div>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Indicator</th>
                                <th>Value</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(pests || {}).map(([key, val]) => {
                                const label = key.replace(/_/g, ' ').replace(/pct/g, '%').replace(/\b\w/g, l => l.toUpperCase());
                                const isHigh = (key.includes('aphid') && val > 5) || (key.includes('botrytis') && val > 2) || (key.includes('mite') && val > 5);
                                return (
                                    <tr key={key}>
                                        <td style={{ fontWeight: 500 }}>{label}</td>
                                        <td>{val}</td>
                                        <td>{isHigh ? <StatusBadge status="critical" label="HIGH" /> : <StatusBadge status="pass" label="NORMAL" />}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3>Manual Data Entry</h3>
                        <StatusBadge status="monitoring" label="Field inspection" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <div>
                            <label className="form-label">Aphids per Leaf</label>
                            <input type="number" className="form-input" defaultValue={pests?.aphids_per_leaf || 0} />
                        </div>
                        <div>
                            <label className="form-label">Sticky Trap Count</label>
                            <input type="number" className="form-input" defaultValue={pests?.sticky_trap_daily || 0} />
                        </div>
                        <div>
                            <label className="form-label">Infection Rate (%)</label>
                            <input type="number" className="form-input" defaultValue={pests?.botrytis_infection_pct || 0} />
                        </div>
                        <div>
                            <label className="form-label">Soil pH</label>
                            <input type="number" className="form-input" defaultValue={sensors?.soil_ph || 5.0} step="0.1" />
                        </div>
                    </div>
                    <button className="btn btn-primary" style={{ marginTop: 16, width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Icon name="save" size={16} />
                        Update Readings
                    </button>
                </div>
            </div>

            {/* JSON Data Preview */}
            <div className="card" style={{ marginTop: 20 }}>
                <div className="card-header">
                    <h3>Raw JSON Input</h3>
                    <StatusBadge status="low" label="API Format" />
                </div>
                <pre style={{
                    background: '#0a0e1a', padding: 16, borderRadius: '8px',
                    fontSize: '0.78rem', color: '#10b981', overflow: 'auto', maxHeight: 180,
                    border: '1px solid #1e293b',
                }}>
                    {JSON.stringify({
                        crop: field?.crop,
                        field_id: field?.name,
                        date: new Date().toISOString(),
                        growth_stage: field?.growthStageZh,
                        env: sensors,
                        pest: pests,
                        prev_actions: { last_spray: '10 days ago' },
                    }, null, 2)}
                </pre>
            </div>
        </div>
    );
}
