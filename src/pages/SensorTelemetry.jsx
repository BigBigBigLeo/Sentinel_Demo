import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import useStore from '../engine/store';
import StatusBadge from '../components/StatusBadge';

export default function SensorTelemetry() {
    const { currentSnapshot, simulationData, activeFieldId, currentDay, fields } = useStore();
    const [selectedSensor, setSelectedSensor] = useState('humidity_pct');
    const field = fields[activeFieldId];
    const sensors = currentSnapshot?.sensors;
    const pests = currentSnapshot?.pests;

    // 24h hourly data for the current day
    const dayData = simulationData[activeFieldId]?.[currentDay - 1];
    const hourlyData = dayData?.hourly?.map(h => ({
        hour: `${String(h.hour).padStart(2, '0')}:00`,
        ...h,
    })) || [];

    // Multi-day trend
    const simData = simulationData[activeFieldId] || [];
    const trendData = simData.slice(Math.max(0, currentDay - 14), currentDay).map(d => ({
        day: `D${d.day}`,
        temp: d.daily.temp_C,
        humidity: d.daily.humidity_pct,
        soil: d.daily.soil_moist_pct,
        leafWet: +d.daily.leaf_wetness_hrs,
        rain: +d.daily.rainfall_mm,
    }));

    const sensorConfig = {
        temp_C: { label: 'Temperature', unit: '°C', color: '#f59e0b', key: 'temp_C' },
        humidity_pct: { label: 'Humidity', unit: '%', color: '#3dabf5', key: 'humidity_pct' },
        soil_moist_pct: { label: 'Soil Moisture', unit: '%', color: '#10b981', key: 'soil_moist_pct' },
        leaf_wetness_hrs: { label: 'Leaf Wetness', unit: 'h', color: '#8b5cf6', key: 'leaf_wetness_hrs' },
        wind_speed_ms: { label: 'Wind Speed', unit: 'm/s', color: '#64748b', key: 'wind_speed_ms' },
        light_Lux: { label: 'Light', unit: 'Lux', color: '#eab308', key: 'light_Lux' },
    };

    const activeSC = sensorConfig[selectedSensor];

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Sensor Telemetry</h1>
                    <p className="page-subtitle">Stage 1: Perception — {field?.name} Day {currentDay}</p>
                </div>
                <StatusBadge status={sensors?.humidity_pct > 85 ? 'critical' : 'low'} label={sensors?.humidity_pct > 85 ? 'HIGH HUMIDITY' : 'NOMINAL'} size="lg" />
            </div>

            {/* Live Sensor Grid */}
            <div className="grid grid-4">
                {sensors && Object.entries(sensorConfig).map(([key, cfg]) => {
                    const val = sensors[key];
                    const isAlert = (key === 'humidity_pct' && val > 85) || (key === 'leaf_wetness_hrs' && val > 6) || (key === 'wind_speed_ms' && val > 3);
                    return (
                        <div
                            key={key}
                            className={`card sensor-card ${selectedSensor === key ? 'sensor-selected' : ''}`}
                            onClick={() => setSelectedSensor(key)}
                            style={{ cursor: 'pointer', borderLeft: selectedSensor === key ? `3px solid ${cfg.color}` : undefined }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{cfg.label}</span>
                                {isAlert && <StatusBadge status="critical" label="ALERT" />}
                            </div>
                            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: isAlert ? '#ef4444' : '#e2e8f0', marginTop: 4 }}>
                                {val}{cfg.unit}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 24h Chart */}
            <div className="card" style={{ marginTop: 16 }}>
                <h3 className="card-title">{activeSC.label} — 24h Profile (Day {currentDay})</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={hourlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={{ stroke: '#1e293b' }} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#1e293b' }} />
                        <Tooltip contentStyle={{ background: '#1a2235', border: '1px solid #1e293b', borderRadius: 8, color: '#e2e8f0' }} />
                        <Line type="monotone" dataKey={activeSC.key} stroke={activeSC.color} strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* 14-Day Trend */}
            <div className="card" style={{ marginTop: 16 }}>
                <h3 className="card-title">14-Day Trend</h3>
                <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={{ stroke: '#1e293b' }} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#1e293b' }} />
                        <Tooltip contentStyle={{ background: '#1a2235', border: '1px solid #1e293b', borderRadius: 8, color: '#e2e8f0' }} />
                        <Line type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="Temp (°C)" />
                        <Line type="monotone" dataKey="humidity" stroke="#3dabf5" strokeWidth={1.5} dot={false} name="Humidity (%)" />
                        <Line type="monotone" dataKey="soil" stroke="#10b981" strokeWidth={1.5} dot={false} name="Soil Moist (%)" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Pest Monitoring Table */}
            <div className="card" style={{ marginTop: 16 }}>
                <h3 className="card-title">Pest Monitoring</h3>
                {pests && (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Metric</th>
                                <th>Value</th>
                                <th>Threshold</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Aphids per leaf</td>
                                <td>{pests.aphids_per_leaf}</td>
                                <td>5.0</td>
                                <td><StatusBadge status={pests.aphids_per_leaf > 5 ? 'critical' : 'low'} /></td>
                            </tr>
                            <tr>
                                <td>Botrytis spore index</td>
                                <td>{pests.botrytis_spore_index}</td>
                                <td>70</td>
                                <td><StatusBadge status={pests.botrytis_spore_index > 70 ? 'critical' : pests.botrytis_spore_index > 40 ? 'elevated' : 'low'} /></td>
                            </tr>
                            <tr>
                                <td>Sticky trap (whitefly)</td>
                                <td>{pests.sticky_trap_whitefly}</td>
                                <td>30</td>
                                <td><StatusBadge status={pests.sticky_trap_whitefly > 30 ? 'critical' : 'low'} /></td>
                            </tr>
                            <tr>
                                <td>Fruit fly trap count</td>
                                <td>{pests.fruitfly_trap_count}</td>
                                <td>5</td>
                                <td><StatusBadge status={pests.fruitfly_trap_count > 5 ? 'elevated' : 'low'} /></td>
                            </tr>
                            <tr>
                                <td>Mite density</td>
                                <td>{pests.mite_density}</td>
                                <td>5.0</td>
                                <td><StatusBadge status={pests.mite_density > 5 ? 'critical' : 'low'} /></td>
                            </tr>
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
