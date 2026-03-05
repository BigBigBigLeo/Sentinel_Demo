import React, { useEffect, useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
import useStore from '../engine/store';
import StatusBadge from '../components/StatusBadge';
import Icon from '../components/Icon';
import MetricCard from '../components/MetricCard';
import PipelineBreadcrumb from '../components/PipelineBreadcrumb';
import MultimodalGallery from '../components/MultimodalGallery';
import {
    thresholdBreaches,
    pestMonitoring,
    sensorFleet,
    zoneIntervals,
    perUnitTimeSeries,
} from '../data/mockData';

const SENSOR_TYPE_META = {
    temperature: { label: 'Temperature', labelZh: '温度', icon: 'thermostat', color: '#38bdf8', unit: '°C' },
    humidity: { label: 'Humidity', labelZh: '湿度', icon: 'water-drop', color: '#f59e0b', unit: '%' },
    soilMoisture: { label: 'Soil Moisture', labelZh: '土壤含水率', icon: 'leaf', color: '#34d399', unit: '%' },
    leafWetness: { label: 'Leaf Wetness', labelZh: '叶面湿润时长', icon: 'leaf', color: '#a78bfa', unit: 'h' },
    wind: { label: 'Wind Speed', labelZh: '风速', icon: 'wind', color: '#60a5fa', unit: 'm/s' },
    light: { label: 'Light Intensity', labelZh: '光照', icon: 'sun', color: '#fbbf24', unit: 'Lux' },
    soilPh: { label: 'Soil pH', labelZh: '土壤 pH', icon: 'activity', color: '#fb923c', unit: 'pH' },
    rainfall: { label: 'Rainfall', labelZh: '降雨量', icon: 'cloud-rain', color: '#06b6d4', unit: 'mm' },
    pestTrap: { label: 'Pest Trap', labelZh: '虫情监测', icon: 'search', color: '#f472b6', unit: 'count/day' },
    camera: { label: 'Camera', labelZh: '摄像头', icon: 'camera', color: '#818cf8', unit: '' },
    co2: { label: 'CO2 Level', labelZh: '二氧化碳', icon: 'wind', color: '#22d3ee', unit: 'ppm' },
    uvIndex: { label: 'UV Index', labelZh: '紫外指数', icon: 'sun', color: '#e879f9', unit: 'UV' },
    irrigationFlow: { label: 'Irrigation Flow', labelZh: '灌溉流量', icon: 'water-drop', color: '#2dd4bf', unit: 'L/min' },
    sporeCount: { label: 'Spore Counter', labelZh: '孢子计数', icon: 'perception', color: '#fb7185', unit: 'spores/m3' },
};

const TELEMETRY_WINDOWS = [
    { key: '6h', label: '6h', hours: 6, points: 6, axis: 'hour' },
    { key: '24h', label: '24h', hours: 24, points: 24, axis: 'hour' },
    { key: '7d', label: '7d', hours: 24 * 7, points: 28, axis: 'day' },
    { key: '30d', label: '30d', hours: 24 * 30, points: 30, axis: 'day' },
    { key: '90d', label: '90d', hours: 24 * 90, points: 36, axis: 'day' },
    { key: '180d', label: '180d', hours: 24 * 180, points: 52, axis: 'week' },
    { key: '1y', label: '1y', hours: 24 * 365, points: 52, axis: 'week' },
    { key: '2y', label: '2y', hours: 24 * 730, points: 104, axis: 'week' },
];

const statusColor = { online: '#34d399', warning: '#f59e0b', offline: '#ef4444' };

const CAMERA_STREAMS = {
    blueberry: ['/drone_rgb_field.png', '/satellite_ndvi.png', '/leaf_wetness_closeup.png'],
    flower: ['/images/iot_greenhouse.png', '/images/field_team.png', '/pest_trap_macro.png'],
};

const getWindow = (key) => TELEMETRY_WINDOWS.find(w => w.key === key) || TELEMETRY_WINDOWS[1];

const buildAxisLabel = (index, total, windowConfig) => {
    const ratio = total <= 1 ? 0 : index / (total - 1);
    if (windowConfig.axis === 'hour') return `${Math.round(ratio * windowConfig.hours)}h`;
    if (windowConfig.axis === 'day') return `D${Math.max(1, Math.round(ratio * (windowConfig.hours / 24)))}`;
    return `W${Math.max(1, Math.round(ratio * (windowConfig.hours / (24 * 7))))}`;
};

const buildScaledSeries = (rawSeries, windowKey) => {
    if (!Array.isArray(rawSeries) || rawSeries.length === 0) return [];
    const windowConfig = getWindow(windowKey);
    const values = rawSeries.map(item => Number(item.value) || 0);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const span = Math.max(maxVal - minVal, Math.max(1, Math.abs(values[values.length - 1]) * 0.06));

    return Array.from({ length: windowConfig.points }).map((_, index) => {
        const ratio = windowConfig.points <= 1 ? 0 : index / (windowConfig.points - 1);
        const sourceIndex = Math.floor(ratio * (values.length - 1));
        const base = values[sourceIndex];
        const seasonality = Math.sin((index / Math.max(windowConfig.points, 1)) * Math.PI * 4) * span * 0.08;
        const drift = (ratio - 0.5) * span * 0.05;
        const value = Math.max(0, +(base + seasonality + drift).toFixed(2));
        return {
            point: index,
            hour: buildAxisLabel(index, windowConfig.points, windowConfig),
            value,
        };
    });
};

export default function SensorTelemetry() {
    const { fields, activeFieldId } = useStore();
    const field = fields[activeFieldId];
    const fleet = sensorFleet[activeFieldId] || [];
    const pests = pestMonitoring[activeFieldId] || {};
    const unitSeries = perUnitTimeSeries[activeFieldId] || {};

    const [telemetryWindow, setTelemetryWindow] = useState('24h');
    const [selectedUnitId, setSelectedUnitId] = useState(null);
    const [cameraFrame, setCameraFrame] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCameraFrame(v => (v + 1) % 1000);
        }, 2500);
        return () => clearInterval(timer);
    }, []);

    const groupedFleet = useMemo(() => {
        const grouped = {};
        fleet.forEach(sensor => {
            if (!grouped[sensor.type]) grouped[sensor.type] = [];
            grouped[sensor.type].push(sensor);
        });
        return grouped;
    }, [fleet]);

    const scaledSeriesByUnit = useMemo(() => {
        const out = {};
        Object.entries(unitSeries).forEach(([unitId, series]) => {
            out[unitId] = buildScaledSeries(series, telemetryWindow);
        });
        return out;
    }, [unitSeries, telemetryWindow]);

    const totalOnline = fleet.filter(s => s.status === 'online').length;
    const totalWarning = fleet.filter(s => s.status === 'warning').length;
    const totalTypes = Object.keys(groupedFleet).length;

    const selectedUnit = fleet.find(item => item.id === selectedUnitId) || null;
    const selectedUnitSeries = selectedUnit ? (scaledSeriesByUnit[selectedUnit.id] || []) : [];

    const streamFrames = CAMERA_STREAMS[field?.crop] || CAMERA_STREAMS.blueberry;
    const currentCameraFrame = streamFrames[cameraFrame % streamFrames.length];

    const now = new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });

    const fmtTime = (d) => new Date(d).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });

    return (
        <div className="page">
            <PipelineBreadcrumb />

            <div className="page-header">
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Icon name="sensors" size={22} color="#38bdf8" />
                        Sensor Telemetry
                    </h1>
                    <p className="page-subtitle">Stage 2: Data Collection | {field?.name} | {now}</p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <StatusBadge status="monitoring" label={`${totalOnline} Online`} />
                    {totalWarning > 0 && <StatusBadge status="warning" label={`${totalWarning} Warning`} />}
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{fleet.length} sensors | {totalTypes} types</span>
                </div>
            </div>

            <div className="card telemetry-window-toolbar" style={{ marginBottom: 16, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon name="clock" size={14} color="#38bdf8" />
                        <span style={{ fontSize: '0.75rem', color: '#93c5fd', fontWeight: 700 }}>
                            Unified Telemetry Window
                        </span>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                            All charts synchronized from hours to 2 years
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {TELEMETRY_WINDOWS.map(option => (
                            <button
                                key={option.key}
                                className={`btn ${telemetryWindow === option.key ? 'btn-primary' : 'btn-secondary'}`}
                                style={{ padding: '5px 10px', fontSize: '0.7rem' }}
                                onClick={() => setTelemetryWindow(option.key)}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-4" style={{ marginBottom: 16 }}>
                <MetricCard label="Total Sensors" value={fleet.length} status="monitoring" subtitle={`${totalTypes} sensor types`} />
                <MetricCard label="Online" value={totalOnline} status="monitoring" subtitle={`${fleet.length ? ((totalOnline / fleet.length) * 100).toFixed(0) : 0}% uptime`} />
                <MetricCard label="Warnings" value={totalWarning} status={totalWarning > 0 ? 'warning' : 'monitoring'} subtitle="threshold alerts active" />
                <MetricCard label="Data Rate" value="288/day" subtitle={`window ${telemetryWindow.toUpperCase()} active`} />
            </div>

            {Object.entries(groupedFleet).map(([type, units]) => {
                const meta = SENSOR_TYPE_META[type] || { label: type, color: '#94a3b8', icon: 'signal', unit: '' };
                const zones = zoneIntervals[type];
                const isNonNumeric = type === 'camera';

                return (
                    <div key={type} className="card" style={{ marginBottom: 16 }}>
                        <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Icon name={meta.icon} size={18} color={meta.color} />
                            {meta.label}
                            <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 400 }}>({meta.labelZh})</span>
                            <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: '#94a3b8' }}>{units.length} unit{units.length > 1 ? 's' : ''}</span>
                        </h3>

                        <div className="grid grid-3" style={{ gap: 12 }}>
                            {units.map(unit => {
                                const series = scaledSeriesByUnit[unit.id] || [];
                                const hasChart = series.length > 0 && !isNonNumeric;
                                const isWarning = unit.status === 'warning';

                                return (
                                    <button
                                        key={unit.id}
                                        type="button"
                                        className="sensor-detail-card"
                                        onClick={() => setSelectedUnitId(unit.id)}
                                        style={{
                                            padding: 14,
                                            background: 'rgba(15,23,42,0.4)',
                                            borderRadius: 10,
                                            border: `1px solid ${isWarning ? 'rgba(245,158,11,0.3)' : 'var(--border-subtle)'}`,
                                            borderLeft: `3px solid ${statusColor[unit.status] || '#64748b'}`,
                                            textAlign: 'left',
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                            <div>
                                                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#e2e8f0', fontFamily: 'monospace' }}>{unit.id}</span>
                                                <span style={{ fontSize: '0.65rem', color: '#64748b', marginLeft: 8 }}>{unit.zone}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor[unit.status] }} />
                                                <span style={{ fontSize: '0.6rem', color: statusColor[unit.status], textTransform: 'uppercase', fontWeight: 600 }}>{unit.status}</span>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                                            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: isWarning ? '#f59e0b' : '#e2e8f0' }}>
                                                {typeof unit.value === 'number' ? unit.value : unit.value}
                                            </span>
                                            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{unit.unit || meta.unit}</span>
                                        </div>

                                        {hasChart && (
                                            <div style={{ marginBottom: 6 }}>
                                                <ResponsiveContainer width="100%" height={70}>
                                                    <AreaChart data={series}>
                                                        <defs>
                                                            <linearGradient id={`grad-${unit.id}`} x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="0%" stopColor={meta.color} stopOpacity={0.2} />
                                                                <stop offset="100%" stopColor={meta.color} stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <XAxis dataKey="hour" tick={false} axisLine={false} tickLine={false} />
                                                        <YAxis tick={{ fill: '#475569', fontSize: 8 }} axisLine={false} tickLine={false} width={30} />
                                                        <Tooltip contentStyle={{ background: '#1a2235', border: '1px solid #1e293b', borderRadius: 8, fontSize: '0.65rem' }} />
                                                        {zones?.normal && <ReferenceArea y1={zones.normal[0]} y2={zones.normal[1]} fill="#34d399" fillOpacity={0.06} />}
                                                        {zones?.risky && <ReferenceArea y1={zones.risky[0]} y2={zones.risky[1]} fill="#f59e0b" fillOpacity={0.08} />}
                                                        {zones?.riskyHigh && <ReferenceArea y1={zones.riskyHigh[0]} y2={zones.riskyHigh[1]} fill="#f59e0b" fillOpacity={0.08} />}
                                                        {zones?.critical && <ReferenceArea y1={zones.critical[0]} y2={zones.critical[1]} fill="#ef4444" fillOpacity={0.08} />}
                                                        {zones?.criticalHigh && <ReferenceArea y1={zones.criticalHigh[0]} y2={zones.criticalHigh[1]} fill="#ef4444" fillOpacity={0.08} />}
                                                        <Area type="monotone" dataKey="value" stroke={meta.color} fill={`url(#grad-${unit.id})`} strokeWidth={1.5} dot={false} />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        )}

                                        {isNonNumeric && (
                                            <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(129,140,248,0.3)' }}>
                                                <img src={currentCameraFrame} alt={`${field?.crop} stream`} style={{ width: '100%', height: 96, objectFit: 'cover', display: 'block' }} />
                                                <div style={{ padding: '6px 8px', background: 'rgba(129,140,248,0.1)', fontSize: '0.68rem', color: '#818cf8', textAlign: 'center' }}>
                                                    Live {field?.crop === 'flower' ? 'greenhouse flower' : 'blueberry'} stream | {unit.zone}
                                                </div>
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.6rem', color: '#475569' }}>
                                            {unit.battery !== null && <span><Icon name="battery" size={10} color="#64748b" /> {unit.battery}%</span>}
                                            <span>{unit.signalDb}dB</span>
                                            <span>Cal: {new Date(unit.lastCalibration).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}

            <div className="card" style={{ marginBottom: 16 }}>
                <h3 className="card-title">Threshold Breach Log | Recent Events</h3>
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

            <MultimodalGallery />

            {selectedUnit && (
                <div className="overlay-modal" onClick={() => setSelectedUnitId(null)}>
                    <div className="overlay-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <h3 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Icon name={SENSOR_TYPE_META[selectedUnit.type]?.icon || 'activity'} size={16} color={SENSOR_TYPE_META[selectedUnit.type]?.color || '#38bdf8'} />
                                Sensor Detail - {selectedUnit.id}
                            </h3>
                            <button type="button" className="icon-btn" onClick={() => setSelectedUnitId(null)}>
                                <Icon name="x" size={14} color="#94a3b8" />
                            </button>
                        </div>

                        <div className="grid grid-2" style={{ gap: 12 }}>
                            <div>
                                <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: 4 }}>Zone</div>
                                <div style={{ fontSize: '0.88rem', color: '#e2e8f0', fontWeight: 700 }}>{selectedUnit.zone}</div>
                                <div style={{ marginTop: 10, fontSize: '0.72rem', color: '#64748b' }}>Current Value</div>
                                <div style={{ fontSize: '1.6rem', color: '#e2e8f0', fontWeight: 800 }}>{selectedUnit.value} {selectedUnit.unit || SENSOR_TYPE_META[selectedUnit.type]?.unit}</div>
                                <div style={{ marginTop: 10, fontSize: '0.72rem', color: '#64748b' }}>Signal/Battery</div>
                                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{selectedUnit.signalDb}dB | {selectedUnit.battery ?? 'N/A'}%</div>
                                <div style={{ marginTop: 10, fontSize: '0.72rem', color: '#64748b' }}>Last Calibration</div>
                                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{selectedUnit.lastCalibration}</div>
                            </div>
                            <div>
                                {selectedUnit.type !== 'camera' && selectedUnitSeries.length > 0 && (
                                    <ResponsiveContainer width="100%" height={220}>
                                        <AreaChart data={selectedUnitSeries}>
                                            <defs>
                                                <linearGradient id="detail-grad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor={SENSOR_TYPE_META[selectedUnit.type]?.color || '#38bdf8'} stopOpacity={0.25} />
                                                    <stop offset="100%" stopColor={SENSOR_TYPE_META[selectedUnit.type]?.color || '#38bdf8'} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                                            <Tooltip contentStyle={{ background: '#1a2235', border: '1px solid #1e293b', borderRadius: 8, fontSize: '0.7rem' }} />
                                            <Area type="monotone" dataKey="value" stroke={SENSOR_TYPE_META[selectedUnit.type]?.color || '#38bdf8'} fill="url(#detail-grad)" strokeWidth={2} dot={false} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                                {selectedUnit.type === 'camera' && (
                                    <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(129,140,248,0.3)' }}>
                                        <img src={currentCameraFrame} alt="camera stream" style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }} />
                                        <div style={{ padding: '8px 10px', background: 'rgba(129,140,248,0.1)', color: '#818cf8', fontSize: '0.72rem' }}>
                                            Streaming {field?.crop === 'flower' ? 'greenhouse flowers' : 'blueberry canopy'} | frame {cameraFrame % streamFrames.length + 1}/{streamFrames.length}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
