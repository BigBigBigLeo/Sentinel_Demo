import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Icon from './Icon';

export default function FinancialKPI({ financials, compact = false }) {
    if (!financials) return null;

    const c = financials.currency || '¥';
    const fmt = (v) => v >= 10000 ? `${(v / 10000).toFixed(1)}万` : v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toLocaleString();

    const comparisonData = [
        { name: 'Sentinel Precision', cost: financials.totalSpent, fill: '#38bdf8' },
        { name: 'Traditional Method', cost: financials.traditionalEstimate, fill: '#64748b' },
    ];

    if (compact) {
        return (
            <div className="financial-kpi-compact">
                <div className="fin-metric">
                    <div className="fin-label">Season Spend</div>
                    <div className="fin-value" style={{ color: '#f59e0b' }}>{c}{fmt(financials.totalSpent)}</div>
                </div>
                <div className="fin-divider" />
                <div className="fin-metric">
                    <div className="fin-label">Predicted Savings</div>
                    <div className="fin-value" style={{ color: '#34d399' }}>{c}{fmt(financials.predictedSavings)}</div>
                </div>
                <div className="fin-divider" />
                <div className="fin-metric">
                    <div className="fin-label">Revenue Protected</div>
                    <div className="fin-value" style={{ color: '#38bdf8' }}>{c}{fmt(financials.revenueProtected)}</div>
                </div>
                <div className="fin-divider" />
                <div className="fin-metric">
                    <div className="fin-label">Season ROI</div>
                    <div className="fin-value" style={{ color: '#a78bfa' }}>{financials.seasonROI}x</div>
                </div>
            </div>
        );
    }

    return (
        <div className="financial-kpi-panel">
            <div className="financial-kpi-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="fin-icon-wrap"><Icon name="dollar" size={18} /></div>
                    <div>
                        <div className="fin-title">Season Financial Intelligence</div>
                        <div className="fin-subtitle">{financials.interventions} interventions · {financials.gradeDowngradesPrevented} downgrades prevented</div>
                    </div>
                </div>
            </div>

            <div className="financial-kpi-body">
                {/* Top row metrics */}
                <div className="fin-grid-4">
                    <div className="fin-card" style={{ borderLeftColor: '#f59e0b' }}>
                        <div className="fin-card-label">Total Spent</div>
                        <div className="fin-card-value" style={{ color: '#f59e0b' }}>{c}{fmt(financials.totalSpent)}</div>
                        <div className="fin-card-breakdown">
                            Labor {c}{fmt(financials.laborCost)} · Chemical {c}{fmt(financials.chemicalCost)} · Drone {c}{fmt(financials.droneCost)} · IoT {c}{fmt(financials.iotCost)}
                        </div>
                    </div>
                    <div className="fin-card" style={{ borderLeftColor: '#34d399' }}>
                        <div className="fin-card-label">Predicted Savings</div>
                        <div className="fin-card-value" style={{ color: '#34d399' }}>{c}{fmt(financials.predictedSavings)}</div>
                        <div className="fin-card-breakdown">vs. traditional broadcast approach</div>
                    </div>
                    <div className="fin-card" style={{ borderLeftColor: '#38bdf8' }}>
                        <div className="fin-card-label">Revenue Protected</div>
                        <div className="fin-card-value" style={{ color: '#38bdf8' }}>{c}{fmt(financials.revenueProtected)}</div>
                        <div className="fin-card-breakdown">Losses prevented: {c}{fmt(financials.preventedLosses)}</div>
                    </div>
                    <div className="fin-card" style={{ borderLeftColor: '#a78bfa' }}>
                        <div className="fin-card-label">Season ROI</div>
                        <div className="fin-card-value" style={{ color: '#a78bfa' }}>{financials.seasonROI}x</div>
                        <div className="fin-card-breakdown">Net benefit: {c}{fmt(financials.netBenefit)}</div>
                    </div>
                </div>

                {/* Cost comparison chart */}
                <div className="fin-chart-section">
                    <div className="fin-chart-label">Sentinel vs. Traditional — Season Cost Comparison</div>
                    <ResponsiveContainer width="100%" height={130}>
                        <BarChart data={comparisonData} layout="vertical" barSize={22}>
                            <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#1e293b' }} tickFormatter={(v) => `${c}${(v / 1000).toFixed(0)}k`} />
                            <YAxis type="category" dataKey="name" width={130} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#1e293b' }} />
                            <Tooltip contentStyle={{ background: '#1a2235', border: '1px solid #1e293b', borderRadius: 8, color: '#e2e8f0' }} formatter={(v) => `${c}${v.toLocaleString()}`} />
                            <Bar dataKey="cost" radius={[0, 6, 6, 0]}>
                                {comparisonData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
