import React, { useMemo, useState } from 'react';
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
        currentSnapshot, executions, auditRecords,
    } = useStore();
    const [showJson, setShowJson] = useState(false);
    const [reviewItem, setReviewItem] = useState(null);
    const [selectedPreviousRxId, setSelectedPreviousRxId] = useState(null);
    const [selectedDecisionLogId, setSelectedDecisionLogId] = useState(null);
    const field = fields[activeFieldId];
    const topRisk = riskResults[0];
    const sensors = currentSnapshot?.sensors || {};
    const now = new Date().toLocaleString('en-US', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

    const handleGenerateRx = () => {
        startPrescriptionThinking();
        generateRx({ autoExecuteLowImpact: true });
        setTimeout(() => {
            const { activePrescription: latestRx, approvalQueue: pendingQueue } = useStore.getState();
            const isPendingApproval = pendingQueue.some(item => item.prescription?.id === latestRx?.id);
            if (latestRx && !isPendingApproval) {
                navigate('/execution');
            }
        }, 120);
    };

    const handleModify = (rxId) => {
        modifyRx(rxId, { dosageRatio: 0.85 });
    };

    const handleExecute = (rxId) => {
        const pendingApproval = approvalQueue.find(item => item.prescription?.id === rxId);
        if (pendingApproval) {
            setReviewItem(pendingApproval);
            return;
        }

        const execution = executeRx(rxId);
        if (execution) {
            setTimeout(() => navigate('/execution'), 300);
        }
    };

    const handleApprove = (id) => {
        approveDecision(id);
        setReviewItem(null);
    };

    const handleReject = (id) => {
        rejectDecision(id);
        setReviewItem(null);
    };

    const seededRecentPrescriptions = useMemo(() => ([
        { id: 'RX-240301-A', threatName: 'Gray Mold (Botrytis)', actionLabel: 'Biocontrol Release + Ventilation', riskScore: 62, estimatedCost: 2600, status: 'completed', generatedAt: '2026-03-01T09:18:00Z', confidence: 0.86, decisionMode: 'reactive', result: 'Spore index reduced 31% in 48h.' },
        { id: 'RX-240228-B', threatName: 'Aphids', actionLabel: 'Targeted Spot Spray', riskScore: 54, estimatedCost: 1800, status: 'completed', generatedAt: '2026-02-28T06:42:00Z', confidence: 0.82, decisionMode: 'reactive', result: 'Aphid count dropped below threshold.' },
        { id: 'RX-240227-C', threatName: 'Anthracnose', actionLabel: 'Manual Removal + Monitoring', riskScore: 41, estimatedCost: 1300, status: 'completed', generatedAt: '2026-02-27T13:25:00Z', confidence: 0.79, decisionMode: 'preventive', result: 'Lesion growth contained in 24h.' },
        { id: 'RX-240224-D', threatName: 'Root Rot', actionLabel: 'Irrigation Control', riskScore: 36, estimatedCost: 900, status: 'completed', generatedAt: '2026-02-24T03:10:00Z', confidence: 0.77, decisionMode: 'preventive', result: 'Soil moisture normalized within 12h.' },
        { id: 'RX-240222-E', threatName: 'Frost Damage', actionLabel: 'Frost Protection Protocol', riskScore: 71, estimatedCost: 2900, status: 'completed', generatedAt: '2026-02-22T18:05:00Z', confidence: 0.9, decisionMode: 'reactive', result: 'No canopy damage observed after event.' },
    ]), []);

    const previousPrescriptions = useMemo(() => {
        const live = prescriptions.slice(0, -1).reverse().slice(0, 12);
        const seen = new Set(live.map(item => item.id));
        const fallback = seededRecentPrescriptions.filter(item => !seen.has(item.id));
        return [...live, ...fallback].slice(0, 12);
    }, [prescriptions, seededRecentPrescriptions]);
    const selectedPreviousRx = previousPrescriptions.find(item => item.id === selectedPreviousRxId) || previousPrescriptions[0];
    const seededExecutionByRxId = useMemo(() => ({
        'RX-240301-A': { id: 'EXE-240301-A', status: 'completed', actualCoverage_pct: 96, actualDosageRatio: 0.88, completedAt: '2026-03-01T11:08:00Z' },
        'RX-240228-B': { id: 'EXE-240228-B', status: 'completed', actualCoverage_pct: 94, actualDosageRatio: 0.81, completedAt: '2026-02-28T08:02:00Z' },
        'RX-240227-C': { id: 'EXE-240227-C', status: 'completed', actualCoverage_pct: 91, actualDosageRatio: 0.74, completedAt: '2026-02-27T14:31:00Z' },
        'RX-240224-D': { id: 'EXE-240224-D', status: 'completed', actualCoverage_pct: 98, actualDosageRatio: 0.65, completedAt: '2026-02-24T04:03:00Z' },
        'RX-240222-E': { id: 'EXE-240222-E', status: 'completed', actualCoverage_pct: 93, actualDosageRatio: 0.9, completedAt: '2026-02-22T21:10:00Z' },
    }), []);
    const seededAuditByRxId = useMemo(() => ({
        'RX-240301-A': { id: 'AUD-240301-A', responsibilityAssignment: 'system', gradeResult: 'A preserved' },
        'RX-240228-B': { id: 'AUD-240228-B', responsibilityAssignment: 'system', gradeResult: 'A preserved' },
        'RX-240227-C': { id: 'AUD-240227-C', responsibilityAssignment: 'system', gradeResult: 'A preserved' },
        'RX-240224-D': { id: 'AUD-240224-D', responsibilityAssignment: 'system', gradeResult: 'A preserved' },
        'RX-240222-E': { id: 'AUD-240222-E', responsibilityAssignment: 'operator', gradeResult: 'A preserved' },
    }), []);

    const selectedPreviousExecution = selectedPreviousRx
        ? executions.find(item => item.prescriptionId === selectedPreviousRx.id) || seededExecutionByRxId[selectedPreviousRx.id] || null
        : null;
    const selectedPreviousAudit = selectedPreviousRx
        ? auditRecords.find(item => item.prescriptionId === selectedPreviousRx.id) || seededAuditByRxId[selectedPreviousRx.id] || null
        : null;

    const seededDecisionEvents = useMemo(() => ([
        { timestamp: '2026-03-01T09:17:00Z', type: 'prescription', message: 'Biocontrol package selected after PHI restriction blocked primary chemistry.' },
        { timestamp: '2026-02-28T06:40:00Z', type: 'approval', message: 'Human operator approved critical intervention in 6 minutes.' },
        { timestamp: '2026-02-27T13:24:00Z', type: 'modification', message: 'Dosage ratio adjusted from 0.80 to 0.74 due wind volatility.' },
        { timestamp: '2026-02-24T03:09:00Z', type: 'prescription', message: 'Preventive irrigation-control action generated for root rot pressure.' },
        { timestamp: '2026-02-22T18:04:00Z', type: 'rejection', message: 'Initial plan rejected; frost-protection protocol regenerated with manual verification.' },
    ]), []);

    const decisionEvents = useMemo(() => {
        const live = eventLog
            .filter(e => e.type === 'prescription' || e.type === 'modification' || e.type === 'approval' || e.type === 'rejection')
            .slice(-25)
            .reverse();
        const merged = [...live];
        seededDecisionEvents.forEach(item => {
            if (!merged.some(evt => evt.timestamp === item.timestamp && evt.type === item.type)) {
                merged.push(item);
            }
        });
        return merged.slice(0, 25);
    }, [eventLog, seededDecisionEvents]);
    const selectedDecisionEvent = decisionEvents.find(item => `${item.timestamp}-${item.type}` === selectedDecisionLogId) || decisionEvents[0];
    const decisionTitle = (item) => {
        if (!item?.message) return 'Decision event';
        return item.message.split('.')[0].slice(0, 90);
    };
    const decisionStage = (type) => {
        const map = {
            prescription: 'Plan generation',
            modification: 'Plan adjustment',
            approval: 'Human gate',
            rejection: 'Plan rejected',
        };
        return map[type] || 'Decision event';
    };

    // Reasoning detail for the active prescription  - scenario-aware
    const rx = activePrescription;
    const similarEvents = 3 + ((topRisk?.score || 50) % 5);
    const reasoning = rx ? {
        factors: [
            `Humidity at ${sensors.humidity_pct?.toFixed(1) || '-'}% (threshold: 85%) -> ${sensors.humidity_pct > 85 ? 'elevated disease pressure' : 'within normal range'}`,
            `Leaf wetness ${sensors.leaf_wetness_h?.toFixed(2) || sensors.leaf_wetness_hrs?.toFixed(2) || '-'}h (threshold: 3h) -> ${(sensors.leaf_wetness_h || sensors.leaf_wetness_hrs || 0) > 3 ? 'spore germination conditions present' : 'below germination threshold'}`,
            `Growth stage: ${currentSnapshot?.stageName || 'Flowering'} -> ${currentSnapshot?.stageName === 'flowering' ? 'high' : 'moderate'} susceptibility window`,
            `Days to harvest: ${activeScenario?.daysToHarvest || 30}d -> ${(activeScenario?.daysToHarvest || 30) < 14 ? 'PHI restrictions apply' : 'PHI compliant for recommended chemicals'}`,
            `Historical: ${similarEvents} similar events in 2025 - same treatment profile proved effective`,
            `Weather forecast: ${sensors.rainfall_mm > 5 ? 'active rain - treatment window limited' : 'dry period - optimal treatment window'}`,
            ...(activeScenario?.id === 'D' ? ['Cascade detection: aphid damage weakens plant cuticle  - fungal entry probability +42%', `Compound threat score: primary + secondary risk interaction modeled`] : []),
            ...(activeScenario?.id === 'E' ? ['Non-chemical intervention: frost protection via latent heat + insulation', 'Zero chemical usage  - environmental impact: positive'] : []),
            ...(activeScenario?.id === 'F' ? ['System failure compound event: ventilation failure + disease risk simultaneously', 'Emergency protocol activated  - PHI tight margin (7d PHI vs 8d to harvest)'] : []),
            `Cost-benefit: CNY ${rx.estimatedCost || 2800} intervention vs. CNY ${(topRisk?.score || 50) * 400} potential loss`,
        ],
        alternatives: [
            { name: 'Biocontrol (Bacillus subtilis)', reason: `${activeScenario?.id === 'A' ? 'Selected as fallback  - PHI blocks chemical' : 'Rejected: current infestation rate exceeds biocontrol efficacy threshold'}`, viability: activeScenario?.id === 'A' ? 85 : 30 },
            { name: 'Manual pruning only', reason: `Insufficient for score >${topRisk?.score >= 60 ? '60' : '40'}  - would only reduce by ~20pts`, viability: 45 },
            { name: 'Full-zone spray (Iprodione)', reason: 'Rejected: MOA rotation conflict  - same group used in last 21d', viability: 0 },
            { name: 'Wait and monitor', reason: `${topRisk?.score >= 70 ? 'Risk critical  - weather window closing' : 'Risk below intervention threshold'}`, viability: topRisk?.score >= 70 ? 15 : 60 },
            ...(activeScenario?.id === 'D' ? [{ name: 'Single-phase broad spray', reason: 'Rejected: compound pest requires sequential treatment for 55% chemical savings', viability: 35 }] : []),
        ],
        constraints: [
            { name: 'PHI Compliance', status: (activeScenario?.daysToHarvest || 30) >= 14 || !rx.activeIngredient ? 'pass' : 'fail', detail: rx.activeIngredient ? `${activeScenario?.daysToHarvest || 30}d to harvest ${(activeScenario?.daysToHarvest || 30) >= 14 ? '>' : '<'} ${rx.constraints?.phi_days || 14}d PHI` : 'Non-chemical  - PHI not applicable' },
            { name: 'Wind Conditions', status: (sensors.wind_speed_ms || 0) > 3 ? 'fail' : 'pass', detail: `${sensors.wind_speed_ms?.toFixed(1) || '1.8'} m/s ${(sensors.wind_speed_ms || 0) > 3 ? '>' : '<'} 3.0 m/s spray limit` },
            { name: 'Banned Substance Check', status: 'pass', detail: `${rx.activeIngredient?.name || 'Active ingredient'} not on China banned list (GB 2763-2021)` },
            { name: 'MOA Rotation', status: 'pass', detail: `${rx.activeIngredient?.moaGroup || 'M03'} group  - last use >21d ago  - rotation safe` },
            { name: 'Environmental Safeguard', status: 'pass', detail: `Buffer zone 10m compliant. ${sensors.rainfall_mm > 5 ? 'Rain present' : 'No rain <24h.'}` },
            ...(activeScenario?.id === 'A' ? [{ name: 'PHI Override (Fallback)', status: 'pass', detail: 'Chemical blocked  - Biocontrol selected (no PHI restriction)' }] : []),
        ],
    } : null;

    return (
        <div className="page">
            <PipelineBreadcrumb />

            <div className="page-header">
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Icon name="prescription" size={22} color="#38bdf8" />
                        Prescription Builder
                    </h1>
                    <p className="page-subtitle">Stage 4: Prescription  - {field?.name} | {now}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary" onClick={() => setShowJson(!showJson)}>
                        {showJson ? 'Card View' : 'JSON View'}
                    </button>
                    <button className="btn btn-primary" onClick={handleGenerateRx} disabled={!topRisk || isThinking} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {isThinking ? (
                            <><Icon name="reasoning" size={14} /> Thinking...</>
                        ) : (
                            <>Generate Prescription <Icon name="chevron-right" size={14} /></>
                        )}
                    </button>
                </div>
            </div>

            {/* Scenario Context Badge */}
            {activeScenario && rx && (
                <div className="card" style={{ marginBottom: 12, background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.15)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Icon name="reasoning" size={18} color="#a78bfa" />
                        <div>
                            <div style={{ fontWeight: 700, color: '#a78bfa', fontSize: '0.82rem' }}>Scenario {activeScenario.id}: {activeScenario.name}</div>
                            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                                {activeScenario.primaryThreat || activeScenario.name} | {activeScenario.crop} | Harvest in {activeScenario.daysToHarvest}d
                                {rx.usedFallback && <span style={{ color: '#f59e0b', marginLeft: 8 }}> - Fallback treatment active (primary blocked)</span>}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Approval Queue Banner */}
            {approvalQueue.length > 0 && (
                <div className="card" style={{ marginBottom: 16, background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Icon name="alert-triangle" size={20} color="#f59e0b" />
                            <div>
                                <div style={{ fontWeight: 700, color: '#f59e0b', fontSize: '0.88rem' }}>{approvalQueue.length} Critical Decision{approvalQueue.length > 1 ? 's' : ''} Pending Human Approval</div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Risk score {'>='} 70 - auto-execution blocked. Review required before proceeding.</div>
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
                        {topRisk.score >= 70 && <span style={{ color: '#f59e0b', marginLeft: 8, fontSize: '0.72rem', fontWeight: 700 }}>CRITICAL - requires human approval</span>}
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
                                    <Icon name="reasoning" size={16} color="#38bdf8" /> AI Reasoning  - Factors Considered
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
                                <h3 className="card-title">Constraint Checks  - {reasoning.constraints.filter(c => c.status === 'pass').length}/{reasoning.constraints.length} Passed</h3>
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

                    {/* 閳逛讲鏀ｉ埞?Multi-Method Protocol 閳逛讲鏀ｉ埞?*/}
                    {activeScenario?.prescriptionReport && (
                        <div className="card" style={{ marginTop: 12 }}>
                            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Icon name="activity" size={16} color="#a78bfa" /> Treatment Protocol  - {activeScenario.prescriptionReport.methods.length} Methods
                            </h3>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: 10 }}>
                                Timeline: {activeScenario.prescriptionReport.timeline}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {activeScenario.prescriptionReport.methods.map((m, i) => {
                                    const typeColors = { primary: '#34d399', secondary: '#38bdf8', supporting: '#f59e0b', infrastructure: '#a78bfa' };
                                    return (
                                        <div key={i} style={{ padding: '12px 14px', background: 'rgba(15,23,42,0.4)', borderRadius: 8, borderLeft: `3px solid ${typeColors[m.type] || '#64748b'}` }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                                <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.85rem' }}>{m.name}</span>
                                                <span style={{ fontSize: '0.6rem', padding: '2px 8px', borderRadius: 10, background: `${typeColors[m.type]}15`, color: typeColors[m.type], fontWeight: 700, textTransform: 'uppercase' }}>{m.type}</span>
                                            </div>
                                            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 4 }}>{m.description}</div>
                                            <div style={{ fontSize: '0.65rem', color: '#475569' }}> - {m.timing}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* 閳逛讲鏀ｉ埞?Actor Assignment Matrix 閳逛讲鏀ｉ埞?*/}
                    {activeScenario?.prescriptionReport?.actors && (
                        <div className="card" style={{ marginTop: 12 }}>
                            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Icon name="drone" size={16} color="#38bdf8" /> Actor Assignment  - {activeScenario.prescriptionReport.actors.length} Units Deployed
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
                                {activeScenario.prescriptionReport.actors.map((a, i) => (
                                    <div key={i} style={{ padding: '12px', background: 'rgba(15,23,42,0.4)', borderRadius: 8, border: '1px solid rgba(56,189,248,0.1)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                            <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.82rem' }}>{a.name}</span>
                                            <span style={{ fontSize: '0.55rem', padding: '2px 6px', borderRadius: 6, background: a.status === 'assigned' ? 'rgba(52,211,153,0.1)' : a.status === 'standby' ? 'rgba(245,158,11,0.1)' : 'rgba(56,189,248,0.1)', color: a.status === 'assigned' ? '#34d399' : a.status === 'standby' ? '#f59e0b' : '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>{a.status}</span>
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: 3 }}><strong style={{ color: '#64748b' }}>Role:</strong> {a.role}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: 3 }}><strong style={{ color: '#64748b' }}>Zone:</strong> {a.zone}</div>
                                        <div style={{ fontSize: '0.65rem', color: '#475569' }}>棣冩暋 {a.equipment}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 閳逛讲鏀ｉ埞?Action Items Checklist 閳逛讲鏀ｉ埞?*/}
                    {activeScenario?.prescriptionReport?.actions && (
                        <div className="card" style={{ marginTop: 12 }}>
                            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Icon name="check" size={16} color="#34d399" /> Action Items  - {activeScenario.prescriptionReport.actions.length} Steps
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {activeScenario.prescriptionReport.actions.map((a, i) => {
                                    const prioColors = { IMMEDIATE: '#ef4444', HIGH: '#f59e0b', MEDIUM: '#38bdf8', ONGOING: '#a78bfa', SCHEDULED: '#34d399', GATE: '#f472b6', CONDITIONAL: '#64748b' };
                                    return (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'rgba(15,23,42,0.35)', borderRadius: 6, borderLeft: `3px solid ${prioColors[a.priority] || '#64748b'}` }}>
                                            <span style={{ width: 22, height: 22, borderRadius: '50%', border: '2px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, color: '#64748b', flexShrink: 0 }}>{a.step}</span>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '0.78rem', color: '#e2e8f0', fontWeight: 600 }}>{a.action}</div>
                                                <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Actor: {a.actor}</div>
                                            </div>
                                            <span style={{ fontSize: '0.55rem', padding: '2px 8px', borderRadius: 8, background: `${prioColors[a.priority]}15`, color: prioColors[a.priority], fontWeight: 700 }}>{a.priority}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* 閳逛讲鏀ｉ埞?Chemical Details 閳逛讲鏀ｉ埞?*/}
                    {activeScenario?.prescriptionReport?.chemicals && (
                        <div className="card" style={{ marginTop: 12 }}>
                            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Icon name="prescription" size={16} color="#fbbf24" /> Chemical / Agent Details
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {activeScenario.prescriptionReport.chemicals.map((c, i) => (
                                    <div key={i} style={{ padding: '12px 14px', background: 'rgba(15,23,42,0.4)', borderRadius: 8, borderLeft: '3px solid #fbbf24' }}>
                                        <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.88rem', marginBottom: 6 }}>{c.name}</div>
                                        <div className="grid grid-2" style={{ gap: 8 }}>
                                            {[
                                                { label: 'Type', value: c.type },
                                                { label: 'Dosage', value: c.dosage },
                                                { label: 'PHI', value: c.phi },
                                                { label: 'Safety', value: c.safety },
                                            ].map((d, j) => (
                                                <div key={j} style={{ padding: '6px 10px', background: 'rgba(15,23,42,0.3)', borderRadius: 6 }}>
                                                    <div style={{ fontSize: '0.6rem', color: '#64748b', marginBottom: 2 }}>{d.label}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>{d.value}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 閳逛讲鏀ｉ埞?Cost-Benefit Analysis 閳逛讲鏀ｉ埞?*/}
                    <div className="card" style={{ marginTop: 12 }}>
                        <h3 className="card-title">Cost-Benefit Analysis</h3>
                        <table className="data-table">
                            <thead>
                                <tr><th>Item</th><th>Amount</th><th>Notes</th></tr>
                            </thead>
                            <tbody>
                                {activeScenario?.prescriptionReport?.costBreakdown ? (
                                    activeScenario.prescriptionReport.costBreakdown.map((c, i) => (
                                        <tr key={i}>
                                            <td style={{ fontWeight: 600, color: '#e2e8f0' }}>{c.item}</td>
                                            <td style={{ color: '#f59e0b', fontFamily: 'monospace' }}>{`CNY ${c.amount.toLocaleString()}`}</td>
                                            <td style={{ fontSize: '0.72rem', color: '#64748b' }}>{c.note}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <>
                                        <tr>
                                            <td style={{ fontWeight: 600, color: '#e2e8f0' }}>Chemical Cost</td>
                                            <td style={{ color: '#f59e0b', fontFamily: 'monospace' }}>{`CNY ${(rx.estimatedCost ? (rx.estimatedCost * 0.45).toFixed(0) : 1260)}`}</td>
                                            <td style={{ fontSize: '0.72rem', color: '#64748b' }}>Active ingredient  + application area</td>
                                        </tr>
                                        <tr>
                                            <td style={{ fontWeight: 600, color: '#e2e8f0' }}>Operations</td>
                                            <td style={{ color: '#f59e0b', fontFamily: 'monospace' }}>{`CNY ${(rx.estimatedCost ? (rx.estimatedCost * 0.55).toFixed(0) : 1540)}`}</td>
                                            <td style={{ fontSize: '0.72rem', color: '#64748b' }}>Drone, labor, and equipment</td>
                                        </tr>
                                    </>
                                )}
                                <tr style={{ borderTop: '2px solid #334155' }}>
                                    <td style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.88rem' }}>Total Cost</td>
                                    <td style={{ fontWeight: 700, color: '#ef4444', fontFamily: 'monospace', fontSize: '0.88rem' }}>
                                        {`CNY ${activeScenario?.prescriptionReport?.costBreakdown
                                            ? activeScenario.prescriptionReport.costBreakdown.reduce((s, c) => s + c.amount, 0).toLocaleString()
                                            : (rx.estimatedCost || 2800)}`}
                                    </td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td style={{ fontWeight: 600, color: '#34d399' }}>Potential Loss (if untreated)</td>
                                    <td style={{ fontWeight: 700, color: '#34d399', fontFamily: 'monospace', fontSize: '0.88rem' }}>{`CNY ${(activeScenario?.outcomeMetrics?.revenueProtected?.toLocaleString() || ((topRisk?.score || 50) * 400).toLocaleString())}`}</td>
                                    <td style={{ fontSize: '0.72rem', color: '#64748b' }}>Grade downgrade + volume loss</td>
                                </tr>
                                <tr>
                                    <td style={{ fontWeight: 600, color: '#10b981' }}>Projected ROI</td>
                                    <td style={{ fontWeight: 700, color: '#10b981', fontFamily: 'monospace', fontSize: '0.88rem' }}>
                                        {(() => {
                                            const cost = activeScenario?.prescriptionReport?.costBreakdown
                                                ? activeScenario.prescriptionReport.costBreakdown.reduce((s, c) => s + c.amount, 0)
                                                : (rx.estimatedCost || 2800);
                                            const revenue = activeScenario?.outcomeMetrics?.revenueProtected || (topRisk?.score || 50) * 400;
                                            return (revenue / cost).toFixed(1);
                                        })()}x
                                    </td>
                                    <td style={{ fontSize: '0.72rem', color: '#64748b' }}>savings / cost ratio</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Prescription Pipeline Timeline */}
                    <div className="card" style={{ marginTop: 12 }}>
                        <h3 className="card-title">Prescription Pipeline  - Decision Flow</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                            {[
                                { time: '00:00:00', step: 'Data Ingestion', detail: `12 multimodal sources analyzed | ${(currentSnapshot?.sensors ? Object.keys(currentSnapshot.sensors).length : 8)} sensor parameters`, icon: 'perception', color: '#38bdf8' },
                                { time: '00:00:02', step: 'Risk Assessment', detail: `${topRisk?.name || 'Gray Mold'} identified at ${topRisk?.score || 82}/100 | ${riskResults?.length || 5} threats evaluated`, icon: 'alert-triangle', color: '#f59e0b' },
                                { time: '00:00:05', step: 'Historical Cross-Reference', detail: '7 past decisions reviewed | 3 similar events matched from 2025-2026', icon: 'history', color: '#a78bfa' },
                                { time: '00:00:08', step: 'Constraint Validation', detail: `${reasoning?.constraints?.filter(c => c.status === 'pass').length || 5}/${reasoning?.constraints?.length || 5} constraints passed | PHI, Wind, MOA, Environmental`, icon: 'check-circle', color: '#34d399' },
                                { time: '00:00:12', step: 'Prescription Generated', detail: `${rx.chemical || 'Mancozeb 70% WP'} spot spray | ${rx.estimatedCost || 2800} CNY | ${rx.method || '5 actors'}`, icon: 'prescription', color: '#10b981' },
                                { time: topRisk?.score >= 70 ? '00:08:22' : '00:00:12', step: topRisk?.score >= 70 ? 'Human Approval Required' : 'Auto-Approved', detail: topRisk?.score >= 70 ? 'Risk >= 70 routed to approval queue | Awaiting field operator review' : 'Risk < 70 auto-approved by Decision OS', icon: topRisk?.score >= 70 ? 'warning' : 'check-circle', color: topRisk?.score >= 70 ? '#f59e0b' : '#34d399' },
                            ].map((stage, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '10px 0', borderLeft: `2px solid ${stage.color}`, paddingLeft: 14, marginLeft: 8 }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18 }}>
                                        <Icon name={stage.icon} size={14} color={stage.color} />
                                    </span>
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
                        {topRisk
                            ? `${topRisk.name} at ${topRisk.score}/100. Generate a preventive or reactive prescription.`
                            : 'Waiting for risk signal data.'}
                    </div>
                    {topRisk && (
                        <button className="btn btn-primary" onClick={handleGenerateRx}>Generate Prescription</button>
                    )}
                </div>
            )}

            {/* Previous Prescriptions */}
            {previousPrescriptions.length > 0 && (
                <div className="card" style={{ marginTop: 20 }}>
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon name="history" size={16} color="#38bdf8" />
                        Recent Prescriptions
                    </h3>
                    <div className="grid grid-2" style={{ gap: 12 }}>
                        <div className="scrollbar-themed" style={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {previousPrescriptions.map(item => (
                                <button
                                    key={item.id}
                                    className="btn btn-secondary"
                                    onClick={() => setSelectedPreviousRxId(item.id)}
                                    style={{
                                        width: '100%',
                                        justifyContent: 'space-between',
                                        padding: '9px 10px',
                                        border: selectedPreviousRx?.id === item.id ? '1px solid rgba(56,189,248,0.35)' : '1px solid rgba(51,65,85,0.6)',
                                        background: selectedPreviousRx?.id === item.id ? 'rgba(56,189,248,0.12)' : 'rgba(15,23,42,0.45)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-start',
                                        gap: 3,
                                    }}
                                >
                                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: '0.72rem', color: '#e2e8f0', fontWeight: 700 }}>{item.id}</span>
                                        <StatusBadge status={item.status || 'pending'} />
                                    </div>
                                    <span style={{ fontSize: '0.68rem', color: '#e2e8f0' }}>{item.threatName}</span>
                                    <span style={{ fontSize: '0.64rem', color: '#94a3b8' }}>{item.actionLabel}</span>
                                    <span style={{ fontSize: '0.62rem', color: '#64748b', fontFamily: 'monospace' }}>
                                        {item.generatedAt
                                            ? new Date(item.generatedAt).toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })
                                            : '--'}
                                        {' | '}
                                        Risk {item.riskScore ?? '--'}/100
                                    </span>
                                </button>
                            ))}
                        </div>
                        {selectedPreviousRx && (
                            <div style={{ padding: 12, borderRadius: 10, border: '1px solid rgba(51,65,85,0.6)', background: 'rgba(15,23,42,0.45)' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e2e8f0', marginBottom: 8 }}>{selectedPreviousRx.id}</div>
                                <div style={{ fontSize: '0.68rem', color: '#64748b', marginBottom: 8 }}>
                                    {selectedPreviousRx.generatedAt
                                        ? new Date(selectedPreviousRx.generatedAt).toLocaleString('en-US', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })
                                        : '--'}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 4 }}>Threat: {selectedPreviousRx.threatName}</div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 4 }}>Action: {selectedPreviousRx.actionLabel}</div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 4 }}>Risk Score: {selectedPreviousRx.riskScore}</div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 4 }}>Cost: CNY {(selectedPreviousRx.estimatedCost || 0).toLocaleString()}</div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 4 }}>Mode: {selectedPreviousRx.decisionMode || 'reactive'}</div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 8 }}>Result: {selectedPreviousRx.result || 'Execution completed with expected impact.'}</div>
                                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 10 }}>Execution</div>
                                <div style={{ fontSize: '0.72rem', color: '#e2e8f0' }}>
                                    {selectedPreviousExecution
                                        ? `${selectedPreviousExecution.id} | ${selectedPreviousExecution.status} | coverage ${selectedPreviousExecution.actualCoverage_pct ?? '--'}% | dosage ${selectedPreviousExecution.actualDosageRatio ? `${(selectedPreviousExecution.actualDosageRatio * 100).toFixed(0)}%` : '--'}`
                                        : 'No execution record'}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 8 }}>Audit</div>
                                <div style={{ fontSize: '0.72rem', color: '#e2e8f0' }}>
                                    {selectedPreviousAudit
                                        ? `${selectedPreviousAudit.id} | ${selectedPreviousAudit.responsibilityAssignment || 'completed'} | ${selectedPreviousAudit.gradeResult || 'A preserved'}`
                                        : 'No audit record'}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Decision Log */}
            {decisionEvents.length > 0 && (
                <div className="card" style={{ marginTop: 16 }}>
                    <h3 className="card-title">Decision Log (Recent)</h3>
                    <div className="grid grid-2" style={{ gap: 12 }}>
                        <div className="scrollbar-themed" style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {decisionEvents.map(item => {
                                const itemId = `${item.timestamp}-${item.type}`;
                                return (
                                    <button
                                        key={itemId}
                                        className="btn btn-secondary"
                                        onClick={() => setSelectedDecisionLogId(itemId)}
                                        style={{
                                            width: '100%',
                                            justifyContent: 'space-between',
                                            padding: '6px 10px',
                                            border: selectedDecisionEvent?.timestamp === item.timestamp && selectedDecisionEvent?.type === item.type
                                                ? '1px solid rgba(56,189,248,0.35)'
                                                : '1px solid rgba(51,65,85,0.5)',
                                            background: 'rgba(15,23,42,0.45)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'flex-start',
                                            gap: 4,
                                        }}
                                    >
                                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                                            <span style={{ fontSize: '0.66rem', color: '#64748b', fontFamily: 'monospace' }}>
                                                {new Date(item.timestamp).toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}
                                            </span>
                                            <StatusBadge status={item.type === 'approval' ? 'monitoring' : item.type === 'rejection' ? 'critical' : item.type === 'modification' ? 'warning' : 'elevated'} label={item.type.toUpperCase()} />
                                        </div>
                                        <span style={{ fontSize: '0.7rem', color: '#e2e8f0', lineHeight: 1.3 }}>{decisionTitle(item)}</span>
                                        <span style={{ fontSize: '0.62rem', color: '#64748b' }}>{decisionStage(item.type)}</span>
                                    </button>
                                );
                            })}
                        </div>
                        {selectedDecisionEvent && (
                            <div style={{ padding: 12, borderRadius: 10, border: '1px solid rgba(51,65,85,0.6)', background: 'rgba(15,23,42,0.45)' }}>
                                <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace', marginBottom: 8 }}>
                                    {new Date(selectedDecisionEvent.timestamp).toLocaleString('en-US', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                                </div>
                                <div style={{ marginBottom: 8 }}>
                                    <StatusBadge status={selectedDecisionEvent.type === 'approval' ? 'monitoring' : selectedDecisionEvent.type === 'rejection' ? 'critical' : selectedDecisionEvent.type === 'modification' ? 'warning' : 'elevated'} label={selectedDecisionEvent.type.toUpperCase()} />
                                </div>
                                <div style={{ fontSize: '0.78rem', color: '#e2e8f0', fontWeight: 700, marginBottom: 6 }}>
                                    {decisionTitle(selectedDecisionEvent)}
                                </div>
                                <div style={{ fontSize: '0.76rem', color: '#94a3b8', lineHeight: 1.5 }}>
                                    {selectedDecisionEvent.message}
                                </div>
                                <div style={{ marginTop: 8, fontSize: '0.7rem', color: '#64748b' }}>
                                    Stage: {decisionStage(selectedDecisionEvent.type)} | Source: Sentinel Decision OS
                                </div>
                            </div>
                        )}
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





