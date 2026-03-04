import React, { useState } from 'react';
import useStore from '../engine/store';
import thresholds from '../data/thresholds';
import { bannedPesticides, phiConstraints } from '../data/constraints';
import StatusBadge from '../components/StatusBadge';
import Icon from '../components/Icon';
import PipelineBreadcrumb from '../components/PipelineBreadcrumb';

export default function Admin() {
    const { fields, activeFieldId } = useStore();
    const field = fields[activeFieldId];

    // Local threshold state for editing
    const [localThresholds, setLocalThresholds] = useState({ ...thresholds });
    const [saved, setSaved] = useState(false);

    const updateThreshold = (category, key, value) => {
        setLocalThresholds(prev => ({
            ...prev,
            [category]: { ...prev[category], [key]: parseFloat(value) || value },
        }));
        setSaved(false);
    };

    const handleSave = () => {
        // In a real system, this would persist. Here we just confirm.
        Object.assign(thresholds, localThresholds);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="page">
            <PipelineBreadcrumb />
            <div className="page-header">
                <div>
                    <h1 className="page-title">Admin & Configuration</h1>
                    <p className="page-subtitle">System thresholds, constraints, and parameters</p>
                </div>
                <button className="btn btn-primary" onClick={handleSave} style={saved ? { display: 'flex', alignItems: 'center', gap: 6 } : {}}>
                    {saved ? <><Icon name="check" size={14} /> Saved</> : 'Save Configuration'}
                </button>
            </div>

            {/* Threshold Editor */}
            <div className="grid grid-2">
                {/* Botrytis */}
                <div className="card">
                    <h3 className="card-title">Gray Mold (Botrytis) Thresholds</h3>
                    <div className="config-grid">
                        <label>Humidity (%)</label>
                        <input type="number" className="config-input" value={localThresholds.botrytis.humidity_pct} onChange={e => updateThreshold('botrytis', 'humidity_pct', e.target.value)} />
                        <label>Leaf Wetness (hrs)</label>
                        <input type="number" className="config-input" value={localThresholds.botrytis.leaf_wetness_hrs} onChange={e => updateThreshold('botrytis', 'leaf_wetness_hrs', e.target.value)} />
                        <label>Overcast Days</label>
                        <input type="number" className="config-input" value={localThresholds.botrytis.overcast_days} onChange={e => updateThreshold('botrytis', 'overcast_days', e.target.value)} />
                        <label>Spore Index Critical</label>
                        <input type="number" className="config-input" value={localThresholds.botrytis.spore_index_critical} onChange={e => updateThreshold('botrytis', 'spore_index_critical', e.target.value)} />
                    </div>
                </div>

                {/* Aphids */}
                <div className="card">
                    <h3 className="card-title">Aphid Thresholds</h3>
                    <div className="config-grid">
                        <label>Per Leaf</label>
                        <input type="number" className="config-input" value={localThresholds.aphids.per_leaf} onChange={e => updateThreshold('aphids', 'per_leaf', e.target.value)} />
                        <label>Sticky Trap Daily</label>
                        <input type="number" className="config-input" value={localThresholds.aphids.sticky_trap_daily} onChange={e => updateThreshold('aphids', 'sticky_trap_daily', e.target.value)} />
                    </div>
                </div>

                {/* Spider Mites */}
                <div className="card">
                    <h3 className="card-title">Spider Mite Thresholds</h3>
                    <div className="config-grid">
                        <label>Mite Density</label>
                        <input type="number" className="config-input" value={localThresholds.spider_mites.mite_density} onChange={e => updateThreshold('spider_mites', 'mite_density', e.target.value)} />
                        <label>Temp Min (°C)</label>
                        <input type="number" className="config-input" value={localThresholds.spider_mites.temp_min} onChange={e => updateThreshold('spider_mites', 'temp_min', e.target.value)} />
                    </div>
                </div>

                {/* Environment */}
                <div className="card">
                    <h3 className="card-title">Environmental Alerts</h3>
                    <div className="config-grid">
                        <label>Temp High (°C)</label>
                        <input type="number" className="config-input" value={localThresholds.environment.temp_high} onChange={e => updateThreshold('environment', 'temp_high', e.target.value)} />
                        <label>Temp Low (°C)</label>
                        <input type="number" className="config-input" value={localThresholds.environment.temp_low} onChange={e => updateThreshold('environment', 'temp_low', e.target.value)} />
                        <label>Wind Spray Limit (m/s)</label>
                        <input type="number" className="config-input" value={localThresholds.environment.wind_spray_limit} onChange={e => updateThreshold('environment', 'wind_spray_limit', e.target.value)} step="0.1" />
                    </div>
                </div>
            </div>

            {/* PHI Constraints Table */}
            <div className="card" style={{ marginTop: 16 }}>
                <h3 className="card-title">Pre-Harvest Interval (PHI) Constraints</h3>
                <table className="data-table">
                    <thead><tr><th>Pesticide</th><th>PHI (days)</th><th>MoA Group</th></tr></thead>
                    <tbody>
                        {Object.values(phiConstraints).map(p => (
                            <tr key={p.name}><td>{p.name}</td><td style={{ fontFamily: 'monospace' }}>{p.days}d</td><td>{p.moaGroup}</td></tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Banned Pesticides */}
            <div className="card" style={{ marginTop: 16 }}>
                <h3 className="card-title">Banned / Restricted Pesticides (China)</h3>
                <table className="data-table">
                    <thead><tr><th>Substance</th><th>Reason</th><th>Status</th></tr></thead>
                    <tbody>
                        {bannedPesticides.map(p => (
                            <tr key={p.name}><td>{p.name}</td><td style={{ fontSize: '0.75rem' }}>{p.reason}</td><td><StatusBadge status="fail" label="BANNED" /></td></tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* System Info */}
            <div className="card" style={{ marginTop: 16 }}>
                <h3 className="card-title">System Information</h3>
                <table className="data-table">
                    <tbody>
                        <tr><td style={{ color: '#94a3b8' }}>Engine Version</td><td>Sentinel Engine v4.2</td></tr>
                        <tr><td style={{ color: '#94a3b8' }}>Build</td><td>2026.03 (Prototype)</td></tr>
                        <tr><td style={{ color: '#94a3b8' }}>Active Field</td><td>{field?.name} ({field?.nameZh})</td></tr>
                        <tr><td style={{ color: '#94a3b8' }}>Crop</td><td>{field?.crop}</td></tr>
                        <tr><td style={{ color: '#94a3b8' }}>Area</td><td>{field?.area_mu} mu</td></tr>
                        <tr><td style={{ color: '#94a3b8' }}>Mode</td><td>Demo / Simulation</td></tr>
                        <tr><td style={{ color: '#94a3b8' }}>Data Source</td><td>Synthetic (60-day lifecycle)</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
