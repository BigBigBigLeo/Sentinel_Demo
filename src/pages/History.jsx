import React, { useMemo, useState } from 'react';
import Icon from '../components/Icon';
import StatusBadge from '../components/StatusBadge';
import PipelineBreadcrumb from '../components/PipelineBreadcrumb';
import { historicalDecisions } from '../data/mockData';
import {
    AreaChart, Area, BarChart, Bar, LineChart, Line,
    XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, PieChart, Pie, Legend,
} from 'recharts';

// Expanded historical records for all 6 scenarios
const scenarioOutcomes = [
    { id: 'A', name: 'Blueberry PHI Constraint', date: '2025-11-08', crop: 'Blueberry', riskPeak: 85, riskFinal: 42, grade: 'A+', revenueProtected: 44000, cost: 3200, responseMin: 18, chemical: 'Trichoderma (Bio)', aiAccuracy: 94 },
    { id: 'B', name: 'Monsoon Rose Gray Mold', date: '2025-11-15', crop: 'Rose', riskPeak: 88, riskFinal: 55, grade: 'B (30% downgraded)', revenueProtected: 51000, cost: 4500, responseMin: 380, chemical: 'Carbendazim', aiAccuracy: 91, loss: 12600 },
    { id: 'C', name: 'Execution Deviation', date: '2025-12-02', crop: 'Blueberry', riskPeak: 72, riskFinal: 18, grade: 'A+', revenueProtected: 28000, cost: 3640, responseMin: 22, chemical: 'Chlorothalonil', aiAccuracy: 92, excessCost: 840 },
    { id: 'D', name: 'Multi-Pest Cascade', date: '2025-12-18', crop: 'Blueberry', riskPeak: 78, riskFinal: 22, grade: 'A+', revenueProtected: 68000, cost: 5800, responseMin: 35, chemical: 'Sequential', aiAccuracy: 96 },
    { id: 'E', name: 'Frost Emergency', date: '2026-01-05', crop: 'Blueberry', riskPeak: 82, riskFinal: 10, grade: 'A+', revenueProtected: 52000, cost: 1800, responseMin: 8, chemical: 'None (Non-chemical)', aiAccuracy: 98 },
    { id: 'F', name: 'Ventilation Failure', date: '2026-01-22', crop: 'Rose', riskPeak: 82, riskFinal: 28, grade: 'A+', revenueProtected: 72000, cost: 6200, responseMin: 12, chemical: 'Carbendazim (Emergency)', aiAccuracy: 95 },
];

const aiAccuracyTrend = [
    { month: 'Sep', accuracy: 82, decisions: 3 },
    { month: 'Oct', accuracy: 86, decisions: 5 },
    { month: 'Nov', accuracy: 91, decisions: 8 },
    { month: 'Dec', accuracy: 94, decisions: 6 },
    { month: 'Jan', accuracy: 97, decisions: 7 },
    { month: 'Feb', accuracy: 98, decisions: 4 },
];

const chemicalUsageTrend = [
    { month: 'Sep', sentinel: 12, traditional: 28 },
    { month: 'Oct', sentinel: 9, traditional: 26 },
    { month: 'Nov', sentinel: 7, traditional: 25 },
    { month: 'Dec', sentinel: 5, traditional: 24 },
    { month: 'Jan', sentinel: 3, traditional: 23 },
    { month: 'Feb', sentinel: 4, traditional: 22 },
];

const revenueCumulative = [
    { month: 'Sep', protected: 12000, cost: 3200 },
    { month: 'Oct', protected: 35000, cost: 7800 },
    { month: 'Nov', protected: 128000, cost: 15500 },
    { month: 'Dec', protected: 224000, cost: 25100 },
    { month: 'Jan', protected: 348000, cost: 33100 },
    { month: 'Feb', protected: 413000, cost: 39200 },
];

const responseTimeData = [
    { range: '<15min', count: 8, fill: '#34d399' },
    { range: '15-30min', count: 12, fill: '#38bdf8' },
    { range: '30-60min', count: 5, fill: '#f59e0b' },
    { range: '1-4hr', count: 3, fill: '#f97316' },
    { range: '>4hr', count: 1, fill: '#ef4444' },
];

export default function History() {
    const [filter, setFilter] = useState('all');
    const [expandedScenario, setExpandedScenario] = useState(null);
    const [selectedDecisionId, setSelectedDecisionId] = useState(null);

    const filteredOutcomes = filter === 'all' ? scenarioOutcomes
        : filter === 'success' ? scenarioOutcomes.filter(s => s.grade.includes('+'))
            : scenarioOutcomes.filter(s => !s.grade.includes('+'));

    const totalProtected = scenarioOutcomes.reduce((s, o) => s + o.revenueProtected, 0);
    const totalCost = scenarioOutcomes.reduce((s, o) => s + o.cost, 0);
    const avgAccuracy = (scenarioOutcomes.reduce((s, o) => s + o.aiAccuracy, 0) / scenarioOutcomes.length).toFixed(1);
    const avgResponse = Math.round(scenarioOutcomes.reduce((s, o) => s + o.responseMin, 0) / scenarioOutcomes.length);
    const decisionEntries = useMemo(
        () => [...historicalDecisions]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 16),
        [],
    );
    const selectedDecision = decisionEntries.find(item => item.id === selectedDecisionId) || decisionEntries[0];

    return (
        <div className="page">
            <PipelineBreadcrumb />

            <div className="page-header">
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Icon name="history" size={20} color="#38bdf8" /> Analytics & History
                    </h1>
                    <p className="page-subtitle">Season Performance Dashboard  - {scenarioOutcomes.length} Interventions Tracked</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    {['all', 'success', 'issues'].map(f => (
                        <button key={f} className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setFilter(f)} style={{ textTransform: 'capitalize', fontSize: '0.75rem' }}>
                            {f === 'all' ? 'All' : f === 'success' ? 'Success' : 'Issues'}
                        </button>
                    ))}
                </div>
            </div>

            {/* 鈹佲攣鈹?Summary KPI Cards 鈹佲攣鈹?*/}
            <div className="grid grid-4" style={{ gap: 12, marginBottom: 20 }}>
                {[
                    { label: 'Revenue Protected', value: `CNY ${(totalProtected / 1000).toFixed(0)}K`, sub: `from ${scenarioOutcomes.length} interventions`, color: '#34d399', icon: 'money' },
                    { label: 'Total Cost', value: `CNY ${(totalCost / 1000).toFixed(1)}K`, sub: `ROI: ${(totalProtected / totalCost).toFixed(1)}x`, color: '#f59e0b', icon: 'clipboard' },
                    { label: 'AI Accuracy', value: `${avgAccuracy}%`, sub: 'avg decision quality', color: '#38bdf8', icon: 'robot' },
                    { label: 'Avg Response', value: `${avgResponse} min`, sub: 'detection to execution', color: '#a78bfa', icon: 'bolt' },
                ].map((kpi, i) => (
                    <div key={i} className="card" style={{
                        background: `linear-gradient(135deg, ${kpi.color}08 0%, transparent 100%)`,
                        borderTop: `2px solid ${kpi.color}40`,
                        textAlign: 'center', padding: '16px 12px',
                    }}>
                        <div style={{ marginBottom: 6, display: 'flex', justifyContent: 'center' }}><Icon name={kpi.icon} size={24} color={kpi.color} /></div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: kpi.color, fontFamily: 'monospace', lineHeight: 1.2 }}>{kpi.value}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 4 }}>{kpi.label}</div>
                        <div style={{ fontSize: '0.6rem', color: '#64748b', marginTop: 2 }}>{kpi.sub}</div>
                    </div>
                ))}
            </div>

            {/* 鈹佲攣鈹?Scenario Replay Cards 鈹佲攣鈹?*/}
            <div style={{ marginBottom: 20 }}>
                <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span><Icon name="folder" size={16} color="#38bdf8" /></span> Intervention Record  - Scenario Replay
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {filteredOutcomes.map(outcome => (
                        <div key={outcome.id} className="card" style={{
                            cursor: 'pointer',
                            borderLeft: `3px solid ${outcome.grade.includes('+') ? '#34d399' : '#f59e0b'}`,
                            transition: 'all 0.2s',
                        }} onClick={() => setExpandedScenario(expandedScenario === outcome.id ? null : outcome.id)}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{
                                        width: 38, height: 38, borderRadius: 10,
                                        background: outcome.grade.includes('+') ? 'rgba(52,211,153,0.12)' : 'rgba(245,158,11,0.12)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 800, fontSize: '0.9rem', color: outcome.grade.includes('+') ? '#34d399' : '#f59e0b',
                                    }}>{outcome.id}</div>
                                    <div>
                                        <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.85rem' }}>{outcome.name}</div>
                                        <div style={{ fontSize: '0.65rem', color: '#64748b', display: 'flex', gap: 12, marginTop: 2 }}>
                                            <span>{outcome.date}</span>
                                            <span>{outcome.crop}</span>
                                            <span>Treatment: {outcome.chemical}</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 700, color: '#34d399', fontFamily: 'monospace', fontSize: '0.9rem' }}>CNY {outcome.revenueProtected.toLocaleString()}</div>
                                        <div style={{ fontSize: '0.6rem', color: '#64748b' }}>protected</div>
                                    </div>
                                    <StatusBadge status={outcome.grade.includes('+') ? 'monitoring' : 'warning'} label={outcome.grade} />
                                    <Icon name="chevron-right" size={14} color="#475569" />
                                </div>
                            </div>

                            {/* Expanded detail */}
                            {expandedScenario === outcome.id && (
                                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(30,41,59,0.5)' }}>
                                    <div className="grid grid-4" style={{ gap: 8, marginBottom: 12 }}>
                                        {[
                                            { label: 'Risk Peak', value: `${outcome.riskPeak}/100`, color: '#ef4444' },
                                            { label: 'Risk Final', value: `${outcome.riskFinal}/100`, color: '#34d399' },
                                            { label: 'Response', value: `${outcome.responseMin} min`, color: '#38bdf8' },
                                            { label: 'AI Accuracy', value: `${outcome.aiAccuracy}%`, color: '#a78bfa' },
                                        ].map((m, i) => (
                                            <div key={i} style={{ padding: '8px 10px', background: 'rgba(15,23,42,0.4)', borderRadius: 6, textAlign: 'center' }}>
                                                <div style={{ fontSize: '1rem', fontWeight: 700, color: m.color, fontFamily: 'monospace' }}>{m.value}</div>
                                                <div style={{ fontSize: '0.6rem', color: '#64748b' }}>{m.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Risk journey bar */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'rgba(15,23,42,0.3)', borderRadius: 8 }}>
                                        <span style={{ fontSize: '0.65rem', color: '#64748b', width: 50 }}>Risk:</span>
                                        <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'rgba(15,23,42,0.5)', position: 'relative', overflow: 'hidden' }}>
                                            <div style={{
                                                position: 'absolute', left: 0, top: 0, height: '100%',
                                                width: `${outcome.riskPeak}%`, borderRadius: 4,
                                                background: 'linear-gradient(90deg, #34d399, #f59e0b, #ef4444)',
                                                opacity: 0.3,
                                            }} />
                                            <div style={{
                                                position: 'absolute', left: 0, top: 0, height: '100%',
                                                width: `${outcome.riskFinal}%`, borderRadius: 4,
                                                background: '#34d399',
                                            }} />
                                        </div>
                                        <span style={{ fontSize: '0.65rem', color: '#34d399', fontWeight: 700, fontFamily: 'monospace', width: 70, textAlign: 'right' }}>{`${outcome.riskPeak}->${outcome.riskFinal}`}</span>
                                    </div>
                                    {outcome.loss && (
                                        <div style={{ marginTop: 8, padding: '6px 10px', background: 'rgba(239,68,68,0.06)', borderRadius: 6, fontSize: '0.7rem', color: '#f87171' }}>
                                            <Icon name="warning" size={10} color="#f59e0b" /> Revenue loss: CNY {outcome.loss.toLocaleString()}  - {outcome.id === 'B' ? 'due to 6h operator delay' : 'execution deviation'}
                                        </div>
                                    )}
                                    {outcome.excessCost && (
                                        <div style={{ marginTop: 8, padding: '6px 10px', background: 'rgba(245,158,11,0.06)', borderRadius: 6, fontSize: '0.7rem', color: '#f59e0b' }}>
                                            <Icon name="warning" size={10} color="#f59e0b" /> Excess cost: CNY {outcome.excessCost.toLocaleString()}  - dosage deviation {outcome.id === 'C' ? '(0.7x->1.2x)' : ''}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* 鈹佲攣鈹?Charts Grid 鈹佲攣鈹?*/}
            <div className="grid grid-2" style={{ gap: 12, marginBottom: 20 }}>
                {/* AI Accuracy Trend */}
                <div className="card">
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon name="reasoning" size={16} color="#38bdf8" /> AI Decision Accuracy Over Time
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={aiAccuracyTrend}>
                            <defs>
                                <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                            <YAxis domain={[75, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickFormatter={v => `${v}%`} />
                            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} formatter={(v) => [`${v}%`, 'Accuracy']} />
                            <Area type="monotone" dataKey="accuracy" stroke="#38bdf8" fill="url(#accGrad)" strokeWidth={2} dot={{ fill: '#38bdf8', r: 4 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                    <div style={{ textAlign: 'center', fontSize: '0.65rem', color: '#34d399', marginTop: 4 }}>
                        <Icon name="trending-up" size={10} color="#34d399" /> +16% improvement over 6 months - model self-learning active
                    </div>
                </div>

                {/* Chemical Usage Trend */}
                <div className="card">
                    <h3 className="card-title">Chemical Usage  - Sentinel vs. Traditional (L/month)</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={chemicalUsageTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                            <Bar dataKey="traditional" fill="#475569" radius={[4, 4, 0, 0]} barSize={16} name="Traditional" />
                            <Bar dataKey="sentinel" fill="#34d399" radius={[4, 4, 0, 0]} barSize={16} name="Sentinel" />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: '0.7rem' }} />
                        </BarChart>
                    </ResponsiveContainer>
                    <div style={{ textAlign: 'center', fontSize: '0.65rem', color: '#34d399', marginTop: 4 }}>
                        <Icon name="leaf" size={10} color="#34d399" /> Average 68% chemical reduction through precision targeting
                    </div>
                </div>

                {/* Revenue Protected Cumulative */}
                <div className="card">
                    <h3 className="card-title">Cumulative Revenue Protected (CNY)</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={revenueCumulative}>
                            <defs>
                                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#34d399" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickFormatter={v => `CNY ${(v / 1000).toFixed(0)}K`} />
                            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} formatter={(v) => [`CNY ${v.toLocaleString()}`, '']} />
                            <Area type="monotone" dataKey="protected" stroke="#34d399" fill="url(#revGrad)" strokeWidth={2} name="Protected" />
                            <Area type="monotone" dataKey="cost" stroke="#f59e0b" fill="rgba(245,158,11,0.05)" strokeWidth={1.5} strokeDasharray="4 4" name="Cost" />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: '0.7rem' }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Response Time Distribution */}
                <div className="card">
                    <h3 className="card-title">Response Time Distribution</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={responseTimeData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="range" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                            <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={32} name="Interventions">
                                {responseTimeData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    <div style={{ textAlign: 'center', fontSize: '0.65rem', color: '#38bdf8', marginTop: 4 }}>
                        <Icon name="bolt" size={10} color="#38bdf8" /> 69% of interventions responded to within 30 minutes
                    </div>
                </div>
            </div>

            {/* 鈹佲攣鈹?Decision Quality Matrix 鈹佲攣鈹?*/}
            <div className="card" style={{ marginBottom: 20 }}>
                <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon name="activity" size={16} color="#a78bfa" /> Decision Quality Matrix
                </h3>
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table" style={{ width: '100%', fontSize: '0.75rem' }}>
                        <thead>
                            <tr>
                                <th style={{ width: 50 }}>ID</th>
                                <th>Scenario</th>
                                <th>Date</th>
                                <th>Risk Peak</th>
                                <th>Risk Final</th>
                                <th>Response</th>
                                <th>AI Accuracy</th>
                                <th>Grade</th>
                                <th>ROI</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scenarioOutcomes.map(o => (
                                <tr key={o.id}>
                                    <td style={{ fontWeight: 800, color: '#38bdf8' }}>{o.id}</td>
                                    <td style={{ fontWeight: 600, color: '#e2e8f0' }}>{o.name}</td>
                                    <td style={{ color: '#64748b', fontFamily: 'monospace' }}>{o.date}</td>
                                    <td>
                                        <span style={{ color: o.riskPeak >= 80 ? '#ef4444' : o.riskPeak >= 70 ? '#f59e0b' : '#f97316', fontWeight: 700, fontFamily: 'monospace' }}>{o.riskPeak}</span>
                                    </td>
                                    <td>
                                        <span style={{ color: o.riskFinal <= 30 ? '#34d399' : '#f59e0b', fontWeight: 700, fontFamily: 'monospace' }}>{o.riskFinal}</span>
                                    </td>
                                    <td>
                                        <span style={{ color: o.responseMin <= 30 ? '#34d399' : o.responseMin <= 60 ? '#f59e0b' : '#ef4444', fontFamily: 'monospace' }}>
                                            {o.responseMin >= 60 ? `${(o.responseMin / 60).toFixed(1)}h` : `${o.responseMin}m`}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(15,23,42,0.5)' }}>
                                                <div style={{ width: `${o.aiAccuracy}%`, height: '100%', borderRadius: 2, background: o.aiAccuracy >= 95 ? '#34d399' : '#38bdf8' }} />
                                            </div>
                                            <span style={{ fontFamily: 'monospace', color: '#e2e8f0' }}>{o.aiAccuracy}%</span>
                                        </div>
                                    </td>
                                    <td><StatusBadge status={o.grade.includes('+') ? 'monitoring' : 'warning'} label={o.grade} /></td>
                                    <td style={{ fontWeight: 700, color: '#34d399', fontFamily: 'monospace' }}>{(o.revenueProtected / o.cost).toFixed(1)}x</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 鈹佲攣鈹?Compliance Record 鈹佲攣鈹?*/}
            <div className="card" style={{ marginBottom: 20 }}>
                <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon name="audit-alt" size={16} color="#34d399" /> Compliance & Regulatory Record
                </h3>
                <div className="grid grid-3" style={{ gap: 10 }}>
                    {[
                        { label: 'PHI Compliance', value: '100%', detail: '6/6 interventions PHI-verified', color: '#34d399', icon: 'check-circle' },
                        { label: 'Banned Substance', value: 'CLEAR', detail: 'Zero restricted chemicals used', color: '#34d399', icon: 'shield' },
                        { label: 'Label Rate', value: '92%', detail: '1 deviation (Scenario C: +71%)', color: '#f59e0b', icon: 'clipboard' },
                        { label: 'Wind Safety', value: '100%', detail: 'All drone ops within 3.0 m/s', color: '#34d399', icon: 'wind' },
                        { label: 'Audit Coverage', value: '100%', detail: 'All interventions fully audited', color: '#34d399', icon: 'clipboard' },
                        { label: 'GB 2763-2021', value: 'PASSED', detail: 'MRL testing within limits', color: '#34d399', icon: 'building' },
                    ].map((c, i) => (
                        <div key={i} style={{ padding: '12px 14px', background: 'rgba(15,23,42,0.4)', borderRadius: 8, borderLeft: `3px solid ${c.color}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: 4 }}><Icon name={c.icon} size={14} color={c.color} /> {c.label}</span>
                                <span style={{ fontWeight: 800, color: c.color, fontFamily: 'monospace', fontSize: '0.85rem' }}>{c.value}</span>
                            </div>
                            <div style={{ fontSize: '0.62rem', color: '#64748b' }}>{c.detail}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 鈹佲攣鈹?Decision Log 鈹佲攣鈹?*/}
            <div className="card">
                <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon name="activity" size={16} color="#64748b" /> Detailed Decision Log
                </h3>
                <div className="grid grid-2" style={{ gap: 12 }}>
                    <div className="scrollbar-themed" style={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {decisionEntries.map((d) => (
                            <button
                                key={d.id}
                                className="btn btn-secondary"
                                onClick={() => setSelectedDecisionId(d.id)}
                                style={{
                                    width: '100%',
                                    justifyContent: 'space-between',
                                    padding: '8px 10px',
                                    border: selectedDecision?.id === d.id
                                        ? '1px solid rgba(56,189,248,0.35)'
                                        : '1px solid rgba(51,65,85,0.5)',
                                    background: 'rgba(15,23,42,0.45)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    gap: 3,
                                }}
                            >
                                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontFamily: 'monospace', color: '#475569', fontSize: '0.65rem' }}>
                                        {new Date(d.timestamp).toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}
                                    </span>
                                    <StatusBadge status={d.outcome === 'success' ? 'monitoring' : d.outcome === 'partial' ? 'warning' : d.outcome === 'no_action' ? 'low' : 'critical'} label={d.outcome?.replace('_', ' ').toUpperCase()} />
                                </div>
                                <span style={{ fontSize: '0.71rem', color: '#e2e8f0', lineHeight: 1.3 }}>{d.threat}</span>
                                <span style={{ fontSize: '0.63rem', color: '#94a3b8' }}>{d.action}</span>
                                <span style={{ fontSize: '0.6rem', color: '#64748b' }}>{d.field} | Risk {d.riskScore ?? '--'}/100</span>
                            </button>
                        ))}
                    </div>
                    {selectedDecision && (
                        <div style={{ padding: 12, borderRadius: 10, border: '1px solid rgba(51,65,85,0.6)', background: 'rgba(15,23,42,0.45)' }}>
                            <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace', marginBottom: 8 }}>
                                {new Date(selectedDecision.timestamp).toLocaleString('en-US', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                            </div>
                            <div style={{ marginBottom: 8 }}>
                                <StatusBadge
                                    status={selectedDecision.outcome === 'success'
                                        ? 'monitoring'
                                        : selectedDecision.outcome === 'partial'
                                            ? 'warning'
                                            : selectedDecision.outcome === 'no_action'
                                                ? 'low'
                                                : 'critical'}
                                    label={selectedDecision.outcome?.replace('_', ' ').toUpperCase()}
                                />
                            </div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e2e8f0', marginBottom: 6 }}>{selectedDecision.threat}</div>
                            <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginBottom: 4 }}>Action: {selectedDecision.action}</div>
                            <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginBottom: 4 }}>Field: {selectedDecision.field}</div>
                            <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginBottom: 4 }}>Risk Score: {selectedDecision.riskScore ?? '--'}/100</div>
                            <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginBottom: 4 }}>
                                Approval: {selectedDecision.approvedBy} ({selectedDecision.approvalType})
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginBottom: 4 }}>
                                Rx/Exec/Audit: {selectedDecision.prescriptionId || '--'} | {selectedDecision.executionId || '--'} | {selectedDecision.auditId || '--'}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#34d399', fontFamily: 'monospace', marginTop: 8 }}>
                                Savings: CNY {(selectedDecision.savingsYuan || selectedDecision.savings || 0).toLocaleString()}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#f59e0b', fontFamily: 'monospace', marginTop: 4 }}>
                                Cost: CNY {(selectedDecision.costYuan || 0).toLocaleString()}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#94a3b8', lineHeight: 1.45, marginTop: 8 }}>
                                {selectedDecision.note}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}





