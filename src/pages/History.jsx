import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import useStore from '../engine/store';
import StatusBadge from '../components/StatusBadge';
import MetricCard from '../components/MetricCard';
import Icon from '../components/Icon';

export default function History() {
    const { prescriptions, executions, auditRecords, eventLog, fields, activeFieldId } = useStore();
    const field = fields[activeFieldId];

    // Calculate cumulative economics
    const totalProtected = auditRecords.reduce((s, a) => s + a.economicImpact.revenueProtected, 0);
    const totalCost = auditRecords.reduce((s, a) => s + a.economicImpact.costOfAction, 0);
    const overallRoi = totalCost > 0 ? (totalProtected / totalCost).toFixed(1) : 0;
    const decisionDensity = field?.area_mu ? (prescriptions.length / field.area_mu * 12).toFixed(1) : 0;

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">History & Performance</h1>
                    <p className="page-subtitle">{field?.name} — Cumulative Decision Log</p>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-4">
                <MetricCard label="Total Decisions" value={prescriptions.length} icon="box" />
                <MetricCard label="Revenue Protected" value={`¥${(totalProtected / 1000).toFixed(1)}k`} status="low" icon="dollar" />
                <MetricCard label="Total Cost" value={`¥${(totalCost / 1000).toFixed(1)}k`} icon="dollar" />
                <MetricCard label="Overall ROI" value={`${overallRoi}x`} status={overallRoi > 5 ? 'low' : 'monitoring'} icon="trending-up" />
            </div>

            {/* Decision Density */}
            <div className="card" style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="card-title">Decision Density</h3>
                    <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#3dabf5' }}>{decisionDensity} decisions/ha/cycle</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 4 }}>
                    Higher decision density indicates more precise, targeted interventions versus broadcast approaches.
                </div>
            </div>

            {/* Decision Timeline */}
            <div className="card" style={{ marginTop: 16 }}>
                <h3 className="card-title">Decision Timeline</h3>
                {prescriptions.length === 0 ? (
                    <div style={{ color: '#64748b', padding: 20, textAlign: 'center' }}>No decisions recorded yet.</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                        {prescriptions.map((rx, i) => {
                            const execution = executions.find(e => e.prescriptionId === rx.id);
                            const audit = auditRecords.find(a => a.prescriptionId === rx.id);
                            return (
                                <div key={rx.id} className="timeline-entry">
                                    <div className="timeline-dot-wrapper">
                                        <div className={`timeline-dot ${rx.status === 'failed' ? 'dot-fail' : 'dot-ok'}`} />
                                        {i < prescriptions.length - 1 && <div className="timeline-line" />}
                                    </div>
                                    <div className="timeline-content">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.85rem' }}>{rx.id}: {rx.threatName}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{rx.actionLabel} | {rx.target}</div>
                                            </div>
                                            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                                <StatusBadge status={rx.status} />
                                                {rx.usedFallback && <StatusBadge status="warning" label="FALLBACK" />}
                                            </div>
                                        </div>
                                        {execution && (
                                            <div style={{ marginTop: 6, fontSize: '0.75rem', color: '#94a3b8' }}>
                                                Execution: {execution.id} |
                                                Dosage: {(execution.actualDosageRatio * 100).toFixed(0)}% |
                                                Fingerprint: <StatusBadge status={execution.executionFingerprint.match ? 'match' : 'mismatch'} />
                                            </div>
                                        )}
                                        {audit && (
                                            <div style={{ marginTop: 4, fontSize: '0.75rem', color: '#10b981' }}>
                                                Audit: {audit.id} | Revenue protected: ¥{audit.economicImpact.revenueProtected.toLocaleString()} | ROI: {audit.economicImpact.roi}x
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Full Event Log */}
            <div className="card" style={{ marginTop: 16 }}>
                <h3 className="card-title">System Event Log</h3>
                <div style={{ maxHeight: 300, overflow: 'auto' }}>
                    {eventLog.length === 0 ? (
                        <div style={{ color: '#64748b', padding: 20, textAlign: 'center' }}>No events recorded.</div>
                    ) : (
                        <table className="data-table">
                            <thead><tr><th>Time</th><th>Type</th><th>Message</th></tr></thead>
                            <tbody>
                                {[...eventLog].reverse().map((e, i) => (
                                    <tr key={i}>
                                        <td style={{ fontSize: '0.7rem', whiteSpace: 'nowrap' }}>{new Date(e.timestamp).toLocaleTimeString()}</td>
                                        <td><StatusBadge status={e.type === 'deviation' ? 'critical' : e.type === 'audit' ? 'pass' : 'monitoring'} label={e.type} /></td>
                                        <td style={{ fontSize: '0.75rem' }}>{e.message}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
