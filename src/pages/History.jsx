import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Cell, PieChart, Pie, Legend } from 'recharts';
import useStore from '../engine/store';
import StatusBadge from '../components/StatusBadge';
import Icon from '../components/Icon';
import PipelineBreadcrumb from '../components/PipelineBreadcrumb';
import { historicalDecisions, performanceKPIs } from '../data/mockData';

const kpi = performanceKPIs;

const KPICard = ({ label, value, suffix, trend, trendLabel, color = '#38bdf8', sparkData }) => (
    <div style={{
        padding: '16px 18px', background: 'rgba(15,23,42,0.5)', borderRadius: 12,
        border: '1px solid var(--border-subtle)', position: 'relative', overflow: 'hidden',
    }}>
        <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{label}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color, fontFamily: "'Inter', sans-serif", lineHeight: 1 }}>{value}</span>
            {suffix && <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>{suffix}</span>}
        </div>
        {trendLabel && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                <span style={{ fontSize: '0.7rem', color: trend === 'up' ? '#34d399' : trend === 'down' ? '#ef4444' : '#94a3b8' }}>
                    {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendLabel}
                </span>
            </div>
        )}
        {sparkData && (
            <div style={{ position: 'absolute', right: 8, bottom: 8, width: 70, height: 28, opacity: 0.4 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparkData.map((v, i) => ({ v, i }))}>
                        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        )}
    </div>
);

export default function History() {
    const { eventLog } = useStore();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredDecisions = historicalDecisions.filter(d =>
        !searchTerm || d.threat.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Chart Data
    const costSavingsData = historicalDecisions.filter(d => d.costYuan > 0).map(d => ({
        name: d.id.slice(-3),
        cost: d.costYuan,
        savings: d.savingsYuan,
    }));

    const riskTrendData = historicalDecisions.map(d => ({
        name: new Date(d.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        risk: d.riskScore,
    }));

    const threatData = {};
    historicalDecisions.forEach(d => {
        const t = d.threat.split(' (')[0].split(' — ')[0];
        threatData[t] = (threatData[t] || 0) + 1;
    });
    const threatChartData = Object.entries(threatData).map(([name, count]) => ({ name, count }));

    const outcomeData = [
        { name: 'Success', value: historicalDecisions.filter(d => d.outcome === 'success').length, color: '#34d399' },
        { name: 'Partial', value: historicalDecisions.filter(d => d.outcome === 'partial').length, color: '#f59e0b' },
        { name: 'No Action', value: historicalDecisions.filter(d => d.outcome === 'no_action').length, color: '#64748b' },
    ].filter(d => d.value > 0);

    const monthlyData = kpi.monthlyBreakdown || [];

    return (
        <div className="page">
            <PipelineBreadcrumb />

            <div className="page-header">
                <div>
                    <h1 className="page-title">History & Performance</h1>
                    <p className="page-subtitle">Stage 7: Continuous Improvement — Season Performance Analytics</p>
                </div>
            </div>

            {/* KPI Cards — Row 1: Financial */}
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Financial Performance</div>
            <div className="grid grid-4" style={{ marginBottom: 16 }}>
                <KPICard label="Total Spent" value={`¥${(kpi.totalSpent / 1000).toFixed(1)}k`} color="#f59e0b" trend="down" trendLabel="vs. ¥42k conventional" sparkData={[42, 38, 28, 18, 13.6]} />
                <KPICard label="Revenue Protected" value={`¥${(kpi.totalSavings / 1000).toFixed(0)}k`} color="#34d399" trend="up" trendLabel="+18% vs last season" sparkData={[40, 55, 72, 95, 122.9]} />
                <KPICard label="Season ROI" value={`${kpi.seasonROI}×`} color="#38bdf8" trend="up" trendLabel="cost to savings ratio" sparkData={[3.2, 5.1, 7.4, 8.1, 9.04]} />
                <KPICard label="Chemical Cost Saved" value={`${kpi.chemicalReduction}%`} suffix="reduction" color="#a78bfa" trend="up" trendLabel="vs. conventional approach" sparkData={[20, 35, 48, 58, 68]} />
            </div>

            {/* KPI Cards — Row 2: Operations */}
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Operational Metrics</div>
            <div className="grid grid-4" style={{ marginBottom: 16 }}>
                <KPICard label="Interventions" value={kpi.totalInterventions} color="#e2e8f0" trend="up" trendLabel={`${kpi.successRate}% success rate`} sparkData={[1, 2, 4, 6, 7]} />
                <KPICard label="Avg Response" value={kpi.avgResponseTimeMin} suffix="min" color="#06b6d4" trend="down" trendLabel="detection to action" sparkData={[22, 18, 15, 13, 12]} />
                <KPICard label="Drone Flights" value={kpi.droneFlightsTotal} suffix="total" color="#38bdf8" trend="up" trendLabel={`${kpi.droneFlightHours}h total flight time`} />
                <KPICard label="Area Treated" value={kpi.areaTreatedHa} suffix="ha" color="#34d399" trend="up" trendLabel="precision coverage" />
            </div>

            {/* KPI Cards — Row 3: AI & Compliance */}
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>AI & Compliance</div>
            <div className="grid grid-4" style={{ marginBottom: 16 }}>
                <KPICard label="AI Accuracy" value={`${kpi.aiPredictionAccuracy}%`} color="#10b981" trend="up" trendLabel="prediction accuracy" sparkData={[82, 85, 88, 90, 91.3]} />
                <KPICard label="False Positives" value={`${kpi.falsePositiveRate}%`} color="#f59e0b" trend="down" trendLabel="continuously improving" sparkData={[12, 9, 7, 5, 4.2]} />
                <KPICard label="Data Processed" value={`${(kpi.dataPointsProcessed / 1000).toFixed(0)}k`} suffix="points" color="#818cf8" trend="up" trendLabel="multimodal data" />
                <KPICard label="Zero Residue" value={`${kpi.zeroResidueCompliance}%`} color="#34d399" trend="up" trendLabel="compliance maintained" />
            </div>

            {/* KPI Cards — Row 4: Environmental */}
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Environmental Impact</div>
            <div className="grid grid-4" style={{ marginBottom: 16 }}>
                <KPICard label="Pesticide Used" value={kpi.pesticideUsedLiters} suffix="L" color="#fb7185" trend="down" trendLabel="68% less than conventional" />
                <KPICard label="Water Saved" value={`${(kpi.waterSavedLiters / 1000).toFixed(1)}k`} suffix="L" color="#06b6d4" trend="up" trendLabel="precision irrigation" />
                <KPICard label="Carbon Footprint" value={kpi.carbonFootprintKg} suffix="kg CO₂" color="#94a3b8" trend="down" trendLabel="drone vs tractor" />
                <KPICard label="Biocontrol" value={kpi.biocontrolDeployments} suffix="deployments" color="#34d399" trend="up" trendLabel="chemical-free interventions" />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-2" style={{ marginBottom: 16 }}>
                <div className="card">
                    <h3 className="card-title">Cost vs. Revenue Protected</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={costSavingsData}>
                            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={{ stroke: '#1e293b' }} />
                            <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={{ stroke: '#1e293b' }} />
                            <Tooltip contentStyle={{ background: '#1a2235', border: '1px solid #1e293b', borderRadius: 8, fontSize: '0.7rem' }} />
                            <Bar dataKey="cost" name="Cost (¥)" fill="#ef4444" radius={[3, 3, 0, 0]} />
                            <Bar dataKey="savings" name="Protected (¥)" fill="#34d399" radius={[3, 3, 0, 0]} />
                            <Legend wrapperStyle={{ fontSize: '0.65rem' }} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="card">
                    <h3 className="card-title">Risk Score Trend</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={riskTrendData}>
                            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={{ stroke: '#1e293b' }} />
                            <YAxis domain={[0, 100]} tick={{ fill: '#475569', fontSize: 10 }} axisLine={{ stroke: '#1e293b' }} />
                            <Tooltip contentStyle={{ background: '#1a2235', border: '1px solid #1e293b', borderRadius: 8, fontSize: '0.7rem' }} />
                            <Line type="monotone" dataKey="risk" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-3" style={{ marginBottom: 16 }}>
                <div className="card">
                    <h3 className="card-title">Threat Distribution</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={threatChartData} layout="vertical">
                            <XAxis type="number" tick={{ fill: '#475569', fontSize: 10 }} axisLine={{ stroke: '#1e293b' }} />
                            <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9 }} width={100} axisLine={false} />
                            <Tooltip contentStyle={{ background: '#1a2235', border: '1px solid #1e293b', borderRadius: 8, fontSize: '0.7rem' }} />
                            <Bar dataKey="count" fill="#38bdf8" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="card">
                    <h3 className="card-title">Outcome Distribution</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie data={outcomeData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                {outcomeData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                            </Pie>
                            <Tooltip contentStyle={{ background: '#1a2235', border: '1px solid #1e293b', borderRadius: 8, fontSize: '0.7rem' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="card">
                    <h3 className="card-title">Monthly Cost vs Savings</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={monthlyData}>
                            <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={{ stroke: '#1e293b' }} />
                            <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={{ stroke: '#1e293b' }} />
                            <Tooltip contentStyle={{ background: '#1a2235', border: '1px solid #1e293b', borderRadius: 8, fontSize: '0.7rem' }} />
                            <Bar dataKey="cost" name="Cost (¥)" fill="#ef4444" radius={[3, 3, 0, 0]} />
                            <Bar dataKey="savings" name="Savings (¥)" fill="#34d399" radius={[3, 3, 0, 0]} />
                            <Legend wrapperStyle={{ fontSize: '0.65rem' }} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Model Performance */}
            <div className="card" style={{ marginBottom: 16 }}>
                <h3 className="card-title">AI Model Performance — Continuous Learning</h3>
                <div className="grid grid-3" style={{ gap: 12 }}>
                    <div style={{ padding: 14, background: 'rgba(15,23,42,0.4)', borderRadius: 10, borderLeft: '3px solid #10b981' }}>
                        <div style={{ fontSize: '0.65rem', color: '#64748b', marginBottom: 4 }}>Prediction Accuracy</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>{kpi.aiPredictionAccuracy}%</div>
                        <div style={{ height: 4, background: '#1e293b', borderRadius: 2, marginTop: 6 }}>
                            <div style={{ height: '100%', width: `${kpi.aiPredictionAccuracy}%`, background: '#10b981', borderRadius: 2 }} />
                        </div>
                    </div>
                    <div style={{ padding: 14, background: 'rgba(15,23,42,0.4)', borderRadius: 10, borderLeft: '3px solid #f59e0b' }}>
                        <div style={{ fontSize: '0.65rem', color: '#64748b', marginBottom: 4 }}>Decision Confidence</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b' }}>{kpi.avgDecisionConfidence}%</div>
                        <div style={{ height: 4, background: '#1e293b', borderRadius: 2, marginTop: 6 }}>
                            <div style={{ height: '100%', width: `${kpi.avgDecisionConfidence}%`, background: '#f59e0b', borderRadius: 2 }} />
                        </div>
                    </div>
                    <div style={{ padding: 14, background: 'rgba(15,23,42,0.4)', borderRadius: 10, borderLeft: '3px solid #38bdf8' }}>
                        <div style={{ fontSize: '0.65rem', color: '#64748b', marginBottom: 4 }}>Best ROI Intervention</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8' }}>{kpi.bestROIIntervention?.roi}×</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 4 }}>{kpi.bestROIIntervention?.name}</div>
                    </div>
                </div>
            </div>

            {/* Decision Log Table */}
            <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h3 className="card-title" style={{ margin: 0 }}>Decision Log — All Interventions</h3>
                    <input
                        type="text"
                        placeholder="Search decisions..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ padding: '6px 12px', background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, color: '#e2e8f0', fontSize: '0.75rem', width: 220 }}
                    />
                </div>
                <table className="data-table">
                    <thead>
                        <tr><th>ID</th><th>Timestamp</th><th>Threat</th><th>Risk</th><th>Action</th><th>Cost</th><th>Saved</th><th>Approved</th><th>Outcome</th></tr>
                    </thead>
                    <tbody>
                        {filteredDecisions.map((d, i) => (
                            <tr key={i}>
                                <td style={{ fontFamily: 'monospace', fontSize: '0.68rem' }}>{d.id}</td>
                                <td style={{ fontFamily: 'monospace', fontSize: '0.68rem' }}>{new Date(d.timestamp).toLocaleString('en-US', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}</td>
                                <td style={{ fontSize: '0.72rem' }}>{d.threat}</td>
                                <td><span style={{ fontWeight: 700, color: d.riskScore >= 70 ? '#ef4444' : d.riskScore >= 40 ? '#f59e0b' : '#34d399' }}>{d.riskScore}</span></td>
                                <td style={{ fontSize: '0.7rem', maxWidth: 200 }}>{d.action}</td>
                                <td style={{ fontFamily: 'monospace', color: '#f59e0b' }}>¥{d.costYuan.toLocaleString()}</td>
                                <td style={{ fontFamily: 'monospace', color: '#34d399' }}>¥{d.savingsYuan.toLocaleString()}</td>
                                <td style={{ fontSize: '0.68rem' }}>{d.approvedBy}</td>
                                <td><StatusBadge status={d.outcome === 'success' ? 'monitoring' : d.outcome === 'partial' ? 'warning' : 'elevated'} label={d.outcome?.toUpperCase()} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Learning Notes */}
            <div className="card" style={{ marginBottom: 16 }}>
                <h3 className="card-title">Decision Notes & Learning Outcomes</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {historicalDecisions.filter(d => d.note).map((d, i) => (
                        <div key={i} style={{ padding: '10px 14px', background: 'rgba(15,23,42,0.4)', borderRadius: 8, borderLeft: `3px solid ${d.outcome === 'success' ? '#34d399' : '#f59e0b'}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.78rem' }}>{d.id} — {d.threat}</span>
                                <span style={{ fontSize: '0.65rem', color: '#64748b' }}>{new Date(d.timestamp).toLocaleString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })}</span>
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.5 }}>{d.note}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
