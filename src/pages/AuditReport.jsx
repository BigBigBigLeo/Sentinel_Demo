import React, { useState, useEffect } from 'react';
import useStore from '../engine/store';
import StatusBadge from '../components/StatusBadge';
import MetricCard from '../components/MetricCard';
import Icon from '../components/Icon';
import MLFeedbackPanel from '../components/MLFeedbackPanel';
import PipelineBreadcrumb from '../components/PipelineBreadcrumb';
import { getComplianceSummary } from '../engine/auditEngine';
import { executionRecords, historicalDecisions, sensorFleet } from '../data/mockData';

const PRE_AUDIT_CHECKS = [
    { id: 'phi', name: 'Pre-Harvest Interval (PHI)', detail: 'Mancozeb 14d PHI vs. 30d to harvest', status: 'pass', standard: 'GB/T 8321' },
    { id: 'banned', name: 'Banned Substance Check', detail: 'Active ingredient not on China banned list', status: 'pass', standard: 'China MoA List' },
    { id: 'dose', name: 'Dosage Accuracy', detail: '850ml/mu applied vs. 900ml/mu recommended (94.4%)', status: 'pass', standard: 'Label Rate' },
    { id: 'wind', name: 'Wind Condition at Spray Time', detail: '1.8 m/s < 3.0 m/s limit — spray compliant', status: 'pass', standard: 'GB/T 17980' },
    { id: 'buffer', name: 'Buffer Zone Compliance', detail: '10m buffer maintained from water bodies', status: 'pass', standard: 'Environmental Protection' },
    { id: 'moa', name: 'MOA Rotation', detail: 'M03 group — last use >21d ago — rotation safe', status: 'pass', standard: 'Resistance Mgmt' },
    { id: 'confidence', name: 'Confidence Gate (≥75%)', detail: 'Model confidence 87.2% ≥ 75% threshold after 3 rounds', status: 'pass', standard: 'AI Decision Policy' },
];

// Auto-generated report sections with timestamps
const REPORT_SECTIONS = [
    {
        id: 'ingestion', title: '1. Data Ingestion Summary', icon: 'perception',
        timestamp: '2026-03-04T00:45:12+08:00',
        content: [
            { label: 'Sensor Data Points', value: '24 sensors × 288 readings/day = 6,912 data points' },
            { label: 'Multimodal Imagery', value: '6 captures (RGB, NDVI, Thermal, Satellite, Hyperspectral, Leaf Wetness)' },
            { label: 'Weather Feed', value: '48h forecast ingested from 3 sources' },
            { label: 'Historical Reference', value: '7 past decisions, 3 execution records cross-referenced' },
            { label: 'Pest Monitoring', value: '3 trap stations reporting, 35 counts/day aggregate' },
        ],
    },
    {
        id: 'risk', title: '2. Risk Assessment Record', icon: 'alert-triangle',
        timestamp: '2026-03-04T00:45:14+08:00',
        content: [
            { label: 'Threats Evaluated', value: '5 threats across 2 fields' },
            { label: 'Highest Risk', value: 'Gray Mold (Botrytis) — 82/100 CRITICAL' },
            { label: 'Evidence Sources', value: '12 multimodal data sources analyzed' },
            { label: 'Decision Type', value: 'Critical — routed to human approval queue' },
            { label: 'Revenue at Risk', value: '¥36,800 potential loss if untreated' },
        ],
    },
    {
        id: 'prescription', title: '3. Prescription Record', icon: 'prescription',
        timestamp: '2026-03-04T00:45:16+08:00',
        content: [
            { label: 'Rx ID', value: 'RX-20260304-001' },
            { label: 'Action', value: 'Spot Spray — Mancozeb 70% WP (85% dosage)' },
            { label: 'Target', value: 'Gray Mold (Botrytis), Zones B3-East/West' },
            { label: 'Alternatives Considered', value: '4 (Biocontrol, Manual, Iprodione, Wait)' },
            { label: 'Constraints Passed', value: '7/7 (PHI, Wind, Banned, MOA, Buffer, Dose, Confidence)' },
        ],
    },
    {
        id: 'approval', title: '4. Human Approval Record', icon: 'lock',
        timestamp: '2026-03-04T00:45:18+08:00',
        content: [
            { label: 'Approval Required', value: 'Yes — risk score 82/100 ≥ 70 threshold' },
            { label: 'Reviewed By', value: 'Field Operator (Human)' },
            { label: 'Review Time', value: '8 minutes (within 15-min SLA)' },
            { label: 'Decision', value: 'APPROVED' },
            { label: 'Notes', value: 'Operator confirmed visual symptoms match AI analysis' },
        ],
    },
    {
        id: 'execution', title: '5. Execution Record', icon: 'play',
        timestamp: '2026-03-04T00:45:20+08:00',
        content: [
            { label: 'Actors Deployed', value: '5 (2 drones, 1 IoT system, 1 field team, 1 facility)' },
            { label: 'Total Duration', value: '3h 00min' },
            { label: 'Coverage', value: '97% average across all zones' },
            { label: 'Issues', value: 'None — wind remained below threshold throughout' },
            { label: 'Chemical Used', value: '10.2L Mancozeb (94.4% of recommended)' },
        ],
    },
    {
        id: 'verification', title: '6. Post-Execution Verification', icon: 'check',
        timestamp: '2026-03-04T02:45:00+08:00',
        content: [
            { label: 'Sensor Check (+2h)', value: 'Humidity dropped 92% → 74%. Spore count -88%.' },
            { label: 'Sensor Check (+24h)', value: 'Botrytis spore count at 12% of pre-treatment. No spread.' },
            { label: 'Visual Inspection', value: 'Field Team A confirmed no new lesions in treated zones.' },
            { label: 'Adjacent Zones', value: 'Zero cross-contamination detected in B3-South, B3-North.' },
            { label: 'Drone Re-scan', value: 'NDVI normalized. No stress signatures in treated area.' },
        ],
    },
    {
        id: 'evaluation', title: '7. AI Evaluation & Conclusion', icon: 'reasoning',
        timestamp: '2026-03-04T02:50:00+08:00',
        content: [
            { label: 'Effectiveness', value: '95% — exceeded 85% target for botrytis containment' },
            { label: 'Cost Efficiency', value: '¥3,500 spent vs. ¥22,000 potential loss = 6.3× ROI' },
            { label: 'Lessons Learned', value: 'Early detection via AI watchdog reduced response time by 4h vs. manual' },
            { label: 'Model Update', value: 'Added case to training set — 847,001st data point' },
            { label: 'Recommendation', value: 'Schedule verification scan in 72h. Maintain elevated monitoring.' },
        ],
    },
];

export default function AuditReport() {
    const { auditRecords, eventLog, riskResults, activePrescription, fields, activeFieldId } = useStore();
    const field = fields[activeFieldId];
    const compliance = getComplianceSummary(auditRecords || []);
    const now = new Date().toLocaleString('en-US', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

    // Simulate report generation animation
    const [visibleSections, setVisibleSections] = useState(0);
    const [generating, setGenerating] = useState(false);

    const handleGenerate = () => {
        setGenerating(true);
        setVisibleSections(0);
        let i = 0;
        const timer = setInterval(() => {
            i++;
            setVisibleSections(i);
            if (i >= REPORT_SECTIONS.length) {
                clearInterval(timer);
                setGenerating(false);
            }
        }, 800);
    };

    // Distribution targets
    const [distribution, setDistribution] = useState({
        regulatory: true, client: true, mlTraining: true, archive: true,
    });

    return (
        <div className="page">
            <PipelineBreadcrumb />

            <div className="page-header">
                <div>
                    <h1 className="page-title">Audit Report</h1>
                    <p className="page-subtitle">Stage 6: Audit & Compliance — {field?.name} | {now}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    {visibleSections < REPORT_SECTIONS.length && (
                        <button className="btn btn-primary" onClick={handleGenerate} disabled={generating}>
                            {generating ? 'Generating...' : 'Generate Audit Report'}
                        </button>
                    )}
                </div>
            </div>

            {/* Compliance Summary KPIs */}
            <div className="grid grid-4" style={{ marginBottom: 16 }}>
                <MetricCard label="Checks Passed" value={`${PRE_AUDIT_CHECKS.filter(c => c.status === 'pass').length}/${PRE_AUDIT_CHECKS.length}`} status="monitoring" subtitle="compliance gates" />
                <MetricCard label="Data Sources" value="12" subtitle="multimodal sources audited" />
                <MetricCard label="Report Sections" value={`${visibleSections}/${REPORT_SECTIONS.length}`} status={visibleSections >= REPORT_SECTIONS.length ? 'monitoring' : 'elevated'} subtitle="auto-generated" />
                <MetricCard label="Confidence" value="87.2%" status="monitoring" subtitle="model confidence" />
            </div>

            {/* Pre-Audit Compliance Checks */}
            <div className="card" style={{ marginBottom: 16 }}>
                <h3 className="card-title">Pre-Execution Compliance Checks</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {PRE_AUDIT_CHECKS.map(c => (
                        <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'rgba(15,23,42,0.4)', borderRadius: 8 }}>
                            <Icon name={c.status === 'pass' ? 'check' : 'alert-triangle'} size={14} color={c.status === 'pass' ? '#34d399' : '#ef4444'} />
                            <span style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.82rem', minWidth: 200 }}>{c.name}</span>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8', flex: 1 }}>{c.detail}</span>
                            <span style={{ fontSize: '0.6rem', color: '#475569', fontFamily: 'monospace' }}>{c.standard}</span>
                            <StatusBadge status={c.status === 'pass' ? 'monitoring' : 'critical'} label={c.status.toUpperCase()} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Auto-Generated Report Sections */}
            {visibleSections > 0 && (
                <div style={{ marginBottom: 16 }}>
                    <h3 className="section-title">Auto-Generated Audit Report</h3>
                    {REPORT_SECTIONS.slice(0, visibleSections).map((section, i) => (
                        <div key={section.id} className="card" style={{ marginBottom: 12, animation: 'fade-in 0.5s ease', borderLeft: '3px solid #38bdf8' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                <Icon name={section.icon} size={16} color="#38bdf8" />
                                <h3 className="card-title" style={{ marginBottom: 0 }}>{section.title}</h3>
                                <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: '#475569', fontFamily: 'monospace' }}>
                                    {new Date(section.timestamp).toLocaleString('en-US', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                                </span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {section.content.map((item, j) => (
                                    <div key={j} style={{ display: 'flex', gap: 12, padding: '6px 0', borderBottom: '1px solid rgba(30,41,59,0.5)', fontSize: '0.78rem' }}>
                                        <span style={{ color: '#64748b', minWidth: 180, fontWeight: 600 }}>{item.label}</span>
                                        <span style={{ color: '#e2e8f0' }}>{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Generating indicator */}
            {generating && (
                <div className="card" style={{ textAlign: 'center', padding: 20, borderLeft: '3px solid #f59e0b' }}>
                    <Icon name="reasoning" size={20} color="#f59e0b" />
                    <div style={{ color: '#f59e0b', fontWeight: 600, marginTop: 8 }}>Generating section {visibleSections + 1} of {REPORT_SECTIONS.length}...</div>
                    <div style={{ color: '#64748b', fontSize: '0.72rem', marginTop: 4 }}>Auto-compiling from execution data, sensor readings, and AI analysis</div>
                </div>
            )}

            {/* Distribution Panel */}
            {visibleSections >= REPORT_SECTIONS.length && (
                <div className="card" style={{ marginBottom: 16, background: 'rgba(52,211,153,0.02)', border: '1px solid rgba(52,211,153,0.15)' }}>
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon name="chevron-right" size={16} color="#34d399" /> Report Distribution
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
                        {[
                            { key: 'regulatory', label: 'Regulatory Agency', desc: 'MoA compliance submission' },
                            { key: 'client', label: 'Client Portal', desc: 'Farm owner dashboard' },
                            { key: 'mlTraining', label: 'ML Training Pipeline', desc: 'Model improvement feed' },
                            { key: 'archive', label: 'Permanent Archive', desc: 'Immutable audit record' },
                        ].map(target => (
                            <label key={target.key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(15,23,42,0.4)', borderRadius: 8, cursor: 'pointer', border: distribution[target.key] ? '1px solid rgba(52,211,153,0.3)' : '1px solid var(--border-subtle)' }}>
                                <input type="checkbox" checked={distribution[target.key]} onChange={e => setDistribution({ ...distribution, [target.key]: e.target.checked })} style={{ accentColor: '#34d399' }} />
                                <div>
                                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0' }}>{target.label}</div>
                                    <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{target.desc}</div>
                                </div>
                            </label>
                        ))}
                    </div>
                    <button className="btn btn-success" style={{ width: '100%', justifyContent: 'center' }}>
                        <Icon name="check" size={14} /> Submit Audit Report to {Object.values(distribution).filter(Boolean).length} Destinations
                    </button>
                </div>
            )}

            {/* Decision Loop Stages */}
            <div className="card" style={{ marginBottom: 16 }}>
                <h3 className="card-title">Decision Loop — Provenance Trail</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {[
                        { timestamp: '00:45:12', event: 'Sensor anomaly detected — humidity >85%', actor: 'AI Watchdog', hash: '0x7f3a..c1e2' },
                        { timestamp: '00:45:14', event: 'Risk assessment initiated — 12 sources queried', actor: 'Decision Engine', hash: '0x8d2b..f4a1' },
                        { timestamp: '00:45:16', event: 'Prescription generated — Mancozeb 70% WP', actor: 'Rx Builder', hash: '0x91c3..d5b7' },
                        { timestamp: '00:45:18', event: 'Critical risk ≥70 — routed to human approval', actor: 'Approval Gate', hash: '0xa4e5..e8c3' },
                        { timestamp: '00:53:22', event: 'Human approved — visual confirmation matched', actor: 'Field Operator', hash: '0xb7f6..f9d4' },
                        { timestamp: '01:00:00', event: 'Execution initiated — 5 actors deployed', actor: 'Execution Engine', hash: '0xc8a7..a1e5' },
                        { timestamp: '02:45:00', event: 'Post-execution verification — spore count -88%', actor: 'Verification Agent', hash: '0xd9b8..b2f6' },
                        { timestamp: '02:50:00', event: 'Audit report compiled and recorded', actor: 'Audit Engine', hash: '0xeac9..c3a7' },
                    ].map((stage, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderLeft: '2px solid #38bdf8', fontSize: '0.78rem' }}>
                            <span style={{ fontSize: '0.65rem', color: '#475569', fontFamily: 'monospace', minWidth: 80 }}>{stage.timestamp}</span>
                            <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{stage.event}</span>
                            <span style={{ fontSize: '0.65rem', color: '#64748b', marginLeft: 'auto' }}>{stage.actor}</span>
                            <span style={{ fontSize: '0.6rem', color: '#334155', fontFamily: 'monospace' }}>{stage.hash}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ML Feedback */}
            <MLFeedbackPanel />
        </div>
    );
}
