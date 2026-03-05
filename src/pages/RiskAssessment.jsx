import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import useStore from '../engine/store';
import RiskGauge from '../components/RiskGauge';
import StatusBadge from '../components/StatusBadge';
import MetricCard from '../components/MetricCard';
import Icon from '../components/Icon';
import PipelineBreadcrumb from '../components/PipelineBreadcrumb';
import { previousActions, sensorThresholds } from '../data/mockData';

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));
const num = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};
const riskBand = (score) => (score >= 70 ? 'critical' : score >= 50 ? 'elevated' : score >= 30 ? 'monitoring' : 'low');

export default function RiskAssessment() {
    const navigate = useNavigate();
    const {
        riskResults,
        revenueAtRisk,
        currentSnapshot,
        fields,
        activeFieldId,
        activeScenario,
        simulationData,
    } = useStore();

    const field = fields[activeFieldId];
    const sensors = currentSnapshot?.sensors || {};
    const pests = currentSnapshot?.pests || {};
    const actions = previousActions[activeFieldId] || {};
    const safeRiskResults = Array.isArray(riskResults)
        ? riskResults.filter(item => item && typeof item === 'object')
        : [];

    const [report, setReport] = useState(null);
    const reportRef = useRef(null);

    const now = new Date().toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    });

    const topRisk = safeRiskResults[0];

    const chartData = safeRiskResults.map(r => {
        const rawName = String(r?.name || r?.threatId || 'Unknown Threat');
        const score = Number.isFinite(Number(r?.score)) ? Number(r.score) : 0;
        return {
            name: rawName.length > 14 ? `${rawName.slice(0, 12)}...` : rawName,
            score,
            color: score >= 70 ? '#ef4444' : score >= 50 ? '#f59e0b' : score >= 30 ? '#3dabf5' : '#10b981',
        };
    });

    const evidence = useMemo(() => {
        const daysToHarvest = activeScenario?.daysToHarvest || 30;
        return [
            {
                title: 'Humidity Pressure',
                value: `${Number(sensors.humidity_pct || 0).toFixed(1)}%`,
                detail: `Threshold ${sensorThresholds.humidity?.max || 85}%`,
                impact: Number(sensors.humidity_pct || 0) > (sensorThresholds.humidity?.max || 85) ? 'high' : 'medium',
            },
            {
                title: 'Leaf Wetness',
                value: `${Number(sensors.leaf_wetness_h ?? sensors.leaf_wetness_hrs ?? 0).toFixed(1)}h`,
                detail: `Threshold ${sensorThresholds.leafWetness?.max || 3}h`,
                impact: Number(sensors.leaf_wetness_h ?? sensors.leaf_wetness_hrs ?? 0) > (sensorThresholds.leafWetness?.max || 3) ? 'high' : 'low',
            },
            {
                title: 'Pest Trap Counts',
                value: `${Number(pests.sticky_trap_daily || pests.aphids_per_leaf || 0).toFixed(1)}`,
                detail: 'Daily trap and leaf checks',
                impact: Number(pests.sticky_trap_daily || 0) > 12 ? 'high' : 'medium',
            },
            {
                title: 'Growth Stage',
                value: currentSnapshot?.stageName || 'Unknown',
                detail: 'Stage-sensitive threat response',
                impact: 'medium',
            },
            {
                title: 'Days To Harvest',
                value: `${daysToHarvest}d`,
                detail: daysToHarvest < 14 ? 'PHI constraints likely active' : 'PHI constraints manageable',
                impact: daysToHarvest < 14 ? 'high' : 'medium',
            },
            {
                title: 'Recent Spray',
                value: actions.last_spray || 'No recent spray',
                detail: `Chemical: ${actions.last_spray_chemical || 'N/A'}`,
                impact: 'low',
            },
        ];
    }, [activeScenario?.daysToHarvest, actions.last_spray, actions.last_spray_chemical, currentSnapshot?.stageName, pests.aphids_per_leaf, pests.sticky_trap_daily, sensors.humidity_pct, sensors.leaf_wetness_h, sensors.leaf_wetness_hrs]);

    const simArray = Array.isArray(simulationData) ? simulationData : Object.values(simulationData || {});
    const riskTrend = simArray.slice(-7).map((d, i) => ({
        day: `D${d?.day || i + 1}`,
        botrytis: d?.threats?.grayMold?.score ?? (10 + i * 2),
        anthracnose: d?.threats?.anthracnose?.score ?? (8 + i * 2),
        aphids: d?.threats?.aphids?.score ?? (6 + i * 1.8),
    }));

    const generateRiskReport = () => {
        const daysToHarvest = activeScenario?.daysToHarvest || 30;
        const humidity = num(sensors.humidity_pct);
        const humidityTh = num(sensorThresholds.humidity?.max, 85);
        const leafWetness = num(sensors.leaf_wetness_h ?? sensors.leaf_wetness_hrs);
        const leafWetnessTh = num(sensorThresholds.leafWetness?.max, 3);
        const trapCount = num(pests.sticky_trap_daily ?? pests.aphids_per_leaf);
        const trapTh = 12;
        const fallbackCompositeScore = clamp(
            8
            + Math.max(0, (humidity - humidityTh) * 1.2)
            + Math.max(0, (leafWetness - leafWetnessTh) * 9)
            + Math.max(0, (trapCount - trapTh) * 1.6)
            + (daysToHarvest < 14 ? 4 : 0),
        );

        const threats = safeRiskResults.length > 0
            ? safeRiskResults
                .map(item => ({
                    name: item.name || item.threatId || 'Unknown threat',
                    score: num(item.score),
                    trend: item.trend || 'stable',
                    status: item.status || riskBand(num(item.score)),
                    factors: Array.isArray(item.factors) ? item.factors : [],
                }))
                .sort((a, b) => b.score - a.score)
            : [{
                name: 'Composite Environmental Risk',
                score: fallbackCompositeScore,
                trend: fallbackCompositeScore >= 30 ? 'rising' : 'stable',
                status: riskBand(fallbackCompositeScore),
                factors: [
                    'No explicit threat vector exceeded calibrated model thresholds.',
                    'Composite score synthesized from humidity, leaf wetness, pest trap, and harvest window.',
                ],
            }];

        const primary = threats[0];
        const highSignals = evidence.filter(item => item.impact === 'high').map(item => item.title);
        const mediumSignals = evidence.filter(item => item.impact === 'medium').map(item => item.title);
        const dataCoverage = evidence.map(item => ({
            source: item.title,
            value: item.value,
            detail: item.detail,
            influence: item.impact,
        }));
        const reasoningTrail = [
            ...threats.slice(0, 3).map(item => {
                const factorText = item.factors?.length ? item.factors.join(' | ') : 'No critical rule violations; background pressure only.';
                return `${item.name}: ${item.score}/100 (${item.status}, ${item.trend}). Evidence: ${factorText}`;
            }),
            `Telemetry synthesis: humidity ${humidity.toFixed(1)}% vs ${humidityTh}% threshold; leaf wetness ${leafWetness.toFixed(1)}h vs ${leafWetnessTh}h; pest trap ${trapCount.toFixed(1)} vs ${trapTh}.`,
            `Economic context: revenue-at-risk ${revenueAtRisk ? `CNY ${Number(revenueAtRisk.total || 0).toLocaleString()}` : 'CNY 0'} at current state.`,
            activeScenario
                ? `Scenario context: ${activeScenario.id} - ${activeScenario.name}; days-to-harvest ${daysToHarvest}.`
                : `Operating mode: live telemetry (no active scripted scenario). Days-to-harvest baseline ${daysToHarvest}.`,
            `Operational context: last spray ${actions.last_spray || 'not recorded'}; material ${actions.last_spray_chemical || 'N/A'}.`,
        ];

        const conclusion = primary.score >= 70
            ? 'Critical risk. Immediate response and approval workflow required before execution window closes.'
            : primary.score >= 50
                ? 'Elevated risk. Prepare targeted intervention and execute within 6-24 hours.'
                : primary.score >= 30
                    ? 'Moderate risk. Continue enhanced monitoring and pre-stage preventive actions.'
                    : 'Low risk. No immediate intervention required; maintain baseline monitoring and scheduled inspections.';

        setReport({
            generatedAt: new Date().toISOString(),
            field: field?.name,
            crop: field?.crop,
            scenarioContext: activeScenario ? `${activeScenario.id} - ${activeScenario.name}` : 'Live telemetry mode',
            topThreat: primary.name,
            topScore: primary.score,
            status: primary.status,
            keySignals: [...highSignals, ...mediumSignals].slice(0, 8),
            riskWindow: primary.score >= 70 ? '0-6h' : primary.score >= 50 ? '6-24h' : primary.score >= 30 ? '24-72h' : '72h+',
            threatMatrix: threats.slice(0, 5),
            dataCoverage,
            rationale: reasoningTrail,
            conclusion,
            phiNote: daysToHarvest < 14 ? 'Short harvest window - verify PHI before chemical actions.' : 'Harvest window supports standard PHI plans.',
            recommendationSummary: primary.score >= 70
                ? 'Prepare immediate intervention package and approval routing.'
                : primary.score >= 50
                    ? 'Prepare targeted intervention package and validate execution constraints.'
                    : primary.score >= 30
                        ? 'Increase monitoring cadence and keep preventive package ready.'
                        : 'Continue routine monitoring with no intervention dispatch.',
        });
    };

    useEffect(() => {
        if (report && reportRef.current) {
            reportRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [report]);

    return (
        <div className="page">
            <PipelineBreadcrumb />

            <div className="page-header">
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Icon name="risk" size={22} color="#f59e0b" />
                        Risk Assessment Engine
                    </h1>
                    <p className="page-subtitle">Stage 3: AI Reasoning | {field?.name} | {now}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-primary" onClick={generateRiskReport}>
                        Generate Risk Report
                    </button>
                    <button className="btn btn-secondary" onClick={() => navigate('/prescription')}>
                        Open Prescription Builder
                    </button>
                </div>
            </div>

            <div className="grid grid-3">
                <MetricCard
                    label="Highest Threat"
                    value={topRisk?.score || 0}
                    unit="/100"
                    status={topRisk?.status || 'low'}
                    subtitle={topRisk?.name || 'None'}
                    icon="alert-triangle"
                />
                <MetricCard
                    label="Revenue at Risk"
                    value={revenueAtRisk ? `CNY ${(revenueAtRisk.total / 1000).toFixed(1)}k` : 'CNY 0'}
                    status={revenueAtRisk?.total > 30000 ? 'critical' : revenueAtRisk?.total > 10000 ? 'elevated' : 'low'}
                    subtitle={revenueAtRisk ? `Grade ${revenueAtRisk.currentGrade} | ${revenueAtRisk.downgradeProbability}% downgrade probability` : '--'}
                    icon="money"
                />
                <MetricCard
                    label="Decision Window"
                    value={activeScenario ? `${activeScenario.daysToHarvest}d` : '30d'}
                    subtitle="to harvest"
                    status={activeScenario?.daysToHarvest < 7 ? 'critical' : 'low'}
                    icon="clock"
                />
            </div>

            <div className="card" style={{ marginTop: 16 }}>
                <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon name="layers" size={16} color="#38bdf8" />
                    Multimodal Evidence Board
                </h3>
                <div className="evidence-board">
                    {evidence.map((e, i) => (
                        <div key={i} className={`evidence-card ${e.impact}`}>
                            <div className="evidence-source">{e.title}</div>
                            <div className="evidence-value">{e.value}</div>
                            <div style={{ fontSize: '0.65rem', color: '#475569', marginTop: 2 }}>{e.detail}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card" style={{ marginTop: 16 }}>
                <h3 className="card-title">Threat Assessment - Risk Gauges</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center', padding: '16px 0' }}>
                    {safeRiskResults.map((r, idx) => (
                        <div key={r.threatId || `${r.name || 'risk'}-${idx}`} style={{ textAlign: 'center' }}>
                            <RiskGauge score={Number(r?.score || 0)} size={110} threat={r?.name || r?.threatId || 'Unknown Threat'} />
                            <div style={{ marginTop: 4 }}>
                                <StatusBadge status={r?.status || 'low'} />
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 4 }}>Trend: {r?.trend || 'stable'}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card" style={{ marginTop: 16 }}>
                <h3 className="card-title">Risk Score Comparison</h3>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={chartData} layout="vertical">
                        <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#1e293b' }} />
                        <YAxis type="category" dataKey="name" width={120} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#1e293b' }} />
                        <Tooltip contentStyle={{ background: '#1a2235', border: '1px solid #1e293b', borderRadius: 8, color: '#e2e8f0' }} />
                        <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                            {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {riskTrend.length > 0 && (
                <div className="card" style={{ marginTop: 16 }}>
                    <h3 className="card-title">7-Day Risk Trend</h3>
                    <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={riskTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="day" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} />
                            <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} domain={[0, 100]} />
                            <Tooltip contentStyle={{ background: '#1a2235', border: '1px solid #1e293b', borderRadius: 8, fontSize: '0.7rem' }} />
                            <Line type="monotone" dataKey="botrytis" stroke="#ef4444" dot={false} name="Gray Mold" />
                            <Line type="monotone" dataKey="anthracnose" stroke="#f59e0b" dot={false} name="Anthracnose" />
                            <Line type="monotone" dataKey="aphids" stroke="#34d399" dot={false} name="Aphids" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {report && (
                <div ref={reportRef} className="card" style={{ marginTop: 16, borderLeft: '3px solid #38bdf8', background: 'rgba(56,189,248,0.05)' }}>
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon name="report" size={16} color="#38bdf8" />
                        Risk Assessment Report
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10, marginBottom: 12 }}>
                        <div className="mesh-metric"><span>Generated</span><strong>{new Date(report.generatedAt).toLocaleString('en-US')}</strong></div>
                        <div className="mesh-metric"><span>Top Threat</span><strong>{report.topThreat} ({report.topScore}/100)</strong></div>
                        <div className="mesh-metric"><span>Risk Window</span><strong>{report.riskWindow}</strong></div>
                        <div className="mesh-metric"><span>Field/Crop</span><strong>{report.field} / {report.crop}</strong></div>
                        <div className="mesh-metric"><span>Scenario/Mode</span><strong>{report.scenarioContext}</strong></div>
                        <div className="mesh-metric"><span>Conclusion</span><strong>{report.status?.toUpperCase()}</strong></div>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#93c5fd', marginBottom: 6, fontWeight: 700 }}>Key Signals</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                        {report.keySignals.length > 0 ? report.keySignals.map(item => (
                            <span key={item} className="mesh-chip">{item}</span>
                        )) : <span style={{ fontSize: '0.72rem', color: '#64748b' }}>No high-severity evidence signals detected.</span>}
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#93c5fd', marginBottom: 6, fontWeight: 700 }}>Data Considered</div>
                    <div className="scrollbar-themed" style={{ maxHeight: 160, overflowY: 'auto', display: 'grid', gap: 6, marginBottom: 12 }}>
                        {(report.dataCoverage || []).map((entry) => (
                            <div key={entry.source} style={{ fontSize: '0.72rem', color: '#94a3b8', padding: '6px 8px', borderRadius: 8, background: 'rgba(15,23,42,0.35)', border: '1px solid rgba(51,65,85,0.45)' }}>
                                <strong style={{ color: '#e2e8f0' }}>{entry.source}:</strong> {entry.value} | {entry.detail} | influence {entry.influence}
                            </div>
                        ))}
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#93c5fd', marginBottom: 6, fontWeight: 700 }}>Reasoning Trail</div>
                    <ul style={{ margin: 0, paddingLeft: 18, color: '#cbd5e1', fontSize: '0.74rem', lineHeight: 1.6 }}>
                        {(report.rationale || []).map((line, idx) => <li key={idx}>{line}</li>)}
                    </ul>

                    <div style={{ fontSize: '0.75rem', color: '#93c5fd', margin: '10px 0 6px', fontWeight: 700 }}>Threat Matrix</div>
                    <div className="scrollbar-themed" style={{ maxHeight: 160, overflowY: 'auto', display: 'grid', gap: 6 }}>
                        {(report.threatMatrix || []).map((item) => (
                            <div key={item.name} style={{ fontSize: '0.72rem', color: '#94a3b8', padding: '6px 8px', borderRadius: 8, background: 'rgba(15,23,42,0.35)', border: '1px solid rgba(51,65,85,0.45)' }}>
                                <strong style={{ color: '#e2e8f0' }}>{item.name}</strong> - {item.score}/100 ({item.status}, {item.trend})
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: 10, fontSize: '0.74rem', color: '#94a3b8' }}>{report.phiNote}</div>
                    <div style={{ marginTop: 6, fontSize: '0.76rem', color: '#38bdf8', fontWeight: 700 }}>Conclusion: {report.conclusion}</div>
                    <div style={{ marginTop: 6, fontSize: '0.76rem', color: '#e2e8f0', fontWeight: 600 }}>{report.recommendationSummary}</div>
                </div>
            )}
        </div>
    );
}
