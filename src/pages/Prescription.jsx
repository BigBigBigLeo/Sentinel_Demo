import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../engine/store';
import PrescriptionCard from '../components/PrescriptionCard';
import StatusBadge from '../components/StatusBadge';
import Icon from '../components/Icon';

export default function Prescription() {
    const navigate = useNavigate();
    const { prescriptions, activePrescription, generateRx, modifyRx, executeRx, riskResults, fields, activeFieldId, eventLog } = useStore();
    const [showJson, setShowJson] = useState(false);
    const field = fields[activeFieldId];
    const topRisk = riskResults[0];

    const handleModify = (rxId) => {
        modifyRx(rxId, { dosageRatio: 0.85 });
    };

    const handleExecute = (rxId) => {
        executeRx(rxId);
        setTimeout(() => navigate('/execution'), 300);
    };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Prescription Builder</h1>
                    <p className="page-subtitle">Stage 3: Prescription — {field?.name}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary" onClick={() => setShowJson(!showJson)}>
                        {showJson ? 'Card View' : 'JSON View'}
                    </button>
                    <button className="btn btn-primary" onClick={generateRx} disabled={!topRisk || topRisk.score < 30} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        Generate Prescription <Icon name="chevron-right" size={14} />
                    </button>
                </div>
            </div>

            {/* Status bar */}
            {topRisk && (
                <div className="card" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Highest threat: </span>
                        <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{topRisk.name} ({topRisk.score}/100)</span>
                    </div>
                    <StatusBadge status={topRisk.status} size="lg" />
                </div>
            )}

            {/* Active Prescription */}
            {activePrescription && (
                <div style={{ marginBottom: 16 }}>
                    <h3 className="section-title">Active Prescription</h3>
                    {showJson ? (
                        <div className="card">
                            <pre style={{ fontSize: '0.75rem', color: '#10b981', overflow: 'auto', maxHeight: 500 }}>
                                {JSON.stringify(activePrescription, null, 2)}
                            </pre>
                        </div>
                    ) : (
                        <PrescriptionCard
                            rx={activePrescription}
                            onModify={handleModify}
                            onExecute={handleExecute}
                        />
                    )}
                </div>
            )}

            {/* No prescription yet */}
            {!activePrescription && prescriptions.length === 0 && (
                <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--text-muted)', marginBottom: 8 }}><Icon name="prescription" size={48} /></div>
                    <div style={{ color: '#94a3b8', marginBottom: 16 }}>No prescriptions generated yet.</div>
                    <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: 16 }}>
                        {topRisk && topRisk.score >= 30
                            ? `${topRisk.name} at ${topRisk.score}/100 — prescription available.`
                            : 'All threats below action threshold.'}
                    </div>
                    {topRisk && topRisk.score >= 30 && (
                        <button className="btn btn-primary" onClick={generateRx}>Generate Prescription</button>
                    )}
                </div>
            )}

            {/* Previous Prescriptions */}
            {prescriptions.length > 1 && (
                <div style={{ marginTop: 24 }}>
                    <h3 className="section-title">Previous Prescriptions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {prescriptions.slice(0, -1).reverse().map(rx => (
                            <PrescriptionCard key={rx.id} rx={rx} compact />
                        ))}
                    </div>
                </div>
            )}

            {/* Decision Log */}
            {eventLog.filter(e => e.type === 'prescription' || e.type === 'modification').length > 0 && (
                <div className="card" style={{ marginTop: 16 }}>
                    <h3 className="card-title">Prescription Log</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {eventLog.filter(e => e.type === 'prescription' || e.type === 'modification').map((e, i) => (
                            <div key={i} style={{ display: 'flex', gap: 12, padding: '6px 0', borderBottom: '1px solid #1e293b', fontSize: '0.75rem' }}>
                                <span style={{ color: '#64748b', minWidth: 60 }}>{new Date(e.timestamp).toLocaleTimeString()}</span>
                                <StatusBadge status={e.type === 'modification' ? 'warning' : 'monitoring'} label={e.type.toUpperCase()} />
                                <span style={{ color: '#94a3b8' }}>{e.message}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
