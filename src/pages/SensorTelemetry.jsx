import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts';
import useStore from '../engine/store';
import StatusBadge from '../components/StatusBadge';
import Icon from '../components/Icon';
import MetricCard from '../components/MetricCard';
import PipelineBreadcrumb from '../components/PipelineBreadcrumb';
import MultimodalGallery from '../components/MultimodalGallery';
import {
    sensorTimeSeries, sensorForecasts, sensorThresholds, thresholdBreaches,
    pestMonitoring, sensorFleet, zoneIntervals, perUnitTimeSeries,
} from '../data/mockData';

const SENSOR_TYPE_META = {
    temperature: { label: 'Temperature', labelZh: '温度', icon: '🌡️', color: '#38bdf8', unit: '°C' },
    humidity: { label: 'Humidity', labelZh: '湿度', icon: '💧', color: '#f59e0b', unit: '%' },
    soilMoisture: { label: 'Soil Moisture', labelZh: '土壤含水量', icon: '🌱', color: '#34d399', unit: '%' },
    leafWetness: { label: 'Leaf Wetness', labelZh: '叶面湿度', icon: '🍃', color: '#a78bfa', unit: 'h' },
    wind: { label: 'Wind Speed', labelZh: '风速', icon: '💨', color: '#60a5fa', unit: 'm/s' },
    light: { label: 'Light Intensity', labelZh: '光照', icon: '☀️', color: '#fbbf24', unit: 'Lux' },
    soilPh: { label: 'Soil pH', labelZh: '土壤pH', icon: '🧪', color: '#fb923c', unit: 'pH' },
    rainfall: { label: 'Rainfall', labelZh: '降水', icon: '🌧️', color: '#06b6d4', unit: 'mm' },
    pestTrap: { label: 'Pest Trap', labelZh: '虫情监测', icon: '🪲', color: '#f472b6', unit: 'count/day' },
    camera: { label: 'Camera', labelZh: '摄像头', icon: '📷', color: '#818cf8', unit: '' },
    co2: { label: 'CO₂ Level', labelZh: '二氧化碳', icon: '🫁', color: '#22d3ee', unit: 'ppm' },
    uvIndex: { label: 'UV Index', labelZh: '紫外线指数', icon: '🔆', color: '#e879f9', unit: 'UV' },
    irrigationFlow: { label: 'Irrigation Flow', labelZh: '灌溉流量', icon: '🚿', color: '#2dd4bf', unit: 'L/min' },
    sporeCount: { label: 'Spore Counter', labelZh: '孢子计数', icon: '🔬', color: '#fb7185', unit: 'spores/m³' },
};

const statusColor = { online: '#34d399', warning: '#f59e0b', offline: '#ef4444' };

export default function SensorTelemetry() {
    const { currentSnapshot, fields, activeFieldId } = useStore();
    const field = fields[activeFieldId];
    const fleet = sensorFleet[activeFieldId] || [];
    const pests = pestMonitoring[activeFieldId] || {};
    const unitSeries = perUnitTimeSeries[activeFieldId] || {};

    // Group fleet by type
    const groupedFleet = {};
    fleet.forEach(s => {
        if (!groupedFleet[s.type]) groupedFleet[s.type] = [];
        groupedFleet[s.type].push(s);
    });

    const totalOnline = fleet.filter(s => s.status === 'online').length;
    const totalWarning = fleet.filter(s => s.status === 'warning').length;
    const totalTypes = Object.keys(groupedFleet).length;

    const now = new Date().toLocaleString('en-US', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const fmtTime = (d) => new Date(d).toLocaleString('en-US', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });

    // Zone interval band helper
    const getZoneBands = (type) => {
        const zi = zoneIntervals[type];
        if (!zi) return null;
        return zi;
    };

    return (
        <div className="page">
            <PipelineBreadcrumb />

            <div className="page-header">
                <div>
                    <h1 className="page-title">Sensor Telemetry</h1>
                    <p className="page-subtitle">Stage 2: Data Collection — {field?.name} | {now}</p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <StatusBadge status="monitoring" label={`${totalOnline} Online`} />
                    {totalWarning > 0 && <StatusBadge status="warning" label={`${totalWarning} Warning`} />}
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{fleet.length} sensors | {totalTypes} types</span>
                </div>
            </div>

            {/* Summary KPIs */}
            <div className="grid grid-4" style={{ marginBottom: 16 }}>
                <MetricCard label="Total Sensors" value={fleet.length} status="monitoring" subtitle={`${totalTypes} sensor types`} />
                <MetricCard label="Online" value={totalOnline} status="monitoring" subtitle={`${((totalOnline / fleet.length) * 100).toFixed(0)}% uptime`} />
                <MetricCard label="Warnings" value={totalWarning} status={totalWarning > 0 ? 'warning' : 'monitoring'} subtitle="threshold alerts active" />
                <MetricCard label="Data Rate" value="288/day" subtitle="readings per sensor" />
            </div>

            {/* All Sensors — Expanded by Type */}
            {Object.entries(groupedFleet).map(([type, units]) => {
                const meta = SENSOR_TYPE_META[type] || { label: type, color: '#94a3b8', icon: '📡', unit: '' };
                const zones = getZoneBands(type);
                const isNonNumeric = type === 'camera';

                return (
                    <div key={type} className="card" style={{ marginBottom: 16 }}>
                        <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: '1.1rem' }}>{meta.icon}</span>
                            {meta.label} <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 400 }}>({meta.labelZh})</span>
                            <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: '#94a3b8' }}>{units.length} unit{units.length > 1 ? 's' : ''}</span>
                        </h3>

                        <div className="grid grid-3" style={{ gap: 12 }}>
                            {units.map(u => {
                                const series = unitSeries[u.id] || [];
                                const hasChart = series.length > 0 && !isNonNumeric;
                                const isWarning = u.status === 'warning';

                                return (
                                    <div key={u.id} style={{
                                        padding: 14, background: 'rgba(15,23,42,0.4)', borderRadius: 10,
                                        border: `1px solid ${isWarning ? 'rgba(245,158,11,0.3)' : 'var(--border-subtle)'}`,
                                        borderLeft: `3px solid ${statusColor[u.status] || '#64748b'}`,
                                    }}>
                                        {/* Header: ID, Zone, Status */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                            <div>
                                                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#e2e8f0', fontFamily: 'monospace' }}>{u.id}</span>
                                                <span style={{ fontSize: '0.65rem', color: '#64748b', marginLeft: 8 }}>{u.zone}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor[u.status] }} />
                                                <span style={{ fontSize: '0.6rem', color: statusColor[u.status], textTransform: 'uppercase', fontWeight: 600 }}>{u.status}</span>
                                            </div>
                                        </div>

                                        {/* Current Value */}
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                                            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: isWarning ? '#f59e0b' : '#e2e8f0' }}>
                                                {typeof u.value === 'number' ? u.value : u.value}
                                            </span>
                                            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{u.unit}</span>
                                        </div>

                                        {/* Mini Chart with Zone Bands */}
                                        {hasChart && (
                                            <div style={{ marginBottom: 6 }}>
                                                <ResponsiveContainer width="100%" height={70}>
                                                    <AreaChart data={series}>
                                                        <defs>
                                                            <linearGradient id={`grad-${u.id}`} x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="0%" stopColor={meta.color} stopOpacity={0.2} />
                                                                <stop offset="100%" stopColor={meta.color} stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <XAxis dataKey="hour" tick={false} axisLine={false} tickLine={false} />
                                                        <YAxis tick={{ fill: '#475569', fontSize: 8 }} axisLine={false} tickLine={false} width={30} />
                                                        <Tooltip contentStyle={{ background: '#1a2235', border: '1px solid #1e293b', borderRadius: 8, fontSize: '0.65rem' }} />
                                                        {/* Zone interval bands */}
                                                        {zones?.normal && <ReferenceArea y1={zones.normal[0]} y2={zones.normal[1]} fill="#34d399" fillOpacity={0.06} />}
                                                        {zones?.risky && <ReferenceArea y1={zones.risky[0]} y2={zones.risky[1]} fill="#f59e0b" fillOpacity={0.08} />}
                                                        {zones?.riskyHigh && <ReferenceArea y1={zones.riskyHigh[0]} y2={zones.riskyHigh[1]} fill="#f59e0b" fillOpacity={0.08} />}
                                                        {zones?.critical && <ReferenceArea y1={zones.critical[0]} y2={zones.critical[1]} fill="#ef4444" fillOpacity={0.08} />}
                                                        {zones?.criticalHigh && <ReferenceArea y1={zones.criticalHigh[0]} y2={zones.criticalHigh[1]} fill="#ef4444" fillOpacity={0.08} />}
                                                        <Area type="monotone" dataKey="value" stroke={meta.color} fill={`url(#grad-${u.id})`} strokeWidth={1.5} dot={false} />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 2 }}>
                                                    <span style={{ fontSize: '0.5rem', color: '#34d399' }}>● Normal</span>
                                                    <span style={{ fontSize: '0.5rem', color: '#f59e0b' }}>● Risky</span>
                                                    <span style={{ fontSize: '0.5rem', color: '#ef4444' }}>● Critical</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Camera streaming indicator */}
                                        {isNonNumeric && (
                                            <div style={{ padding: '8px 12px', background: 'rgba(129,140,248,0.08)', borderRadius: 8, fontSize: '0.7rem', color: '#818cf8', textAlign: 'center' }}>
                                                📹 Live Stream Active — {u.zone}
                                            </div>
                                        )}

                                        {/* Metadata */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.6rem', color: '#475569' }}>
                                            {u.battery !== null && <span>🔋 {u.battery}%</span>}
                                            <span>{u.signalDb}dB</span>
                                            <span>Cal: {new Date(u.lastCalibration).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}

            {/* Threshold Breach Log */}
            <div className="card" style={{ marginBottom: 16 }}>
                <h3 className="card-title">Threshold Breach Log — Recent Events</h3>
                <table className="data-table">
                    <thead>
                        <tr><th>Time</th><th>Sensor</th><th>Value</th><th>Threshold</th><th>Zone</th><th>Action</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                        {(thresholdBreaches || []).map((b, i) => (
                            <tr key={i}>
                                <td style={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>{fmtTime(b.time)}</td>
                                <td>{b.sensor}</td>
                                <td style={{ fontWeight: 600, color: '#f59e0b' }}>{b.value}</td>
                                <td style={{ color: '#64748b' }}>{b.threshold}</td>
                                <td>{b.zone}</td>
                                <td style={{ fontSize: '0.72rem' }}>{b.action}</td>
                                <td><StatusBadge status={b.status} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pest Monitoring */}
            <div className="card" style={{ marginBottom: 16 }}>
                <h3 className="card-title">Pest Monitoring Station</h3>
                <div className="grid grid-3" style={{ gap: 10 }}>
                    {Object.entries(pests).map(([key, val]) => (
                        <div key={key} style={{ padding: 12, background: 'rgba(15,23,42,0.4)', borderRadius: 10, border: '1px solid var(--border-subtle)', borderLeft: `3px solid ${val > 10 ? '#ef4444' : val > 5 ? '#f59e0b' : '#34d399'}` }}>
                            <div style={{ fontSize: '0.68rem', color: '#64748b', marginBottom: 4 }}>{key.replace(/_/g, ' ')}</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: val > 10 ? '#ef4444' : val > 5 ? '#f59e0b' : '#e2e8f0' }}>{val}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Multimodal Sensor Imagery */}
            <MultimodalGallery />
        </div>
    );
}
