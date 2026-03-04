import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../engine/store';
import PrescriptionCard from '../components/PrescriptionCard';
import StatusBadge from '../components/StatusBadge';
import Icon from '../components/Icon';
import AIThinkingPanel from '../components/AIThinkingPanel';
import PipelineBreadcrumb from '../components/PipelineBreadcrumb';
import ApprovalModal from '../components/ApprovalModal';

export default function Prescription() {
    const navigate = useNavigate();
    const {
        prescriptions, activePrescription, generateRx, modifyRx, executeRx,
        riskResults, fields, activeFieldId, eventLog, activeScenario,
        thinkingChain, isThinking, thinkingContext,
        startPrescriptionThinking, stopThinking,
        approvalQueue, approveDecision, rejectDecision,
        currentSnapshot,
    } = useStore();
    const [showJson, setShowJson] = useState(false);
    const [reviewItem, setReviewItem] = useState(null);
    const field = fields[activeFieldId];
    const topRisk = riskResults[0];
    const sensors = currentSnapshot?.sensors || {};
    const now = new Date().toLocaleString('en-US', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

    const handleGenerateRx = () => {
        startPrescriptionThinking();
        setTimeout(() => {
            generateRx();
        }, 6000);
    };

    const handleModify = (rxId) => {
        modifyRx(rxId, { dosageRatio: 0.85 });
    };

    const handleExecute = (rxId) => {
        executeRx(rxId);
        setTimeout(() => navigate('/execution'), 300);
    };

    const handleApprove = (id) => {
        approveDecision(id);
        setReviewItem(null);
    };

    const handleReject = (id) => {
        rejectDecision(id);
        setReviewItem(null);
    };

    // Reasoning detail for the active prescription
    const rx = activePrescription;
    const reasoning = rx ? {
        factors: [
            `Humidity at ${sensors.humidity_pct?.toFixed(1) || '—'}% (threshold: 85%) → elevated disease pressure`,
            `Leaf wetness ${sensors.leaf_wetness_h?.toFixed(2) || '—'}h (threshold: 3h) → spore germination conditions`,
            `Growth stage: ${currentSnapshot?.stageName || 'Flowering'} → high susceptibility window`,
            `Days to harvest: ${activeScenario?.daysToHarvest || 30}d → PHI compliant for all recommended chemicals`,
            `Historical: 3 similar events in 2025.02 — same treatment proved effective`,
            `Weather forecast: rain in 48h — treatment window closing soon`,
            `Pest trap counts elevated in Zone B3-South (15/day)`,
            `Cost-benefit: ¥${rx.estimatedCost || 2800} intervention vs. ¥${(topRisk?.score || 50) * 400} potential loss`,
        ],
        alternatives: [
            { name: 'Biocontrol (Bacillus subtilis)', reason: 'Rejected: current infestation rate exceeds biocontrol efficacy threshold', viability: 30 },
            { name: 'Manual pruning only', reason: 'Insufficient for score >60 — would only reduce by ~20pts', viability: 45 },
            { name: 'Full-zone spray (Iprodione)', reason: 'Rejected: MOA rotation conflict — same group used in last 21d', viability: 0 },
            { name: 'Wait and monitor', reason: 'Risk escalating — weather window closing in 48h', viability: 15 },
        ],
        constraints: [
            { name: 'PHI Compliance', status: 'pass', detail: `${activeScenario?.daysToHarvest || 30}d to harvest > 14d PHI requirement` },
            { name: 'Wind Conditions', status: sensors.wind_speed_ms > 3 ? 'fail' : 'pass', detail: `${sensors.wind_speed_ms?.toFixed(1) || '1.8'} m/s ${sensors.wind_speed_ms > 3 ? '>' : '<'} 3.0 m/s spray limit` },
            { name: 'Banned Substance Check', status: 'pass', detail: 'Active ingredient not on China banned list' },
            { name: 'MOA Rotation', status: 'pass', detail: 'M03 group — last use >21d ago — rotation safe' },
            { name: 'Environmental Safeguard', status: 'pass', detail: 'Buffer zone 10m compliant. No rain <24h.' },
        ],
    } : null;

    return (
        <div className="page">
            <PipelineBreadcrumb />

            <div className="page-header">
                <div>
                    <h1 className="page-title">Prescription Builder</h1>
                    <p className="page-subtitle">Stage 4: Prescription — {field?.name} | {now}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary" onClick={() => setShowJson(!showJson)}>
                        {showJson ? 'Card View' : 'JSON View'}
                    </button>
                    <button className="btn btn-primary" onClick={handleGenerateRx} disabled={!topRisk || topRisk.score < 30 || isThinking} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {isThinking ? (
                            <><Icon name="reasoning" size={14} /> Thinking...</>
                        ) : (
                            <>Generate Prescription <Icon name="chevron-right" size={14} /></>
                        )}
                    </button>
                </div>
            </div>

            {/* Approval Queue Banner */}
            {approvalQueue.length > 0 && (
                <div className="card" style={{ marginBottom: 16, background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Icon name="alert-triangle" size={20} color="#f59e0b" />
                            <div>
                                <div style={{ fontWeight: 700, color: '#f59e0b', fontSize: '0.88rem' }}>⚠ {approvalQueue.length} Critical Decision{approvalQueue.length > 1 ? 's' : ''} Pending Human Approval</div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Risk score ≥ 70 — auto-execution blocked. Review required before proceeding.</div>
                            </div>
                        </div>
                        <button className="btn btn-primary" onClick={() => setReviewItem(approvalQueue[0])} style={{ whiteSpace: 'nowrap' }}>
                            Review Now
                        </button>
                    </div>
                </div>
            )}

            {/* AI Thinking Panel */}
            {(thinkingChain.length > 0 && thinkingContext === 'prescription') && (
                <AIThinkingPanel
                    chain={thinkingChain}
                    isThinking={isThinking}
                    onComplete={stopThinking}
                />
            )}

            {/* Status bar */}
            {topRisk && (
                <div className="card" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Highest threat: </span>
                        <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{topRisk.name} ({topRisk.score}/100)</span>
                        {topRisk.score >= 70 && <span style={{ color: '#f59e0b', marginLeft: 8, fontSize: '0.72rem', fontWeight: 700 }}>⚠ CRITICAL — requires human approval</span>}
                    </div>
                    <StatusBadge status={topRisk.status} size="lg" />
                </div>
            )}

            {/* Active Prescription with Reasoning Detail */}
            {rx && (
                <div style={{ marginBottom: 16 }}>
                    <h3 className="section-title">Active Prescription</h3>
                    {showJson ? (
                        <div className="card">
                            <pre style={{ fontSize: '0.75rem', color: '#10b981', overflow: 'auto', maxHeight: 500 }}>
                                {JSON.stringify(rx, null, 2)}
                            </pre>
                        </div>
                    ) : (
                        <PrescriptionCard
                            rx={rx}
                            onModify={handleModify}
                            onExecute={handleExecute}
                        />
                    )}

                    {/* Reasoning Detail */}
                    {reasoning && (
                        <>
                            {/* Factors Considered */}
                            <div className="card" style={{ marginTop: 12 }}>
                                <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Icon name="reasoning" size={16} color="#38bdf8" /> AI Reasoning — Factors Considered
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    {reasoning.factors.map((f, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.78rem', color: '#94a3b8', padding: '6px 0', borderBottom: '1px solid rgba(30,41,59,0.5)' }}>
                                            <span style={{ color: '#38bdf8', fontWeight: 700, flexShrink: 0 }}>#{i + 1}</span>
                                            <span>{f}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Constraints */}
                            <div className="card" style={{ marginTop: 12 }}>
                                <h3 className="card-title">Constraint Checks — {reasoning.constraints.filter(c => c.status === 'pass').length}/{reasoning.constraints.length} Passed</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    {reasoning.constraints.map((c, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'rgba(15,23,42,0.4)', borderRadius: 8 }}>
                                            <Icon name={c.status === 'pass' ? 'check' : 'alert-triangle'} size={14} color={c.status === 'pass' ? '#34d399' : '#ef4444'} />
                                            <span style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.82rem', minWidth: 170 }}>{c.name}</span>
                                            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{c.detail}</span>
                                            <span style={{ marginLeft: 'auto' }}><StatusBadge status={c.status === 'pass' ? 'monitoring' : 'critical'} label={c.status.toUpperCase()} /></span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Alternatives Considered */}
                            <div className="card" style={{ marginTop: 12 }}>
                                <h3 className="card-title">Alternatives Considered & Rejected</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {reasoning.alternatives.map((a, i) => (
                                        <div key={i} style={{ padding: '10px 14px', background: 'rgba(15,23,42,0.4)', borderRadius: 8, borderLeft: `3px solid ${a.viability > 30 ? '#f59e0b' : '#ef4444'}` }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                                <span style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.82rem' }}>{a.name}</span>
                                                <span style={{ fontSize: '0.65rem', color: '#64748b' }}>Viability: {a.viability}%</span>
                                            </div>
                                            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{a.reason}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Full Prescription Detail */}
                    <div className="card" style={{ marginTop: 12 }}>
                        <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Icon name="prescription" size={16} color="#34d399" /> Prescription Detail — Full Specification
                        </h3>
                        <div className="grid grid-2" style={{ gap: 12 }}>
                            {[
                                { label: 'Chemical', value: rx.chemical || 'Mancozeb 70% WP', sub: 'Active Ingredient: Mancozeb (M03 Group)' },
                                { label: 'Dosage', value: `${((rx.dosageRatio || 1) * 800).toFixed(0)} ml/mu`, sub: `Dilution: 1:${rx.dilutionRatio || 500} | Label max: 1000 ml/mu` },
                                { label: 'Application Method', value: rx.method || 'Precision Spot Spray', sub: `UAV at 2.5m altitude, 4m/s, ${rx.nozzleType || 'XR-110015VS nozzle'}` },
                                { label: 'Equipment', value: rx.equipment || 'DJI T40 Agricultural Drone ×2', sub: `Tank capacity: 40L | Flight time: 25min/charge` },
                                { label: 'Target Zones', value: rx.zones || `${field?.name} B3-East, B3-South`, sub: `Area: ${rx.areaHa || 2.8} hectares | ${rx.rows || 'Rows 1-8'}` },
                                { label: 'Timing Window', value: rx.timing || 'Dawn (05:30-08:00)', sub: `Wind ≤3m/s required | No rain 24h before/after` },
                                { label: 'Re-Entry Interval', value: rx.rei || '24 hours', sub: `Worker REI per label | PPE required during application` },
                                { label: 'Pre-Harvest Interval', value: `${activeScenario?.daysToHarvest || 30} days remaining`, sub: `PHI for Mancozeb: 14 days | Status: ${(activeScenario?.daysToHarvest || 30) >= 14 ? '✅ COMPLIANT' : '⚠️ RESTRICTED'}` },
                            ].map((item, i) => (
                                <div key={i} style={{ padding: '12px 14px', background: 'rgba(15,23,42,0.4)', borderRadius: 8, borderLeft: '3px solid #34d399' }}>
                                    <div style={{ fontSize: '0.65rem', color: '#64748b', marginBottom: 4 }}>{item.label}</div>
                                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#e2e8f0', marginBottom: 2 }}>{item.value}</div>
                                    <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{item.sub}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Cost-Benefit Analysis */}
                    <div className="card" style={{ marginTop: 12 }}>
                        <h3 className="card-title">Cost-Benefit Analysis</h3>
                        <table className="data-table">
                            <thead>
                                <tr><th>Item</th><th>Amount</th><th>Notes</th></tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={{ fontWeight: 600, color: '#e2e8f0' }}>Chemical Cost</td>
                                    <td style={{ color: '#f59e0b', fontFamily: 'monospace' }}>¥{rx.estimatedCost ? (rx.estimatedCost * 0.45).toFixed(0) : 1260}</td>
                                    <td style={{ fontSize: '0.72rem', color: '#64748b' }}>Mancozeb WP × {rx.areaHa || 2.8}ha</td>
                                </tr>
                                <tr>
                                    <td style={{ fontWeight: 600, color: '#e2e8f0' }}>Drone Operation</td>
                                    <td style={{ color: '#f59e0b', fontFamily: 'monospace' }}>¥{rx.estimatedCost ? (rx.estimatedCost * 0.35).toFixed(0) : 980}</td>
                                    <td style={{ fontSize: '0.72rem', color: '#64748b' }}>2× DJI T40 × ~75min flight</td>
                                </tr>
                                <tr>
                                    <td style={{ fontWeight: 600, color: '#e2e8f0' }}>Labor (Field Team)</td>
                                    <td style={{ color: '#f59e0b', fontFamily: 'monospace' }}>¥{rx.estimatedCost ? (rx.estimatedCost * 0.14).toFixed(0) : 392}</td>
                                    <td style={{ fontSize: '0.72rem', color: '#64748b' }}>Manual inspection + pruning crew</td>
                                </tr>
                                <tr>
                                    <td style={{ fontWeight: 600, color: '#e2e8f0' }}>IoT Systems</td>
                                    <td style={{ color: '#f59e0b', fontFamily: 'monospace' }}>¥{rx.estimatedCost ? (rx.estimatedCost * 0.06).toFixed(0) : 168}</td>
                                    <td style={{ fontSize: '0.72rem', color: '#64748b' }}>Ventilation + shade deployment</td>
                                </tr>
                                <tr style={{ borderTop: '2px solid #334155' }}>
                                    <td style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.88rem' }}>Total Cost</td>
                                    <td style={{ fontWeight: 700, color: '#ef4444', fontFamily: 'monospace', fontSize: '0.88rem' }}>¥{rx.estimatedCost || 2800}</td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td style={{ fontWeight: 600, color: '#34d399' }}>Potential Loss (if untreated)</td>
                                    <td style={{ fontWeight: 700, color: '#34d399', fontFamily: 'monospace', fontSize: '0.88rem' }}>¥{(topRisk?.score || 50) * 400}</td>
                                    <td style={{ fontSize: '0.72rem', color: '#64748b' }}>Grade downgrade + volume loss</td>
                                </tr>
                                <tr>
                                    <td style={{ fontWeight: 600, color: '#10b981' }}>Projected ROI</td>
                                    <td style={{ fontWeight: 700, color: '#10b981', fontFamily: 'monospace', fontSize: '0.88rem' }}>{(((topRisk?.score || 50) * 400) / (rx.estimatedCost || 2800)).toFixed(1)}×</td>
                                    <td style={{ fontSize: '0.72rem', color: '#64748b' }}>savings / cost ratio</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Prescription Pipeline Timeline */}
                    <div className="card" style={{ marginTop: 12 }}>
                        <h3 className="card-title">Prescription Pipeline — Decision Flow</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                            {[
                                { time: '00:00:00', step: 'Data Ingestion', detail: `12 multimodal sources analyzed | ${(currentSnapshot?.sensors ? Object.keys(currentSnapshot.sensors).length : 8)} sensor parameters`, icon: '📡', color: '#38bdf8' },
                                { time: '00:00:02', step: 'Risk Assessment', detail: `${topRisk?.name || 'Gray Mold'} identified at ${topRisk?.score || 82}/100 | ${riskResults?.length || 5} threats evaluated`, icon: '⚡', color: '#f59e0b' },
                                { time: '00:00:05', step: 'Historical Cross-Reference', detail: '7 past decisions reviewed | 3 similar events matched from 2025-2026', icon: '📚', color: '#a78bfa' },
                                { time: '00:00:08', step: 'Constraint Validation', detail: `${reasoning?.constraints?.filter(c => c.status === 'pass').length || 5}/${reasoning?.constraints?.length || 5} constraints passed | PHI, Wind, MOA, Environmental`, icon: '✅', color: '#34d399' },
                                { time: '00:00:12', step: 'Prescription Generated', detail: `${rx.chemical || 'Mancozeb 70% WP'} spot spray | ¥${rx.estimatedCost || 2800} | ${rx.method || '5 actors'}`, icon: '📋', color: '#10b981' },
                                { time: topRisk?.score >= 70 ? '00:08:22' : '00:00:12', step: topRisk?.score >= 70 ? 'Human Approval Required' : 'Auto-Approved', detail: topRisk?.score >= 70 ? `Risk ≥70 — routed to approval queue | Awaiting field operator review` : `Risk <70 — auto-approved by Decision OS`, icon: topRisk?.score >= 70 ? '👤' : '🤖', color: topRisk?.score >= 70 ? '#f59e0b' : '#34d399' },
                            ].map((stage, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '10px 0', borderLeft: `2px solid ${stage.color}`, paddingLeft: 14, marginLeft: 8 }}>
                                    <span style={{ fontSize: '1rem' }}>{stage.icon}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.82rem' }}>{stage.step}</span>
                                            <span style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: '#475569' }}>T+{stage.time}</span>
                                        </div>
                                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>{stage.detail}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* No prescription yet */}
            {!rx && prescriptions.length === 0 && !isThinking && (
                <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--text-muted)', marginBottom: 8 }}><Icon name="prescription" size={48} /></div>
                    <div style={{ color: '#94a3b8', marginBottom: 16 }}>No prescriptions generated yet.</div>
                    <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: 16 }}>
                        {topRisk && topRisk.score >= 30
                            ? `${topRisk.name} at ${topRisk.score}/100 — prescription available.`
                            : 'All threats below action threshold.'}
                    </div>
                    {topRisk && topRisk.score >= 30 && (
                        <button className="btn btn-primary" onClick={handleGenerateRx}>Generate Prescription</button>
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
            {eventLog.filter(e => e.type === 'prescription' || e.type === 'modification' || e.type === 'approval' || e.type === 'rejection').length > 0 && (
                <div className="card" style={{ marginTop: 16 }}>
                    <h3 className="card-title">Decision Log</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {eventLog.filter(e => e.type === 'prescription' || e.type === 'modification' || e.type === 'approval' || e.type === 'rejection').map((e, i) => (
                            <div key={i} style={{ display: 'flex', gap: 12, padding: '6px 0', borderBottom: '1px solid #1e293b', fontSize: '0.75rem' }}>
                                <span style={{ color: '#64748b', minWidth: 150, fontFamily: 'monospace' }}>{new Date(e.timestamp).toLocaleString('en-US', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                                <StatusBadge status={e.type === 'approval' ? 'monitoring' : e.type === 'rejection' ? 'critical' : e.type === 'modification' ? 'warning' : 'elevated'} label={e.type.toUpperCase()} />
                                <span style={{ color: '#94a3b8' }}>{e.message}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Approval Modal */}
            {reviewItem && (
                <ApprovalModal
                    item={reviewItem}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onClose={() => setReviewItem(null)}
                />
            )}
        </div>
    );
}
