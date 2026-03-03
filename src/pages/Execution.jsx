import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import useStore from '../engine/store';
import StatusBadge from '../components/StatusBadge';
import ExecutionFingerprint from '../components/ExecutionFingerprint';
import Icon from '../components/Icon';

export default function Execution() {
    const { activeExecution, executions } = useStore();
    const ex = activeExecution;

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Execution Monitor</h1>
                    <p className="page-subtitle">Stage 4: Execution{ex ? ` — ${ex.id}` : ''}</p>
                </div>
                {ex && <StatusBadge status={ex.status} size="lg" />}
            </div>

            {!ex && (
                <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--text-muted)', marginBottom: 8 }}><Icon name="play" size={48} /></div>
                    <div style={{ color: '#94a3b8' }}>No active execution. Generate and execute a prescription first.</div>
                </div>
            )}

            {ex && (
                <>
                    {/* Progress Steps */}
                    <div className="card" style={{ marginBottom: 16 }}>
                        <h3 className="card-title">Execution Progress</h3>
                        <div className="execution-steps">
                            {ex.steps.map((step, i) => (
                                <div key={step.id} className={`exec-step exec-step-${step.status}`}>
                                    <div className="exec-step-indicator">
                                        <div className={`exec-dot ${step.status}`}>
                                            {step.status === 'completed' ? <Icon name="check" size={12} /> : step.status === 'failed' ? <Icon name="x" size={12} /> : step.status === 'skipped' ? '—' : <Icon name="circle" size={8} />}
                                        </div>
                                        {i < ex.steps.length - 1 && <div className={`exec-line ${step.status}`} />}
                                    </div>
                                    <div className="exec-step-content">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.85rem' }}>{step.label}</span>
                                            <StatusBadge status={step.status} />
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>{step.detail}</div>
                                        {step.time && <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 2 }}>{new Date(step.time).toLocaleString()}</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Fingerprint + Flight Path in 2-col */}
                    <div className="grid grid-2">
                        {/* Fingerprint */}
                        <ExecutionFingerprint fingerprint={ex.executionFingerprint} deviations={ex.deviations} />

                        {/* Dosage Comparison */}
                        <div className="card">
                            <h3 className="card-title">Dosage Comparison</h3>
                            <ResponsiveContainer width="100%" height={180}>
                                <BarChart data={[
                                    { name: 'Sentinel', dosage: ex.actualDosageRatio * 100, fill: '#3dabf5' },
                                    { name: 'Traditional', dosage: 100, fill: '#64748b' },
                                ]}>
                                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#1e293b' }} />
                                    <YAxis domain={[0, 130]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#1e293b' }} label={{ value: '% of label', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }} />
                                    <Tooltip contentStyle={{ background: '#1a2235', border: '1px solid #1e293b', borderRadius: 8, color: '#e2e8f0' }} />
                                    <Bar dataKey="dosage" radius={[6, 6, 0, 0]}>
                                        <Cell fill="#3dabf5" />
                                        <Cell fill="#64748b" />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '8px 0' }}>
                                <span style={{ color: '#94a3b8' }}>Chemical savings</span>
                                <span style={{ color: '#10b981', fontWeight: 600 }}>{ex.dosageComparison?.savings_pct || 0}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Drone Flight Path */}
                    {ex.flightPath && (
                        <div className="card" style={{ marginTop: 16 }}>
                            <h3 className="card-title">Drone Flight Path — Coverage {ex.actualCoverage_pct}%</h3>
                            <div style={{ position: 'relative', height: 200, background: '#0a0e1a', borderRadius: 8, overflow: 'hidden' }}>
                                <svg width="100%" height="100%" viewBox="0 0 120 100">
                                    {/* Grid */}
                                    {Array.from({ length: 9 }).map((_, i) => (
                                        <line key={`h${i}`} x1="0" y1={i * 12} x2="120" y2={i * 12} stroke="#1e293b" strokeWidth="0.3" />
                                    ))}
                                    {Array.from({ length: 9 }).map((_, i) => (
                                        <line key={`v${i}`} x1={i * 15} y1="0" x2={i * 15} y2="100" stroke="#1e293b" strokeWidth="0.3" />
                                    ))}
                                    {/* Flight path */}
                                    <polyline
                                        points={ex.flightPath.map(p => `${p.x},${p.y}`).join(' ')}
                                        fill="none" stroke="#3dabf5" strokeWidth="0.8" opacity="0.5"
                                    />
                                    {/* Spray points */}
                                    {ex.flightPath.filter((_, i) => i % 3 === 0).map((p, i) => (
                                        <circle key={i} cx={p.x} cy={p.y} r="1.5" fill="#3dabf5" opacity="0.7" />
                                    ))}
                                    {/* Drone current (last point) */}
                                    <circle cx={ex.flightPath[ex.flightPath.length - 1].x} cy={ex.flightPath[ex.flightPath.length - 1].y} r="3" fill="#10b981" />
                                </svg>
                            </div>
                        </div>
                    )}

                    {/* Execution Details */}
                    <div className="card" style={{ marginTop: 16 }}>
                        <h3 className="card-title">Execution Details</h3>
                        <table className="data-table">
                            <tbody>
                                <tr><td style={{ color: '#94a3b8' }}>Execution ID</td><td>{ex.id}</td></tr>
                                <tr><td style={{ color: '#94a3b8' }}>Prescription</td><td>{ex.prescriptionId}</td></tr>
                                <tr><td style={{ color: '#94a3b8' }}>Method</td><td>{ex.method}</td></tr>
                                <tr><td style={{ color: '#94a3b8' }}>Dosage (actual)</td><td>{(ex.actualDosageRatio * 100).toFixed(0)}% of label</td></tr>
                                <tr><td style={{ color: '#94a3b8' }}>Coverage</td><td>{ex.actualCoverage_pct}%</td></tr>
                                <tr><td style={{ color: '#94a3b8' }}>Operator</td><td>{ex.operatorId}</td></tr>
                                <tr><td style={{ color: '#94a3b8' }}>Start</td><td>{ex.startTime ? new Date(ex.startTime).toLocaleString() : '—'}</td></tr>
                                <tr><td style={{ color: '#94a3b8' }}>End</td><td>{ex.endTime ? new Date(ex.endTime).toLocaleString() : '—'}</td></tr>
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* Previous Executions */}
            {executions.length > 1 && (
                <div className="card" style={{ marginTop: 16 }}>
                    <h3 className="card-title">Execution History</h3>
                    <table className="data-table">
                        <thead><tr><th>ID</th><th>Rx</th><th>Method</th><th>Dosage</th><th>Fingerprint</th><th>Status</th></tr></thead>
                        <tbody>
                            {executions.slice(0, -1).reverse().map(e => (
                                <tr key={e.id}>
                                    <td>{e.id}</td>
                                    <td>{e.prescriptionId}</td>
                                    <td>{e.method}</td>
                                    <td>{(e.actualDosageRatio * 100).toFixed(0)}%</td>
                                    <td><StatusBadge status={e.executionFingerprint.match ? 'match' : 'mismatch'} /></td>
                                    <td><StatusBadge status={e.status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
